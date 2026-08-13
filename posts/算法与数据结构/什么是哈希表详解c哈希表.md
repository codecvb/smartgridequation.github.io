---
title: 什么是哈希表详解c哈希表
slug: 什么是哈希表详解c哈希表
category: 算法与数据结构
summary: 什么是哈希表？
tags: 算法
---

#### 什么是哈希表？


哈希表（Hash Table）是一种高效的数据结构，它通过**哈希函数**将键（Key）映射到存储位置（数组索引），实现快速的插入、删除和查找操作（平均时间复杂度为 O (1)）。


哈希表的核心思想是：


1.  使用数组作为底层存储结构
2.  通过哈希函数计算键对应的数组索引
3.  当不同的键映射到相同索引时，使用**哈希冲突解决策略**处理


#### C++ 中的哈希表实现


C++ 标准库提供了多种哈希表相关容器，主要包括：


1.  **`std::unordered_map`**：键值对映射，键唯一
2.  **`std::unordered_set`**：存储唯一键
3.  **`std::unordered_multimap`**：允许键重复的键值对映射
4.  **`std::unordered_multiset`**：允许键重复的集合


这些容器都基于哈希表实现，属于 C++11 及以上标准。


##### 1. `std::unordered_map` 基本用法


C++ unordered\_map 示例


V1


```cpp
#include <iostream>
#include <unordered_map>
#include <string>

int main() {
    // 创建一个unordered_map，键为string类型，值为int类型
    std::unordered_map<std::string, int> student_scores;

    // 插入元素
    student_scores["Alice"] = 90;
    student_scores.insert({"Bob", 85});
    student_scores.emplace("Charlie", 95);

    // 查找元素
    std::string name = "Bob";
    auto it = student_scores.find(name);
    if (it != student_scores.end()) {
        std::cout << name << " 的分数是: " << it->second << std::endl;
    } else {
        std::cout << name << " 未找到" << std::endl;
    }

    // 遍历哈希表
    std::cout << "\n所有学生分数:" << std::endl;
    for (const auto& pair : student_scores) {
        std::cout << pair.first << ": " << pair.second << std::endl;
    }

    // 删除元素
    student_scores.erase("Bob");

    // 查看大小
    std::cout << "\n当前学生数量: " << student_scores.size() << std::endl;

    return 0;
}
```


##### 2\. 哈希冲突解决策略


C++ 哈希表采用**链地址法**（Separate Chaining）解决哈希冲突：


-   底层是一个数组，每个元素是一个链表（或平衡树）的头指针
-   当哈希冲突发生时，将新元素添加到对应索引的链表中
-   当链表长度超过阈值时，会自动转换为平衡树（如红黑树）以保持高效操作


##### 3\. 自定义类型作为键


要将自定义类型用作哈希表的键，需要：


1.  提供哈希函数（特化 `std::hash`）
2.  提供相等比较运算符（`operator==`）


C++ 自定义哈希表键类型


V1


```cpp
#include <iostream>
#include <unordered_map>
#include <string>

// 自定义类型
struct Person {
    std::string name;
    int age;

    // 相等比较运算符
    bool operator==(const Person& other) const {
        return name == other.name && age == other.age;
    }
};

// 为Person类型提供哈希函数
namespace std {
    template<> struct hash<Person> {
        size_t operator()(const Person& p) const {
            // 组合name和age的哈希值
            size_t h1 = hash<std::string>()(p.name);
            size_t h2 = hash<int>()(p.age);
            // 简单的哈希组合方式
            return h1 ^ (h2 << 1);
        }
    };
}

int main() {
    std::unordered_map<Person, std::string> person_jobs;

    person_jobs[{ "Alice", 30 }] = "Engineer";
    person_jobs[{ "Bob", 25 }] = "Designer";

    for (const auto& pair : person_jobs) {
        std::cout << pair.first.name << " (" << pair.first.age << "): "
                  << pair.second << std::endl;
    }

    return 0;
}
```


#### 哈希表的优缺点


**优点**：


-   平均时间复杂度为 O (1) 的插入、删除和查找
-   适用于需要频繁查找的场景


**缺点**：


-   元素无序存储
-   哈希函数设计不当会导致大量冲突，性能下降
-   内存占用通常比树结构更大
-   最坏情况下（所有元素哈希冲突）时间复杂度为 O (n)


#### 与 `std::map` 的对比


特性

`std::unordered_map`

`std::map`

底层实现

哈希表

红黑树

元素顺序

无序

按键排序

平均查找时间

O(1)

O(log n)

最坏查找时间

O(n)

O(log n)

内存占用

通常更大

通常更小

插入性能

更好（平均）

较稳定


选择建议：


-   需要快速查找且不关心顺序时，选 `std::unordered_map`
-   需要有序存储或保证最坏情况性能时，选 `std::map`


哈希表是 C++ 中处理快速查找场景的重要工具，合理使用能显著提升程序性能。


分享


#### 用哈希表解决几个算法问题，难度为简单或者中等


下面我将使用哈希表解决几个简单到中等难度的算法问题，展示哈希表在实际编程中的应用。


#### 问题 1：两数之和（简单）


给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值的那两个整数，并返回它们的数组下标。


两数之和问题的哈希表解法


```cpp
#include <iostream>
#include <vector>
#include <unordered_map>

using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // 创建哈希表存储数字及其索引
    unordered_map<int, int> num_map;

    for (int i = 0; i < nums.size(); ++i) {
        // 计算需要寻找的补数
        int complement = target - nums[i];

        // 检查补数是否已经在哈希表中
        if (num_map.find(complement) != num_map.end()) {
            // 找到则返回两个索引
            return {num_map[complement], i};
        }

        // 未找到则将当前数字及其索引存入哈希表
        num_map[nums[i]] = i;
    }

    // 题目保证有解，这里只是为了语法完整
    return {};
}

int main() {
    vector<int> nums = {2, 7, 11, 15};
    int target = 9;

    vector<int> result = twoSum(nums, target);
    cout << "[" << result[0] << ", " << result[1] << "]" << endl;  // 输出 [0, 1]

    return 0;
}

```


**解法说明**：


-   时间复杂度：O (n)，只需遍历一次数组
-   空间复杂度：O (n)，哈希表最多存储 n 个元素
-   核心思路：通过哈希表存储已遍历的数字及其索引，对每个数字计算补数并检查是否在哈希表中


在 C++ 中，`unordered_map` 等标准容器具有**默认构造函数**，这意味着当你声明 `unordered_map num_map;` 时，编译器会自动调用其默认构造函数完成初始化，不需要显式编写初始化代码。


这就是为什么即使没有显式初始化（如 `unordered_map num_map = unordered_map();`），也可以直接使用 `num_map.find()` 等成员函数的原因：


1.

    **默认构造函数的作用**：


    -   会初始化哈希表的内部结构（如桶数组、大小计数器等）
    -   会创建一个**空的哈希表**（包含 0 个元素），但容器本身是处于可用状态的


2.

    **对 `find()` 方法的影响**：


    -   当调用 `num_map.find(complement)` 时，即使哈希表为空，`find()` 也能正常工作
    -   对于空哈希表，`find()` 会直接返回 `num_map.end()`，表示未找到目标元素


简单来说，`unordered_map` 的默认构造函数已经确保了对象处于**可用状态**，因此可以直接调用其成员函数，无需额外的初始化操作。这是 C++ 标准容器的设计特性，方便开发者使用。


#### 问题 2：存在重复元素 II（中等）


给定一个整数数组和一个整数 k，判断数组中是否存在两个不同的索引 i 和 j，使得 nums \[i\] = nums \[j\]，并且 i 和 j 的差的绝对值不超过 k。


存在重复元素II的哈希表解法


```cpp
#include <iostream>
#include <vector>
#include <unordered_map>

using namespace std;

bool containsNearbyDuplicate(vector<int>& nums, int k) {
    unordered_map<int, int> num_index;  // 存储数字及其最近出现的索引

    for (int i = 0; i < nums.size(); ++i) {
        // 检查当前数字是否出现过，且索引差不超过k
        if (num_index.find(nums[i]) != num_index.end() &&
            i - num_index[nums[i]] <= k) {
            return true;
        }

        // 更新当前数字的最新索引
        num_index[nums[i]] = i;
    }

    return false;
}

int main() {
    vector<int> nums1 = {1, 2, 3, 1};
    int k1 = 3;
    cout << boolalpha << containsNearbyDuplicate(nums1, k1) << endl;  // 输出 true

    vector<int> nums2 = {1, 0, 1, 1};
    int k2 = 1;
    cout << boolalpha << containsNearbyDuplicate(nums2, k2) << endl;  // 输出 true

    vector<int> nums3 = {1, 2, 3, 1, 2, 3};
    int k3 = 2;
    cout << boolalpha << containsNearbyDuplicate(nums3, k3) << endl;  // 输出 false

    return 0;
}

```


**解法说明**：


-   时间复杂度：O (n)，只需一次遍历
-   空间复杂度：O (n)，哈希表存储元素及其索引
-   核心思路：使用哈希表记录每个数字最后出现的位置，每次遇到相同数字时检查索引差


#### 问题 3：无重复字符的最长子串（中等）


给定一个字符串，请你找出其中不含有重复字符的最长子串的长度。


我来修改函数，使其输出最小子字符串，并详细展示left和right的变化过程。


### 修改后的C++代码


```cpp
#include <iostream>
#include <string>
#include <unordered_map>
#include <algorithm>
using namespace std;

int lengthOfLongestSubstring(string s) {
    unordered_map<char, int> charIndexMap;
    int maxLength = 0;
    int left = 0;
    int start = 0; // 记录最长子串的起始位置

    for (int right = 0; right < s.size(); right++) {
        char currentChar = s[right];

        // 输出当前状态
        cout << "right=" << right << ", char='" << currentChar << "', ";
        cout << "left=" << left << ", ";
        cout << "current window: [" << left << "," << right << "] = \"";
        for (int i = left; i <= right; i++) cout << s[i];
        cout << "\"" << endl;

        if (charIndexMap.find(currentChar) != charIndexMap.end() && charIndexMap[currentChar] >= left) {
            cout << "  -> Duplicate found! Moving left from " << left << " to " << charIndexMap[currentChar] + 1 << endl;
            left = charIndexMap[currentChar] + 1;
        }

        charIndexMap[currentChar] = right;
        int currentLength = right - left + 1;

        if (currentLength > maxLength) {
            maxLength = currentLength;
            start = left; // 记录最长子串的起始位置
            cout << "  -> New max length: " << maxLength << ", substring: \"";
            for (int i = start; i <= right; i++) cout << s[i];
            cout << "\"" << endl;
        }

        cout << "  Updated map: ";
        for (auto& pair : charIndexMap) {
            cout << pair.first << ":" << pair.second << " ";
        }
        cout << endl << endl;
    }

    cout << "Longest substring: \"";
    for (int i = start; i < start + maxLength; i++) cout << s[i];
    cout << "\" with length: " << maxLength << endl << endl;

    return maxLength;
}

int main() {
    string test1 = "abcabcbb";
    string test2 = "pwwkew";
    string test3 = "abcdeedcbaabcdeedcba";

    cout << "=== Test 1: \"" << test1 << "\" ===" << endl;
    lengthOfLongestSubstring(test1);

    cout << "=== Test 2: \"" << test2 << "\" ===" << endl;
    lengthOfLongestSubstring(test2);

    cout << "=== Test 3: \"" << test3 << "\" ===" << endl;
    lengthOfLongestSubstring(test3);

    return 0;
}
```


### left和right变化与子字符串的关系说明


#### 基本概念：


-

    **left**: 滑动窗口的左边界，表示当前无重复子串的起始位置


-

    **right**: 滑动窗口的右边界，表示当前遍历到的字符位置


-

    **窗口 \[left, right\]**: 表示当


```html
变化规则：
right向右移动：每次循环right增加1，扩展窗口的右边界

left的移动条件：当遇到重复字符时，left移动到该字符上次出现位置的下一个位置

子串长度：right - left + 1

以test2: "pwwkew" 为例的详细过程：
=== Test 2: "pwwkew" ===
right=0, char='p', left=0, current window: [0,0] = "p"
  -> New max length: 1, substring: "p"
  Updated map: p:0

right=1, char='w', left=0, current window: [0,1] = "pw"
  -> New max length: 2, substring: "pw"
  Updated map: p:0 w:1

right=2, char='w', left=0, current window: [0,2] = "pww"
  -> Duplicate found! Moving left from 0 to 2
  Updated map: p:0 w:2

right=3, char='k', left=2, current window: [2,3] = "wk"
  -> New max length: 2, substring: "wk"
  Updated map: p:0 w:2 k:3

right=4, char='e', left=2, current window: [2,4] = "wke"
  -> New max length: 3, substring: "wke"
  Updated map: p:0 w:2 k:3 e:4

right=5, char='w', left=2, current window: [2,5] = "wkew"
  -> Duplicate found! Moving left from 2 to 3
  Updated map: p:0 w:5 k:3 e:4

Longest substring: "wke" with length: 3
```


#### 关键点说明：


1.

    **初始状态**：left=0, right=0，窗口为"p"


2.

    **扩展窗口**：right移动到1，窗口扩展为"pw"（无重复）


3.

    **遇到重复**：right=2时遇到第二个'w'，发现重复，left从0移动到2


4.

    **重新构建**：窗口变为"w"（从索引2开始）


5.

    **继续扩展**：添加'k'和'e'，形成"wke"（长度为3）


6.

    **再次遇到重复**：right=5时遇到第三个'w'，但此时left=2，窗口为"wkew"包含重复


7.

    **调整窗口**：left移动到3，窗口变为"kew"（仍然长度为3）


#### 输出结果：


程序会详细显示每一步的left、right变化，当前窗口内容，哈希表状态，以及何时发现重复字符和如何调整窗口边界。


这样的输出可以帮助你清晰理解滑动窗口算法的工作原理和left/right指针的动态变化过程。


**解法说明**：


-   时间复杂度：O (n)，每个字符只处理一次
-   空间复杂度：O (min (m, n))，m 是字符集大小
-   核心思路：使用滑动窗口 + 哈希表，哈希表记录字符最后出现的位置，当遇到重复字符时调整窗口起始位置


这些问题展示了哈希表在快速查找、去重和记录位置等场景的高效应用，通过哈希表可以将许多原本需要 O (n²) 时间复杂度的问题优化到 O (n)。
