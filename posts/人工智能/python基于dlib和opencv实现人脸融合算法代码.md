---
title: Python基于Dlib和OpenCV实现人脸融合算法代码
slug: python基于dlib和opencv实现人脸融合算法代码
category: 人工智能
summary: 该代码实现了一个基于Dlib和OpenCV的人脸融合工具FaceMerger。主要功能包括：1) 使用Dlib检测68个人脸特征点；2) 通过三角剖分和仿射变换将源人脸特征点映射到目标人脸；3) 采用泊松融合(seamlessClone)实现自然过渡。核心步骤为：提取特征点→计算凸包→三角剖分→逐三角形变形→泊松融合。最终输出将源人脸特征区域无缝融合到目标人脸上的结果。该算法适用于需要保持目标人脸…
tags: 人工智能, Python, OpenCV
---

该代码实现了一个基于Dlib和OpenCV的人脸融合工具FaceMerger。主要功能包括：1) 使用Dlib检测68个人脸特征点；2) 通过三角剖分和仿射变换将源人脸特征点映射到目标人脸；3) 采用泊松融合(seamlessClone)实现自然过渡。核心步骤为：提取特征点→计算凸包→三角剖分→逐三角形变形→泊松融合。最终输出将源人脸特征区域无缝融合到目标人脸上的结果。该算法适用于需要保持目标人脸整体结构同时融合源人脸特征的场景，如人脸编辑、特效制作等应用。


```python
import cv2
import numpy as np
import dlib

class FaceMerger:
    def __init__(self, predictor_path="shape_predictor_68_face_landmarks.dat"):
        self.detector = dlib.get_frontal_face_detector()
        self.predictor = dlib.shape_predictor(predictor_path)

    def get_landmarks(self, image):
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        faces = self.detector(gray, 1)
        if len(faces) == 0:
            raise ValueError("No face detected")

        shape = self.predictor(gray, faces[0])
        landmarks = np.array([(p.x, p.y) for p in shape.parts()])
        return landmarks

    def apply_affine_transform(self, src, src_tri, dst_tri, size):
        warp_mat = cv2.getAffineTransform(np.float32(src_tri), np.float32(dst_tri))
        dst = cv2.warpAffine(src, warp_mat, (size[0], size[1]), None,
                             flags=cv2.INTER_LINEAR,
                             borderMode=cv2.BORDER_REFLECT_101)
        return dst

    def warp_triangle(self, img1, img2, tri1, tri2):
        rect1 = cv2.boundingRect(np.float32([tri1]))
        rect2 = cv2.boundingRect(np.float32([tri2]))

        tri1_rect = [(p[0] - rect1[0], p[1] - rect1[1]) for p in tri1]
        tri2_rect = [(p[0] - rect2[0], p[1] - rect2[1]) for p in tri2]

        mask = np.zeros((rect2[3], rect2[2], 3), dtype=np.float32)
        cv2.fillConvexPoly(mask, np.int32(tri2_rect), (1.0, 1.0, 1.0), 16, 0)

        img1_rect = img1[rect1[1]:rect1[1] + rect1[3],
                         rect1[0]:rect1[0] + rect1[2]]

        size = (rect2[2], rect2[3])
        warped_rect = self.apply_affine_transform(img1_rect, tri1_rect, tri2_rect, size)

        img2_rect = img2[rect2[1]:rect2[1] + rect2[3],
                         rect2[0]:rect2[0] + rect2[2]]

        img2_rect = img2_rect * (1 - mask) + warped_rect * mask
        img2[rect2[1]:rect2[1] + rect2[3],
             rect2[0]:rect2[0] + rect2[2]] = img2_rect

    def seamless_clone(self, src, dst, mask, center):
        """泊松融合"""
        output = cv2.seamlessClone(src, dst, mask, center, cv2.NORMAL_CLONE)
        return output

    def merge_faces(self, img1, img2):
        landmarks1 = self.get_landmarks(img1)
        landmarks2 = self.get_landmarks(img2)

        # 凸包点索引（68个特征点的凸包）
        hull_indices = cv2.convexHull(landmarks2, returnPoints=False).flatten()
        hull2 = landmarks2[hull_indices]
        hull1 = landmarks1[hull_indices]

        # 三角剖分
        rect = (0, 0, img2.shape[1], img2.shape[0])
        subdiv = cv2.Subdiv2D(rect)
        for point in hull2:
            subdiv.insert((int(point[0]), int(point[1])))
        triangles = subdiv.getTriangleList()
        triangles = np.array(triangles, dtype=np.int32)

        # 创建掩码和图像副本
        mask = np.zeros(img2.shape, dtype=img2.dtype)
        img1_warped = np.copy(img2)

        # 对每个三角形进行变形
        for t in triangles:
            pt1 = (t[0], t[1])
            pt2 = (t[2], t[3])
            pt3 = (t[4], t[5])

            idx1 = np.where((hull2 == pt1).all(axis=1))[0][0]
            idx2 = np.where((hull2 == pt2).all(axis=1))[0][0]
            idx3 = np.where((hull2 == pt3).all(axis=1))[0][0]

            tri2 = [hull2[idx1], hull2[idx2], hull2[idx3]]
            tri1 = [hull1[idx1], hull1[idx2], hull1[idx3]]

            self.warp_triangle(img1, img1_warped, tri1, tri2)
            cv2.fillConvexPoly(mask, np.int32(tri2), (255, 255, 255))

        # 泊松融合
        center = (int(np.mean(hull2[:, 0])), int(np.mean(hull2[:, 1])))
        output = self.seamless_clone(img1_warped, img2, mask, center)
        return output

if __name__ == "__main__":
    merger = FaceMerger("shape_predictor_68_face_landmarks.dat")

    # 读取图片
    img1 = cv2.imread("6.jpg")  # 源人脸
    img2 = cv2.imread("5.jpg")  # 目标人脸

    # 调整图像尺寸一致（可选）
    img1 = cv2.resize(img1, (500, 500))
    img2 = cv2.resize(img2, (500, 500))

    # 执行融合
    result = merger.merge_faces(img1, img2)

    # 显示结果
    cv2.imshow("Source Face", img1)
    cv2.imshow("Target Face", img2)
    cv2.imshow("Merged Face", result)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

    # 保存结果
    cv2.imwrite("merged_result.jpg", result)
```


![](/uploads/csdn/python基于dlib和opencv实现人脸融合算法代码/img-01.png)
