---
title: MATLAB汽车行驶过程避障模拟简化
slug: matlab汽车行驶过程避障模拟简化
category: MATLAB 仿真
summary: 代码解释：
tags: MATLAB
---

#### 代码解释：


1.  **参数初始化**：设定了道路的宽度和长度、小车的尺寸和初始位置、速度和角度，以及障碍物的数量、尺寸和随机位置。
2.  **图形窗口创建**：使用 `figure` 函数创建一个图形窗口，并设置坐标轴范围和纵横比。
3.  **循环模拟**：通过一个循环模拟避障过程，在每次循环中，清空之前的绘图，绘制道路和障碍物，检查是否需要避障并随机决定换道方向，更新小车位置，绘制小车，最后暂停一段时间以形成动画效果。


这个代码只是一个简单的示例，你可以根据需要进一步优化和扩展，例如添加更复杂的四轮转向逻辑。


![](/uploads/csdn/matlab汽车行驶过程避障模拟简化/img-01.gif)


```Matlab
% 初始化参数
road_width = 10; % 道路宽度
road_length = 100; % 道路长度
car_width = 1; % 小车宽度
car_length = 2; % 小车长度
car_x = 2; % 小车初始 x 坐标
car_y = 0; % 小车初始 y 坐标
car_speed = 2; % 小车速度
car_theta = 0; % 小车初始角度

% 障碍物参数
num_obstacles = 10; % 障碍物数量
obstacle_width = 1; % 障碍物宽度
obstacle_length = 2; % 障碍物长度
obstacle_x = randi([1, road_width - obstacle_width], 1, num_obstacles); % 障碍物随机 x 坐标
obstacle_y = randi([10, road_length - obstacle_length], 1, num_obstacles); % 障碍物随机 y 坐标

% 创建图形窗口
figure;
axis([0, road_width, 0, road_length]);
axis equal;
hold on;

% 循环模拟避障过程
for t = 1:100
    % 清空之前的绘图
    cla;

    % 绘制道路
    rectangle('Position', [0, 0, road_width, road_length], 'EdgeColor', 'k', 'LineWidth', 2);

    % 绘制障碍物
    for i = 1:num_obstacles
        rectangle('Position', [obstacle_x(i), obstacle_y(i), obstacle_width, obstacle_length], 'FaceColor', 'r');
    end

    % 检查是否需要避障
    need_avoid = false;
    for i = 1:num_obstacles
        % 判断是否与障碍物重叠
        if ~(car_x + car_width <= obstacle_x(i) || car_x >= obstacle_x(i) + obstacle_width || ...
                car_y + car_length <= obstacle_y(i) || car_y >= obstacle_y(i) + obstacle_length)
            need_avoid = true;
            % 优先向左换道，如果左边有空间且没障碍物
            if car_x > 1
                left_clear = true;
                for j = 1:num_obstacles
                    if ~(car_x - 1 + car_width <= obstacle_x(j) || car_x - 1 >= obstacle_x(j) + obstacle_width || ...
                            car_y + car_length <= obstacle_y(j) || car_y >= obstacle_y(j) + obstacle_length)
                        left_clear = false;
                        break;
                    end
                end
                if left_clear
                    car_x = car_x - 1; % 向左换道
                else
                    % 若左边有障碍物，尝试向右换道
                    if car_x < road_width - car_width
                        right_clear = true;
                        for j = 1:num_obstacles
                            if ~(car_x + 1 + car_width <= obstacle_x(j) || car_x + 1 >= obstacle_x(j) + obstacle_width || ...
                                    car_y + car_length <= obstacle_y(j) || car_y >= obstacle_y(j) + obstacle_length)
                                right_clear = false;
                                break;
                            end
                        end
                        if right_clear
                            car_x = car_x + 1; % 向右换道
                        end
                    end
                end
            else
                % 若左边没空间，尝试向右换道
                if car_x < road_width - car_width
                    right_clear = true;
                    for j = 1:num_obstacles
                        if ~(car_x + 1 + car_width <= obstacle_x(j) || car_x + 1 >= obstacle_x(j) + obstacle_width || ...
                                car_y + car_length <= obstacle_y(j) || car_y >= obstacle_y(j) + obstacle_length)
                            right_clear = false;
                            break;
                        end
                    end
                    if right_clear
                        car_x = car_x + 1; % 向右换道
                    end
                end
            end
        end
    end

    % 如果不需要避障，继续正常行驶
    if ~need_avoid
        % 可以添加随机换道超车逻辑
        if rand < 0.1 && car_x < road_width - car_width
            right_clear = true;
            for j = 1:num_obstacles
                if ~(car_x + 1 + car_width <= obstacle_x(j) || car_x + 1 >= obstacle_x(j) + obstacle_width || ...
                        car_y + car_length <= obstacle_y(j) || car_y >= obstacle_y(j) + obstacle_length)
                    right_clear = false;
                    break;
                end
            end
            if right_clear
                car_x = car_x + 1; % 随机向右换道超车
            end
        end
    end

    % 更新小车位置
    car_y = car_y + car_speed;

    % 绘制小车
    rectangle('Position', [car_x, car_y, car_width, car_length], 'FaceColor', 'b');

    % 暂停一段时间以形成动画效果
    pause(0.3);
end
```
