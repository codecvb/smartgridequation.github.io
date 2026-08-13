---
title: 一个完整的神经网络识别0 9手写数字的MATLAB神经网络
slug: 一个完整的神经网络识别0-9手写数字的matlab神经网络
category: 人工智能
summary: 本文介绍了一个基于简单神经网络的手写数字识别系统MATLAB实现。
tags: 人工智能, MATLAB, 神经网络
---

本文介绍了一个基于简单神经网络的手写数字识别系统MATLAB实现。


该系统能够识别0-9的手写数字，主要包含四个功能模块：


1) 数据生成模块，模拟16×16像素的手写数字图像；


2) 神经网络训练模块，采用单隐藏层结构，使用Sigmoid激活函数和Softmax输出；


3) 预测模块，对测试数据进行分类；


4) 演示模块，可视化识别过程。


系统实现了完整的工作流程，包括数据预处理、网络训练和性能评估，测试准确率可达较高水平。该实现特别考虑了数值稳定性和实际应用场景，加入了噪声模拟和正则化处理。


![](/uploads/csdn/一个完整的神经网络识别0-9手写数字的matlab神经网络/img-01.png)


![](/uploads/csdn/一个完整的神经网络识别0-9手写数字的matlab神经网络/img-02.png)


```Matlab
% 手写数字识别系统 - 可完整运行版本
% 使用简单神经网络识别0-9的手写数字

% 主函数：演示手写数字识别流程
function handwriting_recognition_demo()
    % 1. 生成训练和测试数据
    [X_train, y_train, X_test, y_test] = generate_handwriting_data(500, 100);

    % 2. 训练神经网络
    hidden_size = 32;      % 隐藏层神经元数量
    learning_rate = 0.05;  % 学习率
    epochs = 20000;        % 训练轮数
    model = train_handwriting_network(X_train, y_train, hidden_size, learning_rate, epochs);

    % 3. 在测试集上评估
    [y_pred, ~] = predict_handwriting(model, X_test);
    accuracy = mean(y_pred == y_test);
    fprintf('测试集准确率: %.2f%%\n', accuracy * 100);

    % 4. 演示单个数字识别
    demo_recognition(model);
end

% 生成模拟手写数字数据（16x16像素）
function [X_train, y_train, X_test, y_test] = generate_handwriting_data(train_size, test_size)
    % 每个数字图像为16x16像素（256个特征）
    img_size = 16;
    input_size = img_size * img_size;
    num_classes = 10;  % 0-9

    % 确保输入参数有效
    if train_size <= 0 || test_size <= 0
        error('样本数量必须为正数');
    end

    % 生成训练数据
    X_train = zeros(train_size, input_size);
    y_train = zeros(train_size, 1);
    for i = 1:train_size
        digit = randi([0, 9]);
        y_train(i) = digit;
        X_train(i, :) = generate_digit_image(digit, img_size);
    end

    % 生成测试数据
    X_test = zeros(test_size, input_size);
    y_test = zeros(test_size, 1);
    for i = 1:test_size
        digit = randi([0, 9]);
        y_test(i) = digit;
        X_test(i, :) = generate_digit_image(digit, img_size);
    end
end

% 生成单个数字的图像数据（改进版，更稳定）
function img_vec = generate_digit_image(digit, img_size)
    % 创建空白图像
    img = zeros(img_size);
    pad = 2;  % 边距
    inner_size = img_size - 2*pad;
    if inner_size < 5
        error('图像尺寸太小，无法生成有效数字');
    end

    % 在内部区域绘制数字
    [x, y] = meshgrid(1:inner_size);
    x = x + pad;
    y = y + pad;
    mid = round(img_size / 2);

    % 绘制不同数字
    switch digit
        case 0  % 圆形
            r = round(inner_size/2) - 1;
            img( ((x - mid).^2 + (y - mid).^2) <= r^2 ) = 1;
            img( ((x - mid).^2 + (y - mid).^2) <= (r-2)^2 ) = 0;

        case 1  % 竖线
            img(:, mid-1:mid) = 1;
            img(1:pad, :) = 0;  % 顶部留空
            img(end-pad+1:end, :) = 0;  % 底部留空

        case 2  % 数字2
            img(pad, pad:mid) = 1;  % 上横线
            img(pad:mid, mid) = 1;  % 右竖线
            img(mid, pad:mid) = 1;  % 中横线
            img(mid:end-pad, pad) = 1;  % 左竖线
            img(end-pad, pad:end-pad) = 1;  % 下横线

        case 3  % 数字3
            img(pad, pad:end-pad) = 1;  % 上横线
            img(pad:mid, end-pad) = 1;  % 右上竖线
            img(mid, pad:end-pad) = 1;  % 中横线
            img(mid:end-pad, end-pad) = 1;  % 右下竖线
            img(end-pad, pad:end-pad) = 1;  % 下横线

        case 4  % 数字4
            img(pad:mid, pad) = 1;  % 左竖线
            img(pad:mid, mid) = 1;  % 中竖线
            img(mid, pad:mid) = 1;  % 中横线
            img(:, mid) = 1;  % 右竖线

        case 5  % 数字5
            img(pad, pad:end-pad) = 1;  % 上横线
            img(pad:mid, pad) = 1;  % 左上竖线
            img(mid, pad:mid) = 1;  % 中横线
            img(mid:end-pad, end-pad) = 1;  % 右下竖线
            img(end-pad, pad:end-pad) = 1;  % 下横线

        case 6  % 数字6
            img(pad:end-pad, pad) = 1;  % 左竖线
            img(pad, pad:end-pad) = 1;  % 上横线
            img(end-pad, pad:end-pad) = 1;  % 下横线
            img(mid:end-pad, end-pad) = 1;  % 右下竖线
            img(pad:mid, end-pad) = 1;  % 右上竖线
            img(mid, pad:mid) = 1;  % 中横线

        case 7  % 数字7
            img(pad, pad:end-pad) = 1;  % 上横线
            img(pad:end-pad, end-pad) = 1;  % 右竖线

        case 8  % 数字8
            img(pad:end-pad, pad) = 1;  % 左竖线
            img(pad:end-pad, end-pad) = 1;  % 右竖线
            img(pad, pad:end-pad) = 1;  % 上横线
            img(end-pad, pad:end-pad) = 1;  % 下横线
            img(mid, pad:end-pad) = 1;  % 中横线

        case 9  % 数字9
            img(pad:mid, pad) = 1;  % 左竖线
            img(pad:end-pad, end-pad) = 1;  % 右竖线
            img(pad, pad:end-pad) = 1;  % 上横线
            img(mid, pad:end-pad) = 1;  % 中横线
            img(end-pad, mid:end-pad) = 1;  % 下横线
    end

    % 添加随机噪声使更接近真实手写
    noise = randn(size(img)) * 0.15;
    img = img + noise;
    img = max(0, min(1, img));  % 归一化到0-1范围

    % 转换为向量
    img_vec = img(:)';
end

% 训练手写识别神经网络（多分类版本）
function model = train_handwriting_network(X, y, hidden_size, learning_rate, epochs)
    [num_samples, input_size] = size(X);
    num_classes = 10;  % 0-9共10个数字

    % 检查输入有效性
    if size(y, 1) ~= num_samples
        error('标签数量与样本数量不匹配');
    end
    if any(y < 0 | y > 9)
        error('标签必须是0-9之间的整数');
    end

    % 将标签转换为独热编码
    y_onehot = zeros(num_samples, num_classes);
    for i = 1:num_samples
        y_onehot(i, y(i) + 1) = 1;  % +1因为MATLAB索引从1开始
    end

    % 初始化权重和偏置
    rng(42);  % 设置随机种子，确保结果可重复
    W1 = randn(input_size, hidden_size) * 0.01;
    b1 = zeros(1, hidden_size);
    W2 = randn(hidden_size, num_classes) * 0.01;
    b2 = zeros(1, num_classes);

    % 训练网络
    for i = 1:epochs
        % 前向传播
        Z1 = X * W1 + repmat(b1, num_samples, 1);
        A1 = sigmoid(Z1);
        Z2 = A1 * W2 + repmat(b2, num_samples, 1);
        A2 = softmax(Z2);  % 多分类使用softmax

        % 计算损失
        loss = -mean(sum(y_onehot .* log(A2 + 1e-10), 2));  % 加小值防止log(0)

        % 每2000轮打印一次损失
        if mod(i, 2000) == 0
            fprintf('Epoch %d, Loss: %.4f\n', i, loss);
        end

        % 反向传播
        dZ2 = A2 - y_onehot;
        dW2 = (A1' * dZ2) / num_samples;
        db2 = mean(dZ2);

        dZ1 = (dZ2 * W2') .* sigmoid_derivative(Z1);
        dW1 = (X' * dZ1) / num_samples;
        db1 = mean(dZ1);

        % 更新参数
        W1 = W1 - learning_rate * dW1;
        b1 = b1 - learning_rate * db1;
        W2 = W2 - learning_rate * dW2;
        b2 = b2 - learning_rate * db2;
    end

    % 保存模型
    model.W1 = W1;
    model.b1 = b1;
    model.W2 = W2;
    model.b2 = b2;
    model.num_classes = num_classes;
end

% 预测手写数字
function [y_pred, probabilities] = predict_handwriting(model, X)
    num_samples = size(X, 1);

    % 前向传播
    Z1 = X * model.W1 + repmat(model.b1, num_samples, 1);
    A1 = sigmoid(Z1);
    Z2 = A1 * model.W2 + repmat(model.b2, num_samples, 1);
    probabilities = softmax(Z2);

    % 找到概率最大的类别
    [~, indices] = max(probabilities, [], 2);
    y_pred = indices - 1;  % 转换回0-9的数字
end

% 演示单个手写数字识别
function demo_recognition(model)
    img_size = 16;
    % 选择几个典型数字进行演示
    test_digits = [0, 1, 2, 7, 9];
    test_idx = randi(length(test_digits));
    test_digit = test_digits(test_idx);
    fprintf('\n演示识别数字 %d...\n', test_digit);

    % 生成该数字的图像
    img_vec = generate_digit_image(test_digit, img_size);
    img = reshape(img_vec, [img_size, img_size]);

    % 显示图像
    figure('Name', '手写数字识别演示');
    imshow(img, []);
    title(['待识别数字图像 (实际是 ', num2str(test_digit), ')']);

    % 进行识别
    [predicted_digit, probs] = predict_handwriting(model, img_vec);
    fprintf('神经网络识别结果: %d\n', predicted_digit);
    fprintf('识别置信度: %.2f%%\n', max(probs) * 100);
end

% Sigmoid激活函数
function s = sigmoid(x)
    s = 1 ./ (1 + exp(-x));
end

% Sigmoid导数
function ds = sigmoid_derivative(x)
    s = sigmoid(x);
    ds = s .* (1 - s);
end

% Softmax函数（用于多分类输出）
function sm = softmax(x)
    % 减去每行最大值防止数值溢出
    exp_x = exp(x - max(x, [], 2));
    sm = exp_x ./ sum(exp_x, 2);
end

```
