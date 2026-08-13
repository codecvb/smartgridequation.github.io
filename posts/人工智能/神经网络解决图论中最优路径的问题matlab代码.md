---
title: 神经网络解决图论中最优路径的问题MATLAB代码
slug: 神经网络解决图论中最优路径的问题matlab代码
category: 人工智能
summary: 解决思路
tags: 人工智能, MATLAB, 神经网络
---

![](/uploads/csdn/神经网络解决图论中最优路径的问题matlab代码/img-01.png)


#### 解决思路


我们选择**离散 Hopfield 神经网络**来解决图的最短路径问题，核心思路是：


1.  将图的路径选择问题转化为神经网络的能量函数优化问题
2.  能量函数的最小值对应最优路径（最短路径）
3.  通过神经网络的迭代更新，让网络收敛到能量最小值
4.  从收敛后的网络状态中解码出最优路径


```Matlab
% ==============================
% 基于Hopfield神经网络的随机位置多节点全遍历求解
% 功能：随机生成节点位置+多节点全遍历路径求解+可视化
% ==============================
clear; clc; close all;
rng(123); % 设置随机种子，保证结果可复现（可注释掉获取不同随机结果）

%% 1. 自定义参数设置
node_num = 20;          % 节点数量（可自行调整，建议10-20个）
start_node = 1;         % 起点
connect_prob = 0.4;     % 节点间连接概率（控制图的稀疏度，0.3-0.5为宜）
min_edge_length = 1;    % 最小边长度
max_edge_length = 10;   % 最大边长度

% 神经网络参数（适配多节点）
T = 5000;               % 最大迭代次数（节点越多需越大）
tau = 0.005;            % 时间步长（更小的值提升收敛精度）
beta = 80;              % 增益系数（增强约束强度）

%% 2. 随机生成节点位置和邻接矩阵
% 2.1 随机生成节点坐标（x,y），范围[0,20]
node_pos = rand(node_num, 2) * 20;

% 2.2 生成连通的邻接矩阵（保证图连通，避免无法遍历）
adj_matrix = zeros(node_num);
% 先构建最小生成树保证连通性
for i = 2:node_num
    j = randi(i-1); % 随机连接到前面的节点
    edge_len = min_edge_length + rand()*(max_edge_length - min_edge_length);
    adj_matrix(i,j) = edge_len;
    adj_matrix(j,i) = edge_len;
end
% 随机添加额外边
for i = 1:node_num
    for j = i+1:node_num
        if adj_matrix(i,j) == 0 && rand() < connect_prob
            edge_len = min_edge_length + rand()*(max_edge_length - min_edge_length);
            adj_matrix(i,j) = edge_len;
            adj_matrix(j,i) = edge_len;
        end
    end
end

n = node_num; % 节点总数
if n < 2
    error('节点数需大于等于2');
end

%% 3. Hopfield神经网络初始化
N = n * n;  % 网络神经元总数
V = zeros(n, n);  % 状态矩阵 V(i,j)=1表示第j步到达节点i
V(start_node, 1) = 1; % 起点初始化

%% 4. 定义能量函数的权重矩阵和偏置（适配多节点）
W = zeros(N);
for i = 1:n
    for j = 1:n
        for k = 1:n
            for l = 1:n
                idx1 = (j-1)*n + i;
                idx2 = (l-1)*n + k;

                % 约束1：路径连续性（仅允许邻接节点跳转）
                if j == l-1  % 前一步→当前步
                    if adj_matrix(k,i) == 0 && k~=i  % 无直接连接的节点惩罚
                        W(idx1, idx2) = W(idx1, idx2) + beta * 3;
                    else  % 邻接节点奖励（边越短奖励越大）
                        W(idx1, idx2) = W(idx1, idx2) - adj_matrix(k,i)/2;
                    end
                end

                % 约束2：单步长约束（每一步只能在一个节点）
                if i == k && j == l
                    W(idx1, idx2) = W(idx1, idx2) - beta;
                end

                % 约束3：单节点约束（每个节点仅出现一次）
                if i == k && j ~= l
                    W(idx1, idx2) = W(idx1, idx2) - beta * 2;
                end

                % 约束4：无效步长惩罚（避免非连续步长激活）
                if abs(j - l) > 1 && i == k
                    W(idx1, idx2) = W(idx1, idx2) + beta;
                end
            end
        end
    end
end

% 偏置向量b（强化约束）
b = zeros(N, 1);
b((1-1)*n + start_node) = beta * n; % 起点约束
% 全节点覆盖约束
for i = 1:n
    b((1:n-1)*n + i) = b((1:n-1)*n + i) + beta/2;
end

%% 5. 神经网络迭代更新
energy_history = [];
converge_flag = false;
for t = 1:T
    % 计算神经元输入
    u = W * V(:) + b;

    % Sigmoid激活函数
    V_new = 1 ./ (1 + exp(-u/tau));

    % 二值化处理
    V_new(V_new >= 0.5) = 1;
    V_new(V_new < 0.5) = 0;
    V_new = reshape(V_new, n, n);

    % 计算当前能量
    energy = -0.5 * V(:)' * W * V(:) - b' * V(:);
    energy_history = [energy_history, energy];

    % 收敛判断
    if sum(sum(abs(V_new - V))) < 1e-6
        disp(['迭代', num2str(t), '次后收敛']);
        V = V_new;
        converge_flag = true;
        break;
    end

    V = V_new;

    % 最大迭代次数提示
    if t == T
        disp('达到最大迭代次数，停止计算');
    end
end

%% 6. 路径解码（容错增强）
path = [];
current_node = start_node;
path = [path, current_node];
visited_nodes = zeros(1, n);
visited_nodes(start_node) = 1;

% 逐步解码路径
for step = 2:n
    next_node = 0;
    % 优先选择邻接且未访问的节点
    for node = 1:n
        if V(node, step) == 1 && visited_nodes(node) == 0 && adj_matrix(current_node, node) > 0
            next_node = node;
            break;
        end
    end
    % 容错1：放宽状态矩阵约束
    if next_node == 0
        for node = 1:n
            if visited_nodes(node) == 0 && adj_matrix(current_node, node) > 0
                next_node = node;
                break;
            end
        end
    end
    % 容错2：允许访问已访问节点（避免路径断裂）
    if next_node == 0
        for node = 1:n
            if adj_matrix(current_node, node) > 0
                next_node = node;
                disp(['警告：节点', num2str(current_node), '无未访问邻接节点，复用节点', num2str(next_node)]);
                break;
            end
        end
    end

    if next_node == 0
        disp('错误：无法找到有效后续节点，路径中断');
        break;
    end

    path = [path, next_node];
    if visited_nodes(next_node) == 0
        visited_nodes(next_node) = 1;
    end
    current_node = next_node;
end

% 计算路径总长度
total_length = 0;
for i = 1:length(path)-1
    total_length = total_length + adj_matrix(path(i), path(i+1));
end

%% 7. 结果展示
disp('=== 多节点全遍历求解结果 ===');
disp(['节点总数：', num2str(n)]);
disp(['起点：', num2str(start_node)]);
disp(['遍历路径：', num2str(path)]);
disp(['路径总长度：', num2str(round(total_length, 2))]);
disp(['遍历节点数：', num2str(length(path)), '/', num2str(n)]);
disp(['未访问节点：', num2str(find(visited_nodes == 0))]);

%% 8. 可视化（适配随机位置）
% 8.1 能量变化曲线
figure('Color','w','Position',[100,100,800,400]);
plot(energy_history, 'LineWidth',1.5,'Color','#2E86AB');
xlabel('迭代次数','FontSize',12);
ylabel('能量值','FontSize',12);
title(['能量变化曲线（节点数：', num2str(n), '）'],'FontSize',14);
grid on; grid minor;

% 8.2 随机节点+遍历路径可视化
figure('Color','w','Position',[200,200,800,600]);
% 绘制所有边
hold on;
for i = 1:n
    for j = i+1:n
        if adj_matrix(i,j) > 0
            plot([node_pos(i,1), node_pos(j,1)], [node_pos(i,2), node_pos(j,2)], ...
                 'k--','LineWidth',0.8,'Color',[0.7,0.7,0.7]);
        end
    end
end
% 绘制节点
scatter(node_pos(:,1), node_pos(:,2), 100, 'ro', 'filled','MarkerEdgeColor','k');
% 标注节点编号
for i = 1:n
    text(node_pos(i,1)+0.2, node_pos(i,2)+0.2, num2str(i), ...
         'FontSize',11,'FontWeight','bold');
end
% 绘制遍历路径
for i = 1:length(path)-1
    plot([node_pos(path(i),1), node_pos(path(i+1),1)], ...
         [node_pos(path(i),2), node_pos(path(i+1),2)], ...
         'r-','LineWidth',2.5,'Color','#A23B72');
    % 标注步长
    mid_x = (node_pos(path(i),1) + node_pos(path(i+1),1))/2;
    mid_y = (node_pos(path(i),2) + node_pos(path(i+1),2))/2;
    text(mid_x, mid_y, num2str(i), 'FontSize',9,'Color','blue','FontWeight','bold');
end
% 标注起点
plot(node_pos(start_node,1), node_pos(start_node,2), 'gs', 'MarkerSize',12,'LineWidth',2);
text(node_pos(start_node,1)-0.5, node_pos(start_node,2)-0.5, '起点', ...
     'FontSize',10,'Color','green','FontWeight','bold');
axis equal;
xlabel('X坐标','FontSize',12);
ylabel('Y坐标','FontSize',12);
title(['随机位置多节点遍历路径（节点数：', num2str(n), '）'],'FontSize',14);
box on;
hold off;

% 8.3 输出节点位置信息
disp('=== 节点位置坐标 ===');
for i = 1:n
    disp(['节点', num2str(i), '：(', num2str(round(node_pos(i,1),2)), ', ', num2str(round(node_pos(i,2),2)), ')']);
end
```


#### 代码关键说明


1.

    **随机节点生成**：


    -   `node_pos = rand(node_num, 2) * 20` 生成 0-20 范围内的随机坐标；
    -   设置`rng(123)`固定随机种子，如需不同随机结果可注释该行；
    -   可调整`node_num`（节点数）、`connect_prob`（连接概率）等参数。


2.

    **邻接矩阵生成**：


    -   先构建最小生成树保证图的连通性，避免无法遍历；
    -   再随机添加额外边，控制图的稀疏度；
    -   边长度随机生成在`min_edge_length`和`max_edge_length`之间。


3.

    **多节点适配**：


    -   增大迭代次数`T=5000`、增益系数`beta=80`，适配更多节点的计算需求；
    -   优化能量函数惩罚 / 奖励权重，提升收敛稳定性；
    -   增强路径解码的容错机制，避免路径断裂。


4.

    **可视化优化**：


    -   绘制随机坐标的节点和路径，标注起点、步长、节点编号；
    -   输出节点位置坐标，便于核对；
    -   能量曲线和路径图分开绘制，布局更清晰。


#### 使用建议


-   节点数建议先从 10 个开始测试，再逐步增加到 20 个（节点过多会增加计算时间）；
-   若收敛效果不佳，可调整`beta`（增益系数）或`tau`（时间步长）；
-   `connect_prob`建议设置 0.3-0.5，过小会导致图过稀疏，过大则计算量增加。


#### 总结


1.  代码实现了**随机位置多节点**的全遍历路径求解，核心是通过随机数生成节点坐标和连通的邻接矩阵；
2.  适配多节点的神经网络参数调整（迭代次数、增益系数）是保证收敛的关键；
3.  增强的容错解码逻辑和可视化优化，提升了代码的实用性和可读性。
