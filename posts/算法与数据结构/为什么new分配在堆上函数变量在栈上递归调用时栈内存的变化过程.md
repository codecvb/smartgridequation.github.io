---
title: 为什么new分配在堆上函数变量在栈上递归调用时栈内存的变化过程
slug: 为什么new分配在堆上函数变量在栈上递归调用时栈内存的变化过程
category: 算法与数据结构
summary: 在 C++ 里，new 运算符分配的内存位于堆上，而函数的局部变量存于栈上，这是由它们各自的特性和设计目的决定的，下面为你详细解释：
tags: 算法
---

在 C++ 里，`new` 运算符分配的内存位于堆上，而函数的局部变量存于栈上，这是由它们各自的特性和设计目的决定的，下面为你详细解释：


#### `new` 分配在堆上的原因


##### 1\. 动态内存分配需求


程序运行时，有些时候需要根据实际情况来决定所需内存的大小，编译时无法确定具体的内存量。堆内存能很好地满足这种动态分配的需求，`new` 运算符可在运行时按需分配内存。


**示例场景**：编写一个图像处理程序，需要根据用户选择的图像分辨率来分配内存。由于不同用户选择的分辨率不同，所需内存大小也不同，此时就可以使用 `new` 在堆上动态分配内存。


```cpp
#include <iostream>
int main() {
    int width, height;
    std::cout << "请输入图像的宽度和高度：";
    std::cin >> width >> height;
    // 在堆上动态分配二维数组
    int** image = new int*[height];
    for (int i = 0; i < height; ++i) {
        image[i] = new int[width];
    }
    // 使用完后释放内存
    for (int i = 0; i < height; ++i) {
        delete[] image[i];
    }
    delete[] image;
    return 0;
}
```


在这个例子中，图像的宽度和高度在运行时由用户输入决定，通过 `new` 运算符在堆上动态分配了二维数组的内存。


##### 2\. 生命周期管理的灵活性


堆内存的生命周期由程序员手动控制，对象的生命周期可以跨越函数调用。这对于需要在多个函数间共享对象或者对象需要长期存在的场景非常有用。


**示例场景**：在一个游戏程序中，需要创建一个全局的游戏角色对象，该对象在整个游戏运行期间都需要存在。可以使用 `new` 在堆上创建该对象，确保其生命周期足够长。


```cpp
#include <iostream>
class GameCharacter {
public:
    GameCharacter() { std::cout << "游戏角色创建" << std::endl; }
    ~GameCharacter() { std::cout << "游戏角色销毁" << std::endl; }
};
GameCharacter* createCharacter() {
    return new GameCharacter();
}
void playGame(GameCharacter* character) {
    // 使用角色进行游戏
}
int main() {
    GameCharacter* character = createCharacter();
    playGame(character);
    delete character; // 手动释放内存
    return 0;
}
```


在这个例子中，`GameCharacter` 对象在 `createCharacter` 函数中使用 `new` 在堆上创建，其生命周期可以跨越多个函数调用，最后在 `main` 函数中手动释放内存。


##### 3\. 支持大型数据结构


堆内存可以分配较大的内存块，适合存储大型的数据结构，如大型数组、复杂的链表等。


**示例场景**：实现一个大型的图数据结构，需要存储大量的节点和边信息。可以使用 `new` 在堆上分配足够的内存来存储这些信息。


```cpp
#include <iostream>
const int MAX_NODES = 1000;
class Graph {
private:
    int** adjMatrix;
public:
    Graph() {
        adjMatrix = new int*[MAX_NODES];
        for (int i = 0; i < MAX_NODES; ++i) {
            adjMatrix[i] = new int[MAX_NODES];
        }
    }
    ~Graph() {
        for (int i = 0; i < MAX_NODES; ++i) {
            delete[] adjMatrix[i];
        }
        delete[] adjMatrix;
    }
};
int main() {
    Graph graph;
    return 0;
}
```


在这个例子中，`Graph` 类使用 `new` 在堆上分配了一个二维数组来存储图的邻接矩阵，由于矩阵较大，使用堆内存可以满足其内存需求。


#### 函数变量在栈上的原因


##### 1\. 自动内存管理


栈内存的分配和释放由操作系统自动完成，函数进入时，局部变量的内存会自动分配；函数退出时，这些变量的内存会自动释放。这大大简化了程序员的内存管理工作，降低了内存泄漏的风险。


**示例场景**：在一个简单的函数中，使用局部变量进行计算。


```cpp
#include <iostream>
int add(int a, int b) {
    int result = a + b; // 局部变量在栈上分配
    return result;
}
int main() {
    int sum = add(3, 5);
    std::cout << "Sum: " << sum << std::endl;
    return 0;
}
```


在这个例子中，`result` 是 `add` 函数的局部变量，它在栈上分配内存，当 `add` 函数执行完毕，`result` 所占用的栈内存会自动释放。


##### 2\. 快速的内存分配和释放


栈内存的分配和释放速度非常快，只需要移动栈指针即可。这使得函数调用和局部变量的创建和销毁非常高效，适合频繁创建和销毁的临时变量。


**示例场景**：在一个循环中多次调用函数，每次调用都会创建和销毁局部变量。


```cpp
#include <iostream>
void printNumber(int num) {
    int temp = num * 2; // 局部变量在栈上分配
    std::cout << temp << std::endl;
}
int main() {
    for (int i = 0; i < 10; ++i) {
        printNumber(i);
    }
    return 0;
}
```


在这个例子中，`printNumber` 函数每次被调用时，都会在栈上快速分配 `temp` 变量的内存，函数执行完毕后，又会快速释放该内存。


##### 3\. 函数调用栈的管理


栈内存用于存储函数调用的上下文信息，包括返回地址、参数和局部变量等。这使得函数调用和返回能够有序进行，保证程序的正常执行流程。


**示例场景**：递归函数调用。


```cpp
#include <iostream>
int factorial(int n) {
    if (n == 0 || n == 1) {
        return 1;
    }
    return n * factorial(n - 1); // 递归调用，栈用于保存每次调用的上下文
}
int main() {
    int num = 5;
    int result = factorial(num);
    std::cout << num << "! = " << result << std::endl;
    return 0;
}
```


在递归调用 `factorial` 函数时，每次调用都会在栈上保存当前的参数和返回地址，直到递归结束，栈上的信息会依次弹出，恢复函数调用的上下文。


递归函数是指在函数的定义中使用函数自身的方法。在递归函数调用过程中，栈内存会发生一系列有规律的变化，下面将结合一个具体的递归函数示例详细解释。


#### 示例递归函数：计算阶乘


cpp


```cpp
#include <iostream>

int factorial(int n) {
    if (n == 0 || n == 1) {
        return 1;
    }
    return n * factorial(n - 1);
}

int main() {
    int num = 3;
    int result = factorial(num);
    std::cout << num << " 的阶乘是: " << result << std::endl;
    return 0;
}
```


#### 递归调用时栈内存的变化过程


##### 1\. 初始调用


当在 `main` 函数中调用 `factorial(3)` 时，程序开始执行 `factorial` 函数。此时，栈上会为这次函数调用分配一块内存区域，称为栈帧（Stack Frame）。栈帧包含以下信息：


-   **返回地址**：记录调用 `factorial(3)` 之后程序应该继续执行的位置，也就是 `main` 函数中调用 `factorial(3)` 语句的下一条语句的地址。
-   **参数**：将参数 `n` 的值 `3` 压入栈中。
-   **局部变量**：如果 `factorial` 函数中有局部变量，也会在栈帧中为它们分配内存。不过在这个例子中，除了参数 `n` 没有其他局部变量。


##### 2\. 第一次递归调用 `factorial(2)`


由于 `n` 的值为 `3`，不满足终止条件（`n == 0 || n == 1`），所以函数会进行递归调用 `factorial(2)`。这时，会在栈上为这次新的函数调用创建一个新的栈帧，该栈帧同样包含返回地址、参数 `n` 的值 `2` 等信息。此时，栈上就有了两个栈帧，新的栈帧位于旧栈帧之上。


##### 3\. 第二次递归调用 `factorial(1)`


同样，因为 `n` 的值为 `2`，不满足终止条件，函数会再次进行递归调用 `factorial(1)`。又会在栈上创建一个新的栈帧，包含返回地址和参数 `n` 的值 `1`。此时，栈上有三个栈帧，从栈顶到栈底依次是 `factorial(1)`、`factorial(2)` 和 `factorial(3)` 的栈帧。


##### 4\. 终止条件满足


当调用 `factorial(1)` 时，`n` 的值为 `1`，满足终止条件 `n == 0 || n == 1`，函数直接返回 `1`。此时，`factorial(1)` 的栈帧会从栈上弹出，释放其所占用的内存。


##### 5\. 返回并继续执行


`factorial(1)` 返回 `1` 后，程序回到 `factorial(2)` 的栈帧继续执行。`factorial(2)` 会计算 `2 * factorial(1)` 的结果，也就是 `2 * 1 = 2`。计算完成后，`factorial(2)` 的栈帧也会从栈上弹出，释放内存。


##### 6\. 最终返回


`factorial(2)` 返回 `2` 后，程序回到 `factorial(3)` 的栈帧继续执行。`factorial(3)` 会计算 `3 * factorial(2)` 的结果，也就是 `3 * 2 = 6`。计算完成后，`factorial(3)` 的栈帧从栈上弹出，释放内存。最后，程序回到 `main` 函数继续执行，将 `factorial(3)` 的返回值 `6` 赋给变量 `result` 并输出。


#### 总结


在递归函数调用过程中，每次递归调用都会在栈上创建一个新的栈帧，栈帧中包含返回地址、参数和局部变量等信息。当递归调用达到终止条件后，栈帧会从栈顶开始依次弹出，释放内存，直到最初的函数调用栈帧也被弹出，整个递归调用过程结束。这种栈内存的管理方式确保了递归函数能够正确地保存和恢复调用上下文，从而实现递归计算。但需要注意的是，如果递归深度过大，栈内存可能会耗尽，导致栈溢出错误。
