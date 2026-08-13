---
title: 推荐比mini stl更好的C实现项目代码
slug: 推荐比mini-stl更好的c实现项目代码
category: C/C++ 与 Rust
summary: 代码来源 -- STL模拟: STL模拟 的各类实现 - Gitee.com
tags: C/C++, Rust, C
---

代码来源 -- [STL模拟: STL模拟 的各类实现 - Gitee.com](https://gitee.com/liu-zhijiang_sc/stl-simulation/tree/master "STL模拟: STL模拟 的各类实现 - Gitee.com")


```cpp
// 防止头文件被重复包含
#pragma once
// 包含输入输出流库，用于基本的输入输出操作
#include <iostream>
// 包含向量容器库，向量是一种动态数组
#include <vector>
// 包含列表容器库，列表是一种双向链表
#include <list>

// 使用标准命名空间，这样就可以直接使用标准库中的类和函数，而无需加上std::前缀
using namespace std;

// 正向迭代器类模板，用于以正向顺序遍历容器
template <class Iterator>
class ForwardIterator {
private:
    // 当前迭代器指向的位置
    Iterator current;

public:
    // 定义迭代器所指向元素的类型
    using value_type = typename iterator_traits<Iterator>::value_type;
    // 定义迭代器所指向元素的引用类型
    using reference = typename iterator_traits<Iterator>::reference;
    // 定义迭代器所指向元素的指针类型
    using pointer = typename iterator_traits<Iterator>::pointer;

    // 构造函数，使用一个迭代器初始化当前迭代器
    explicit ForwardIterator(Iterator it) : current(it) {}

    // 解引用操作符，返回当前迭代器指向的元素的引用
    reference operator*() {
        return *current;
    }

    // 前置递增操作符，将迭代器移动到下一个位置，并返回自身引用
    ForwardIterator& operator++() {
        ++current;
        return *this;
    }

    // 后置递增操作符，先保存当前迭代器状态，再将迭代器移动到下一个位置，最后返回保存的状态
    ForwardIterator operator++(int) {
        ForwardIterator tmp = *this;
        ++(*this);
        return tmp;
    }

    // 不等于比较操作符，用于判断两个迭代器是否指向不同的位置
    bool operator!=(const ForwardIterator& other) const {
        return current != other.current;
    }
};

// 常量正向迭代器类模板，用于以正向顺序遍历容器，且不允许修改元素
template <class Iterator>
class ConstForwardIterator {
private:
    // 当前迭代器指向的位置
    Iterator current;

public:
    // 定义迭代器所指向元素的类型
    using value_type = typename iterator_traits<Iterator>::value_type;
    // 定义迭代器所指向元素的常量引用类型
    using reference = const typename iterator_traits<Iterator>::value_type&;
    // 定义迭代器所指向元素的常量指针类型
    using pointer = const typename iterator_traits<Iterator>::value_type*;

    // 构造函数，使用一个迭代器初始化当前迭代器
    explicit ConstForwardIterator(Iterator it) : current(it) {}

    // 解引用操作符，返回当前迭代器指向的元素的常量引用
    reference operator*() const {
        return *current;
    }

    // 前置递增操作符，将迭代器移动到下一个位置，并返回自身引用
    ConstForwardIterator& operator++() {
        ++current;
        return *this;
    }

    // 后置递增操作符，先保存当前迭代器状态，再将迭代器移动到下一个位置，最后返回保存的状态
    ConstForwardIterator operator++(int) {
        ConstForwardIterator tmp = *this;
        ++(*this);
        return tmp;
    }

    // 不等于比较操作符，用于判断两个迭代器是否指向不同的位置
    bool operator!=(const ConstForwardIterator& other) const {
        return current != other.current;
    }
};

// 反向迭代器类模板，用于以反向顺序遍历容器
template <class Iterator>
class ReverseIterator {
private:
    // 当前迭代器指向的位置
    Iterator current;

public:
    // 定义迭代器所指向元素的类型
    using value_type = typename iterator_traits<Iterator>::value_type;
    // 定义迭代器所指向元素的引用类型
    using reference = typename iterator_traits<Iterator>::reference;

    // 构造函数，从标准库的反向迭代器构造当前反向迭代器
    explicit ReverseIterator(const std::reverse_iterator<Iterator>& rev_it)
        : current(rev_it.base()) {}

    // 解引用操作符，返回当前迭代器指向的元素
    auto operator*() const {
        Iterator tmp = current;
        --tmp;  // 反向迭代，因为反向迭代器的行为与正向迭代器相反
        return *tmp;
    }

    // 前置递增操作符，将迭代器移动到前一个位置（反向移动），并返回自身引用
    ReverseIterator& operator++() {
        --current;
        return *this;
    }

    // 后置递增操作符，先保存当前迭代器状态，再将迭代器移动到前一个位置（反向移动），最后返回保存的状态
    ReverseIterator operator++(int) {
        ReverseIterator tmp = *this;
        --current;
        return tmp;
    }

    // 不等于比较操作符，用于判断两个迭代器是否指向不同的位置
    bool operator!=(const ReverseIterator& other) const {
        return current != other.current;
    }

    // 返回底层的正向迭代器
    Iterator base() const {
        return current;
    }
};

// 常量反向迭代器类模板，用于以反向顺序遍历容器，且不允许修改元素
template <class Iterator>
class ConstReverseIterator {
private:
    // 当前迭代器指向的位置
    Iterator current;

public:
    // 定义迭代器所指向元素的类型
    using value_type = typename iterator_traits<Iterator>::value_type;
    // 定义迭代器所指向元素的常量引用类型
    using reference = const typename iterator_traits<Iterator>::value_type&;

    // 构造函数，从标准库的常量反向迭代器构造当前常量反向迭代器
    explicit ConstReverseIterator(const std::reverse_iterator<Iterator>& rev_it)
        : current(rev_it.base()) {}

    // 解引用操作符，返回当前迭代器指向的元素的常量引用
    auto operator*() const {
        Iterator tmp = current;
        --tmp;  // 反向迭代，因为反向迭代器的行为与正向迭代器相反
        return *tmp;
    }

    // 前置递增操作符，将迭代器移动到前一个位置（反向移动），并返回自身引用
    ConstReverseIterator& operator++() {
        --current;
        return *this;
    }

    // 不等于比较操作符，用于判断两个迭代器是否指向不同的位置
    bool operator!=(const ConstReverseIterator& other) const {
        return current != other.current;
    }

    // 返回底层的正向迭代器
    Iterator base() const {
        return current;
    }
};

// 容器适配器类模板，用于为容器提供自定义的迭代器接口
template <class Container>
class ContainerAdapter {
private:
    // 引用要适配的容器
    Container& container;

public:
    // 定义容器的迭代器类型
    using iterator = typename Container::iterator;
    // 定义容器的常量迭代器类型
    using const_iterator = typename Container::const_iterator;

    // 构造函数，初始化要适配的容器
    ContainerAdapter(Container& container) : container(container) {}

    // 返回正向迭代器的起始位置
    ForwardIterator<iterator> begin() {
        return ForwardIterator<iterator>(container.begin());
    }
    // 返回正向迭代器的结束位置
    ForwardIterator<iterator> end() {
        return ForwardIterator<iterator>(container.end());
    }

    // 返回正向常量迭代器的起始位置
    ConstForwardIterator<const_iterator> cbegin() const {
        return ConstForwardIterator<const_iterator>(container.cbegin());
    }
    // 返回正向常量迭代器的结束位置
    ConstForwardIterator<const_iterator> cend() const {
        return ConstForwardIterator<const_iterator>(container.cend());
    }

    // 返回反向迭代器的起始位置
    ReverseIterator<typename Container::iterator> rbegin() {
        return ReverseIterator<typename Container::iterator>(container.rbegin());
    }
    // 返回反向迭代器的结束位置
    ReverseIterator<typename Container::iterator> rend() {
        return ReverseIterator<typename Container::iterator>(container.rend());
    }
    // 返回常量反向迭代器的起始位置
    ConstReverseIterator<typename Container::const_iterator> crbegin() const {
        return ConstReverseIterator<typename Container::const_iterator>(container.crbegin());
    }
    // 返回常量反向迭代器的结束位置
    ConstReverseIterator<typename Container::const_iterator> crend() const {
        return ConstReverseIterator<typename Container::const_iterator>(container.crend());
    }
};
```


```cpp
#include<iostream>
//以vector和list为例
#include<vector>
// 需要使用for_eacj必须引入的算法库函数
#include<algorithm>
#include"Iterator_for_all_container.h"

using namespace std;
//
//class OPerator
//{
//public:
//	OPerator();
//	~OPerator();
//	OPerator operator++();
//	OPerator operator++(int k);
//private:
//	int n;
//};
//
//OPerator::OPerator()
//{
//}
//
//OPerator::~OPerator()
//{
//}
//
//OPerator OPerator::operator++() {
//	// 前置++
//	++n;
//	return *this;
//}
//OPerator OPerator::operator++(int k) {
//	// 后置++
//	OPerator temp(*this);// 记录修改前的对象
//	n++;
//	return temp;
//}
//
//
//
 遍历
//void Test() {
//	vector<int> v;
//	v.push_back(20);
//	v.push_back(10);
//	v.push_back(5);
//
//	// 1.基本的循环
//	for (auto it = v.begin(); it !=  v.end(); ++it) {
//		cout << *it << " ";
//	}
//	cout << endl;
//	// 2.C++11之后，增强版for
//	for (const auto& elem : v) {
//		cout << elem << " ";
//	}
//	cout << endl;
//	// 3.lambda表达式
//	for_each(v.begin(), v.end(), [](int elem) { cout << elem << " "; });
//	cout << endl;
//	// 4.不需要修改容器元素的话,可以使用常量迭代器
//	for (auto it = v.cbegin(); it != v.cend(); ++it) {
//		cout << *it << " ";
//	}
//	cout << endl;
//}
//
//void Test_reverse() {
//	vector<int> vec;
//	for (int i = 0; i < 5; i++) {
//		vec.push_back(i);
//	}
//	// 反向迭代器
//	for (vector<int>::reverse_iterator it = vec.rbegin(); it != vec.rend(); ++it) {
//		cout << *it << " ";
//	}
//	cout << endl;
//	//lambda
//	for_each(vec.rbegin(), vec.rend(), [](const auto& elem)-> void { cout << elem << " "; });
//}


// 使用适配器类进行容器的遍历
template <class Container>
void testContainerAdapter(Container& container) {
    // 创建适配器实例
    ContainerAdapter<Container> adapter(container);

    // 正向迭代器测试
    std::cout << "正向迭代器: ";
    for (auto it = adapter.begin(); it != adapter.end(); ++it) {
        std::cout << *it << " ";
    }
    std::cout << std::endl;

    // 正向常量迭代器测试
    std::cout << "正向常量迭代器: ";
    for (auto it = adapter.cbegin(); it != adapter.cend(); ++it) {
        std::cout << *it << " ";
    }
    std::cout << std::endl;

    // 反向迭代器测试
    std::cout << "反向迭代器: ";
    for (auto it = adapter.rbegin(); it != adapter.rend(); ++it) {
        std::cout << *it << " ";
    }
    std::cout << std::endl;

    // 常量反向迭代器测试
    std::cout << "常量反向迭代器: ";
    for (auto it = adapter.crbegin(); it != adapter.crend(); ++it) {
        std::cout << *it << " ";
    }
    std::cout << std::endl;
    // lambda
    for_each(adapter.crbegin(), adapter.crend(), [](const auto& elem) ->void { std::cout << elem << " "; });
}

void Test_iterator() {
    // 测试 vector
    std::vector<int> vec = { 1, 2, 3, 4, 5 };
    std::cout << "测试 vector 容器:" << std::endl;
    testContainerAdapter(vec);

    // 测试 list
    std::list<int> lst = { 10, 20, 30, 40, 50 };
    std::cout << "\n测试 list 容器:" << std::endl;
    testContainerAdapter(lst);
}

int main() {
    Test_iterator();
    return 0;
}
```


![](/uploads/csdn/推荐比mini-stl更好的c实现项目代码/img-01.png)
