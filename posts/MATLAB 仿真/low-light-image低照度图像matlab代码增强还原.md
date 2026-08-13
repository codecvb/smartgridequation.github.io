---
title: low light image低照度图像MATLAB代码增强还原
slug: low-light-image低照度图像matlab代码增强还原
category: MATLAB 仿真
summary: Matlab
% 读取低照度图像
image = imread('lowlightimage.jpg');
tags: MATLAB, 图像处理
---

```Matlab
% 读取低照度图像
image = imread('low_light_image.jpg');

% 转换为灰度图像
gray_image = rgb2gray(image);

% 直方图均衡化
hist_eq_image = histeq(gray_image);

% 自适应直方图均衡化
adapthisteq_image = adapthisteq(gray_image);

% 显示原始图像和增强后的图像
subplot(1,3,1);
imshow(gray_image);
title('原始图像');

subplot(1,3,2);
imshow(hist_eq_image);
title('直方图均衡化后的图像');

subplot(1,3,3);
imshow(adapthisteq_image);
title('自适应直方图均衡化后的图像');
```


修复效果如此，真心不错


![](/uploads/csdn/low-light-image低照度图像matlab代码增强还原/img-01.png)


在 MATLAB 里，可借助多种方法来增强低照度图像。下面给出两种常用的方法：直方图均衡化和自适应直方图均衡化。


#### 1\. 直方图均衡化


直方图均衡化是一种把图像的灰度直方图均匀分布的图像增强技术，能够提升图像的对比度。


#### 2\. 自适应直方图均衡化


自适应直方图均衡化（AHE）是直方图均衡化的改进版本，它会把图像划分成多个小块，然后对每个小块分别进行直方图均衡化，从而避免全局直方图均衡化可能产生的过度增强问题。


下面是使用这两种方法进行低照度图像增强的 MATLAB 代码：


low-light-image-enhancementMATLAB低照度图像增强代码


生成 low\_light\_image\_enhancement.m


在上述代码中，你需要把`low_light_image.jpg`替换成你实际的低照度图像文件名。运行此代码后，你会看到原始图像、直方图均衡化后的图像以及自适应直方图均衡化后的图像。


低照度图像MATLAB代码增强还原的原理


以下为你详细介绍在 MATLAB 里对低照度图像进行增强还原所常用的几种方法及其原理：


#### 1\. 直方图均衡化


##### 原理


直方图均衡化是一种借助改变图像的灰度分布，来增强图像对比度的方法。它的核心思想是把原始图像的灰度直方图变换为均匀分布的形式，让图像的灰度值在整个灰度级范围内均匀分布，进而提升图像的全局对比度。


具体步骤如下：


-   **统计灰度分布**：统计原始图像中每个灰度级出现的频数。
-   **计算累积分布函数（CDF）**：对灰度分布的频数进行累加，得到累积分布函数。
-   **灰度映射**：按照累积分布函数把原始图像的每个灰度级映射到新的灰度级上，使得新的灰度分布更加均匀。


##### MATLAB 代码示例及解释


matlab


```Matlab
% 读取低照度图像
image = imread('low_light_image.jpg');
% 转换为灰度图像
gray_image = rgb2gray(image);
% 直方图均衡化
hist_eq_image = histeq(gray_image);
```


在这段代码中，`histeq`函数会自动完成上述步骤，把输入的灰度图像进行直方图均衡化处理。


#### 2\. 自适应直方图均衡化（Adaptive Histogram Equalization, AHE）


##### 原理


自适应直方图均衡化是直方图均衡化的改进版本。直方图均衡化是对整幅图像进行全局处理，可能会造成图像某些区域过度增强。而自适应直方图均衡化会把图像划分成多个不重叠的小块（tile），对每个小块分别进行直方图均衡化，然后使用双线性插值在小块之间进行平滑过渡，从而避免全局直方图均衡化的不足。


##### MATLAB 代码示例及解释


matlab


```Matlab
% 读取低照度图像
image = imread('low_light_image.jpg');
% 转换为灰度图像
gray_image = rgb2gray(image);
% 自适应直方图均衡化
adapthisteq_image = adapthisteq(gray_image);
```


在这段代码中，`adapthisteq`函数会自动将图像分割成小块，对每个小块进行直方图均衡化，并进行平滑过渡。


#### 3\. 基于 Retinex 理论的方法


##### 原理


Retinex 理论认为，图像是由反射图像和光照图像相乘得到的，即 I(x,y)=R(x,y)×L(x,y)，其中 I(x,y) 是原始图像，R(x,y) 是反射图像，L(x,y) 是光照图像。低照度图像增强的目标是估计出光照图像 L(x,y)，然后去除光照的影响，从而得到增强后的反射图像。


常见的基于 Retinex 理论的方法有单尺度 Retinex（SSR）、多尺度 Retinex（MSR）和多尺度 Retinex 颜色恢复（MSRCR）等。


##### MATLAB 代码示例（以单尺度 Retinex 为例）


matlab


```Matlab
function enhanced_image = SSR(image, sigma)
    % 转换为双精度类型
    image = im2double(image);
    % 高斯滤波估计光照图像
    L = imgaussfilt(image, sigma);
    % 计算反射图像
    R = log(image + eps) - log(L + eps);
    % 归一化
    enhanced_image = mat2gray(R);
end

% 读取低照度图像
image = imread('low_light_image.jpg');
% 转换为灰度图像
gray_image = rgb2gray(image);
% 单尺度Retinex增强
sigma = 30;
enhanced_image = SSR(gray_image, sigma);
```


在这段代码中，`SSR`函数实现了单尺度 Retinex 算法。首先使用高斯滤波估计光照图像，然后通过对数运算去除光照的影响，最后进行归一化处理得到增强后的图像。
