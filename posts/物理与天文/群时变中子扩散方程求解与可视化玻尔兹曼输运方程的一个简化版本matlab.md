---
title: 群时变中子扩散方程求解与可视化玻尔兹曼输运方程的一个简化版本MATLAB
slug: 群时变中子扩散方程求解与可视化玻尔兹曼输运方程的一个简化版本matlab
category: 物理与天文
summary: 本文实现了一维两群中子扩散方程的数值求解与可视化。采用有限差分法离散空间变量，向后欧拉法处理时间变量，模拟了中子通量在20cm平板介质中的时变传播。快中子（群1）和热中子（群2）分别设置不同的扩散系数、吸收截面和散射截面，初始条件下在中心位置设置高斯脉冲源。程序实现了真空边界条件，并通过周期性地绘制通量分布来展示演化过程。最终输出两个中子群在模拟结束时刻的详细空间分布。该代码为玻尔兹曼输运方程提供…
tags: 物理, 天文, MATLAB
---

本文实现了一维两群中子扩散方程的数值求解与可视化。采用有限差分法离散空间变量，向后欧拉法处理时间变量，模拟了中子通量在20cm平板介质中的时变传播。快中子（群1）和热中子（群2）分别设置不同的扩散系数、吸收截面和散射截面，初始条件下在中心位置设置高斯脉冲源。程序实现了真空边界条件，并通过周期性地绘制通量分布来展示演化过程。最终输出两个中子群在模拟结束时刻的详细空间分布。该代码为玻尔兹曼输运方程提供了简化的一维两群扩散求解方案，可用于中子输运基本特性的教学研究。


![](/uploads/csdn/群时变中子扩散方程求解与可视化玻尔兹曼输运方程的一个简化版本matlab/img-01.jpeg)


![](/uploads/csdn/群时变中子扩散方程求解与可视化玻尔兹曼输运方程的一个简化版本matlab/img-02.jpeg)


```Matlab
% ================================================================
% 1D, 2群时变中子扩散方程求解与可视化
% 这个代码是玻尔兹曼输运方程的一个简化版本
% ================================================================

clear; clc; close all;

%% 1. 定义物理参数和计算网格
L = 20.0;                 % 平板介质厚度 [cm]

% --- 群 1 (快中子) 参数 ---
D1 = 1.5;                 % 扩散系数 [cm]
Sigma_a1 = 0.01;          % 吸收截面 [1/cm]
Sigma_s12 = 0.1;          % 散射到群2的截面 [1/cm]
Sigma1 = Sigma_a1 + Sigma_s12; % 总去除截面

% --- 群 2 (热中子) 参数 ---
D2 = 0.5;                 % 扩散系数 [cm]
Sigma_a2 = 0.2;           % 吸收截面 [1/cm]
Sigma2 = Sigma_a2;

% --- 时间和空间离散化 ---
Nx = 40;                  % 空间网格节点数
x = linspace(0, L, Nx);   % 生成空间坐标网格
dx = x(2) - x(1);         % 计算网格步长

t_max = 5.0;              % 最大模拟时间 [s]
Nt = 100;                 % 时间步数
dt = t_max / Nt;          % 时间步长

%% 2. 初始化通量数组
Phi1 = zeros(Nx, 1);      % 群1通量
Phi2 = zeros(Nx, 1);      % 群2通量

% 设置初始条件 (例如，在中心有一个脉冲源)
source_width = 2.0;
source_amplitude = 100.0;
for i = 1:Nx
    if abs(x(i) - L/2) < source_width
        Phi1(i) = source_amplitude * exp(-((x(i)-L/2)/source_width)^2);
    end
end

%% 3. 定义有限差分系数 (用于空间项)
% 对于内部节点，Laplacian算子 ∇·D∇Φ 的离散形式为:
% D*(Phi(i+1) - 2*Phi(i) + Phi(i-1)) / dx^2
coeff = 1 / dx^2;

%% 4. 时间演化与求解
figure('Name', '1D, 2群中子通量时间演化');

for n = 1:Nt
    % 创建用于求解下一时间步的矩阵
    % 为了效率，我们使用原地更新，而不是每次都创建新矩阵

    % --- 更新群 1 ---
    Phi1_new = Phi1;
    for i = 2:Nx-1 % 内部节点
        % 向后欧拉法离散:
        % (Phi1_new - Phi1_old)/dt = D1*Laplacian(Phi1_new) - Sigma1*Phi1_new + S1
        % 整理得:
        % Phi1_new - dt*D1*Laplacian(Phi1_new) + dt*Sigma1*Phi1_new = Phi1_old + dt*S1

        % 此处 S1 = 0 (除了初始条件)
        lhs = 1.0 + dt * (D1 * coeff * 2.0 + Sigma1);
        rhs = Phi1(i) + dt * D1 * coeff * (Phi1(i+1) + Phi1(i-1));

        Phi1_new(i) = rhs / lhs;
    end
    % 真空边界条件 (Neumann-like)
    Phi1_new(1) = Phi1_new(2);
    Phi1_new(end) = Phi1_new(end-1);

    % --- 更新群 2 ---
    Phi2_new = Phi2;
    for i = 2:Nx-1 % 内部节点
        % 向后欧拉法离散:
        % (Phi2_new - Phi2_old)/dt = D2*Laplacian(Phi2_new) - Sigma2*Phi2_new + Sigma_s12*Phi1_new + S2

        % 此处 S2 = 0
        lhs = 1.0 + dt * (D2 * coeff * 2.0 + Sigma2);
        rhs = Phi2(i) + dt * ( D2 * coeff * (Phi2(i+1) + Phi2(i-1)) + Sigma_s12 * Phi1_new(i) );

        Phi2_new(i) = rhs / lhs;
    end
    % 真空边界条件
    Phi2_new(1) = Phi2_new(2);
    Phi2_new(end) = Phi2_new(end-1);

    % 更新通量
    Phi1 = Phi1_new;
    Phi2 = Phi2_new;

    % --- 定期绘图以观察演化 ---
    if mod(n, Nt/10) == 0 || n == 1
        plot(x, Phi1, 'r-', 'LineWidth', 2, 'DisplayName', ['快中子通量 (t=' num2str(n*dt,'%.2f') 's)']);
        hold on;
        plot(x, Phi2, 'b-', 'LineWidth', 2, 'DisplayName', ['热中子通量 (t=' num2str(n*dt,'%.2f') 's)']);
        xlabel('位置 x [cm]');
        ylabel('中子通量 \Phi [1/cm^2/s]');
        title('1D, 2群中子通量时间演化');
        legend('Location', 'best');
        grid on;
        ylim([0, max([max(Phi1), max(Phi2)])*1.1]);
        drawnow; % 强制刷新图像
    end
end
hold off;

% --- 最终状态的详细视图 ---
figure('Name', '最终时刻的中子通量分布');
subplot(2,1,1);
plot(x, Phi1, 'r-o', 'LineWidth', 1.5);
xlabel('位置 x [cm]');
ylabel('快中子通量 \Phi_1 [1/cm^2/s]');
title(['最终时刻 (t=' num2str(t_max) 's) 的快中子通量']);
grid on;

subplot(2,1,2);
plot(x, Phi2, 'b-o', 'LineWidth', 1.5);
xlabel('位置 x [cm]');
ylabel('热中子通量 \Phi_2 [1/cm^2/s]');
title(['最终时刻 (t=' num2str(t_max) 's) 的热中子通量']);
grid on;

fprintf('模拟完成。\n');

% ================================================================
% 代码结束
% ================================================================
```
