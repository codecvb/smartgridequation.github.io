---
title: 物理竞赛书籍按层级堆叠求质心的问题附带MATLAB仿真代码和数学求导过程
slug: 物理竞赛书籍按层级堆叠求质心的问题附带matlab仿真代码和数学求导过程
category: 物理与天文
summary: 三、MATLAB 仿真：可视化堆叠与质心计算
tags: 物理, 天文, MATLAB, 物理仿真, 数学
---

![](/uploads/csdn/物理竞赛书籍按层级堆叠求质心的问题附带matlab仿真代码和数学求导过程/img-01.png)


![](/uploads/csdn/物理竞赛书籍按层级堆叠求质心的问题附带matlab仿真代码和数学求导过程/img-02.png)


![](/uploads/csdn/物理竞赛书籍按层级堆叠求质心的问题附带matlab仿真代码和数学求导过程/img-03.png)


![](/uploads/csdn/物理竞赛书籍按层级堆叠求质心的问题附带matlab仿真代码和数学求导过程/img-04.png)


#### 三、MATLAB 仿真：可视化堆叠与质心计算


以下代码实现**3 层均匀长方体堆叠**的质心计算与可视化，支持自定义每层的质量、长度和底部位置，输出每层质心及系统总质心的坐标，并绘制堆叠示意图。


```Matlab
%% 物理稳定的多层书籍堆叠仿真（确保不会翻倒）
clear; clc; close all;

% ===================== 1. 生成稳定的堆叠参数 =====================
% 随机生成5-8层（层数不宜过多，否则难以保持稳定）
n = randi([5, 8]);
layers = zeros(n, 3);  % 堆叠参数矩阵（质量, 长度, 底部坐标）

% 生成每层的参数（带稳定性约束）
for i = 1:n
    layers(i, 1) = 0.8 + rand*1.2;  % 质量：0.8-2.0之间（质量差异不宜过大）
    layers(i, 2) = 3 + rand*2;      % 长度：3-5单位（统一尺度便于稳定堆叠）

    if i == 1
        % 第一层从0开始，作为基准
        layers(i, 3) = 0;
    else
        % 前一层的支撑范围
        prev_start = layers(i-1, 3);
        prev_end = layers(i-1, 3) + layers(i-1, 2);
        prev_mid = (prev_start + prev_end) / 2;  % 前一层中点

        % 当前层的长度
        current_length = layers(i, 2);

        % 稳定性约束：当前层的质心必须位于前一层的支撑范围内
        % 最大偏移量：不超过前一层长度的1/4（保证足够安全余量）
        max_offset = layers(i-1, 2) / 4;

        % 在安全范围内随机偏移
        offset = (rand - 0.5) * 2 * max_offset;  % [-max_offset, max_offset]

        % 计算当前层的底部坐标
        current_start = prev_mid - current_length/2 + offset;

        % 确保不会完全超出前一层范围（额外约束）
        current_end = current_start + current_length;
        if current_start < prev_start
            current_start = prev_start;
        elseif current_end > prev_end
            current_start = prev_end - current_length;
        end

        layers(i, 3) = current_start;
    end
end

% ===================== 2. 计算质心 =====================
m = layers(:, 1);  % 各层质量
L = layers(:, 2);  % 各层长度
a = layers(:, 3);  % 各层底部坐标
x_cm_layer = a + L/2;  % 每层质心坐标

% 系统总质心
M_total = sum(m);
X_cm_total = sum(m .* x_cm_layer) / M_total;

% 检查整体稳定性：总质心是否在最底层支撑范围内（修复兼容性问题）
base_start = a(1);
base_end = a(1) + L(1);
if X_cm_total >= base_start && X_cm_total <= base_end
    is_stable = true;
else
    is_stable = false;
end

% ===================== 3. 输出结果 =====================
fprintf('=== 稳定堆叠书籍质心计算结果 ===\n');
if(is_stable)
    fprintf('总层数: %d, 整体稳定性: %s\n', n,'稳定');
else
    fprintf('总层数: %d, 整体稳定性: %s\n', n, '不稳定');
end
for i = 1:n
    % 检查当前层相对于下一层的稳定性
    if i > 1
        lower_start = a(i-1);
        lower_end = a(i-1) + L(i-1);
        % 修复兼容性问题：使用传统if判断
        if x_cm_layer(i) >= lower_start && x_cm_layer(i) <= lower_end
            layer_stable = true;
        else
            layer_stable = false;
        end
    else
        layer_stable = true;  % 最底层无需检查
    end
    if(layer_stable)
            fprintf('第%d层：质量=%.2f, 长度=%.2f, 底部=%.2f, 质心=%.2f, 稳定性: %s\n', ...
        i, m(i), L(i), a(i), x_cm_layer(i), '稳定');
    else
            fprintf('第%d层：质量=%.2f, 长度=%.2f, 底部=%.2f, 质心=%.2f, 稳定性: %s\n', ...
        i, m(i), L(i), a(i), x_cm_layer(i), '不稳定');
    end

end
fprintf('系统总质量=%.2f, 总质心坐标=%.2f\n', M_total, X_cm_total);
fprintf('最底层支撑范围: [%.2f, %.2f]\n', base_start, base_end);

% ===================== 4. 可视化 =====================
figure('Color','w','Position',[100,100,1000,600]);
y_pos = 1:n;
colors = hsv(n);

% 绘制每层书籍
for i = 1:n
    x_rect = [a(i), a(i)+L(i), a(i)+L(i), a(i), a(i)];
    y_rect = [y_pos(i)-0.4, y_pos(i)-0.4, y_pos(i)+0.4, y_pos(i)+0.4, y_pos(i)-0.4];
    fill(x_rect, y_rect, colors(i,:), 'EdgeColor','k', 'FaceAlpha',0.7);
    hold on;
    text(a(i)+0.1, y_pos(i), sprintf('第%d层', i), ...
         'VerticalAlignment', 'middle', 'FontSize',8);
end

% 绘制每层质心
for i = 1:n
    scatter(x_cm_layer(i), y_pos(i), 80, colors(i,:), 'filled', ...
            'MarkerEdgeColor','k', 'LineWidth',1.5);
    text(x_cm_layer(i)+0.1, y_pos(i)+0.5, sprintf('%.2f', x_cm_layer(i)), ...
         'Color', colors(i,:), 'FontSize',9);
    hold on;
end

% 绘制总质心
y_total_cm = mean(y_pos);
scatter(X_cm_total, y_total_cm, 300, 'y', 'p', 'filled', ...
        'MarkerEdgeColor','k', 'LineWidth',2);
text(X_cm_total+0.1, y_total_cm+0.8, sprintf('总质心: %.2f', X_cm_total), ...
     'Color', 'k', 'FontSize',11, 'FontWeight','bold', 'BackgroundColor','y');

% 标记最底层支撑范围（红色虚线）
plot([base_start, base_start], [0.5, n+0.5], 'r--', 'LineWidth',1.5);
plot([base_end, base_end], [0.5, n+0.5], 'r--', 'LineWidth',1.5);
text(base_start, 0.3, sprintf('支撑边界: %.2f', base_start), ...
     'Color', 'r', 'FontSize',9, 'HorizontalAlignment','center');
text(base_end, 0.3, sprintf('支撑边界: %.2f', base_end), ...
     'Color', 'r', 'FontSize',9, 'HorizontalAlignment','center');

% 图表设置
xlabel('水平坐标', 'FontSize',12);
ylabel('层级位置', 'FontSize',12);
title(sprintf('稳定堆叠书籍仿真（%d层）', n), 'FontSize',14, 'FontWeight','bold');
legend('书籍', '每层质心', '总质心', '支撑边界', 'Location','best');
grid on;
xlim([min(a)-1 max(a+L)+1]);
hold off;
```


#### 四、每次书籍都向外延伸二分之一，书的质量大小相同，求出延伸的极限，用MATLAB进行仿真模拟该极限


![](/uploads/csdn/物理竞赛书籍按层级堆叠求质心的问题附带matlab仿真代码和数学求导过程/img-05.png)
