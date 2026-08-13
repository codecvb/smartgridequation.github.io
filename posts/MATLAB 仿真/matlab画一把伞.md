---
title: MATLAB画一把伞
slug: matlab画一把伞
category: MATLAB 仿真
summary: Matlab
% 伞的参数
tags: MATLAB
---

![](/uploads/csdn/matlab画一把伞/img-01.jpeg)


```Matlab
% 伞的参数

num_ribs = 5; % 伞骨数量修改为5

R = 1; % 伞的半径

height = 0.5; % 伞的高度

handle_length = 2; % 伞柄长度

semicircle_radius = 0.26; % 伞柄末端半圆的半径

% 生成伞叶网格

theta = linspace(0, 2*pi, 100);

phi = linspace(0, pi/2, 50);

[Theta, Phi] = meshgrid(theta, phi);

% 计算伞叶的坐标

X = R * cos(Theta) .* sin(Phi);

Y = R * sin(Theta) .* sin(Phi);

Z = height * cos(Phi);

% 给伞叶添加一些随机波动，模拟褶皱

noise = 0.009 * randn(size(Z));

Z = Z + noise;

% 绘制伞叶

figure;

surf(X, Y, Z, 'FaceColor', 'interp', 'EdgeColor', 'none');

hold on

% 绘制伞骨

for i = 1:num_ribs

theta_rib = (i - 1) * 2*pi / num_ribs;

x_rib = R * cos(theta_rib) * sin(phi);

y_rib = R * sin(theta_rib) * sin(phi);

z_rib = height * cos(phi);

plot3(x_rib, y_rib, z_rib, 'k', 'LineWidth', 2);

hold on

end

% 绘制伞柄

x_handle = [0, 0];

y_handle = [0, 0];

z_handle = [0, -handle_length+0.5];

plot3(x_handle, y_handle, z_handle+[0.5,0.5], 'k', 'LineWidth', 3);

hold on

x_handle = [0, 0];

y_handle = [0, 0];

z_handle = [0, handle_length*0.1];

plot3(x_handle, y_handle, z_handle+[0.5,0.5], 'k', 'LineWidth', 3);

hold on

% 绘制伞柄末端的半圆

semicircle_theta = linspace(0, pi, 50);

x_semicircle = semicircle_radius * cos(semicircle_theta);

y_semicircle = -handle_length * ones(size(semicircle_theta));

z_semicircle = -semicircle_radius * sin(semicircle_theta);

plot3(x_semicircle+0.15+0.12, y_semicircle+2, z_semicircle-1, 'k', 'LineWidth', 3);

% 设置视角和坐标轴

axis equal;

view(3);

box on;

camlight;

lighting gouraud;
```
