---
title: Python实现目标追踪代码与步骤详解
slug: python实现目标追踪代码与步骤详解
category: Python 编程
summary: 需要的源代码如下
tags: Python
---

需要的源代码如下


```python
import cv2
import sys

# 读取视频
cap = cv2.VideoCapture('5b468f1de77d5.mp4')

# 初始化追踪器
tracker = cv2.TrackerCSRT_create()

# 读取第一帧
ret, frame = cap.read()
if not ret:
    print("无法读取视频")
    sys.exit()

# 选择ROI（感兴趣区域）
bbox = cv2.selectROI(frame, False)

# 初始化跟踪器
ok = tracker.init(frame, bbox)

while True:
    # 读取新的一帧
    ret, frame = cap.read()
    if not ret:
        break

    # 更新跟踪器
    ok, bbox = tracker.update(frame)
    if ok:
        # 绘制跟踪框
        p1 = (int(bbox[0]), int(bbox[1]))
        p2 = (int(bbox[0] + bbox[2]), int(bbox[1] + bbox[3]))
        cv2.rectangle(frame, p1, p2, (255, 0, 0), 2, 1)
    else:
        cv2.putText(frame, "Tracking failure detected", (100, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 0, 255), 2)

    # 显示结果帧
    cv2.imshow("Tracking", frame)

    # 按 'q' 退出循环
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
```


步骤


1、在该脚本的目录内添加视频文件


2、执行脚本，第一帧会暂停


![](/uploads/csdn/python实现目标追踪代码与步骤详解/img-01.png)


人后移动鼠标到目标车辆，滑动鼠标截取框图


![](/uploads/csdn/python实现目标追踪代码与步骤详解/img-02.png)


按下空格键，执行目标跟踪


![](/uploads/csdn/python实现目标追踪代码与步骤详解/img-03.png)


如果遇到 AttributeError: module ‘cv2‘ has no attribute ‘TrackerCSRT\_create'，参考[TrackerCSRT\_create](https://blog.csdn.net/weixin_32759777/article/details/144306766 "TrackerCSRT_create")
