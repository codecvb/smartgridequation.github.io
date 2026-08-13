---
title: Python利用海龟画图turtle库做一个篮球比赛计时画面
slug: python利用海龟画图turtle库做一个篮球比赛计时画面
category: Python 编程
summary: Python利用海龟画图turtle库做一个篮球比赛计时画面，代码如下
tags: Python
---

Python利用海龟画图turtle库做一个篮球比赛计时画面，代码如下


```python
import turtle
import time
import random
r = random.random()
g = random.random()
b = random.random()
turtle.speed(0)
for j in range(1,2,1):
    for i in range(1,60,1):
        print(i)
        time.sleep(0.1)
        turtle.color(r,g,b) #这是在设置颜色
        turtle.clear()
        turtle.hideturtle()
        turtle.penup()
        turtle.goto(0, 0)
        turtle.pendown()
        turtle.write('篮球比赛计时',align='center',font=('楷体',100,'normal'))
        turtle.penup()
        turtle.goto(60, -350)
        turtle.pendown()
        if(i<10):
            turtle.write('0'+str(j)+':0'+str(i),align='center',font=('楷体',300,'normal'))
        else:
            turtle.write('0'+str(j)+':'+str(i),align='center',font=('楷体',300,'normal'))
turtle.clear()
turtle.write('计时结束',align='center',font=('楷体',100,'normal'))
```


效果如下


![](/uploads/csdn/python利用海龟画图turtle库做一个篮球比赛计时画面/img-01.gif)
