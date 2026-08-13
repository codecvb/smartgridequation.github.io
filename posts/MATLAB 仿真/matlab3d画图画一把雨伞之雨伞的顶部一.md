---
title: MATLAB3D画图画一把雨伞之雨伞的顶部一
slug: matlab3d画图画一把雨伞之雨伞的顶部一
category: MATLAB 仿真
summary: 题记 雨巷里的一把油纸伞
tags: MATLAB
---

题记 雨巷里的一把油纸伞


一把带顶的雨伞，代码如下：


```cpp
%%%Date 2022年1月11日

%%%Author SmartGridequation

%%%Code BY MATLAB

figure(1)
draw_sphere();

function draw_sphere()

t=linspace(0,0.05*pi,2*pi);
p=linspace(0,2*pi,2*pi);
[theta,phi]=meshgrid(t,p); %网格化数据
R=1; %设置球面半径


x=R*sin(theta).*cos(phi); %代入参数方程
y=R*sin(theta).*sin(phi);
z=R*cos(theta);

hold on

deta = 0;
z = z*1.5;


for i = 1:20
deta = 0.001+deta;

surf(x/i,y/i,z+deta); %绘制表面图
end

end
```


效果如下：


一把带顶的雨伞俯视图（一）


![watermark,type\_d3F5LXplbmhlaQ,shadow\_50,text\_Q1NETiBAU21hcnRHcmlkZXF1YXRpb24=,size\_13,color\_FFFFFF,t\_70,g\_se,x\_16](/uploads/csdn/matlab3d画图画一把雨伞之雨伞的顶部一/img-01.jpeg)


 一把带顶的雨伞侧视图（二）


![watermark,type\_d3F5LXplbmhlaQ,shadow\_50,text\_Q1NETiBAU21hcnRHcmlkZXF1YXRpb24=,size\_13,color\_FFFFFF,t\_70,g\_se,x\_16](/uploads/csdn/matlab3d画图画一把雨伞之雨伞的顶部一/img-02.jpeg)
