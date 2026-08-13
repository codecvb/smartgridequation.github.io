---
title: 使用PythonPyQt5vscode制作流水灯或者交通灯
slug: 使用pythonpyqt5vscode制作流水灯或者交通灯
category: Python 编程
summary: 需要用到 Python PyQt5 vscode，其他的各模块引用在代码里面有，自己找找就行
tags: Python
---

需要用到 Python PyQt5 vscode，其他的各模块引用在代码里面有，自己找找就行


制作流水灯代码


```python
import sys
from PyQt5.QtCore import (QEvent, QTimer, Qt,QPoint)
from PyQt5.QtWidgets import (QApplication, QMenu,QMainWindow)
from PyQt5.QtGui import QPainter,QPen,QColor

class Widget(QMainWindow):
  def __init__(self, parent=None):
    super(Widget, self).__init__(parent)
    self.text ='hello worlds'
    self.resize(1200, 800)
    self.move(100, 100)
    self.i = 0
    self.mytimer = QTimer(self)
    self.mytimer.timeout.connect(self.update)
    self.mytimer.start(1000)

  def paintEvent(self,event):
        painter = QPainter(self)

        painter.drawEllipse(200,200,160,160)
        painter.drawEllipse(400,200,160,160)
        painter.drawEllipse(600,200,160,160)
        painter.drawEllipse(800,200,160,160)
        painter.drawEllipse(1000,200,160,160)

        painter.setPen(QColor(255,0,0))
        painter.setBrush(QColor(255,0,0))

        if self.i % 5 == 0:
            painter.drawEllipse(200,200,160,160)
        elif self.i % 5 == 1:
            painter.drawEllipse(400,200,160,160)
        elif self.i % 5 == 2:
            painter.drawEllipse(600,200,160,160)
        elif self.i % 5 == 3:
            painter.drawEllipse(800,200,160,160)
        elif self.i % 5 == 4:
            painter.drawEllipse(1000,200,160,160)

        self.i = self.i + 1
        if self.i > 1000:
           self.i = 0

if __name__ == "__main__":
  app = QApplication(sys.argv)
  form = Widget()
  form.show()
  app.exec_()
```


效果如下


![](/uploads/csdn/使用pythonpyqt5vscode制作流水灯或者交通灯/img-01.gif)


交通灯代码


```python
import sys
from PyQt5.QtCore import (QEvent, QTimer, Qt,QPoint)
from PyQt5.QtWidgets import (QApplication, QMenu,QMainWindow)
from PyQt5.QtGui import QPainter,QPen,QColor

class Widget(QMainWindow):
  def __init__(self, parent=None):
    super(Widget, self).__init__(parent)
    self.text ='hello worlds'
    self.resize(1200, 800)
    self.move(100, 100)
    self.i = 0
    self.mytimer = QTimer(self)
    self.mytimer.timeout.connect(self.update)
    self.mytimer.start(1000)

  def paintEvent(self,event):
        painter = QPainter(self)
        #for i in range(0,11,1):
        #    painter.drawEllipse(2,2,i,i)
        if self.i % 3 == 0:
            painter.setPen(QColor(0,125,0))
            painter.setBrush(QColor(0,255,0))
            #painter.drawEllipse(200,200,160,160)
        elif self.i % 3 == 1:
            painter.setPen(QColor(255,0,0))
            painter.setBrush(QColor(255,0,0))
            #painter.drawEllipse(200,200,160,160)
        elif self.i % 3 == 2:
            painter.setPen(QColor(0,0,255))
            painter.setBrush(QColor(0,0,255))
            #painter.drawEllipse(200,200,160,160)

        painter.drawEllipse(200,200,160,160)
        painter.drawEllipse(400,200,160,160)
        painter.drawEllipse(600,200,160,160)

        self.i = self.i + 1
        if self.i > 1000:
           self.i = 0

if __name__ == "__main__":
  app = QApplication(sys.argv)
  form = Widget()
  form.show()
  app.exec_()
```


效果入下


![](/uploads/csdn/使用pythonpyqt5vscode制作流水灯或者交通灯/img-02.gif)


如有疑问，可评论，也可以私信我
