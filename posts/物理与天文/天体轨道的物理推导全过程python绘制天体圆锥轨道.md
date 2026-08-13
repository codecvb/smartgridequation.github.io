---
title: 天体轨道的物理推导全过程Python绘制天体圆锥轨道
slug: 天体轨道的物理推导全过程python绘制天体圆锥轨道
category: 物理与天文
summary: 以下是使用 Python 的matplotlib库结合numpy库，根据圆锥曲线的极坐标方程来绘制圆锥曲线（椭圆、抛物线、双曲线）的代码示例，以下代码在 Python 3 环境下运行：
tags: 物理, 天文, Python, 卫星, 物理仿真
---

![](/uploads/csdn/天体轨道的物理推导全过程python绘制天体圆锥轨道/img-01.png)![](/uploads/csdn/天体轨道的物理推导全过程python绘制天体圆锥轨道/img-02.png)![](/uploads/csdn/天体轨道的物理推导全过程python绘制天体圆锥轨道/img-03.png)![](/uploads/csdn/天体轨道的物理推导全过程python绘制天体圆锥轨道/img-04.png)![](/uploads/csdn/天体轨道的物理推导全过程python绘制天体圆锥轨道/img-05.png)![](/uploads/csdn/天体轨道的物理推导全过程python绘制天体圆锥轨道/img-06.png)


以下是使用 Python 的`matplotlib`库结合`numpy`库，根据圆锥曲线的极坐标方程来绘制圆锥曲线（椭圆、抛物线、双曲线）的代码示例，以下代码在 Python 3 环境下运行：


python


```python
import numpy as np
import matplotlib.pyplot as plt

# 绘制圆锥曲线的函数
def draw_conic(e, p, num_points=1000):
    """
    根据离心率e和焦准距p绘制圆锥曲线

    参数:
    e: 离心率，对于椭圆 0 < e < 1，对于抛物线 e = 1，对于双曲线 e > 1
    p: 焦准距
    num_points: 绘制曲线的点数，默认为1000
    """
    theta = np.linspace(0, 2 * np.pi, num_points)
    r = (e * p) / (1 - e * np.cos(theta))
    plt.polar(theta, r)
    plt.title("Conic Section with e={}".format(e))
    plt.show()

# 示例用法
# 绘制椭圆
e_ellipse = 0.5
p_ellipse = 2
draw_conic(e_ellipse, p_ellipse)

# 绘制抛物线
e_parabola = 1
p_parabola = 1
draw_conic(e_parabola, p_parabola)

# 绘制双曲线
e_hyperbola = 1.5
p_hyperbola = 2
draw_conic(e_hyperbola, p_hyperbola)
```


在上述代码中：


1.  首先定义了`draw_conic`函数，它接受离心率`e`和焦准距`p`作为参数，同时可以指定绘制曲线的点数`num_points`（默认 1000 个点）。
2.  在函数内部，使用`numpy`的`linspace`函数生成了从`0`到`2 * np.pi`的等间隔角度值数组`theta`，表示极坐标中的极角。
3.  然后根据圆锥曲线的极坐标方程`r = (e * p) / (1 - e * np.cos(theta))`计算出对应极角下的极径`r`数组。
4.  最后使用`matplotlib`的`polar`函数按照极坐标的形式绘制曲线，并展示出来。通过分别设定不同的离心率和焦准距的值，来绘制椭圆、抛物线和双曲线这三种不同类型的圆锥曲线。


你可以根据实际需求，调整`e`（离心率）和`p`（焦准距）等参数来观察不同形状的圆锥曲线。


如果你希望进一步美化图形、添加更多元素（比如坐标轴标签、图例等），可以在代码基础上继续扩展，例如：


python


```python
import numpy as np
import matplotlib.pyplot as plt

# 绘制圆锥曲线的函数
def draw_conic(e, p, num_points=1000):
    """
    根据离心率e和焦准距p绘制圆锥曲线

    参数:
    e: 离心率，对于椭圆 0 < e < 1，对于抛物线 e = 1，对于双曲线 e > 1
    p: 焦准距
    num_points: 绘制曲线的点数，默认为1000
    """
    theta = np.linspace(0, 2 * np.pi, num_points)
    r = (e * p) / (1 - e * np.cos(theta))
    ax = plt.subplot(111, projection='polar')
    ax.plot(theta, r)
    ax.set_title("Conic Section with e={}".format(e))
    ax.set_rmax(np.max(r) * 1.2)  # 适当放大极径范围，让曲线显示更完整
    ax.set_rticks([])  # 隐藏极径刻度
    ax.set_thetagrids([])  # 隐藏极角刻度
    plt.show()

# 示例用法
# 绘制椭圆
e_ellipse = 0.5
p_ellipse = 2
draw_conic(e_ellipse, p_ellipse)

# 绘制抛物线
e_parabola = 1
p_parabola = 1
draw_conic(e_parabola,  p_parabola)

# 绘制双曲线
e_hyperbola = 1.5
p_hyperbola = 2
draw_conic(e_hyperbola, p_hyperbola)
```


这段扩展后的代码对图形展示做了一些优化，例如将图形在极坐标投影下绘制，设置了合适的极径显示范围、隐藏了极径和极角的刻度等，让图形看起来更加简洁美观。 你可以根据自己的喜好进一步修改图形的外观设置。


效果如下


![](/uploads/csdn/天体轨道的物理推导全过程python绘制天体圆锥轨道/img-07.webp)


![](/uploads/csdn/天体轨道的物理推导全过程python绘制天体圆锥轨道/img-08.webp)
