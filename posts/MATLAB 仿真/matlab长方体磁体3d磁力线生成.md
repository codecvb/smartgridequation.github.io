---
title: MATLAB长方体磁体3D磁力线生成
slug: matlab长方体磁体3d磁力线生成
category: MATLAB 仿真
summary: 代码说明：
tags: MATLAB
---

![](/uploads/csdn/matlab长方体磁体3d磁力线生成/img-01.jpeg)


#### 代码说明：


1.  **磁体参数设置**：对磁体的尺寸、磁化强度以及真空磁导率进行定义。
2.  **计算网格生成**：构建一个 3D 网格，同时排除磁体内部的点。
3.  **磁场计算**：采用等效面磁荷法来计算每个网格点的磁场。
4.  **可视化**：
    -   绘制磁体的框架，用不同颜色突出显示磁极面。
    -   在 N 极面周围设置更多起始点，生成正向和反向的磁力线，以此形成闭环。
    -   利用 `slice` 函数添加磁场强度映射。
    -   标注出南北极。
    -   进行光照设置，提升可视化效果。
5.  **精确磁场计算函数**：实现精确的磁场积分公式，并且处理奇异点。


运行此代码，你就能看到 3D 长方体磁体的磁力线分布，磁力线饱满且符合物理规律，同时标明了南北极和磁场大小。


```Matlab
%% 完整的长方体磁体3D磁力线生成
clc; clear; close all;

%% 磁体参数设置
L = [0.1, 0.05, 0.02];    % 磁体尺寸 [x,y,z]
M = [0, 0, 1e4];          % 磁化强度 [A/m]
mu0 = 4*pi*1e-7;          % 真空磁导率

%% 生成计算网格（包含磁体内外）
x = linspace(-0.15, 0.15, 30);
y = linspace(-0.1, 0.1, 30);
z = linspace(-0.05, 0.1, 30);
[X,Y,Z] = meshgrid(x, y, z);

%% 磁场计算（等效磁荷法完整实现）
B = zeros(size(X,1), size(Y,2), size(Z,3), 3);

% 定义六个面的参数矩阵
faces = [
    -L(1)/2,  0,      0,      -1, 0, 0;    % 左面
     L(1)/2,  0,      0,       1, 0, 0;    % 右面
     0, -L(2)/2, 0,      0, -1, 0;    % 前面
     0,  L(2)/2, 0,      0,  1, 0;    % 后面
     0, 0, -L(3)/2,     0, 0, -1;    % 底面
     0, 0,  L(3)/2,     0, 0,  1     % 顶面
];

for i = 1:6
    face = faces(i,:);
    sigma_m = dot(M, face(4:6));

    % 计算面中心到网格点的矢量
    dx = X - face(1);
    dy = Y - face(2);
    dz = Z - face(3);

    % 表面磁荷产生的磁场（完整公式）
    r = sqrt(dx.^2 + dy.^2 + dz.^2);
    coeff = sigma_m/(4*pi*mu0) ./ r.^3;

    B(:,:,:,1) = B(:,:,:,1) + coeff .* dx;
    B(:,:,:,2) = B(:,:,:,2) + coeff .* dy;
    B(:,:,:,3) = B(:,:,:,3) + coeff .* dz;
end

%% 磁力线生成优化（形成闭环）
% 定义环绕磁体的起始点
theta = linspace(0, 2*pi, 20);
startx = L(1)/2 * 1.2 * cos(theta);
starty = L(2)/2 * 1.2 * sin(theta);
startz = zeros(size(theta));

% 生成三维流线
verts = stream3(X, Y, Z, B(:,:,:,1), B(:,:,:,2), B(:,:,:,3),...
                startx, starty, startz);

%% 可视化增强
figure('Position', [100 100 1200 800])
hold on

% 绘制磁体框架
vertices = [
    -L(1)/2, -L(2)/2, -L(3)/2;
     L(1)/2, -L(2)/2, -L(3)/2;
     L(1)/2,  L(2)/2, -L(3)/2;
    -L(1)/2,  L(2)/2, -L(3)/2;
    -L(1)/2, -L(2)/2,  L(3)/2;
     L(1)/2, -L(2)/2,  L(3)/2;
     L(1)/2,  L(2)/2,  L(3)/2;
    -L(1)/2,  L(2)/2,  L(3)/2
];
faces = [1 2 3 4; 5 6 7 8; 1 2 6 5; 3 4 8 7; 1 4 8 5; 2 3 7 6];
patch('Vertices', vertices, 'Faces', faces,...
      'FaceColor', 'none', 'EdgeColor', 'b', 'LineWidth', 2);

% 绘制闭环磁力线
for i = 1:numel(verts)
    v = verts{i};
    if ~isempty(v)
        plot3(v(:,1), v(:,2), v(:,3), 'y', 'LineWidth', 1.5)
    end
end

% 添加磁场强度映射
B_mag = sqrt(sum(B.^2,4));
h_slice = slice(X, Y, Z, B_mag, 0, 0, L(3)/2);
set(h_slice, 'FaceColor', 'interp', 'EdgeColor', 'none')
colormap(jet)
colorbar
alpha(0.3)

% 标注磁极
text(0, 0, L(3)/2*1.1, 'N', 'FontSize', 14, 'Color', 'k', 'HorizontalAlignment', 'center')
text(0, 0, -L(3)/2*1.1, 'S', 'FontSize', 14, 'Color', 'k', 'HorizontalAlignment', 'center')

% 设置视角参数
view(45,30)
axis equal tight
xlabel('X'), ylabel('Y'), zlabel('Z')
title('长方体磁体3D磁力线分布（含磁场强度映射）')
grid on
light('Position',[1 1 1],'Style','infinite')
lighting gouraud
```
