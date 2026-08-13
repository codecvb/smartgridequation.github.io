---
title: 空间飞行器轨道旅行者号行星际飞行轨道递推计算与分析Matlab代码
slug: 空间飞行器轨道旅行者号行星际飞行轨道递推计算与分析matlab代码
category: 物理与天文
summary: 本文基于Wagner和Wie的论文思路，实现了旅行者号引力辅助(MGA)轨迹的教学版仿真。程序首先计算各行星在简化圆轨道下的日心状态，通过分段Lambert求解得到转移轨道。核心部分分析了飞越点的关键参数：相对速度(vinf)、转角(delta)、近拱点距离(rp)和速度增量(DeltaV\GA)。结果显示木星、土星、天王星飞越时的转角分别为47.8°、83.3°和88.1°。程序还提供了3D可视…
tags: 物理, 天文, MATLAB, 卫星
---

本文基于Wagner和Wie的论文思路，实现了旅行者号引力辅助(MGA)轨迹的教学版仿真。程序首先计算各行星在简化圆轨道下的日心状态，通过分段Lambert求解得到转移轨道。核心部分分析了飞越点的关键参数：相对速度(vinf)、转角(delta)、近拱点距离(rp)和速度增量(DeltaV\_GA)。结果显示木星、土星、天王星飞越时的转角分别为47.8°、83.3°和88.1°。程序还提供了3D可视化功能，展示了航天器轨迹与行星轨道的空间关系，包括引力辅助过程和后续逃逸轨迹。该实现采用简化模型，但保留了MGA的核心物理原理，可作为深空探测任务轨道设计的教学案例。


![](/uploads/csdn/空间飞行器轨道旅行者号行星际飞行轨道递推计算与分析matlab代码/img-01.png)


![](/uploads/csdn/空间飞行器轨道旅行者号行星际飞行轨道递推计算与分析matlab代码/img-02.png)


![](/uploads/csdn/空间飞行器轨道旅行者号行星际飞行轨道递推计算与分析matlab代码/img-03.png)


![](/uploads/csdn/空间飞行器轨道旅行者号行星际飞行轨道递推计算与分析matlab代码/img-04.jpeg)


![](/uploads/csdn/空间飞行器轨道旅行者号行星际飞行轨道递推计算与分析matlab代码/img-05.jpeg)


![](/uploads/csdn/空间飞行器轨道旅行者号行星际飞行轨道递推计算与分析matlab代码/img-06.jpeg)


![](/uploads/csdn/空间飞行器轨道旅行者号行星际飞行轨道递推计算与分析matlab代码/img-07.jpeg)


![](/uploads/csdn/空间飞行器轨道旅行者号行星际飞行轨道递推计算与分析matlab代码/img-08.jpeg)![](/uploads/csdn/空间飞行器轨道旅行者号行星际飞行轨道递推计算与分析matlab代码/img-09.jpeg)


![](/uploads/csdn/空间飞行器轨道旅行者号行星际飞行轨道递推计算与分析matlab代码/img-10.jpeg)![](/uploads/csdn/空间飞行器轨道旅行者号行星际飞行轨道递推计算与分析matlab代码/img-11.jpeg)


![](/uploads/csdn/空间飞行器轨道旅行者号行星际飞行轨道递推计算与分析matlab代码/img-12.jpeg)


![](/uploads/csdn/空间飞行器轨道旅行者号行星际飞行轨道递推计算与分析matlab代码/img-13.jpeg)![](/uploads/csdn/空间飞行器轨道旅行者号行星际飞行轨道递推计算与分析matlab代码/img-14.jpeg)![](/uploads/csdn/空间飞行器轨道旅行者号行星际飞行轨道递推计算与分析matlab代码/img-15.jpeg)


```Matlab
%% voyager_mga_demo.m
% 基于 Wagner & Wie 文中 MGA 思路的教学版实现
% 功能：
% 1) 给定旅行者号飞越时间节点（转移点）
% 2) 分段解 Lambert 得到日心转移轨道
% 3) 在飞越点计算 v_infty、转角 delta、rp 与 DeltaV_GA（论文式(10)）
% 4) 输出并绘图
%
% 说明：为保证“可跑通”，这里使用简化圆轨道星历（非JPL高精度）。
% 若你有 Aerospace Toolbox/SPICE，可替换 planetStateCircular()。

clear; clc; close all;

%% 常数
muSun = 1.32712440018e11;     % km^3/s^2
AU    = 1.495978707e8;        % km

% 行星引力参数 mu_p (km^3/s^2) 与半径 R_p (km)
P.Earth.mu   = 3.986004418e5; P.Earth.R = 6378.1363;
P.Jupiter.mu = 1.26686534e8;  P.Jupiter.R = 71492;
P.Saturn.mu  = 3.7931187e7;   P.Saturn.R = 60268;
P.Uranus.mu  = 5.793939e6;    P.Uranus.R = 25559;
P.Neptune.mu = 6.836529e6;    P.Neptune.R = 24764;

%% Voyager 2 近似关键时间（可自行微调）
% Earth launch, Jupiter, Saturn, Uranus, Neptune encounters
t = datetime([ ...
    1977 8 20;   % Earth departure
    1979 7  9;   % Jupiter flyby
    1981 8 26;   % Saturn flyby
    1986 1 24;   % Uranus flyby
    1989 8 25]); % Neptune flyby

names = {'Earth','Jupiter','Saturn','Uranus','Neptune'};
N = numel(names);

%% 计算各转移点行星日心状态（简化）
R = zeros(3,N); Vp = zeros(3,N);
for i = 1:N
    [R(:,i), Vp(:,i)] = planetStateCircular(names{i}, t(i), muSun);
end

%% 分段Lambert（转移轨道）
Vdep = zeros(3,N-1); Varr = zeros(3,N-1);
for i = 1:N-1
    dt = seconds(t(i+1)-t(i));  % sec
    [v1, v2] = lambert_universal(R(:,i), R(:,i+1), dt, muSun, +1);
    Vdep(:,i) = v1;
    Varr(:,i) = v2;
end

%% 飞越分析（论文核心量）
% 对每个中间飞越点 i=2..N-1:
% incoming heliocentric vel = 上一段到达速度 Varr(:,i-1)
% outgoing heliocentric vel = 下一段出发速度 Vdep(:,i)
% 转到行星系得到 v_inf_in/out，并计算 delta/rp/DeltaV_GA
fprintf('\n===== Flyby Summary (Voyager-style MGA) =====\n');
fprintf('%8s | %10s | %10s | %10s | %10s\n', ...
    'Planet','|vinf_in|','|vinf_out|','delta(deg)','DeltaV_GA');
fprintf('%s\n', repmat('-',1,62));

flybyData = struct([]);
k = 0;
for i = 2:N-1
    k = k + 1;
    planet = names{i};

    vinf_in_vec  = Varr(:,i-1) - Vp(:,i);
    vinf_out_vec = Vdep(:,i)   - Vp(:,i);

    vinf_in  = norm(vinf_in_vec);
    vinf_out = norm(vinf_out_vec);

    % 论文无动力飞越约束（式16）：|vinf_in|=|vinf_out|
    vinf_avg = 0.5*(vinf_in + vinf_out);

    % 转角 delta
    cang = dot(vinf_in_vec, vinf_out_vec)/(vinf_in*vinf_out);
    cang = max(-1,min(1,cang));
    delta = acos(cang);  % rad

    muP = P.(planet).mu;
    RP  = P.(planet).R;

    % 双曲线关系：delta = 2*asin(1/e), rp = mu/v_inf^2*(e-1)
    e_hyp = 1/sin(delta/2);
    rp    = muP/(vinf_avg^2)*(e_hyp - 1);   % km
    alt   = rp - RP;

    % 论文式(10) 对应 patch 点速度差（这里给出计算值）
    dV_GA = abs( sqrt(vinf_in^2  + 2*muP/rp) ...
               - sqrt(vinf_out^2 + 2*muP/rp) );

    fprintf('%8s | %10.4f | %10.4f | %10.4f | %10.6f\n', ...
        planet, vinf_in, vinf_out, rad2deg(delta), dV_GA);

    flybyData(k).planet = planet;
    flybyData(k).vinf_in_vec  = vinf_in_vec;
    flybyData(k).vinf_out_vec = vinf_out_vec;
    flybyData(k).delta = delta;
    flybyData(k).rp = rp;
    flybyData(k).altitude = alt;
    flybyData(k).dV_GA = dV_GA;

    % 演示 VNC<->ecliptic 变换（论文式40-43）
    T_vnc2ecl = TVNC2ECL(R(:,i), Vp(:,i));
    vinf_in_vnc = T_vnc2ecl \ vinf_in_vec; %#ok<MINV>
    flybyData(k).vinf_in_vnc = vinf_in_vnc;
end

%% 输出转移点（位置）
fprintf('\n===== Transfer Points (Heliocentric, AU) =====\n');
for i = 1:N
    fprintf('%8s @ %s : [%.6f, %.6f, %.6f] AU\n', names{i}, datestr(t(i)), ...
        R(1,i)/AU, R(2,i)/AU, R(3,i)/AU);
end

%% 绘图：转移点+分段轨道
figure('Color','w'); hold on; grid on; axis equal;
title('Voyager MGA Transfer Points and Transfer Arcs (Simplified)');
xlabel('x (AU)'); ylabel('y (AU)');

% 画行星转移点
for i = 1:N
    plot(R(1,i)/AU, R(2,i)/AU, 'o', 'MarkerSize', 7, 'LineWidth', 1.5);
    text(R(1,i)/AU, R(2,i)/AU, ['  ' names{i}], 'FontSize', 9);
end

% 每段二体传播画轨道弧
for i = 1:N-1
    dt = seconds(t(i+1)-t(i));
    rr = propagateArcTwoBody(R(:,i), Vdep(:,i), dt, muSun, 250);
    plot(rr(1,:)/AU, rr(2,:)/AU, '-', 'LineWidth', 1.2);
end

legend([names, strcat(names(1:end-1),'-arc')], 'Location','bestoutside');

%% ========== 新增：3D行星轨道和航天器轨迹可视化 ==========
% 生成时间序列用于绘制完整行星轨道
t_start = datetime(1977,1,1);
t_end = datetime(1990,12,31);
t_orbit = t_start:days(30):t_end;  % 每月一个点

% 计算行星轨道位置
planet_names = {'Earth','Jupiter','Saturn','Uranus','Neptune'};
colors = {'b','r','g','m','c'};

figure('Color','w','Position',[100,100,1200,900]);
ax = axes('Parent',gcf);
view(3);  % 设置三维视角
hold on; grid on; box on;
title('Voyager 2 太阳系引力弹弓轨迹 (3D视图)', 'FontSize', 14);
xlabel('X (AU)'); ylabel('Y (AU)'); zlabel('Z (AU)');

% 绘制太阳
scatter3(0,0,0,200,'y','filled','DisplayName','太阳');

% 绘制各行星轨道（完整轨道）
for p = 1:length(planet_names)
    R_orbit = zeros(3, length(t_orbit));
    for i = 1:length(t_orbit)
        [R_orbit(:,i), ~] = planetStateCircular(planet_names{p}, t_orbit(i), muSun);
    end
    plot3(R_orbit(1,:)/AU, R_orbit(2,:)/AU, R_orbit(3,:)/AU, ...
          '--', 'Color', colors{p}, 'LineWidth', 0.8, ...
          'DisplayName', [planet_names{p} '轨道']);
end

% 绘制航天器转移轨迹（分段二体传播）
trajectory_colors = [0.8 0.4 0.1; 0.2 0.6 0.8; 0.9 0.3 0.5; 0.4 0.7 0.3];
arc_names = {'地球→木星', '木星→土星', '土星→天王星', '天王星→海王星'};

for i = 1:N-1
    dt = seconds(t(i+1)-t(i));
    rr = propagateArcTwoBody(R(:,i), Vdep(:,i), dt, muSun, 500);
    plot3(rr(1,:)/AU, rr(2,:)/AU, rr(3,:)/AU, ...
          '-', 'Color', trajectory_colors(i,:), 'LineWidth', 2.5, ...
          'DisplayName', arc_names{i});
end

% 标记飞越点
for i = 1:N
    scatter3(R(1,i)/AU, R(2,i)/AU, R(3,i)/AU, 100, colors{i}, 'filled', ...
             'DisplayName', [names{i} '飞越点']);
    text(R(1,i)/AU+0.1, R(2,i)/AU+0.1, R(3,i)/AU+0.05, ...
         names{i}, 'FontSize', 10, 'FontWeight', 'bold');
end

% 设置视角和比例
axis equal;
view(45, 25);
camproj('perspective');
legend('Location', 'eastoutside', 'FontSize', 9);

%% ========== 新增：离开太阳系的逃逸轨迹（扩展视图） ==========
figure('Color','w','Position',[100,100,1400,1000]);
ax2 = axes('Parent',gcf);
view(3);
hold on; grid on; box on;
title('Voyager 2 太阳系逃逸轨迹 (扩展视图)', 'FontSize', 14);
xlabel('X (AU)'); ylabel('Y (AU)'); zlabel('Z (AU)');

% 绘制太阳
scatter3(0,0,0,300,'y','filled','DisplayName','太阳');

% 绘制行星轨道（简化显示）
for p = 1:length(planet_names)
    theta = linspace(0, 2*pi, 200);
    a = norm(R(:,p))/AU;  % 近似轨道半径
    orbit_x = a * cos(theta);
    orbit_y = a * sin(theta);
    orbit_z = zeros(size(theta));
    plot3(orbit_x, orbit_y, orbit_z, '--', 'Color', colors{p}, 'LineWidth', 0.6, ...
          'HandleVisibility', 'off');
end

% 绘制航天器轨迹（包含逃逸段）
% 实际观测轨迹 + 外推逃逸轨迹
t_extended = linspace(0, seconds(datetime(2020,1,1)-t(1)), 2000);  % 到2020年
rr_extended = propagateArcTwoBody(R(:,1), Vdep(:,1), t_extended(end), muSun, 2000);
plot3(rr_extended(1,:)/AU, rr_extended(2,:)/AU, rr_extended(3,:)/AU, ...
      'k-', 'LineWidth', 1.5, 'DisplayName', 'Voyager 2 逃逸轨迹');

% 标记行星位置
for i = 1:N
    scatter3(R(1,i)/AU, R(2,i)/AU, R(3,i)/AU, 80, colors{i}, 'filled', ...
             'DisplayName', names{i});
end

% 添加逃逸方向指示
if size(rr_extended,2) > 100
    idx_end = size(rr_extended,2);
    idx_start = idx_end - 50;
    escape_dir = rr_extended(:,idx_end) - rr_extended(:,idx_start);
    escape_dir = escape_dir / norm(escape_dir) * 10;  % 归一化并缩放
    quiver3(rr_extended(1,idx_end)/AU, rr_extended(2,idx_end)/AU, rr_extended(3,idx_end)/AU, ...
            escape_dir(1)/AU, escape_dir(2)/AU, escape_dir(3)/AU, ...
            0, 'r', 'LineWidth', 2, 'MaxHeadSize', 0.5, ...
            'DisplayName', '逃逸方向');
end

axis equal;
view(30, 20);
camproj('perspective');
legend('Location', 'eastoutside', 'FontSize', 9);

fprintf('\n===== 3D可视化已生成 =====\n');
fprintf('图1: 太阳系引力弹弓轨迹 (3D视图)\n');
fprintf('图2: 太阳系逃逸轨迹 (扩展视图)\n');
```
