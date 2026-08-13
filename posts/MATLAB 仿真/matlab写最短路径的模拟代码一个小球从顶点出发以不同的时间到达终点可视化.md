---
title: MATLAB写最短路径的模拟代码一个小球从顶点出发以不同的时间到达终点可视化
slug: matlab写最短路径的模拟代码一个小球从顶点出发以不同的时间到达终点可视化
category: MATLAB 仿真
summary: 代码说明：
tags: MATLAB
---

![](/uploads/csdn/matlab写最短路径的模拟代码一个小球从顶点出发以不同的时间到达终点可视化/img-01.jpeg)


#### 代码说明：


1.  **节点生成**：使用 `randi` 函数随机生成 120 个节点的坐标，范围在 `[0, 100]` 之间。
2.  **邻接矩阵**：通过 `connectionProb` 控制节点之间的连接概率，随机连接节点并为每条边分配 1 到 10 之间的随机权重。
3.  **可视化**：将节点和边绘制在图中，并标记起点和终点。
4.  **最短路径计算**：使用 Dijkstra 算法计算从起点到终点的最短路径。
5.  **动态可视化**：模拟小球沿着最短路径移动，并实时更新总耗时。


运行此代码，你将看到一个包含超过 100 个节点的复杂路径网图，以及小球沿着最短路径的动态移动过程。


```Matlab
%% 初始化参数
clf;
hold on;
axis equal;
axis([0 100 0 100]);
grid on;
title('最短路径运动模拟 - 总耗时: 0');

% 定义节点数量
numNodes = 120;

% 随机生成节点坐标
nodes = randi([0, 100], numNodes, 2);

% 初始化邻接矩阵
adjMatrix = zeros(numNodes, numNodes);

% 随机连接节点并分配权重
connectionProb = 0.1; % 连接概率
for i = 1:numNodes
    for j = i + 1:numNodes
        if rand() < connectionProb
            % 权重可以根据节点间距离或随机值分配
            % 这里简单使用随机值
            adjMatrix(i, j) = randi([1, 10]);
            adjMatrix(j, i) = adjMatrix(i, j); % 保证对称
        end
    end
end

%% 可视化静态地图
scatter(nodes(:,1), nodes(:,2), 200, 'filled');
text(nodes(1,1)+2, nodes(1,2), '起点','FontSize',12);
text(nodes(end,1)+2, nodes(end,2), '终点','FontSize',12);

% 绘制所有边
for i = 1:size(adjMatrix,1)
    for j = i+1:size(adjMatrix,2)
        if adjMatrix(i,j) > 0
            plot([nodes(i,1), nodes(j,1)], [nodes(i,2), nodes(j,2)],...
                 '--', 'Color', [0.7 0.7 0.7]);
            text(mean([nodes(i,1), nodes(j,1)]),...
                 mean([nodes(i,2), nodes(j,2)]),...
                 num2str(adjMatrix(i,j)), 'Color', 'red');
        end
    end
end

%% Dijkstra 算法求最短路径
[dist, path] = dijkstra(adjMatrix, 1, numNodes);

%% 运动轨迹生成
trajectory = [];
for k = 1:length(path)-1
    startNode = path(k);
    endNode = path(k+1);
    steps = max(2, ceil(adjMatrix(startNode, endNode)*10)); % 根据耗时生成步数
    x = linspace(nodes(startNode,1), nodes(endNode,1), steps);
    y = linspace(nodes(startNode,2), nodes(endNode,2), steps);
    trajectory = [trajectory; [x(1:end-1)' y(1:end-1)']];
end
trajectory = [trajectory; nodes(end,:)]; % 添加终点

%% 动态可视化
hBall = plot(nodes(1,1), nodes(1,2), 'o', 'MarkerSize', 15,...
            'MarkerFaceColor', 'r', 'MarkerEdgeColor', 'k');

totalTime = 0;
for pos = 1:size(trajectory,1)
    % 更新小球位置
    set(hBall, 'XData', trajectory(pos,1), 'YData', trajectory(pos,2));

    % 更新标题时间
    if pos > 1
        % 找到当前位置在 path 中的索引
        currentNodeIndex = find(all(bsxfun(@eq, nodes(path,:), trajectory(pos,:)), 2));
        if ~isempty(currentNodeIndex) && currentNodeIndex < length(path)
            segmentTime = adjMatrix(path(currentNodeIndex), path(currentNodeIndex + 1));
            totalTime = totalTime + segmentTime/steps;
        end
    end
    title(['最短路径运动模拟 - 总耗时: ' num2str(totalTime, '%.1f')]);

    % 动态绘制路径
    if pos > 1
        plot([trajectory(pos-1,1), trajectory(pos,1)],...
             [trajectory(pos-1,2), trajectory(pos,2)],...
             'b', 'LineWidth', 2);
    end

    pause(0.05); % 控制动画速度
end

%% Dijkstra 算法函数
function [dist, path] = dijkstra(adjMatrix, start, target)
    n = size(adjMatrix,1);
    dist = inf(1,n);
    dist(start) = 0;
    prev = zeros(1,n);
    visited = false(1,n);

    for i = 1:n
        [~, minIndex] = min(dist(~visited));
        nodesIndices = find(~visited);
        u = nodesIndices(minIndex);
        visited(u) = true;

        for v = 1:n
            if adjMatrix(u,v) > 0 && ~visited(v)
                alt = dist(u) + adjMatrix(u,v);
                if alt < dist(v)
                    dist(v) = alt;
                    prev(v) = u;
                end
            end
        end
    end

    % 路径回溯
    path = [];
    if dist(target) == inf
        return;
    end
    u = target;
    while u ~= 0
        path = [u path];
        u = prev(u);
    end
end
```
