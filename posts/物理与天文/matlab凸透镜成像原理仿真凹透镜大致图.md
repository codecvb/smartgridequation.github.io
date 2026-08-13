---
title: MATLAB凸透镜成像原理仿真凹透镜大致图
slug: matlab凸透镜成像原理仿真凹透镜大致图
category: 物理与天文
summary: 用MATLAB画凸透镜成像仿真，直线代表光线，方向由左向右，蓝色部分是焦点成像图。代码如下（内有画圆弧的代码）：
tags: 物理, 天文, MATLAB
---

用MATLAB画凸透镜成像仿真，直线代表光线，方向由左向右，蓝色部分是焦点成像图。代码如下（内有画圆弧的代码）：


```cs
% 焦点
jiaodian_x = 0.4;
jiaodian_y = 0.0;
jiaodian_yy = 0.5;
%成像点
chengxiangdian_x = -1.5;
chengxiangdian_y = 0.4;

hold on

plot([chengxiangdian_x,chengxiangdian_x],[0,chengxiangdian_y],"b","LineWidth",1)
plot([chengxiangdian_x-0.1,jiaodian_x+1],[0,0],"b","LineWidth",1)
plot([chengxiangdian_x,0],[chengxiangdian_y,chengxiangdian_y],"r","LineWidth",1)

k1 = chengxiangdian_y/chengxiangdian_x;

xx = chengxiangdian_x-0.1:0.1:1;
yy = xx.*k1;

plot(xx,yy)

k2 = -chengxiangdian_y/jiaodian_x;

xx = 0:0.1:1;
yy = xx.*k2+chengxiangdian_y;

plot(xx,yy)

%交点
xx0 = chengxiangdian_y/(k1-k2);
yy0 = k1*xx0;
plot([xx0,xx0],[0,k1*xx0],"b","LineWidth",1)

plot([jiaodian_x,0],[jiaodian_y,0.2],"b","LineWidth",1)
plot([-jiaodian_x,0],[jiaodian_y,0.2],"b","LineWidth",1)
plot([jiaodian_x,0],[jiaodian_y,-0.2],"b","LineWidth",1)
plot([-jiaodian_x,0],[jiaodian_y,-0.2],"b","LineWidth",1)

t=-pi/2*(1/3):0.01:pi/2*(1/3);%角度范围
r=1;%半径
center=[0 0];%圆心坐标
x=(cos(t).*r+center(1)-cos(pi/2*(1/3))*r)/8;
y=sin(t).*r+center(2);
plot(x,y,"k")

hold on

t=-pi/2*(1/3):0.01:pi/2*(1/3);%角度范围
r=1;%半径
center=[0 0];%圆心坐标
x=(-cos(t).*r+center(1)+cos(pi/2*(1/3))*r)/8;
y=-sin(t).*r+center(2);
plot(x,y,"k")

axis equal
```


效果如下：


![](/uploads/csdn/matlab凸透镜成像原理仿真凹透镜大致图/img-01.png)


坐标自己在代码段修改，凸透镜的大小和焦距自己修改。


凹透镜大致代码如下：


```cs
t=-pi/2*(1/3):0.01:pi/2*(1/3);%角度范围
r=1;%半径
center=[0 0];%圆心坐标
x=cos(t).*r+center(1)-cos(pi/2*(1/3))*r-0.2;
y=sin(t).*r+center(2);
plot(x,y)

hold on

t=-pi/2*(1/3):0.01:pi/2*(1/3);%角度范围
r=1;%半径
center=[0 0];%圆心坐标
x=-cos(t).*r+center(1)+cos(pi/2*(1/3))*r+0.2;
y=-sin(t).*r+center(2);
plot(x,y)

axis equal
```


 效果如下（如需光路图需要自己添加功能）：


![](/uploads/csdn/matlab凸透镜成像原理仿真凹透镜大致图/img-02.png)
