---
title: MATLAB画出湖面波纹相遇所形成的现象
slug: matlab画出湖面波纹相遇所形成的现象
category: MATLAB 仿真
summary: 我们可以使用 MATLAB 来模拟和绘制湖面波纹相遇时产生的干涉现象。这是一个非常经典的物理现象，可以通过二维波动方程的叠加来实现。
tags: MATLAB
---

我们可以使用 MATLAB 来模拟和绘制湖面波纹相遇时产生的干涉现象。这是一个非常经典的物理现象，可以通过二维波动方程的叠加来实现。


下面是完整的 MATLAB 代码，它将模拟两个点波源产生的波纹在水面上传播并相遇的过程，并生成一个动态的 GIF 动画来展示这一现象。


本文介绍了一个使用MATLAB模拟湖面波纹干涉现象的完整代码。该程序通过定义两个点波源，计算其在二维空间产生的波纹传播，并叠加生成干涉图案。代码采用sinc函数模拟振幅衰减，避免奇点问题，并通过循环计算每一时刻的波面状态，最终生成动态GIF动画展示干涉过程。模拟参数包括波源位置、振幅、波长等可调变量，输出结果直观展示了波纹相遇时的干涉现象。该模拟适用于波动光学和水波干涉的教学演示。


![](/uploads/csdn/matlab画出湖面波纹相遇所形成的现象/img-01.gif)


#### 完整 MATLAB 代码


```Matlab
%% 湖面波纹干涉现象模拟

% 清理工作区
clear; clc; close all;

%% 1. 定义模拟参数
L = 100;                  % 模拟区域的大小 (L x L)
N = 200;                  % 网格点数，用于离散化空间
x = linspace(-L/2, L/2, N); % x轴坐标
y = linspace(-L/2, L/2, N); % y轴坐标
[X, Y] = meshgrid(x, y);   % 创建二维网格

% --- 波源参数 ---
S1 = [-20, 0];            % 第一个波源的坐标
S2 = [20, 0];             % 第二个波源的坐标
A = 1.0;                  % 波的振幅
lambda = 10;              % 波长
k = 2 * pi / lambda;      % 波数
omega = 2;                % 角频率

% --- 时间参数 ---
T_total = 20;             % 总模拟时间
Nt = 100;                 % 时间步数
t = linspace(0, T_total, Nt); % 时间数组

% 准备GIF动画
gif_filename = 'ripple_interference.gif';

%% 2. 循环计算并绘制每一帧
for i = 1:Nt
    % 当前时间
    current_t = t(i);

    % --- 计算两个波源产生的波 ---
    % r1 和 r2 是网格上任意一点到两个波源的距离
    r1 = sqrt((X - S1(1)).^2 + (Y - S1(2)).^2);
    r2 = sqrt((X - S2(1)).^2 + (Y - S2(2)).^2);

    % 计算每个波的相位和振幅
    % 使用 sinc 函数来避免在波源点 (r=0) 处出现无穷大，并模拟振幅随距离衰减
    wave1 = A * sinc(r1 / lambda) .* cos(k * r1 - omega * current_t);
    wave2 = A * sinc(r2 / lambda) .* cos(k * r2 - omega * current_t);

    % --- 波的叠加 (干涉) ---
    % 根据波的叠加原理，总位移是各个波位移的代数和
    total_wave = wave1 + wave2;

    % --- 绘制当前帧 ---
    figure(1);
    surf(X, Y, total_wave, 'EdgeColor', 'none');
    axis equal;
    axis([-L/2, L/2, -L/2, L/2, -2*A, 2*A]); % 限制坐标轴范围
    colormap('jet'); % 使用 jet 颜色图，蓝色表示波谷，红色表示波峰
    colorbar;
    title(sprintf('湖面波纹干涉 (t = %.2f s)', current_t));
    xlabel('X (cm)');
    ylabel('Y (cm)');
    zlabel('振幅');
    view(2); % 从上方俯视，更像看湖面
    drawnow;

    % --- 将当前帧写入GIF文件 ---
    frame = getframe(gcf);
    im = frame2im(frame);
    [imind, cm] = rgb2ind(im, 256);

    if i == 1
        imwrite(imind, cm, gif_filename, 'GIF', 'Loopcount', inf, 'DelayTime', 0.1);
    else
        imwrite(imind, cm, gif_filename, 'GIF', 'WriteMode', 'append', 'DelayTime', 0.1);
    end
end

close(gcf); % 关闭图形窗口
disp(['动画已保存为: ', gif_filename]);
```
