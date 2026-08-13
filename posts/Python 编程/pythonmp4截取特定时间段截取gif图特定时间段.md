---
title: Pythonmp4截取特定时间段截取GIF图特定时间段
slug: pythonmp4截取特定时间段截取gif图特定时间段
category: Python 编程
summary: Python GIF截取特定时间段
tags: Python
---

## Python GIF截取特定时间段


**以下是使用 Python 的`imageio`库来截取 GIF 图特定时间段的示例代码：**


python


```python
import imageio
import os


def extract_gif_section(input_gif_path, output_gif_path, start_time, end_time):
    """
    从输入GIF图中截取指定时间段的帧并保存为新的GIF图。

    :param input_gif_path: 输入GIF图的路径
    :param output_gif_path: 输出GIF图的路径
    :param start_time: 开始时间（秒）
    :param end_time: 结束时间（秒）
    """
    gif_reader = imageio.get_reader(input_gif_path)
    fps = gif_reader.get_meta_data()['fps']

    start_frame = int(start_time * fps)
    end_frame = int(end_time * fps)

    frames = []
    for i, frame in enumerate(gif_reader):
        if start_frame <= i <= end_frame:
            frames.append(frame)

    gif_writer = imageio.get_writer(output_gif_path, fps=fps)
    for frame in frames:
        gif_writer.write(frame)

    gif_writer.close()
    gif_reader.close()


if __name__ == "__main__":
    input_gif_path = "your_input_gif.gif"  # 替换为实际的输入GIF图路径
    output_gif_path = "output_gif.gif"  # 替换为输出GIF图的路径
    start_time = 2  # 开始时间，单位：秒，可根据需要修改
    end_time = 5  # 结束时间，单位：秒，可根据需要修改

    extract_gif_section(input_gif_path, output_gif_path, start_time, end_time)
```


在上述代码中：


1.  首先使用`imageio.get_reader`打开输入的 GIF 图，并获取其帧率（`fps`）信息。
2.  根据给定的开始时间和结束时间，将时间转换为对应的帧序号（通过帧率计算），确定要截取的帧范围。
3.  然后遍历 GIF 图的所有帧，将在指定帧范围内的帧收集到一个列表中。
4.  接着使用`imageio.get_writer`创建一个新的 GIF 图写入对象，将截取到的帧依次写入新的 GIF 图中。
5.  最后关闭写入对象和读取对象，完成截取特定时间段并生成新 GIF 图的操作。


请确保已经安装了`imageio`库，可以通过`pip install imageio`进行安装。同时，记得将代码中的输入和输出 GIF 图路径以及开始时间和结束时间等参数按照实际需求进行替换。


## Python mp4截取特定时间段


以下是使用 Python 的`moviepy`库来截取 MP4 视频特定时间段的示例代码：


python


```python
from moviepy.editor import VideoFileClip


def extract_mp4_section(input_mp4_path, output_mp4_path, start_time, end_time):
    """
    从输入MP4视频中截取指定时间段的视频并保存为新的MP4视频。

    :param input_mp4_path: 输入MP4视频的路径
    :param output_mp4_path: 输出MP4视频的路径
    :param start_time: 开始时间（秒）
    :param end_time: 结束时间（秒）
    """
    video = VideoFileClip(input_mp4_path)
    clipped_video = video.subclip(start_time, end_time)
    clipped_video.write_videofile(output_mp4_path)


if __name__ == "__main__":
    input_mp4_path = "your_input_mp4.mp4"  # 替换为实际的输入MP4视频路径
    output_mp4_path = "output_mp4.mp4"  # 替换为输出MP4视频的路径
    start_time = 10  # 开始时间，单位：秒，可根据需要修改
    end_time = 30  # 结束时间，单位：秒，可根据需要修改

    extract_mp4_section(input_mp4_path, output_mp4_path, start_time, end_time)
```


在上述代码中：


1.  首先通过`VideoFileClip`函数从`moviepy`库中导入输入的 MP4 视频文件，将其转换为一个可操作的视频对象。
2.  然后使用`subclip`方法对该视频对象进行截取操作，指定开始时间和结束时间，得到截取后的视频片段。
3.  最后通过`write_videofile`方法将截取后的视频片段保存为新的 MP4 视频文件，存储到指定的输出路径。


需要注意的是，在运行代码之前，你需要先安装`moviepy`库，可以通过`pip install moviepy`进行安装。同时，要将代码中的输入和输出 MP4 视频路径以及开始时间和结束时间等参数按照实际需求进行替换。


效果如下


![](/uploads/csdn/pythonmp4截取特定时间段截取gif图特定时间段/img-01.gif)
