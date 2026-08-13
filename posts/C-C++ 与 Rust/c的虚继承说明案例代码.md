---
title: c的虚继承说明案例代码
slug: c的虚继承说明案例代码
category: C/C++ 与 Rust
summary: 1.  ## 虚继承的基本概念
tags: C/C++, Rust
---

1.  ## **虚继承的基本概念**


    -   在 C++ 中，虚继承主要用于解决多继承时可能出现的菱形继承问题。菱形继承是指一个类有两个（或更多）子类，而这两个子类又同时继承自一个共同的基类，当这些子类又被另一个类继承时，就形成了菱形结构。在这种情况下，如果没有虚继承，会导致基类数据成员在派生类中有多份副本，可能引起二义性等问题。虚继承可以保证在这种复杂的继承关系中，公共基类只有一份副本。
2.  ## **简单的虚继承示例**


    -   首先看一个没有虚继承导致数据成员重复的例子：
    -   cpp


```cpp
class Base {
public:
    int baseData;
};

class Derived1 : public Base {
};

class Derived2 : public Base {
};

class GrandDerived : public Derived1, public Derived2 {
};

int main() {
    GrandDerived gd;
    // 下面这行代码会产生二义性错误，因为baseData在Derived1和Derived2中都存在
    // gd.baseData = 10;
    return 0;
}
```


-   在这个例子中，`GrandDerived`类通过`Derived1`和`Derived2`间接继承了`Base`类，这就导致`GrandDerived`对象中有两份`Base`类的数据成员`baseData`。当试图访问`baseData`时会产生二义性错误。


1.  ## **使用虚继承解决菱形继承问题**


    -   下面是使用虚继承来解决上述问题的代码
    -   cpp


```cpp
class Base {
public:
    int baseData;
};

class Derived1 : virtual public Base {
};

class Derived2 : virtual public Base {
};

class GrandDerived : public Derived1, public Derived2 {
};

int main() {
    GrandDerived gd;
    gd.baseData = 10;  // 正确，此时只有一份baseData
    return 0;
}
```


-   在这个修改后的代码中，`Derived1`和`Derived2`虚继承自`Base`类。这使得在`GrandDerived`类中，`Base`类只会有一份副本，所以可以正确地访问`baseData`成员。


1.  ## **虚继承的构造函数顺序案例**


    -   当涉及虚继承时，构造函数的调用顺序也有特殊的规则。构造函数的调用顺序是先调用虚基类的构造函数，然后再按照继承顺序调用非虚基类的构造函数。
    -   cpp


```cpp
class Base {
public:
    Base() {
        std::cout << "Base constructor" << std::endl;
    }
};

class Derived1 : virtual public Base {
public:
    Derived1() {
        std::cout << "Derived1 constructor" << std::endl;
    }
};

class Derived2 : virtual public Base {
public:
    Derived2() {
        std::cout << "Derived2 constructor" << std::endl;
    }
};

class GrandDerived : public Derived1, public Derived2 {
public:
    GrandDerived() {
        std::cout << "GrandDerived constructor" << std::endl;
    }
};

int main() {
    GrandDerived gd;
    return 0;
}
```


-   在这个例子中，输出结果是：


```
Base constructor
Derived1 constructor
Derived2 constructor
GrandDerived constructor
```


-   可以看到，首先调用了虚基类`Base`的构造函数，然后按照继承顺序调用了`Derived1`和`Derived2`的构造函数，最后调用了`GrandDerived`的构造函数。


1.  ## **虚继承中的指针和引用案例**


    -   考虑以下代码来展示虚继承中指针和引用的行为：
    -   cpp


```cpp
class Base {
public:
    int baseData;
    virtual void print() {
        std::cout << "Base print" << std::endl;
    }
};

class Derived1 : virtual public Base {
public:
    void print() override {
        std::cout << "Derived1 print" << std::endl;
    }
};

class Derived2 : virtual public Base {
public:
    void print() override {
        std::cout << "Derived2 print" << std::endl;
    }
};

class GrandDerived : public Derived1, public Derived2 {
};

int main() {
    GrandDerived gd;
    Base* ptr = &gd;
    ptr->print();  // 调用Derived1的print函数，这取决于继承顺序和虚函数机制
    return 0;
}
```


-   在这个例子中，通过`Base*`指针指向`GrandDerived`对象，当调用`print`函数时，由于虚函数的动态绑定特性和继承顺序，实际上调用的是`Derived1`类中的`print`函数。这展示了在虚继承场景下，通过基类指针或引用访问虚函数时的多态行为。


## 以下是用流程图来说明虚继承用于解决多继承时菱形继承问题的过程：


```cpp
graph TD;
    A[定义基类Base] --> B[定义子类Derived1和Derived2直接继承Base];
    B --> C[定义GrandDerived类继承Derived1和Derived2形成菱形继承结构];
    C --> D[不使用虚继承时，GrandDerived对象中有两份Base类的数据成员，访问可能出现二义性];
    A --> E[定义子类Derived1和Derived2虚继承Base];
    E --> F[定义GrandDerived类继承Derived1和Derived2];
    F --> G[使用虚继承后，Base类在GrandDerived对象中只有一份副本，可正常访问数据成员];
```


在上述流程图中：


-   首先是定义一个基类`Base`。
-   然后有两种情况分支：
    -   一种是常规的非虚继承方式，`Derived1`和`Derived2`直接继承`Base`，之后`GrandDerived`再继承`Derived1`和`Derived2`，这样会形成菱形继承结构，并且在不使用虚继承时，`GrandDerived`对象中会存在两份`Base`类的数据成员，导致在访问这些数据成员时可能出现二义性问题。
    -   另一种是采用虚继承的方式，`Derived1`和`Derived2`虚继承`Base`，接着`GrandDerived`继承`Derived1`和`Derived2`，此时由于虚继承的作用，`Base`类在`GrandDerived`对象中只会有一份副本，从而可以正常地访问数据成员，避免了二义性等问题。
