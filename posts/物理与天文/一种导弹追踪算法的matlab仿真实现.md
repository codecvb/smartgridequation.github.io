---
title: 一种导弹追踪算法的MATLAB仿真实现
slug: 一种导弹追踪算法的matlab仿真实现
category: 物理与天文
summary: 代码说明：
tags: 物理, 天文, MATLAB
---

![](/uploads/csdn/一种导弹追踪算法的matlab仿真实现/img-01.gif)


![](/uploads/csdn/一种导弹追踪算法的matlab仿真实现/img-02.jpeg)


#### 代码说明：


1.  **参数设置**：设定时间步长、总模拟时间、初始位置和速度等参数。
2.  **空气动力学模型**：利用简化的空气阻力公式来计算两个导弹所受的阻力。
3.  **追踪算法**：采用比例导引算法，让防空导弹追踪机动变轨导弹。
4.  **机动变轨模拟**：每隔 2 秒，机动变轨导弹进行一次随机变轨。
5.  **3D 可视化**：绘制两个导弹的轨迹，并通过动画展示整个追踪过程。


你可以运行这段代码，从而观察机动变轨导弹和防空导弹的速度与位置变化。


以下是一个用于模拟机动变轨导弹和防空导弹追踪过程的 MATLAB 代码，同时会提供 3D 效果展示。


```Matlab
% 模拟参数设置
dt = 0.1; % 时间步长 (s)
t_total = 60; % 总模拟时间 (s)
t = 0:dt:t_total; % 时间向量
num_steps = length(t);

% 初始条件
% 机动变轨导弹初始位置和速度
target_pos = [0; 0; 0];
target_vel = [200; 200; 200];

% 防空导弹初始位置和速度
interceptor_pos = [-6000; -8000; -3000];
interceptor_vel = [600; 600; 600];

% 存储位置和速度
target_pos_history = zeros(3, num_steps);
target_vel_history = zeros(3, num_steps);
interceptor_pos_history = zeros(3, num_steps);
interceptor_vel_history = zeros(3, num_steps);

% 空气动力学参数（简化）
drag_coeff_target = 0.2; % 机动变轨导弹阻力系数
drag_coeff_interceptor = 0.1; % 防空导弹阻力系数
mass_target = 1000; % 机动变轨导弹质量 (kg)
mass_interceptor = 500; % 防空导弹质量 (kg)
air_density = 1.225; % 空气密度 (kg/m^3)
cross_section_target = 1; % 机动变轨导弹横截面积 (m^2)
cross_section_interceptor = 0.5; % 防空导弹横截面积 (m^2)

% 模拟循环
for i = 1:num_steps
    % 存储当前状态
    target_pos_history(:, i) = target_pos;
    target_vel_history(:, i) = target_vel;
    interceptor_pos_history(:, i) = interceptor_pos;
    interceptor_vel_history(:, i) = interceptor_vel;

    % 机动变轨导弹的随机变轨（简单模拟）
    if mod(i, 20) == 0 % 每 2 秒进行一次变轨
        target_vel = target_vel + [randn; randn; randn] * 10;
    end

    % 计算空气阻力
    target_drag = -0.5 * air_density * norm(target_vel)^2 * drag_coeff_target * cross_section_target * target_vel / norm(target_vel);
    interceptor_drag = -0.5 * air_density * norm(interceptor_vel)^2 * drag_coeff_interceptor * cross_section_interceptor * interceptor_vel / norm(interceptor_vel);

    % 计算加速度
    target_acc = target_drag / mass_target;

    % 防空导弹的追踪算法（比例导引）
    line_of_sight = target_pos - interceptor_pos;
    line_of_sight_vel = target_vel - interceptor_vel;
    line_of_sight_rate = (line_of_sight_vel - dot(line_of_sight_vel, line_of_sight) / norm(line_of_sight)^2 * line_of_sight) / norm(line_of_sight);
    interceptor_acc = 3 * norm(interceptor_vel) * line_of_sight_rate + interceptor_drag / mass_interceptor;


    % 更新速度和位置
    target_vel = target_vel + target_acc * dt;
    target_pos = target_pos + target_vel * dt;
    interceptor_vel = interceptor_vel + interceptor_acc * dt;
    interceptor_pos = interceptor_pos + interceptor_vel * dt;
end

% 3D 可视化
figure;
hold on;
grid on;
xlabel('X (m)');
ylabel('Y (m)');
zlabel('Z (m)');
title('机动变轨导弹与防空导弹追踪模拟');

% 绘制轨迹
plot3(target_pos_history(1, :), target_pos_history(2, :), target_pos_history(3, :), 'r', 'LineWidth', 2);
plot3(interceptor_pos_history(1, :), interceptor_pos_history(2, :), interceptor_pos_history(3, :), 'b', 'LineWidth', 2);

% 绘制起始点
plot3(target_pos_history(1, 1), target_pos_history(2, 1), target_pos_history(3, 1), 'ro', 'MarkerFaceColor', 'r', 'MarkerSize', 10);
plot3(interceptor_pos_history(1, 1), interceptor_pos_history(2, 1), interceptor_pos_history(3, 1), 'bo', 'MarkerFaceColor', 'b', 'MarkerSize', 10);

% 绘制当前位置
current_target = plot3(target_pos_history(1, end), target_pos_history(2, end), target_pos_history(3, end), 'rs', 'MarkerFaceColor', 'r', 'MarkerSize', 10);
current_interceptor = plot3(interceptor_pos_history(1, end), interceptor_pos_history(2, end), interceptor_pos_history(3, end), 'bs', 'MarkerFaceColor', 'b', 'MarkerSize', 10);

% 动画效果
for i = 1:num_steps
    set(current_target, 'XData', target_pos_history(1, i), 'YData', target_pos_history(2, i), 'ZData', target_pos_history(3, i));
    set(current_interceptor, 'XData', interceptor_pos_history(1, i), 'YData', interceptor_pos_history(2, i), 'ZData', interceptor_pos_history(3, i));
    drawnow;
    pause(0.01);
end
```
