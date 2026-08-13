---
title: 利用代码程序计算数学函数的泰勒展开式MATLAB推导函数泰勒展开式Python推导函数泰勒展开式
slug: 利用代码程序计算数学函数的泰勒展开式matlab推导函数泰勒展开式python推导函数泰勒展开式
category: 数学
summary: 以下代码均经过博主验证
tags: 数学, Python, MATLAB
---

## 以下代码均经过博主验证


## 一、Python推导函数泰勒展开式


在 Python 中，可以借助 `sympy` 库来推导函数的泰勒展开式，以下是一个示例代码，以推导 `sin(x)` 函数的泰勒展开式为例来说明步骤：


### 1\. 安装 `sympy` 库（如果还未安装的话）


如果使用的是 `pip` 包管理工具，可以在命令行执行以下命令安装：


```
pip install sympy -i https://pypi.mirrors.ustc.edu.cn/simple
```


### 2\. Python 代码示例


python


```python
import sympy

# 定义变量
x = sympy.Symbol('x')
# 定义函数，这里以sin(x)为例
func = sympy.sin(x)
# 求泰勒展开式，参数依次为：函数、展开的变量、展开的点、展开的阶数
taylor_expansion = func.series(x, 0, 10)
print(taylor_expansion.removeO())
```


在上述代码中：


-   首先通过 `sympy.Symbol('x')` 定义了符号变量 `x`，这是后续进行符号运算的基础。
-   接着定义了想要展开的函数，这里定义了 `sympy.sin(x)`，你可以将其替换为其他你想要展开的函数，比如 `sympy.cos(x)`、`sympy.exp(x)` 等等。
-   然后调用 `series` 方法来求泰勒展开式，它接受几个关键参数：
    -   第一个参数是要展开的函数（这里就是前面定义的 `func`）。
    -   第二个参数指定展开的变量，也就是基于哪个变量进行展开（这里是 `x`）。
    -   第三个参数是展开的点，也就是在哪个值附近展开，这里 `0` 表示在 `x = 0` 附近展开（通常称为麦克劳林展开，是泰勒展开在展开点为 0 时的特殊情况）。
    -   第四个参数是展开的阶数，示例中设置为 `10`，表示展开到 `x` 的 10 阶项。
-   最后，因为返回的结果中包含了表示高阶无穷小的 `O(x**10)` 这样的形式，调用 `removeO()` 方法将其去除，得到更简洁的泰勒展开式的表达式呈现。


你可以根据实际需求，修改函数以及相关参数，比如改变展开的点、展开的阶数等，来获取不同情况下函数的泰勒展开式。


### 3.案例如下


```python
import sympy

# 定义变量
x = sympy.Symbol('x')
# 定义函数，这里以sin(x)为例
func = sympy.sin(x)+sympy.cos(x)
# 求泰勒展开式，参数依次为：函数、展开的变量、展开的点、展开的阶数
taylor_expansion = func.series(x, 0, 10)
print(taylor_expansion.removeO())
```


推导出的泰勒展开式


```Matlab
x**9/362880 + x**8/40320 - x**7/5040 - x**6/720 + x**5/120 + x**4/24 - x**3/6 - x**2/2 + x + 1
```


## 二、MATLAB推导函数泰勒展开式


在 MATLAB 中，可以使用 `taylor` 函数来推导函数的泰勒展开式，以下是具体的使用方法及示例：


#### 1\. 基本语法


`taylor(f,x,a,'Order',n)`


-   `f`：表示需要进行泰勒展开的函数表达式，可以是一个符号函数（通过 `syms` 定义符号变量后构建的函数）。
-   `x`：指定展开所依据的变量。
-   `a`：展开的中心点，也就是在该点附近进行泰勒展开，当 `a = 0` 时，就是常见的麦克劳林展开。
-   `'Order',n`：这是可选参数，用于指定泰勒展开的阶数为 `n`（即展开到 `x` 的 `n-1` 次幂项），如果不写这个参数，MATLAB 会使用默认的阶数。


#### 2\. 示例代码


以下以推导函数 `sin(x)` 在 `x = 0` 附近（麦克劳林展开）的泰勒展开式为例：


matlab


```Matlab
% 定义符号变量
syms x;
% 定义函数
f = sin(x);
% 求泰勒展开式，这里求到5阶（即展开到x的4次幂项）
taylor_expansion = taylor(f,x,0,'Order',5);
disp(taylor_expansion);
```


在上述代码中：


-   首先通过 `syms x` 定义了符号变量 `x`，这是进行符号运算的基础，后续定义的函数都基于这个符号变量。
-   接着定义了函数 `f` 为 `sin(x)`，你可以将其替换成其他想要展开的函数，比如 `cos(x)`、`exp(x)` 等。
-   然后调用 `taylor` 函数来求泰勒展开式，这里指定了展开的中心点 `a = 0`，以及展开的阶数为 `5`，最后将得到的泰勒展开式结果输出显示。


如果想改变展开的函数、展开的中心点或者展开的阶数等，只需要修改对应代码中的参数即可。例如，若要推导 `cos(x)` 在 `x = pi/4` 附近展开到 8 阶的泰勒展开式，可以这样写：


matlab


```Matlab
% 定义符号变量
syms x;
% 定义函数
f = cos(x);
% 求泰勒展开式，在x = pi/4附近展开到8阶
taylor_expansion = taylor(f,x,pi/4,'Order',8);
disp(taylor_expansion);
```


通过上述方式，就可以方便地利用 MATLAB 推导不同函数在不同条件下的泰勒展开式了。


案例如下


```Matlab
% 定义符号变量
syms x;
% 定义函数
f = tan(x);
% 求泰勒展开式，在x = pi/4附近展开到8阶
taylor_expansion = taylor(f,x,0,'Order',8);
disp(taylor_expansion);
```


推导结果如下


```Matlab
(17*x^7)/315 + (2*x^5)/15 + x^3/3 + x
```


可以对比正确结果，完全无误


![](/uploads/csdn/利用代码程序计算数学函数的泰勒展开式matlab推导函数泰勒展开式python推导函数泰勒展开式/img-01.png)
