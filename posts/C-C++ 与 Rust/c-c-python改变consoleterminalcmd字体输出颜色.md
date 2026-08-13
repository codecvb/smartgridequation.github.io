---
title: C C PYTHON改变consoleterminalcmd字体输出颜色
slug: c-c-python改变consoleterminalcmd字体输出颜色
category: C/C++ 与 Rust
summary: C代码
tags: C/C++, Rust, C
---

C代码


```cpp
#include <stdio.h>

// 定义一些常用颜色的转义序列
#define RED "\x1b[31m"
#define GREEN "\x1b[32m"
#define YELLOW "\x1b[33m"
#define BLUE "\x1b[34m"
#define RESET "\x1b[0m"

int main() {
    // 在控制台输出不同颜色的文本
    printf(RED "This text will be red.\n" RESET);
    printf(GREEN "This text will be green.\n" RESET);
    printf(YELLOW "This text will be yellow.\n" RESET);
    printf(BLUE "This text will be blue.\n" RESET);

    return 0;
}
```


C++代码


```cpp
#include <iostream>

using namespace std;

// 定义一些常用颜色的转义序列
#define RED "\x1b[31m"
#define GREEN "\x1b[32m"
#define YELLOW "\x1b[33m"
#define BLUE "\x1b[34m"
#define RESET "\x1b[0m"

int main() {
    // 在控制台输出不同颜色的文本
    cout << RED "This text will be red.\n" RESET << endl;
    cout << GREEN "This text will be green.\n" RESET << endl;
    cout << YELLOW "This text will be yellow.\n" RESET << endl;
    cout << BLUE "This text will be blue.\n" RESET << endl;

    return 0;
}
```


效果如下


![](/uploads/csdn/c-c-python改变consoleterminalcmd字体输出颜色/img-01.png)


python代码


```python
# ANSI转义序列开始
class ANSI:
    BLACK = '\033[30m'
    RED = '\033[31m'
    GREEN = '\033[32m'
    YELLOW = '\033[33m'
    BLUE = '\033[34m'
    MAGENTA = '\033[35m'
    CYAN = '\033[36m'
    WHITE = '\033[37m'
    RESET = '\033[39m'

# 使用ANSI转义序列打印不同颜色的文本
print(ANSI.GREEN + "Hello, world!" + ANSI.RESET)
print(ANSI.RED + "Hello, world!" + ANSI.RESET)
print(ANSI.YELLOW + "Hello, world!" + ANSI.RESET)
print(ANSI.MAGENTA + "Hello, world!" + ANSI.RESET)
```


效果如下


![](/uploads/csdn/c-c-python改变consoleterminalcmd字体输出颜色/img-02.png)
