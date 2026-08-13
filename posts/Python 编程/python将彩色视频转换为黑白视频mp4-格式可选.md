---
title: Python将彩色视频转换为黑白视频MP4 格式可选
slug: python将彩色视频转换为黑白视频mp4-格式可选
category: Python 编程
summary: 以下是使用 Python 将彩色视频转换为黑白电视风格的示例代码，主要借助了opencv-python库来实现：
tags: Python
---

以下是使用 Python 将彩色视频转换为黑白电视风格的示例代码，主要借助了`opencv-python`库来实现：


python


```python
import cv2

def convert_to_black_and_white_video(input_video_path, output_video_path):
    # 打开视频文件
    cap = cv2.VideoCapture(input_video_path)

    # 获取视频的帧率、宽度和高度等信息
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    # 定义视频编解码器并创建VideoWriter对象
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_video_path, fourcc, fps, (width, height), isColor=False)

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # 将彩色帧转换为黑白
        gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # 将黑白帧写入输出视频文件
        out.write(gray_frame)

    # 释放资源
    cap.release()
    out.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    input_video_path = "your_input_video.mp4"  # 替换为实际的输入视频路径
    output_video_path = "output_video.mp4"  # 替换为你想要的输出视频路径
    convert_to_black_and_white_video(input_video_path, output_video_path)
```


在上述代码中：


1.  首先使用`cv2.VideoCapture`打开输入的彩色视频文件，并获取视频的帧率、宽度和高度等基本信息。
2.  然后定义了输出视频的编解码器和相关参数，创建了`cv2.VideoWriter`对象用于将处理后的帧写入新的视频文件。这里设置`isColor=False`表示输出的是黑白视频。
3.  在循环中，不断从输入视频中读取每一帧，使用`cv2.cvtColor`函数将彩色帧转换为黑白帧，再将黑白帧写入输出视频文件。
4.  最后，释放视频读取和写入的相关资源。


请确保在运行代码之前已经安装了`opencv-python`库，可以通过`pip install opencv-python`进行安装。同时，将代码中的输入和输出视频路径替换为你实际使用的路径。


效果如下


![](/uploads/csdn/python将彩色视频转换为黑白视频mp4-格式可选/img-01.gif)


![](/uploads/csdn/python将彩色视频转换为黑白视频mp4-格式可选/img-02.gif)
