---
title: C多继承一个子类继承多个父类的情况
slug: c多继承一个子类继承多个父类的情况
category: C/C++ 与 Rust
summary: -   C++的类继承大家还算比较了解。它主要包括单继承、多继承、虚继承这几方面。
tags: C/C++, Rust, C
---

-   C++的类继承大家还算比较了解。它主要包括单继承、多继承、虚继承这几方面。

-   单继承就是一个子类只继承一个父类，多继承就是一个子类继承多个父类。

-   其实在C++中，一个子类继承多个父类的情况还是比较常见的。比如，一个子类需要同时继承两个父类的功能，这时候就可以使用多继承。

-
    以下是一个 C++ 中多继承的简单示例代码：

    cpp


    ```cpp
    #include <iostream>

    // 父类 Base1
    class Base1 {
    public:
    void method1() {
    std::cout << "Base1::method1()" << std::endl;
    }
    };

    // 父类 Base2
    class Base2 {
    public:
    void method2() {
    std::cout << "Base2::method2()" << std::endl;
    }
    };

    // 子类Derived 同时继承 Base1 和 Base2
    class Derived : public Base1, public Base2 {
    public:
    void derivedMethod() {
    std::cout << "Derived::derivedMethod()" << std::endl;
    }
    };

    int main() {
    Derived d;
    d.method1();
    d.method2();
    d.derivedMethod();

    return 0;
    }

    ```


    在上述代码中， Derived  类同时继承了  Base1  和  Base2  两个父类，可以调用这两个父类中的方法。


    ```css
    在多继承的写法上，需要在子类声明时依次列出多个父类，并使用逗号分隔，
    且每个父类的继承方式（如 public、private 或 protected）也要明确指定。
    ```

    ```css
    需要特别关注的方面主要有几个：

    首先是同名成员的冲突问题。如果多个父类中存在同名的成员（包括数据成员或成员函数），
    在子类中使用时需要明确指出是从哪个父类继承来的。

    其次是菱形继承可能导致的二义性问题。比如类 D 继承自类 B 和类 C，而 B 和 C 又都
    继承自类 A，如果 D 中访问 A 中的成员，可能会产生二义性。这时候可能需要使用虚继承来解决。

    还有就是不同父类的构造函数和析构函数的调用顺序，需要按照继承时指定的顺序来进行。
    ```


    你在实际编写代码的时候，一定要小心处理这些情况，避免出现错误


        运行结果如下：


![](/uploads/csdn/c多继承一个子类继承多个父类的情况/img-01.png)
