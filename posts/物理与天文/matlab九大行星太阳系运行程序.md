---
title: MATLAB九大行星太阳系运行程序
slug: matlab九大行星太阳系运行程序
category: 物理与天文
summary: Matlab
function solarsystemsimulation
    % 初始化参数
    G = 6.67430e-11; % 万有引力常数(N·m²/kg²)
    AU = 1.496e11;   % 天文单位(m)
    day = 86400;     % 每日秒数
tags: 物理, 天文, MATLAB
---

![](/uploads/csdn/matlab九大行星太阳系运行程序/img-01.gif)


```Matlab
function solar_system_simulation
    % 初始化参数
    G = 6.67430e-11; % 万有引力常数(N·m²/kg²)
    AU = 1.496e11;   % 天文单位(m)
    day = 86400;     % 每日秒数

    % 太阳质量(kg)
    sun_mass = 1.989e30;

    % 行星数据 [质量(kg) 轨道半长轴(AU) 离心率 轨道倾角(deg) 颜色RGB]
    planets = {
        '水星', 3.3011e23, 0.387, 0.206, 7.0, [0.7 0.7 0.7];
        '金星', 4.8675e24, 0.723, 0.007, 3.4, [0.9 0.6 0.1];
        '地球', 5.9724e24, 1.000, 0.017, 0.0, [0.1 0.5 0.8];
        '火星', 6.4171e23, 1.524, 0.093, 1.9, [0.8 0.3 0.1];
        '木星', 1.8982e27, 5.203, 0.048, 1.3, [0.8 0.7 0.5];
        '土星', 5.6834e26, 9.537, 0.056, 2.5, [0.9 0.8 0.6];
        '天王星', 8.6810e25, 19.191, 0.046, 0.8, [0.6 0.8 0.9];
        '海王星', 1.0243e26, 30.069, 0.010, 1.8, [0.3 0.5 0.9];
        '冥王星', 1.303e22, 39.482, 0.248, 17.2, [0.7 0.5 0.5]
    };

    % 创建3D图形窗口
    figure('Color','k','Position',[100 100 1200 800])
    hold on
    axis equal
    grid on
    view(3)
    xlabel('X (AU)'), ylabel('Y (AU)'), zlabel('Z (AU)')
    title('太阳系行星轨道模拟','Color','w')
    set(gca,'Color','k','XColor','w','YColor','w','ZColor','w')

    % 绘制太阳
    [X,Y,Z] = sphere(10);
    surf(X*0.2,Y*0.2,Z*0.2,'FaceColor','y','EdgeColor','none')
    light('Position',[0 0 0],'Style','local','Color','y')

    % 计算并绘制各行星轨道
    theta = linspace(0,2*pi,500);
    for i = 1:size(planets,1)
        a = planets{i,3}*AU;       % 半长轴(m)
        e = planets{i,4};          % 离心率
        r = a*(1-e)./(1+e*cos(theta)); % 极坐标轨道方程

        % 转换为笛卡尔坐标并考虑轨道倾角
        inclination = deg2rad(planets{i,5});
        x = r.*cos(theta);
        y = r.*sin(theta)*cos(inclination);
        z = r.*sin(theta)*sin(inclination);

        % 绘制轨道线
        plot3(x/AU,y/AU,z/AU,'Color',planets{i,6},'LineWidth',1);

        % 计算轨道周期(秒) - 开普勒第三定律
        T = sqrt(4*pi*a/(G*(sun_mass+planets{i,2})));

        % 创建行星动画对象
        planet_plot(i) = plot3(NaN,NaN,NaN,'o','Color',planets{i,6},...
            'MarkerSize',8,'MarkerFaceColor',planets{i,6});
        text(a/AU,0,0,planets{i,1},'Color','w')
    end

    % 动画参数设置
    days_per_frame = 5;    % 每帧天数
    total_days = 100;     % 总模拟天数
    frames = total_days/days_per_frame;

    % --- 新增部分：GIF保存准备 ---
    % 定义GIF文件名
    gif_filename = 'solar_system_simulation.gif';
    % --- 新增结束 ---

    % 动画循环
    for f = 1:frames
        time = f*days_per_frame*day;

        for i = 1:size(planets,1)
            a = planets{i,3}*AU;
            e = planets{i,4};

            % 计算当前角度(简化模型)
            T = sqrt(4*pi*a/(G*(sun_mass+planets{i,2})));
            angle = 2*pi*mod(time/T,1);

            % 计算当前位置
            r = a*(1-e)/(1+e*cos(angle));
            inclination = deg2rad(planets{i,5});
            x = r*cos(angle);
            y = r*sin(angle)*cos(inclination);
            z = r*sin(angle)*sin(inclination);

            % 更新行星位置
            set(planet_plot(i),'XData',x/AU,'YData',y/AU,'ZData',z/AU)
        end

        drawnow

        % --- 新增部分：保存当前帧到GIF ---
        % 1. 获取当前坐标轴的图像数据
        frame = getframe(gca);
        % 2. 将图像数据转换为索引图像，这是GIF格式所要求的
        %    'colormap'参数确保颜色准确
        im = frame2im(frame);
        [imind, cm] = rgb2ind(im, 256);

        % 3. 写入GIF文件
        %    对于第一帧，使用'w'模式创建文件
        %    对于后续帧，使用'a'模式追加到文件末尾
        %    'DelayTime'设置每帧的显示时间(秒)
        %    'LoopCount',inf 使GIF无限循环播放
        if f == 1
            imwrite(imind, cm, gif_filename, 'GIF', 'LoopCount', inf, 'DelayTime', 0.05);
        else
            imwrite(imind, cm, gif_filename, 'GIF', 'WriteMode', 'append', 'DelayTime', 0.05);
        end
        % --- 新增结束 ---

        pause(0.05)
    end

    % --- 新增部分：提示信息 ---
    disp(['动画已成功保存为 GIF 文件: ', fullfile(pwd, gif_filename)]);
    % --- 新增结束 ---
end
```
