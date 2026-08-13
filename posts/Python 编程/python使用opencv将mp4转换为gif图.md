---
title: Python使用OpenCV将MP4转换为GIF图
slug: python使用opencv将mp4转换为gif图
category: Python 编程
summary: 以下是使用 Python 和 OpenCV 将 MP4 转换为 GIF 的示例代码：
tags: Python, OpenCV
---

以下是使用 Python 和 OpenCV 将 MP4 转换为 GIF 的示例代码：


python


```python
import cv2
import imageio

def mp4_to_gif(mp4_path, gif_path, fps=10, start_time=None, end_time=None):
    """
    将MP4视频转换为GIF动图。

    :param mp4_path: 输入MP4视频的路径。
    :param gif_path: 输出GIF文件的路径。
    :param fps: GIF的帧率，默认值为10。
    :param start_time: 开始时间（秒），默认值为None，表示从视频开头开始转换。
    :param end_time: 结束时间（秒），默认值为None，表示转换到视频结尾。
    """
    cap = cv2.VideoCapture(mp4_path)
    all_images = []
    frame_count = 0
    while True:
        ret, img = cap.read()
        if not ret:
            break
        # 根据开始时间和结束时间截取帧
        if start_time is not None and frame_count < start_time * fps:
            frame_count += 1
            continue
        if end_time is not None and frame_count >= end_time * fps:
            break
        # 将BGR图像转换为RGB格式，以适应imageio保存GIF的要求
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        all_images.append(img)
        frame_count += 1

    # 将帧率转换为每帧之间的延迟时间（毫秒）
    duration = int(1000 / fps)
    imageio.mimsave(gif_path, all_images, duration=duration)
    print("转换完成！")

if __name__ == "__main__":
    input_mp4_path = "your_input_mp4.mp4"  # 替换为实际的输入MP4视频路径
    output_gif_path = "output.gif"  # 替换为输出GIF文件的路径
    start_time = 0  # 开始时间，单位：秒，可根据需要修改
    end_time = 5  # 结束时间，单位：秒，可根据需要修改
    fps = 15  # GIF的帧率，可根据需要修改

    mp4_to_gif(input_mp4_path, output_gif_path, fps=fps, start_time=start_time, end_time=end_time)
```


在上述代码中：


#### 读取视频帧


-   首先使用`cv2.VideoCapture`函数打开指定的 MP4 视频文件，并创建一个视频捕获对象`cap`2.
-   通过一个循环不断读取视频的帧，使用`cap.read()`函数读取视频的下一帧图像。如果读取失败（视频结束），则跳出循环2.


#### 截取特定时间段的帧


-   根据提供的`start_time`和`end_time`参数来控制要转换的帧范围。如果`start_time`不为`None`，并且当前帧索引小于`start_time`乘以帧率的值，则跳过该帧。如果`end_time`不为`None`，并且当前帧索引大于等于`end_time`乘以帧率的值，则跳出循环2.


#### 转换图像格式


-   使用`cv2.cvtColor`函数将读取的图像帧从 BGR 格式转换为 RGB 格式，以便后续生成 GIF 图片时颜色显示正确2.


#### 保存为 GIF


-   将转换后的图像帧添加到`all_images`列表中。
-   根据提供的帧率`fps`计算每帧之间的延迟时间`duration`，以便生成的 GIF 图片播放时具有指定的帧率2.
-   使用`imageio.mimsave`函数将`all_images`列表中的帧保存为 GIF 图片。指定参数`duration`为帧间延迟时间。保存的 GIF 图片文件名由提供的`gif_path`参数决定2.


在运行代码之前，需要先安装`opencv-python`和`imageio`库，可以通过`pip install opencv-python imageio`命令进行安装1. 同时，要将代码中的输入 MP4 视频路径、输出 GIF 文件路径、开始时间、结束时间和帧率等参数按照实际需求进行替换 。


效果如下


![](/uploads/csdn/python使用opencv将mp4转换为gif图/img-01.gif)
