---
title: MATLAB基础编程003 1之画双曲面的组合
slug: matlab基础编程003-1之画双曲面的组合
category: MATLAB 仿真
summary: （1）先画一个双曲面，代码如下：
tags: MATLAB
---

（1）先画一个双曲面，代码如下：


```cs
u = -32:0.1:32;
v = -32:0.1:32;
[xx,yy] = meshgrid(u,v);
zz = (xx.^2)/9-(yy.^2)/16;
mesh(xx,zz,yy)
```


效果如下：


![](/uploads/csdn/matlab基础编程003-1之画双曲面的组合/img-01.jpeg)


（2）再画一个对称的的双曲面，代码如下:


```cs
u = -32:0.1:32;
v = -32:0.1:32;
[xx,yy] = meshgrid(u,v);
zz = (xx.^2)/9-(yy.^2)/16;
mesh(xx,yy,zz)
hold on
u = -32:0.1:32;
v = -32:0.1:32;
[xx,yy] = meshgrid(u,v);
zz = (xx.^2)/9-(yy.^2)/16 - 192;
mesh(xx,yy,-zz)
```


显示效果如下：


![](/uploads/csdn/matlab基础编程003-1之画双曲面的组合/img-02.jpeg)


 （3）无意中画出了另外的图形，效果如下：


![](/uploads/csdn/matlab基础编程003-1之画双曲面的组合/img-03.jpeg)


![](/uploads/csdn/matlab基础编程003-1之画双曲面的组合/img-04.gif)


 源代码来自百度经验，如有疑问，请您留言。
