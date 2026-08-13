---
title: MATLAB水滴下落湖水面泛起涟漪仿真
slug: matlab水滴下落湖水面泛起涟漪仿真
category: MATLAB 仿真
summary: 本文介绍了一个增强版水波纹扩散仿真程序的MATLAB实现。程序通过波动方程模拟水滴冲击产生的水波扩散过程，采用网格化计算和阻尼边界条件提高仿真精度。主要功能包括：1) 随机生成水滴冲击点；2) 实时更新波动方程计算波面高度；3) 可视化3D波动效果；4) 自动将仿真过程保存为GIF动画。关键参数包括网格分辨率(100×100)、波速(0.3)和时间步长(0.9)。程序运行150帧，每25帧随机添加…
tags: MATLAB
---

本文介绍了一个增强版水波纹扩散仿真程序的MATLAB实现。程序通过波动方程模拟水滴冲击产生的水波扩散过程，采用网格化计算和阻尼边界条件提高仿真精度。主要功能包括：1) 随机生成水滴冲击点；2) 实时更新波动方程计算波面高度；3) 可视化3D波动效果；4) 自动将仿真过程保存为GIF动画。关键参数包括网格分辨率(100×100)、波速(0.3)和时间步长(0.9)。程序运行150帧，每25帧随机添加水滴扰动，并显示处理进度。最终输出包含光照效果的3D波纹扩散动画，文件大小通过控制帧数进行优化。


![](/uploads/csdn/matlab水滴下落湖水面泛起涟漪仿真/img-01.gif)


![](/uploads/csdn/matlab水滴下落湖水面泛起涟漪仿真/img-02.gif)


![](/uploads/csdn/matlab水滴下落湖水面泛起涟漪仿真/img-03.gif)


```Matlab
% 运行增强仿真
enhanced_wave_simulation();

% 增强版水波纹仿真 - 带GIF保存功能
function enhanced_wave_simulation()
    % 更精确的水波纹仿真

    % 创建图形窗口
    fig = figure('Position', [200, 200, 1000, 800], 'Color', 'white');

    % 参数设置
    grid_size = 100;
    [X, Y] = meshgrid(linspace(-1, 1, grid_size));
    Z = zeros(size(X));

    % 波动方程参数
    c = 0.3;        % 波速
    damping = 0.02; % 阻尼
    dt = 0.9;      % 时间步长（修正为更合理的值）

    % 状态变量
    height = Z;
    velocity = Z;

    % 冲击位置
    impacts = [];

    % 创建水面图形
    h_surf = surf(X, Y, Z, 'FaceColor', 'interp', 'EdgeColor', 'none');
    colormap(jet);
    zlim([-0.1, 0.1]);
    view(45, 30);
    lighting gouraud;
    light('Position', [1,1,1]);

    title('水滴波纹扩散仿真 - 生成GIF中...', 'FontSize', 12);
    xlabel('X'); ylabel('Y'); zlabel('高度');

    % GIF保存设置
    gif_filename = 'wave_simulation.gif';
    gif_delay_time = 0.1; % GIF帧延迟时间
    frame_count = 0;

    fprintf('开始波纹仿真，将保存为GIF: %s\n', gif_filename);

    % 仿真循环
    for frame = 1:150  % 减少帧数以控制文件大小
        % 随机添加水滴冲击
        if mod(frame, 25) == 0 || frame == 1
            impact_pos = [rand()*1.6-0.8, rand()*1.6-0.8];
            impact_strength = 0.05 + rand()*0.05;
            impacts = [impacts; impact_pos, impact_strength, frame];
        end

        % 应用所有冲击
        for i = 1:size(impacts,1)
            if frame - impacts(i,3) < 20 % 冲击影响时间
                dist = sqrt((X - impacts(i,1)).^2 + (Y - impacts(i,2)).^2);
                time_factor = exp(-(frame - impacts(i,3)) * 0.1);
                height = height + impacts(i,3) * time_factor * exp(-dist * 10) .* cos(15*dist - frame*0.3);
            end
        end

        % 波动方程更新
        laplacian = del2(height);
        acceleration = c^2 * laplacian - damping * velocity;
        velocity = velocity + acceleration * dt;
        height = height + velocity * dt;

        % 边界衰减
        boundary = (abs(X) > 0.9) | (abs(Y) > 0.9);
        height(boundary) = height(boundary) * 0.95;
        velocity(boundary) = velocity(boundary) * 0.95;

        % 更新图形
        set(h_surf, 'ZData', height);
        set(h_surf, 'CData', height);

        % 动态标题
        title(sprintf('水滴波纹扩散 - 帧: %d/150', frame), 'FontSize', 12);

        drawnow;

        % 捕获帧并保存为GIF
        captureFrameForGIF(fig, gif_filename, frame, gif_delay_time);
        frame_count = frame;

        % 显示进度
        if mod(frame, 15) == 0
            fprintf('已处理帧: %d/150\n', frame);
        end
    end

    fprintf('GIF保存完成: %s\n', gif_filename);
    fprintf('总帧数: %d\n', frame_count);
end

% 辅助函数：捕获帧并保存为GIF
function captureFrameForGIF(fig, filename, frame, delay_time)
    try
        % 捕获帧
        frame_data = getframe(fig);
        im = frame2im(frame_data);
        [imind, cm] = rgb2ind(im, 256);

        % 写入GIF文件
        if frame == 1
            % 第一帧
            imwrite(imind, cm, filename, 'gif', ...
                'Loopcount', inf, 'DelayTime', delay_time);
        else
            % 后续帧
            imwrite(imind, cm, filename, 'gif', ...
                'WriteMode', 'append', 'DelayTime', delay_time);
        end
    catch ME
        warning('保存GIF帧时出错: %s', ME.message);
    end
end
```
