---
title: 利用PythonQt6制作会移动的字体动画
slug: 利用pythonqt6制作会移动的字体动画
category: Python 编程
summary: python
This Python file uses the following encoding: utf-8
import sys
tags: Python, QT6
---

```python
# This Python file uses the following encoding: utf-8
import sys

from PySide6.QtWidgets import QApplication, QWidget
from PySide6.QtGui import QPainter, QColor, QFont
from PySide6.QtCore import Qt,QTimer
# Important:
# You need to run the following command to generate the ui_form.py file
#     pyside6-uic form.ui -o ui_form.py, or
#     pyside2-uic form.ui -o ui_form.py
from ui_form import Ui_Widget

class Widget(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.ui = Ui_Widget()
        #self.ui.setupUi(self)
        self.i = 0
        self.id = 0
        self.initUI()
        self.timer = QTimer()
        self.timer.setInterval(100)
        self.timer.timeout.connect(self.update_1)
        self.timer.start()

    def initUI(self):
        self.text = "hello world!"
        self.setGeometry(300, 300, 350, 200)
        self.setWindowTitle('Drawing text')
        self.show()

    def paintEvent(self, event): # 重载⽅法
        qp = QPainter()
        qp.begin(self)
        self.drawText(event, qp)
        qp.end()

    def drawText(self, event, qp):
        qp.setPen(QColor(168, 34, 3))
        qp.setFont(QFont('Decorative', 25))
        #qp.drawText(event.rect(), Qt.AlignCenter, self.text)
        qp.drawText(self.id,100, self.text)

    def update_1(self):
        self.i = self.i + 1
        if self.i >100:
            self.i = 0
        self.id = 3*self.i
        self.update()

if __name__ == "__main__":
    app = QApplication(sys.argv)
    widget = Widget()
    widget.show()
    sys.exit(app.exec())
```


以上为完整代码，可得到如下运行图：


![](/uploads/csdn/利用pythonqt6制作会移动的字体动画/img-01.png)
