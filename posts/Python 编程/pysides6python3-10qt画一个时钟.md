---
title: Pysides6Python3.10Qt画一个时钟
slug: pysides6python3-10qt画一个时钟
category: Python 编程
summary: 代码如下
tags: Python
---

代码如下


```python
import sys
from math import pi, sin, cos
from PySide6.QtCore import Qt, QTimer, QTime, QPointF, QRect
from PySide6.QtGui import QPainter, QPolygonF, QColor, QRadialGradient, QFont
from PySide6.QtWidgets import QApplication, QWidget,QMainWindow,QVBoxLayout

class AnalogClock(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("PySide6 时钟")
        self.setMinimumSize(30, 30)
        #self.clock = QWidget()
        # 设置窗口背景透明
        self.setAttribute(Qt.WA_TranslucentBackground)
        self.setStyleSheet("background: transparent;")

        # 初始化定时器
        self.timer = QTimer(self)
        self.timer.timeout.connect(self.update)
        self.timer.start(1000)  # 每秒更新一次

    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)

        # 计算尺寸参数
        side = min(self.width(), self.height())
        center = self.rect().center()
        radius = (side - 20) / 2

        # 绘制渐变背景
        gradient = QRadialGradient(center, radius, center)
        gradient.setColorAt(0, QColor(240, 240, 240))
        gradient.setColorAt(1, QColor(180, 180, 180))
        painter.setBrush(gradient)
        painter.drawEllipse(center, radius, radius)

        # 绘制外框
        painter.setPen(QColor(80, 80, 80))
        painter.drawEllipse(center, radius, radius)
        painter.drawEllipse(center, radius-5, radius-5)

        # 移动到中心点并旋转坐标系
        painter.translate(center)
        painter.rotate(-90)  # 0度从顶部开始

        # 绘制小时刻度
        painter.setPen(QColor(60, 60, 60))
        for i in range(12):
            painter.rotate(30)
            painter.drawLine(int(radius*0.85), 0, int(radius*0.95), 0)

        # 绘制分钟刻度
        painter.setPen(QColor(100, 100, 100))
        for i in range(90):
            if i % 5 != 0:  # 跳过小时刻度
                painter.rotate(6)
                painter.drawLine(int(radius*0.9), 0, int(radius*0.95), 0)

        # 获取当前时间
        time = QTime.currentTime()
        hour = time.hour() % 12
        minute = time.minute()
        second = time.second()

        painter.rotate(30)

        # 绘制小时数字
        painter.setPen(QColor(40, 40, 40))
        font = QFont("Arial", int(radius/8), QFont.Bold)
        painter.setFont(font)
        for i in range(12):
            angle = i * 30 + 180 + 75  # 每小时30度
            x = radius * 0.75 * cos(angle * pi / 180)
            y = radius * 0.75 * sin(angle * pi / 180)
            painter.drawText(int(x - 10), int(y - 10), 36, 36,
                            Qt.AlignCenter, str(12 if i == 0 else i))

        # 重置坐标系
        painter.resetTransform()
        painter.translate(center)
        painter.rotate(-90)

        # 绘制时针
        hour_angle = (hour + minute/60) * 30
        painter.setPen(Qt.NoPen)
        painter.setBrush(QColor(50, 50, 50))
        painter.save()
        painter.rotate(hour_angle)
        hour_hand = QPolygonF([
            QPointF(-0.02*radius, -0.02*radius),
            QPointF(0.02*radius, -0.02*radius),
            QPointF(0.05*radius, radius*0.5),
        ])
        painter.drawConvexPolygon(hour_hand)
        painter.restore()

        # 绘制分针
        minute_angle = (minute + second/60) * 6
        painter.setBrush(QColor(80, 80, 80))
        painter.save()
        painter.rotate(minute_angle)
        minute_hand = QPolygonF([
            QPointF(-0.015*radius, -0.015*radius),
            QPointF(0.015*radius, -0.015*radius),
            QPointF(0.03*radius, radius*0.7),
        ])
        painter.drawConvexPolygon(minute_hand)
        painter.restore()

        # 绘制秒针
        second_angle = second * 6
        painter.setPen(QColor(200, 50, 50))
        painter.setBrush(QColor(200, 50, 50))
        painter.save()
        painter.rotate(second_angle)
        painter.drawLine(0, 0, 0, -radius*0.8)
        painter.restore()

        # 绘制中心点
        painter.setPen(Qt.NoPen)
        painter.setBrush(QColor(200, 50, 50))
        painter.drawEllipse(QPointF(0, 0), 5, 5)
        # 主窗口

class MainWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("嵌入式绘图示例")
        # 计算中心坐标
        btn_width = 300
        btn_height = 300
        x = (self.width() - btn_width) // 2  # 水平居中
        y = self.height() * 0.75  # 垂直位置在75%处
        self.layout = QVBoxLayout()
        self.clock = AnalogClock(self)
        self.clock.setGeometry(x, y, btn_width, btn_height)
        self.clock.show()


if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = MainWindow()

    window.show()
    sys.exit(app.exec())
```


结果如下：


![](/uploads/csdn/pysides6python3-10qt画一个时钟/img-01.png)
