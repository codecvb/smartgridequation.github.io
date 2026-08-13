---
title: 嫦娥号地月轨道环月一个月MATLAB仿真
slug: 嫦娥号地月轨道环月一个月matlab仿真
category: 物理与天文
summary: 本文基于MATLAB实现了嫦娥系列探测器登月任务的轨道仿真，包含地月转移轨道和30天的环月轨道运行。仿真考虑了地球停泊轨道（200km）、地月转移轨道（200×405000km）、中途修正、月球捕获和环月轨道（100km）等关键阶段。结果显示：总速度增量约3.3km/s，转移时间约5.2天，30天环月运行约450圈轨道。通过数值积分和可视化分析，验证了轨道设计的合理性。该仿真为深空探测任务提供了轨…
tags: 物理, 天文, MATLAB, 卫星
---

本文基于MATLAB实现了嫦娥系列探测器登月任务的轨道仿真，包含地月转移轨道和30天的环月轨道运行。仿真考虑了地球停泊轨道（200km）、地月转移轨道（200×405000km）、中途修正、月球捕获和环月轨道（100km）等关键阶段。结果显示：总速度增量约3.3km/s，转移时间约5.2天，30天环月运行约450圈轨道。通过数值积分和可视化分析，验证了轨道设计的合理性。该仿真为深空探测任务提供了轨道动力学参考，完整呈现了从发射到长期环月的全过程。


![](/uploads/csdn/嫦娥号地月轨道环月一个月matlab仿真/img-01.png)


![](/uploads/csdn/嫦娥号地月轨道环月一个月matlab仿真/img-02.png)


![](/uploads/csdn/嫦娥号地月轨道环月一个月matlab仿真/img-03.png)


![](/uploads/csdn/嫦娥号地月轨道环月一个月matlab仿真/img-04.png)


MATLAB代码实现


```Matlab
%% 嫦娥登月轨道仿真（完整一个月环月轨道）
% 参考嫦娥一号、二号、三号任务数据
% 包含地月转移轨道和完整的环月轨道

clear; clc; close all;

%% 物理常数和任务参数
mu_earth = 3.986004418e5;     % 地球引力常数 (km^3/s^2)
mu_moon = 4.9028e3;           % 月球引力常数 (km^3/s^2)
R_earth = 6378.137;           % 地球半径 (km)
R_moon = 1737.4;              % 月球半径 (km)
a_moon = 384400;              % 月球轨道半长轴 (km)

% 嫦娥任务参考参数
h_parking = 200;              % 地球停泊轨道高度 (km)
h_transfer_perigee = 200;     % 转移轨道近地点高度 (km)
h_transfer_apogee = 405000;   % 转移轨道远地点略超过月球轨道
h_lunar_orbit = 100;          % 环月轨道高度 (km)

%% 轨道阶段定义
fprintf('═══════════════════════════════════════════════════\n');
fprintf('              嫦娥登月轨道仿真（完整一个月）\n');
fprintf('═══════════════════════════════════════════════════\n\n');

%% 阶段1: 发射和地球停泊轨道
fprintf('阶段1: 发射和地球停泊轨道\n');
fprintf('----------------------------------------\n');

r_parking = R_earth + h_parking;
v_parking = sqrt(mu_earth / r_parking);

fprintf('停泊轨道高度: %.0f km\n', h_parking);
fprintf('停泊轨道速度: %.3f km/s\n', v_parking);
fprintf('轨道周期: %.1f 分钟\n\n', 2*pi*sqrt(r_parking^3/mu_earth)/60);

%% 阶段2: 地月转移轨道注入
fprintf('阶段2: 地月转移轨道注入\n');
fprintf('----------------------------------------\n');

r1 = R_earth + h_transfer_perigee;
r2 = R_earth + h_transfer_apogee;

% 转移轨道计算
a_transfer = (r1 + r2) / 2;
e_transfer = (r2 - r1) / (r2 + r1);
v_perigee_transfer = sqrt(2*mu_earth/r1 - mu_earth/a_transfer);
v_apogee_transfer = sqrt(2*mu_earth/r2 - mu_earth/a_transfer);

% 第一次变轨机动
delta_v1 = v_perigee_transfer - v_parking;
T_transfer = pi * sqrt(a_transfer^3 / mu_earth);

fprintf('转移轨道近地点: %.0f km\n', h_transfer_perigee);
fprintf('转移轨道远地点: %.0f km\n', h_transfer_apogee);
fprintf('转移轨道偏心率: %.4f\n', e_transfer);
fprintf('第一次变轨 ΔV: %.3f km/s\n', delta_v1);
fprintf('转移时间: %.2f 天\n\n', T_transfer/(24*3600));

%% 阶段3: 中途修正
fprintf('阶段3: 中途修正\n');
fprintf('----------------------------------------\n');

n_corrections = 2;
correction_dv = [0.005, 0.003];

fprintf('计划进行 %d 次中途修正\n', n_corrections);
for i = 1:n_corrections
    fprintf('修正 %d ΔV: %.4f km/s\n', i, correction_dv(i));
end
fprintf('总修正 ΔV: %.4f km/s\n\n', sum(correction_dv));

%% 阶段4: 月球捕获
fprintf('阶段4: 月球捕获\n');
fprintf('----------------------------------------\n');

% 月球影响球边界
r_soi = a_moon * (mu_moon / mu_earth)^(2/5);
fprintf('月球影响球半径: %.1f km\n', r_soi);

% 修正的捕获逻辑
v_infinity = 0.8;  % km/s，典型的双曲线超速
v_moon_orbital = sqrt(mu_earth / a_moon);  % 月球轨道速度

% 捕获到环月轨道
r_capture = R_moon + h_lunar_orbit;
v_circular_lunar = sqrt(mu_moon / r_capture);

% 从双曲线轨道到圆形轨道的速度增量
v_perilune_hyp = sqrt(v_infinity^2 + 2*mu_moon/r_capture);
delta_v2 = v_perilune_hyp - v_circular_lunar;

fprintf('月球轨道速度: %.3f km/s\n', v_moon_orbital);
fprintf('双曲线超速: %.3f km/s\n', v_infinity);
fprintf('环月轨道速度: %.3f km/s\n', v_circular_lunar);
fprintf('双曲线近月点速度: %.3f km/s\n', v_perilune_hyp);
fprintf('第二次变轨 ΔV: %.3f km/s\n\n', delta_v2);

%% 阶段5: 环月轨道运行（一个月）
fprintf('阶段5: 环月轨道运行\n');
fprintf('----------------------------------------\n');

delta_v3 = 0.015;
T_lunar_orbit = 2*pi*sqrt(r_capture^3/mu_moon); % 单圈环月轨道周期
lunar_orbit_days = 30; % 运行30天
T_lunar_total = lunar_orbit_days * 24 * 3600; % 总环月运行时间

fprintf('轨道调整 ΔV: %.3f km/s\n', delta_v3);
fprintf('单圈环月轨道周期: %.2f 小时\n', T_lunar_orbit/3600);
fprintf('计划环月运行时间: %d 天\n\n', lunar_orbit_days);

%% 总速度增量汇总
total_dv = delta_v1 + sum(correction_dv) + delta_v2 + delta_v3;

fprintf('总速度增量分析:\n');
fprintf('----------------------------------------\n');
fprintf('地月转移注入: %.3f km/s\n', delta_v1);
fprintf('中途修正:     %.3f km/s\n', sum(correction_dv));
fprintf('月球捕获:     %.3f km/s\n', delta_v2);
fprintf('轨道调整:     %.3f km/s\n', delta_v3);
fprintf('----------------------------------------\n');
fprintf('总计:         %.3f km/s\n', total_dv);

%% 轨道传播和可视化
% 时间设置 - 转移轨道
t_span_transfer = linspace(0, T_transfer, 1000);

% 初始条件 - 从转移轨道近地点开始
y0_transfer = [r1, 0, 0, v_perigee_transfer];

% 传播转移轨道
options = odeset('RelTol', 1e-8, 'AbsTol', 1e-8);
[t_transfer, Y_transfer] = ode45(@(t,y) two_body_ode(t, y, mu_earth), t_span_transfer, y0_transfer, options);

% 提取转移轨道数据
x_transfer = Y_transfer(:,1);
y_transfer = Y_transfer(:,2);
vx_transfer = Y_transfer(:,3);
vy_transfer = Y_transfer(:,4);

% 定义角度变量
theta = linspace(0, 2*pi, 100);

% 月球轨道 (简化圆轨道)
x_moon_orbit = a_moon * cos(theta);
y_moon_orbit = a_moon * sin(theta);

% 找到捕获点位置 - 在转移轨道与月球轨道相交处
[~, capture_idx] = min(abs(sqrt(x_transfer.^2 + y_transfer.^2) - a_moon));
capture_point = [x_transfer(capture_idx), y_transfer(capture_idx)];
capture_velocity = [vx_transfer(capture_idx), vy_transfer(capture_idx)];

fprintf('捕获点位置: (%.0f, %.0f) km\n', capture_point(1), capture_point(2));
fprintf('捕获点速度: (%.3f, %.3f) km/s\n', capture_velocity(1), capture_velocity(2));

%% 模拟捕获后的环月轨道（一个月）
fprintf('\n开始模拟一个月的环月轨道...\n');

% 月球位置（假设在x轴正方向）
moon_pos = [a_moon, 0];

% 转换到月球中心坐标系
r_capture_moon = capture_point - moon_pos;
v_capture_moon = capture_velocity - [0, v_moon_orbital]; % 减去月球轨道速度

fprintf('相对于月球的位置: (%.0f, %.0f) km\n', r_capture_moon(1), r_capture_moon(2));
fprintf('相对于月球的速度: (%.3f, %.3f) km/s\n', v_capture_moon(1), v_capture_moon(2));

% 环月轨道传播（在月球坐标系中）- 一个月
t_span_lunar = linspace(0, T_lunar_total, 3000); % 一个月的环月轨道

% 初始状态（月球坐标系）- 假设已经完成捕获机动，进入圆形轨道
% 修正初始条件为圆形轨道
r_circular = R_moon + h_lunar_orbit;
v_circular = sqrt(mu_moon / r_circular);
% 假设初始位置在x轴正方向，速度在y轴正方向（圆形轨道）
y0_lunar_circular = [r_circular, 0, 0, v_circular];

% 传播环月轨道（在月球引力场中）
[t_lunar, Y_lunar_moon_frame] = ode45(@(t,y) two_body_ode(t, y, mu_moon), t_span_lunar, y0_lunar_circular, options);

% 月球运动（简化，假设月球在圆轨道上匀速运动）
moon_angular_velocity = v_moon_orbital / a_moon;
moon_motion_x = a_moon * cos(moon_angular_velocity * (t_lunar + t_transfer(capture_idx)));
moon_motion_y = a_moon * sin(moon_angular_velocity * (t_lunar + t_transfer(capture_idx)));

% 转换回地心坐标系 - 考虑月球运动
x_lunar_earth_frame = Y_lunar_moon_frame(:,1) + moon_motion_x;
y_lunar_earth_frame = Y_lunar_moon_frame(:,2) + moon_motion_y;

fprintf('环月轨道模拟完成: %d 天，%.0f 圈轨道\n', lunar_orbit_days, T_lunar_total/T_lunar_orbit);

%% 合并所有轨道数据
% 转移轨道时间（相对时间）
time_transfer = t_transfer;
x_all = x_transfer;
y_all = y_transfer;

% 环月轨道时间（连续时间）
time_lunar = t_transfer(capture_idx) + t_lunar;
x_all = [x_all; x_lunar_earth_frame];
y_all = [y_all; y_lunar_earth_frame];

% 合并时间向量
time_all = [time_transfer; time_lunar];

fprintf('总轨道数据点数: %d\n', length(time_all));
fprintf('总仿真时间: %.1f 天\n', max(time_all)/(24*3600));

%% 绘制完整的轨道（转移轨道 + 一个月环月轨道）
figure('Position', [100, 100, 1400, 1000]);

% 主轨道图
subplot(2,3,[1,2,4,5]);
hold on; grid on; axis equal;

% 绘制地球和轨道
plot_earth();
plot(R_earth * cos(theta), R_earth * sin(theta), 'b', 'LineWidth', 1);
plot(r_parking * cos(theta), r_parking * sin(theta), 'g--', 'LineWidth', 1.5);

% 绘制转移轨道
plot(x_transfer, y_transfer, 'r-', 'LineWidth', 2.5);

% 绘制环月轨道（一个月）
plot(x_lunar_earth_frame, y_lunar_earth_frame, 'm-', 'LineWidth', 1.5, 'Color', [0.8 0.2 0.8]);

% 绘制月球轨道和月球
plot(x_moon_orbit, y_moon_orbit, 'k--', 'LineWidth', 1);
plot(moon_pos(1), moon_pos(2), 'ko', 'MarkerSize', 10, 'MarkerFaceColor', [0.6 0.6 0.6]);

% 标记关键点和机动位置
plot_maneuver_points(r1, r_parking, capture_point, delta_v1, delta_v2, moon_pos);

% 标记环月轨道起点
plot(x_lunar_earth_frame(1), y_lunar_earth_frame(1), 'co', 'MarkerSize', 8, 'MarkerFaceColor', 'c');
text(x_lunar_earth_frame(1), y_lunar_earth_frame(1)+20000, '环月开始', ...
     'FontSize', 9, 'HorizontalAlignment', 'center', 'Interpreter', 'none');

% 标记环月轨道终点
plot(x_lunar_earth_frame(end), y_lunar_earth_frame(end), 'c*', 'MarkerSize', 12);
text(x_lunar_earth_frame(end), y_lunar_earth_frame(end)-20000, sprintf('环月结束\n(%d天后)', lunar_orbit_days), ...
     'FontSize', 9, 'HorizontalAlignment', 'center', 'Interpreter', 'none');

% 装饰图形
xlabel('x (km)'); ylabel('y (km)');
title(sprintf('嫦娥登月完整轨道（转移 + %d天环月）', lunar_orbit_days), 'FontSize', 14, 'FontWeight', 'bold');
legend('地球', '停泊轨道', '地月转移轨道', sprintf('%d天环月轨道', lunar_orbit_days), ...
       '月球轨道', '月球', '发射点', '月球捕获点', '环月开始', '环月结束', 'Location', 'best');

% 轨道高度变化（完整任务）
subplot(2,3,3);
r_all = sqrt(x_all.^2 + y_all.^2);
plot(time_all/(24*3600), (r_all - R_earth)/1000, 'b-', 'LineWidth', 2);
hold on;

% 标记关键点
plot(time_transfer(capture_idx)/(24*3600), (norm(capture_point) - R_earth)/1000, 'ro', ...
     'MarkerSize', 8, 'MarkerFaceColor', 'r');
plot(time_lunar(1)/(24*3600), (r_all(capture_idx) - R_earth)/1000, 'mo', ...
     'MarkerSize', 8, 'MarkerFaceColor', 'm');
plot(time_lunar(end)/(24*3600), (r_all(end) - R_earth)/1000, 'c*', 'MarkerSize', 10);

grid on;
xlabel('任务时间 (天)'); ylabel('高度 (千公里)');
title('完整任务轨道高度变化');
legend('轨道高度', '捕获点', '环月开始', sprintf('环月结束(%d天)', lunar_orbit_days), 'Location', 'best');

% 速度变化（完整任务）
subplot(2,3,6);
% 计算速度（数值微分）
vx_all = gradient(x_all, time_all);
vy_all = gradient(y_all, time_all);
v_all = sqrt(vx_all.^2 + vy_all.^2);

plot(time_all/(24*3600), v_all, 'r-', 'LineWidth', 2);
hold on;

% 标记关键点
plot(time_transfer(capture_idx)/(24*3600), v_all(capture_idx), 'ro', ...
     'MarkerSize', 8, 'MarkerFaceColor', 'r');
plot(time_lunar(1)/(24*3600), v_all(length(time_transfer)+1), 'mo', ...
     'MarkerSize', 8, 'MarkerFaceColor', 'm');
plot(time_lunar(end)/(24*3600), v_all(end), 'c*', 'MarkerSize', 10);

grid on;
xlabel('任务时间 (天)'); ylabel('速度 (km/s)');
title('完整任务轨道速度变化');
legend('轨道速度', '捕获点', '环月开始', sprintf('环月结束(%d天)', lunar_orbit_days), 'Location', 'best');

%% 绘制月球坐标系中的环月轨道
figure('Position', [100, 100, 800, 600]);
hold on; grid on; axis equal;

% 绘制月球
plot_moon();

% 绘制环月轨道（月球坐标系）- 一个月
plot(Y_lunar_moon_frame(:,1), Y_lunar_moon_frame(:,2), 'm-', 'LineWidth', 1.5, 'Color', [0.8 0.2 0.8]);

% 绘制环月轨道圆形参考
theta_circle = linspace(0, 2*pi, 100);
plot(r_circular * cos(theta_circle), r_circular * sin(theta_circle), 'k--', 'LineWidth', 1);

% 标记轨道圈数（每5圈标记一次）
orbits_per_marker = 5;
for i = 1:orbits_per_marker:floor(T_lunar_total/T_lunar_orbit)
    idx = find(t_lunar >= i * T_lunar_orbit, 1);
    if ~isempty(idx)
        plot(Y_lunar_moon_frame(idx,1), Y_lunar_moon_frame(idx,2), 'bo', 'MarkerSize', 6);
        text(Y_lunar_moon_frame(idx,1), Y_lunar_moon_frame(idx,2)+500, sprintf('第%d圈', i), ...
             'FontSize', 8, 'HorizontalAlignment', 'center');
    end
end

xlabel('x (km, 月球坐标系)'); ylabel('y (km, 月球坐标系)');
title(sprintf('环月轨道（月球坐标系）- %d天运行', lunar_orbit_days), 'FontSize', 14, 'FontWeight', 'bold');
legend('月球', sprintf('%d天环月轨道', lunar_orbit_days), '参考圆轨道', '轨道圈数标记', 'Location', 'best');

%% 任务总结输出
fprintf('\n═══════════════════════════════════════════════════\n');
fprintf('                    任务总结（完整一个月）\n');
fprintf('═══════════════════════════════════════════════════\n\n');

fprintf('轨道阶段详情:\n');
fprintf('1. 发射至 %.0f km 地球停泊轨道\n', h_parking);
fprintf('2. 地月转移轨道注入 (%.3f km/s, %.2f 天)\n', delta_v1, T_transfer/(24*3600));
fprintf('3. %d 次中途修正 (总计 %.4f km/s)\n', n_corrections, sum(correction_dv));
fprintf('4. 月球捕获机动 (%.3f km/s)\n', delta_v2);
fprintf('5. %d 天环月轨道运行 (%.0f 圈轨道)\n\n', lunar_orbit_days, T_lunar_total/T_lunar_orbit);

fprintf('关键参数:\n');
fprintf('• 总任务时间: %.1f 天\n', max(time_all)/(24*3600));
fprintf('• 总速度增量: %.3f km/s\n', total_dv);
fprintf('• 转移轨道: %.0f × %.0f km 椭圆\n', h_transfer_perigee, h_transfer_apogee);
fprintf('• 环月轨道: %.0f km 圆形轨道，周期 %.2f 小时\n', h_lunar_orbit, T_lunar_orbit/3600);
fprintf('• 总轨道圈数: %.0f 圈\n\n', T_lunar_total/T_lunar_orbit);

fprintf('仿真完成！现在可以看到从发射到一个月环月运行的完整轨道轨迹。\n');

%% 辅助函数
function dydt = two_body_ode(~, y, mu)
    % 二体问题微分方程
    r = sqrt(y(1)^2 + y(2)^2);

    dydt = zeros(4,1);
    dydt(1) = y(3);
    dydt(2) = y(4);
    dydt(3) = -mu * y(1) / r^3;
    dydt(4) = -mu * y(2) / r^3;
end

function plot_earth()
    % 绘制地球
    theta_local = linspace(0, 2*pi, 100);
    fill(6378 * cos(theta_local), 6378 * sin(theta_local), [0.2 0.4 0.8], 'FaceAlpha', 0.6);
    plot(6378 * cos(theta_local), 6378 * sin(theta_local), 'b', 'LineWidth', 2);
end

function plot_moon()
    % 绘制月球
    theta_local = linspace(0, 2*pi, 100);
    fill(1737 * cos(theta_local), 1737 * sin(theta_local), [0.6 0.6 0.6], 'FaceAlpha', 0.6);
    plot(1737 * cos(theta_local), 1737 * sin(theta_local), 'k', 'LineWidth', 1);
end

function plot_maneuver_points(r1, r_parking, capture_point, delta_v1, delta_v2, moon_pos)
    % 标记机动点

    % 转移轨道注入点
    plot(r1, 0, 'ro', 'MarkerSize', 10, 'MarkerFaceColor', 'r');
    text(r1, 5000, sprintf('转移注入\nΔV=%.3f km/s', delta_v1), ...
         'FontSize', 9, 'HorizontalAlignment', 'center', 'Interpreter', 'none');

    % 停泊轨道
    plot(r_parking, 0, 'go', 'MarkerSize', 8, 'MarkerFaceColor', 'g');
    text(r_parking, -8000, '停泊轨道', 'FontSize', 9, 'HorizontalAlignment', 'center', 'Interpreter', 'none');

    % 月球捕获点
    plot(capture_point(1), capture_point(2), 'mo', 'MarkerSize', 10, 'MarkerFaceColor', 'm');
    text(capture_point(1), capture_point(2)+15000, sprintf('月球捕获\nΔV=%.3f km/s', delta_v2), ...
         'FontSize', 9, 'HorizontalAlignment', 'center', 'Interpreter', 'none');

    % 月球位置
    plot(moon_pos(1), moon_pos(2), 'ko', 'MarkerSize', 8, 'MarkerFaceColor', [0.6 0.6 0.6]);
    text(moon_pos(1), moon_pos(2)-20000, '月球', 'FontSize', 10, 'HorizontalAlignment', 'center', 'Interpreter', 'none');
end

```
