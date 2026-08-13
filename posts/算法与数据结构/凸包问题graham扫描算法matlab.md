---
title: 凸包问题Graham扫描算法MATLAB
slug: 凸包问题graham扫描算法matlab
category: 算法与数据结构
summary: 算法要解决的问题
tags: 数学, MATLAB
---

#### ![](/uploads/csdn/凸包问题graham扫描算法matlab/img-01.jpeg)


#### 算法要解决的问题


Graham 扫描算法要解决的问题是在给定一组二维平面上的点集时，找出能够完全包含这些点的最小凸多边形，这个最小凸多边形就是这些点的凸包。在很多实际场景中，我们可能只关注一个点集的最外层边界，而凸包算法就可以帮助我们高效地确定这个边界。


例如，在计算机图形学里，为了减少碰撞检测的计算量，会用凸包来近似表示一个复杂图形的边界；在地理信息系统中，计算一些地理区域内离散点的凸包，能够快速确定这些区域的大致范围；在机器人路径规划方面，凸包可以用来定义机器人可活动区域的边界。


#### 凸包算法的定义


凸包算法是一类用于计算点集凸包的算法。凸包在二维平面上可以直观地理解为：想象在平面上钉了许多钉子，这些钉子代表给定的点集，然后用一根橡皮筋把所有钉子都套住，当橡皮筋收紧后，它所形成的形状就是这些钉子（点集）的凸包。


从数学定义来讲，对于一个点集 S，其凸包是包含 S 的最小凸集。所谓凸集，是指对于集合内任意两点 A 和 B，连接这两点的线段上的所有点都在该集合内。


凸包算法的目的就是通过特定的计算步骤，从给定的点集中找出那些构成凸包边界的点，并且按照一定的顺序（通常是顺时针或逆时针）将这些点连接起来，形成一个封闭的凸多边形。常见的凸包算法除了 Graham 扫描算法，还有 Jarvis 步进法、QuickHull 算法等，不同算法在时间复杂度、空间复杂度以及适用场景上各有优劣。


```Matlab
% 生成随机点
n = 20; % 点的数量
points = rand(n, 2);

% 找到y坐标最小的点作为起始点
[y_min, idx] = min(points(:, 2));
p0 = points(idx, :);

% 计算其他点相对于p0的极角
angles = atan2(points(:, 2) - p0(2), points(:, 1) - p0(1));

% 根据极角对所有点进行排序
[~, sorted_idx] = sort(angles);
sorted_points = points(sorted_idx, :);

% 初始化栈
stack = zeros(n, 2);
stack(1, :) = p0;
stack(2, :) = sorted_points(1, :);
top = 2;

% 进行Graham扫描
for i = 2:n
    while top > 1 && orientation(stack(top - 1, :), stack(top, :), sorted_points(i, :)) <= 0
        top = top - 1;
    end
    top = top + 1;
    stack(top, :) = sorted_points(i, :);
end

% 截取栈中有效的部分
hull = stack(1:top, :);

% 可视化
figure;
hold on;
plot(points(:, 1), points(:, 2), 'bo', 'MarkerFaceColor', 'b'); % 绘制所有点
plot(hull(:, 1), hull(:, 2), 'r-', 'LineWidth', 2); % 绘制凸包
plot([hull(top, 1), hull(1, 1)], [hull(top, 2), hull(1, 2)], 'r-', 'LineWidth', 2); % 闭合凸包
title('Graham扫描算法生成的凸包');
xlabel('X');
ylabel('Y');
axis equal;
hold off;

function orient = orientation(p, q, r)
    val = (q(2) - p(2)) * (r(1) - q(1)) - (q(1) - p(1)) * (r(2) - q(2));
    if val == 0
        orient = 0; % 共线
    elseif val > 0
        orient = 1; % 顺时针
    else
        orient = 2; % 逆时针
    end
end
```
