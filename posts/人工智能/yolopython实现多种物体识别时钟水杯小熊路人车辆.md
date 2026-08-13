---
title: YOLOpython实现多种物体识别时钟水杯小熊路人车辆
slug: yolopython实现多种物体识别时钟水杯小熊路人车辆
category: 人工智能
summary: 本文介绍了一个基于YOLO的目标检测类ObjectDetector，支持YOLOv8标准模型和YOLO-World自定义模型。该类提供了两种模型加载方式：标准YOLOv8模型（80类）和可自定义检测类别的YOLO-World模型。主要功能包括模型自动加载和单张图片检测，能够输出检测目标的类别、数量和平均置信度，并保存检测结果图像。使用示例展示了如何初始化检测器并进行图片检测。该实现具有自动回退机制…
tags: 人工智能, Python, YOLO
---

本文介绍了一个基于YOLO的目标检测类ObjectDetector，支持YOLOv8标准模型和YOLO-World自定义模型。该类提供了两种模型加载方式：标准YOLOv8模型（80类）和可自定义检测类别的YOLO-World模型。主要功能包括模型自动加载和单张图片检测，能够输出检测目标的类别、数量和平均置信度，并保存检测结果图像。使用示例展示了如何初始化检测器并进行图片检测。该实现具有自动回退机制，当指定模型加载失败时会自动切换为标准模型。


![](/uploads/csdn/yolopython实现多种物体识别时钟水杯小熊路人车辆/img-01.png)![](/uploads/csdn/yolopython实现多种物体识别时钟水杯小熊路人车辆/img-02.jpeg)


```python
from ultralytics import YOLO
import cv2
import os

class ObjectDetector:
    def __init__(self, model_type='standard'):
        """
        参数:
            model_type: 'standard' 或 'world'
        """
        self.model_type = model_type
        self.model = None
        self.load_model()

    def load_model(self):
        """加载模型"""
        try:
            if self.model_type == 'world':
                # 加载YOLO World模型
                self.model = YOLO("E:/PYTHON/object_regconnition/YOLO-World/yolo_world_v2_l_clip_large_o365v1_goldg_pretrain_800ft-9df82e55.pth")
                # 设置自定义类别
                custom_classes = ["person", "bicycle", "car", "motorcycle", "bus", "truck",
                                "dog", "cat", "bird", "chair", "table", "laptop", "phone"]
                self.model.set_classes(custom_classes)
                print("✅ YOLO World模型加载成功，使用自定义类别")

            else:
                # 加载标准YOLOv8模型
                self.model = YOLO('yolov8n.pt')
                print("✅ 标准YOLOv8模型加载成功，使用80个预定义类别")

            print(f"📊 可检测类别数量: {len(self.model.names)}")

        except Exception as e:
            print(f"❌ 模型加载失败: {e}")
            # 回退到标准模型
            print("🔄 回退到标准YOLOv8模型...")
            self.model = YOLO('yolov8n.pt')
            self.model_type = 'standard'

    def detect_image(self, image_path, save_result=True):
        """检测单张图片"""
        if not os.path.exists(image_path):
            print(f"❌ 图片不存在: {image_path}")
            return

        try:
            # 进行预测
            results = self.model.predict(image_path, conf=0.25)

            # 处理结果
            result = results[0]

            # 打印检测结果
            print(f"\n🎯 在 {os.path.basename(image_path)} 中检测到:")
            print("-" * 50)

            detections = {}
            for box in result.boxes:
                cls_id = int(box.cls.item())
                confidence = box.conf.item()
                class_name = self.model.names[cls_id]

                if class_name not in detections:
                    detections[class_name] = []
                detections[class_name].append(confidence)

            # 打印汇总结果
            for class_name, confidences in detections.items():
                avg_conf = sum(confidences) / len(confidences)
                print(f"  {class_name}: {len(confidences)} 个, 平均置信度: {avg_conf:.3f}")

            # 保存结果图像
            if save_result:
                output_path = f"detected_{os.path.basename(image_path)}"
                result.save(filename=output_path)
                print(f"💾 结果保存为: {output_path}")

            return result

        except Exception as e:
            print(f"❌ 检测失败: {e}")
            return None

# 使用示例
if __name__ == "__main__":
    # 创建检测器
    detector = ObjectDetector(model_type='standard')  # 或 'world'

    # 检测图片
    image_path = "image.jpg"  # 替换为你的图片路径
    detector.detect_image(image_path)

        # 检测图片
    image_path = "image2.png"  # 替换为你的图片路径
    detector.detect_image(image_path)
```
