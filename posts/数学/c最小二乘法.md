---
title: c最小二乘法
slug: c最小二乘法
category: 数学
summary: 下面是一个使用 C++ 实现最小二乘法的示例代码，最小二乘法用于拟合线性回归模型 y = ax + b。
tags: 数学
---

下面是一个使用 C++ 实现最小二乘法的示例代码，最小二乘法用于拟合线性回归模型 y = ax + b。


```cpp
#include <iostream>
#include <vector>

// 定义最小二乘法函数
std::pair<double, double> leastSquares(const std::vector<double>& x, const std::vector<double>& y) {
    int n = x.size();
    double sumX = 0.0, sumY = 0.0, sumXY = 0.0, sumX2 = 0.0;

    // 计算所需的总和
    for (int i = 0; i < n; ++i) {
        sumX += x[i];
        sumY += y[i];
        sumXY += x[i] * y[i];
        sumX2 += x[i] * x[i];
    }

    // 计算斜率 a 和截距 b
    double a = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    double b = (sumY - a * sumX) / n;

    return std::make_pair(a, b);
}

int main() {
    // 示例数据
    std::vector<double> x = {1, 2, 3, 4, 5};
    std::vector<double> y = {2, 4, 6, 8, 10};

    // 调用最小二乘法函数
    std::pair<double, double> result = leastSquares(x, y);
    double a = result.first;
    double b = result.second;

    // 输出结果
    std::cout << "拟合直线方程: y = " << a << "x + " << b << std::endl;

    return 0;
}
```


#### 代码解释


1.  **`leastSquares` 函数**：该函数接受两个 `std::vector` 类型的参数 `x` 和 `y`，分别表示自变量和因变量的数据点。在函数内部，首先计算 x 的总和 `sumX`、y 的总和 `sumY`、x 与 y 乘积的总和 `sumXY` 以及 x 的平方和 `sumX2`。然后根据最小二乘法的公式计算斜率 a 和截距 b，并将它们作为 `std::pair` 类型的结果返回。
2.  **`main` 函数**：定义了示例数据 `x` 和 `y`，调用 `leastSquares` 函数进行最小二乘法拟合，得到斜率 a 和截距 b，并将拟合直线方程输出到控制台。


你可以将示例数据替换为你自己的数据，以进行不同数据集的拟合。


![](/uploads/csdn/c最小二乘法/img-01.png)


![](/uploads/csdn/c最小二乘法/img-02.png)


![](/uploads/csdn/c最小二乘法/img-03.png)


![](/uploads/csdn/c最小二乘法/img-04.png)
