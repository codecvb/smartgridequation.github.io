---
title: 求过椭圆上一定点的诸弦的中点的轨迹并讨论用MATLAB画出来轨迹图高考试题
slug: 求过椭圆上一定点的诸弦的中点的轨迹并讨论用matlab画出来轨迹图高考试题
category: MATLAB 仿真
summary: 本文通过MATLAB程序展示了椭圆中弦中点轨迹的性质。
tags: MATLAB
---

本文通过MATLAB程序展示了椭圆中弦中点轨迹的性质。


给定一个长半轴2、短半轴1的椭圆，程序选取椭圆上的定点P(2,0)，生成过P点的8条弦并计算其中点，发现这些中点都落在中心在(1,0)、长半轴1、短半轴0.5的小椭圆上。


通过参数方程绘制原椭圆和轨迹椭圆，并可视化展示弦及其中点，验证了椭圆中弦中点轨迹仍为椭圆的几何性质。当P点在原椭圆上移动时，轨迹椭圆的中心也会随之移动。


![](/uploads/csdn/求过椭圆上一定点的诸弦的中点的轨迹并讨论用matlab画出来轨迹图高考试题/img-01.png)


![](/uploads/csdn/求过椭圆上一定点的诸弦的中点的轨迹并讨论用matlab画出来轨迹图高考试题/img-02.png)


![](/uploads/csdn/求过椭圆上一定点的诸弦的中点的轨迹并讨论用matlab画出来轨迹图高考试题/img-03.png)


![](/uploads/csdn/求过椭圆上一定点的诸弦的中点的轨迹并讨论用matlab画出来轨迹图高考试题/img-04.png)


```Matlab
% 1. 定义参数（原椭圆与定点）
a = 2;          % 原椭圆长半轴
b = 1;          % 原椭圆短半轴
x0 = 2;         % 定点P的x坐标
y0 = 0;         % 定点P的y坐标

% 2. 生成原椭圆的点（参数方程）
theta = linspace(0, 2*pi, 1000);  % θ从0到2π，取1000个点
x_ellipse = a * cos(theta);
y_ellipse = b * sin(theta);

% 3. 生成轨迹小椭圆的点（参数方程）
h = x0 / 2;     % 轨迹椭圆中心x坐标
k = y0 / 2;     % 轨迹椭圆中心y坐标
a_prime = a / 2;% 轨迹椭圆长半轴
b_prime = b / 2;% 轨迹椭圆短半轴
x_trace = h + a_prime * cos(theta);
y_trace = k + b_prime * sin(theta);

% 4. 生成过定点P的若干条弦及其中点
num_chords = 8;  % 选取8条弦进行展示
theta_points = linspace(0, 2*pi, num_chords+1);  % 均匀分布的角度点
theta_points(end) = [];  % 去除最后一个点（与第一个重复）

% 存储弦的端点和中点
x1 = zeros(1, num_chords);
y1 = zeros(1, num_chords);
x2 = zeros(1, num_chords);
y2 = zeros(1, num_chords);
mid_x = zeros(1, num_chords);
mid_y = zeros(1, num_chords);

for i = 1:num_chords
    % 第一个端点：根据角度生成
    theta1 = theta_points(i);
    x1(i) = a * cos(theta1);
    y1(i) = b * sin(theta1);

    % 计算第二个端点（确保与P、第一个端点共线且在椭圆上）
    % 通过直线方程与椭圆方程联立求解
    if x1(i) ~= x0  % 避免垂直直线
        m = (y1(i) - y0) / (x1(i) - x0);  % 弦的斜率
        c = y0 - m * x0;                  % 直线截距

        % 解二次方程：(x²/a²) + ((m*x + c)²/b²) = 1
        A = 1/a^2 + m^2/b^2;
        B = 2*m*c/b^2;
        C = c^2/b^2 - 1;
        roots_x = roots([A, B, C]);

        % 选择不同于x1(i)的解作为第二个端点
        if abs(roots_x(1) - x1(i)) < 1e-6
            x2(i) = roots_x(2);
        else
            x2(i) = roots_x(1);
        end
        y2(i) = m * x2(i) + c;
    else  % 垂直直线情况
        x2(i) = x0;
        % 解椭圆方程求y
        y_sq = b^2 * (1 - x0^2/a^2);
        if y_sq > 0
            y_vals = [-sqrt(y_sq), sqrt(y_sq)];
            if abs(y_vals(1) - y1(i)) < 1e-6
                y2(i) = y_vals(2);
            else
                y2(i) = y_vals(1);
            end
        end
    end

    % 计算中点
    mid_x(i) = (x1(i) + x2(i)) / 2;
    mid_y(i) = (y1(i) + y2(i)) / 2;
end

% 5. 绘图设置
figure('Color','white','Position',[100,100,800,600]);
hold on;

% 绘制原椭圆（蓝色实线）
plot(x_ellipse, y_ellipse, 'b-', 'LineWidth', 2, ...
    'DisplayName', ['原椭圆: x²/', num2str(a^2), ' + y²/', num2str(b^2), ' = 1']);

% 绘制轨迹小椭圆（红色虚线）
plot(x_trace, y_trace, 'r--', 'LineWidth', 2, ...
    'DisplayName', ['轨迹椭圆: 中心(', num2str(h), ',', num2str(k), ')']);

% 绘制弦（灰色线段）
for i = 1:num_chords
    plot([x1(i), x2(i)], [y1(i), y2(i)], 'k-', 'LineWidth', 1.2, 'HandleVisibility', 'off');
end

% 标记定点P、轨迹中心O'和中点
scatter(x0, y0, 80, 'g', 'filled', 'DisplayName', ['定点P(', num2str(x0), ',', num2str(y0), ')']);
scatter(h, k, 80, 'm', 'filled', 'DisplayName', ['轨迹中心O''(', num2str(h), ',', num2str(k), ')']);
scatter(mid_x, mid_y, 50, 'c', 'filled', 'DisplayName', '弦的中点');

% 图形美化
xlabel('x 轴', 'FontSize', 12);
ylabel('y 轴', 'FontSize', 12);
title('椭圆上定点P的诸弦及其中点轨迹', 'FontSize', 14, 'FontWeight', 'bold');
axis equal;  % 等比例显示，避免图形变形
grid on;
legend('Location', 'best', 'FontSize', 10);
hold off;
```


![](/uploads/csdn/求过椭圆上一定点的诸弦的中点的轨迹并讨论用matlab画出来轨迹图高考试题/img-05.png)


下面我将创建一个 MATLAB 程序，用于展示当椭圆上的定点 P 移动时，其诸弦中点所形成的轨迹椭圆的中心的运动轨迹。


我们已经知道，对于椭圆当 P 点在原椭圆上移动时，这个中心也会形成一个轨迹。


![](/uploads/csdn/求过椭圆上一定点的诸弦的中点的轨迹并讨论用matlab画出来轨迹图高考试题/img-06.png)
