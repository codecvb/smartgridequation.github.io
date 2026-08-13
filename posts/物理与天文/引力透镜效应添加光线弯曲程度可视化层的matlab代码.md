---
title: 引力透镜效应添加光线弯曲程度可视化层的MATLAB代码
slug: 引力透镜效应添加光线弯曲程度可视化层的matlab代码
category: 物理与天文
summary: 物理实现要点：
tags: 物理, 天文, MATLAB
---

![](/uploads/csdn/引力透镜效应添加光线弯曲程度可视化层的matlab代码/img-01.jpeg)


#### 物理实现要点：


1.  ‌**雅可比矩阵计算**‌
    通过数值梯度计算偏转场的空间导数：

2.  ![](/uploads/csdn/引力透镜效应添加光线弯曲程度可视化层的matlab代码/img-02.png)

3.

    放大率μ反映像的亮度增强倍数

4.  ‌**动态范围处理**‌
    使用对数压缩μ值范围：`μ_vis = log10(1+μ)`，避免高放大率区域饱和

5.  ‌**多物理量联合显示**‌


    -   红圈标注爱因斯坦环理论位置
    -   矢量场显示局部光线偏转方向
    -   径向分布曲线验证数值解正确性


#### 参数调节指南：


1.  ‌**质量分布形态**‌
    修改σ值改变质量集中度，观察临界线(critical line)变化

    `sigma = 1e21; % 紧凑型质量分布 → 小爱因斯坦环 sigma = 5e21; % 弥散分布 → 大环`

2.  ‌**强透镜效应触发**‌
    当满足以下条件时出现明显多重成像：

    `M > 1e41; % 提高质量至星系团量级`

3.  ‌**观测距离影响**‌
    调节Dl和Ds模拟不同红移下的观测效果：

    `Dl = 0.8e24; Ds = 1.2e24; % 中等距离 → 中等偏转 Dl = 0.5e24; Ds = 2e24; % 近距离透镜 → 强变形`


该代码通过颜色映射揭示了以下物理规律：


-   ‌**红色区域**‌：高放大率区（μ>100），对应强引力聚焦，亮度显著增强
-   ‌**蓝色区域**‌：发散区（μ<1），光线被引力场发散导致图像变暗
-   ‌**矢量场方向**‌：显示质量分布引起的各向异性偏转模式
-   ‌**径向曲线**‌：验证θ³反比关系 ![](/uploads/csdn/引力透镜效应添加光线弯曲程度可视化层的matlab代码/img-03.png)


```Matlab
%% 引力透镜效应可视化(含光线弯曲程度映射)
clc; clear; close all;

%% 参数设置
c = 3e8;                % 光速 [m/s]
G = 6.6743e-11;         % 引力常数
M = 5e41;               % 透镜质量(星系团量级)
Dl = 1e24;              % 观测者到透镜距离 [m]
Ds = 1.5e24;            % 观测者到光源距离 [m]
sigma = 3e21;           % 质量分布标准差
res = 1024;             % 分辨率
fov = 5e22;             % 视场范围 [m]

%% 生成背景光源(银河系星场)
[x,y] = meshgrid(linspace(-fov/2,fov/2,res));
background = 255*uint8(mat2gray(peaks(res))); % 使用标准测试图

%% 计算引力透镜参数
theta = sqrt(x.^2 + y.^2);
Sigma = M/(2*pi*sigma^2)*exp(-theta.^2/(2*sigma^2)); % 质量面密度
theta_E = sqrt((4*G*M*(Ds-Dl))/(c^2*Ds*Dl));         % 爱因斯坦半径

%% 光线偏转计算
alpha = (4*pi*G/c^2) * ((Ds-Dl)/Ds) * (theta_E^2./theta.^2).*theta;
alpha(theta==0) = 0;

% 分解为x,y分量
alpha_x = alpha .* x ./ theta;
alpha_y = alpha .* y ./ theta;
alpha_x(theta==0) = 0; alpha_y(theta==0) = 0;

%% 计算雅可比矩阵(光线聚焦程度)
[da_xdx, da_xdy] = gradient(alpha_x, x(1,:), y(:,1));
[da_ydx, da_ydy] = gradient(alpha_y, x(1,:), y(:,1));

% 放大率计算 μ = 1/det(J)
J11 = 1 - da_xdx; J12 = -da_xdy;
J21 = -da_ydx; J22 = 1 - da_ydy;
detJ = J11.*J22 - J12.*J21;
mu = 1./abs(detJ); % 取绝对值处理负放大率区域

% 对数压缩动态范围
mu_vis = log10(1 + mu);
mu_vis(mu_vis>3) = 3; % 限制最大显示值

%% 图像变形处理
x_prime = x - alpha_x;
y_prime = y - alpha_y;
lensed_img = interp2(x, y, double(background), x_prime, y_prime, 'linear', 0);

%% 可视化
figure('Position',[100 100 1400 600])

% 原始图像
subplot(2,3,1)
imshow(background)
title('原始背景光源')
axis square

% 质量分布
subplot(2,3,2)
imagesc(Sigma)
axis square
title('透镜质量密度分布')
colorbar

% 爱因斯坦环标注
subplot(2,3,3)
viscircles([res/2 res/2], theta_E/(fov/res), 'Color','r','LineWidth',1.5)
title('爱因斯坦环位置')
axis off

% 引力透镜成像 + 放大率映射
subplot(2,3,4)
imshow(uint8(lensed_img))
hold on
h = imagesc(x(1,:), y(:,1), mu_vis);
set(h, 'AlphaData', 0.6*(mu_vis>0)) % 设置透明度
colormap(jet)
colorbar
title('成像 + 放大率(logμ)')

% 光线偏转矢量场
subplot(2,3,5)
quiver(x(1:20:end,1:20:end), y(1:20:end,1:20:end),...
       alpha_x(1:20:end,1:20:end), alpha_y(1:20:end,1:20:end),...
       'AutoScaleFactor',0.5, 'Color','w')
axis square
title('光线偏转矢量场')

% 径向偏转强度
subplot(2,3,6)
plot(theta(ceil(res/2),:), alpha(ceil(res/2),:), 'b', 'LineWidth',2)
hold on
plot([theta_E theta_E], [0 max(alpha(:))], 'r--')
xlabel('径向距离 [m]'), ylabel('偏转角度 [rad]')
title('径向偏转强度分布')
```
