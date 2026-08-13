---
title: 用Python识别图像中的二维码并纠正倾斜姿态后进行识别
slug: 用python识别图像中的二维码并纠正倾斜姿态后进行识别
category: Python 编程
summary: 该程序实现二维码检测与倾斜纠正功能，主要包含以下功能：1)检测图像中的二维码区域；2)纠正倾斜的二维码图像；3)识别二维码内容。程序提供两种检测方法：基于OpenCV的QRCodeDetector和基于轮廓分析的备用方法。通过透视变换纠正倾斜二维码，并提供多种图像增强方法提高识别率。支持直接识别、纠正后识别和增强后识别三种处理方式，可输出识别结果和保存纠正后的图像。
tags: Python, 图像处理
---

该程序实现二维码检测与倾斜纠正功能，主要包含以下功能：1)检测图像中的二维码区域；2)纠正倾斜的二维码图像；3)识别二维码内容。程序提供两种检测方法：基于OpenCV的QRCodeDetector和基于轮廓分析的备用方法。通过透视变换纠正倾斜二维码，并提供多种图像增强方法提高识别率。支持直接识别、纠正后识别和增强后识别三种处理方式，可输出识别结果和保存纠正后的图像。


![](/uploads/csdn/用python识别图像中的二维码并纠正倾斜姿态后进行识别/img-01.png)


![](/uploads/csdn/用python识别图像中的二维码并纠正倾斜姿态后进行识别/img-02.png)


```python
"""
二维码识别与倾斜纠正程序
功能：
1. 检测图像中的二维码
2. 纠正倾斜姿态
3. 识别二维码内容
"""

import cv2
import numpy as np
import pyzbar.pyzbar as pyzbar
from pyzbar.pyzbar import ZBarSymbol


class QRCodeDetector:
    """二维码检测与纠正类"""

    def __init__(self):
        self.debug = False

    def detect_qr_corners(self, image):
        """
        检测二维码的四个角点

        Args:
            image: 输入图像 (BGR格式)

        Returns:
            corners_list: 检测到的角点列表，每个元素是4个角点的数组
        """
        # 转换为灰度图
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # 使用QRCodeDetector检测二维码
        qr_detector = cv2.QRCodeDetector()

        # 检测并解码
        retval, decoded_info, points, straight_qrcode = qr_detector.detectAndDecodeMulti(gray)

        corners_list = []
        if retval and points is not None:
            for i, pts in enumerate(points):
                if pts is not None:
                    corners = pts.reshape(4, 2).astype(np.float32)
                    corners_list.append(corners)

        return corners_list

    def detect_qr_by_contours(self, image):
        """
        使用轮廓检测方法找到二维码区域

        Args:
            image: 输入图像

        Returns:
            corners_list: 检测到的角点列表
        """
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # 自适应阈值处理
        thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                       cv2.THRESH_BINARY, 51, 10)

        # 形态学操作
        kernel = np.ones(5, np.uint8)
        morph = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

        # 查找轮廓
        contours, _ = cv2.findContours(morph, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

        corners_list = []

        for contour in contours:
            # 计算轮廓面积
            area = cv2.contourArea(contour)
            if area < 1000:  # 过滤太小的区域
                continue

            # 多边形逼近
            peri = cv2.arcLength(contour, True)
            approx = cv2.approxPolyDP(contour, 0.02 * peri, True)

            # 寻找四边形
            if len(approx) == 4:
                corners = approx.reshape(4, 2).astype(np.float32)

                # 检查是否是正方形/矩形（二维码形状）
                angles = self._calculate_angles(corners)
                if all(70 < angle < 110 for angle in angles):
                    corners_list.append(self._order_points(corners))

        return corners_list

    def _calculate_angles(self, corners):
        """计算四边形的内角"""
        angles = []
        n = len(corners)
        for i in range(n):
            p1 = corners[(i - 1) % n]
            p2 = corners[i]
            p3 = corners[(i + 1) % n]

            v1 = p1 - p2
            v2 = p3 - p2

            angle = np.arctan2(v2[1], v2[0]) - np.arctan2(v1[1], v1[0])
            angle = np.degrees(angle)
            if angle < 0:
                angle += 360
            if angle > 180:
                angle = 360 - angle
            angles.append(angle)
        return angles

    def _order_points(self, pts):
        """
        对四个角点进行排序：左上、右上、右下、左下
        """
        rect = np.zeros((4, 2), dtype=np.float32)

        # 计算每个点的坐标和
        s = pts.sum(axis=1)
        rect[0] = pts[np.argmin(s)]  # 左上
        rect[2] = pts[np.argmax(s)]  # 右下

        # 计算差值
        diff = np.diff(pts, axis=1)
        rect[1] = pts[np.argmin(diff)]  # 右上
        rect[3] = pts[np.argmax(diff)]  # 左下

        return rect

    def correct_perspective(self, image, corners, output_size=None):
        """
        纠正透视变换，将倾斜的二维码转正

        Args:
            image: 输入图像
            corners: 四个角点 [左上, 右上, 右下, 左下]
            output_size: 输出图像大小 (宽, 高)，默认自动计算

        Returns:
            corrected_image: 纠正后的图像
        """
        # 确保角点顺序正确
        ordered_corners = self._order_points(corners)

        # 计算输出尺寸
        if output_size is None:
            # 根据角点计算宽度和高度
            width_top = np.linalg.norm(ordered_corners[1] - ordered_corners[0])
            width_bottom = np.linalg.norm(ordered_corners[2] - ordered_corners[3])
            width = int(max(width_top, width_bottom))

            height_left = np.linalg.norm(ordered_corners[3] - ordered_corners[0])
            height_right = np.linalg.norm(ordered_corners[2] - ordered_corners[1])
            height = int(max(height_left, height_right))

            output_size = (width, height)

        # 定义目标点
        dst_points = np.array([
            [0, 0],
            [output_size[0] - 1, 0],
            [output_size[0] - 1, output_size[1] - 1],
            [0, output_size[1] - 1]
        ], dtype=np.float32)

        # 计算透视变换矩阵
        matrix = cv2.getPerspectiveTransform(ordered_corners, dst_points)

        # 应用透视变换
        corrected = cv2.warpPerspective(image, matrix, output_size)

        return corrected

    def decode_qr(self, image):
        """
        解码二维码

        Args:
            image: 输入图像

        Returns:
            results: 解码结果列表
        """
        # 转换为灰度图
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image

        # 解码二维码
        decoded_objects = pyzbar.decode(gray, symbols=[ZBarSymbol.QRCODE])

        results = []
        for obj in decoded_objects:
            result = {
                'data': obj.data.decode('utf-8'),
                'type': obj.type,
                'rect': obj.rect,
                'polygon': obj.polygon
            }
            results.append(result)

        return results

    def process_image(self, image_path, save_corrected=False, output_path=None):
        """
        处理图像：检测、纠正、识别二维码

        Args:
            image_path: 输入图像路径
            save_corrected: 是否保存纠正后的图像
            output_path: 纠正后图像的保存路径

        Returns:
            results: 识别结果列表
        """
        # 读取图像
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"无法读取图像: {image_path}")

        print(f"处理图像: {image_path}")
        print(f"图像尺寸: {image.shape[1]} x {image.shape[0]}")

        results = []

        # 首先尝试直接识别（不纠正）
        direct_results = self.decode_qr(image)
        if direct_results:
            print("✓ 直接识别成功！")
            for i, result in enumerate(direct_results):
                print(f"  [{i+1}] 内容: {result['data']}")
                results.append({
                    'method': 'direct',
                    'corrected': False,
                    **result
                })
            return results

        print("直接识别失败，尝试检测并纠正倾斜...")

        # 尝试检测二维码角点
        corners_list = self.detect_qr_corners(image)

        if not corners_list:
            print("使用备用方法检测...")
            corners_list = self.detect_qr_by_contours(image)

        if not corners_list:
            print("✗ 未检测到二维码")
            return results

        print(f"检测到 {len(corners_list)} 个可能的二维码区域")

        # 对每个检测到的区域进行纠正和识别
        for i, corners in enumerate(corners_list):
            print(f"\n处理区域 {i+1}...")

            # 纠正透视
            corrected_image = self.correct_perspective(image, corners)

            # 保存纠正后的图像（如果需要）
            if save_corrected and output_path:
                corrected_path = output_path.replace('.png', f'_corrected_{i+1}.png')
                cv2.imwrite(corrected_path, corrected_image)
                print(f"  已保存纠正后的图像: {corrected_path}")

            # 尝试解码纠正后的图像
            decoded_results = self.decode_qr(corrected_image)

            if decoded_results:
                print(f"  ✓ 纠正后识别成功！")
                for j, result in enumerate(decoded_results):
                    print(f"    [{j+1}] 内容: {result['data']}")
                    results.append({
                        'method': 'corrected',
                        'corrected': True,
                        'region_index': i + 1,
                        **result
                    })
            else:
                print(f"  ✗ 纠正后仍无法识别")

                # 尝试对纠正后的图像进行增强
                enhanced = self._enhance_qr_image(corrected_image)
                decoded_results = self.decode_qr(enhanced)

                if decoded_results:
                    print(f"  ✓ 增强后识别成功！")
                    for j, result in enumerate(decoded_results):
                        print(f"    [{j+1}] 内容: {result['data']}")
                        results.append({
                            'method': 'enhanced',
                            'corrected': True,
                            'region_index': i + 1,
                            **result
                        })

        return results

    def _enhance_qr_image(self, image):
        """
        增强二维码图像以提高识别率
        """
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image.copy()

        # 尝试多种预处理方法
        enhanced_images = []

        # 1. 自适应阈值
        enhanced_images.append(cv2.adaptiveThreshold(gray, 255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 21, 5))

        # 2. Otsu阈值
        _, otsu = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        enhanced_images.append(otsu)

        # 3. 直方图均衡化
        enhanced_images.append(cv2.equalizeHist(gray))

        # 4. 高斯模糊后锐化
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        enhanced_images.append(cv2.addWeighted(gray, 1.5, blurred, -0.5, 0))

        # 尝试每种增强方法
        for enhanced in enhanced_images:
            results = pyzbar.decode(enhanced, symbols=[ZBarSymbol.QRCODE])
            if results:
                return enhanced

        return gray


def main():
    """主函数"""
    import argparse
    import os

    parser = argparse.ArgumentParser(description='二维码识别与倾斜纠正工具')
    parser.add_argument('image', help='输入图像路径')
    parser.add_argument('-s', '--save', action='store_true', help='保存纠正后的图像')
    parser.add_argument('-o', '--output', help='输出图像路径')
    parser.add_argument('-d', '--debug', action='store_true', help='启用调试模式')

    args = parser.parse_args()

    # 检查输入文件是否存在
    if not os.path.exists(args.image):
        print(f"错误: 文件不存在 - {args.image}")
        return

    # 创建检测器
    detector = QRCodeDetector()
    detector.debug = args.debug

    # 处理图像
    try:
        results = detector.process_image(
            args.image,
            save_corrected=args.save,
            output_path=args.output
        )

        print("\n" + "="*50)
        print("识别结果汇总:")
        print("="*50)

        if results:
            for i, result in enumerate(results):
                print(f"\n[{i+1}] 识别方法: {result['method']}")
                print(f"    内容: {result['data']}")
                print(f"    类型: {result['type']}")
                if result.get('corrected'):
                    print(f"    已纠正: 是")
        else:
            print("未能识别任何二维码")

    except Exception as e:
        print(f"处理过程中出错: {e}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()
```
