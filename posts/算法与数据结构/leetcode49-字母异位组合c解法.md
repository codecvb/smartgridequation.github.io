---
title: LeetCode49.字母异位组合C解法
slug: leetcode49-字母异位组合c解法
category: 算法与数据结构
summary: 给你一个字符串数组，请你将 字母异位词 组合在一起。可以按任意顺序返回结果列表。
tags: 算法, C
---

给你一个字符串数组，请你将 字母异位词 组合在一起。可以按任意顺序返回结果列表。


**示例 1:**


**输入:** strs = \["eat", "tea", "tan", "ate", "nat", "bat"\]


**输出:** \[\["bat"\],\["nat","tan"\],\["ate","eat","tea"\]\]


**解释：**


-   在 strs 中没有字符串可以通过重新排列来形成 `"bat"`。
-   字符串 `"nat"` 和 `"tan"` 是字母异位词，因为它们可以重新排列以形成彼此。
-   字符串 `"ate"` ，`"eat"` 和 `"tea"` 是字母异位词，因为它们可以重新排列以形成彼此。


**示例 2:**


**输入:** strs = \[""\]


**输出:** \[\[""\]\]


**示例 3:**


**输入:** strs = \["a"\]


**输出:** \[\["a"\]\]


#### 解题思路


字母异位词的核心特征是：**字符组成完全相同，仅排列顺序不同**。因此可以通过「标准化」每个字符串（如将字符串按字符排序），将字母异位词映射到同一个键，最终把相同键对应的字符串归为一类。


具体步骤：


1.  遍历字符串数组，对每个字符串进行**排序**（如 "eat" 排序后为 "aet"，"tea" 排序后也为 "aet"），排序后的字符串作为哈希表的键；
2.  哈希表的值为一个字符串列表，用于存储所有与当前键对应的字母异位词；
3.  遍历完成后，将哈希表中的所有值提取出来，即为最终结果。


#### C++ 代码实现


```cpp
#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <algorithm>
using namespace std;

class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        // 哈希表：键为排序后的字符串，值为对应的字母异位词列表
        unordered_map<string, vector<string>> mp;

        for (string& s : strs) {
            // 1. 对当前字符串排序，生成标准化的键
            string key = s;
            sort(key.begin(), key.end());
            // 2. 将原字符串加入对应键的列表中
            mp[key].push_back(s);
        }

        // 3. 提取哈希表中的所有值，组成结果
        vector<vector<string>> res;
        for (auto& pair : mp) {
            res.push_back(pair.second);
        }

        return res;
    }
};

// 测试用例
int main() {
    Solution solution;

    // 示例1
    vector<string> strs1 = {"eat", "tea", "tan", "ate", "nat", "bat"};
    vector<vector<string>> res1 = solution.groupAnagrams(strs1);
    cout << "示例1输出：" << endl;
    for (auto& group : res1) {
        cout << "[";
        for (int i = 0; i < group.size(); ++i) {
            cout << "\"" << group[i] << "\"";
            if (i != group.size() - 1) cout << ",";
        }
        cout << "]" << endl;
    }

    // 示例2
    vector<string> strs2 = {""};
    vector<vector<string>> res2 = solution.groupAnagrams(strs2);
    cout << "\n示例2输出：" << endl;
    for (auto& group : res2) {
        cout << "[";
        for (int i = 0; i < group.size(); ++i) {
            cout << "\"" << group[i] << "\"";
            if (i != group.size() - 1) cout << ",";
        }
        cout << "]" << endl;
    }

    // 示例3
    vector<string> strs3 = {"a"};
    vector<vector<string>> res3 = solution.groupAnagrams(strs3);
    cout << "\n示例3输出：" << endl;
    for (auto& group : res3) {
        cout << "[";
        for (int i = 0; i < group.size(); ++i) {
            cout << "\"" << group[i] << "\"";
            if (i != group.size() - 1) cout << ",";
        }
        cout << "]" << endl;
    }

    return 0;
}
```


#### 代码解释


1.  **哈希表定义**：`unordered_map> mp` 用于存储「排序后的字符串」与「字母异位词列表」的映射；
2.  **遍历并标准化字符串**：

    -   对每个字符串 `s`，复制一份到 `key`，然后对 `key` 按字符排序（如 "tan" 排序为 "ant"，"nat" 排序也为 "ant"）；
    -   将原字符串 `s` 加入 `mp[key]` 对应的列表中，实现字母异位词的分组；


3.  **提取结果**：遍历哈希表，将每个键对应的列表存入结果数组 `res`；
4.  **测试用例**：主函数验证了题目给出的三个示例，输出格式与题目要求一致。


#### 进阶优化（针对长字符串）


如果字符串长度较长，排序的时间复杂度（O (k log k)，k 为字符串长度）可能偏高，可优化为「字符计数法」生成键：


-   统计每个字符串中 26 个字母的出现次数，将计数结果拼接为字符串（如 "eat" 计数为 "1,0,0,0,1,0,...,1,0..."），作为哈希表的键；
-   该方法的时间复杂度为 O (k) 每字符串，适合长字符串场景。


优化后的核心代码片段：


```
// 替换原排序逻辑，生成字符计数字符串作为键
string getKey(string& s) {
    vector<int> count(26, 0);
    for (char c : s) {
        count[c - 'a']++;
    }
    string key;
    for (int num : count) {
        key += to_string(num) + ","; // 加分隔符避免数字拼接歧义（如 11 和 1,1）
    }
    return key;
}

// 在groupAnagrams中调用：
string key = getKey(s);
mp[key].push_back(s);
```


#### 复杂度分析


-   **基础版（排序法）**：


    -   时间复杂度：O (n \* k log k)。n 是字符串数组长度，k 是字符串的最大长度（排序每个字符串需 O (k log k)）；
    -   空间复杂度：O (n \* k)。哈希表需存储所有字符串，最坏情况下占用 O (n\*k) 空间。


-   **优化版（计数法）**：

    -   时间复杂度：O (n \* k)。统计字符计数仅需 O (k) 每字符串；
    -   空间复杂度：O (n \* k)。哈希表存储逻辑不变。


两种方法均能正确解决问题，可根据字符串长度选择：短字符串用排序法（代码更简洁），长字符串用计数法（效率更高）。


解释一下pair.second是什么意思


在 C++ 中，`pair.second` 是访问**键值对容器（如 `unordered_map`/`map`）迭代器指向的键值对中「值」部分** 的方式，我们结合之前的字母异位词代码来拆解说明：


#### 1\. 先理解 `pair` 的本质


`std::pair` 是 C++ STL 中的一个模板类，用于存储**一对关联的数据**（可以是不同类型），它有两个公有成员：


-   `first`：表示第一个元素（对应哈希表的「键」）；
-   `second`：表示第二个元素（对应哈希表的「值」）。


比如哈希表 `unordered_map> mp` 中，每一个键值对的类型是：


cpp


运行


```cpp
pair<const string, vector<string>>  // first是const string（键），second是vector<string>（值）
```


#### 2\. 结合代码看 `pair.second` 的作用


在字母异位词的代码中，这一段是核心：


```cpp
// 提取哈希表中的所有值，组成结果
vector<vector<string>> res;
for (auto& pair : mp) {
    res.push_back(pair.second);
}
```


逐行解释：


-   `for (auto& pair : mp)`：遍历哈希表 `mp` 的每一个键值对，循环变量 `pair` 就是当前的键值对（类型为 `pair>`）；
-   `pair.first`：对应哈希表的「键」（比如排序后的字符串 "aet"）；
-   `pair.second`：对应哈希表的「值」（比如存储 \["ate","eat","tea"\] 的 `vector`）；
-   `res.push_back(pair.second)`：把每个键对应的「字母异位词列表」存入结果数组，最终得到分组后的结果。


#### 3\. 举具体例子（结合示例 1）


哈希表 `mp` 在示例 1 中存储的键值对如下：


pair.first（键）

pair.second（值）

"abt"

\["bat"\]

"ant"

\["nat","tan"\]

"aet"

\["ate","eat","tea"\]


遍历 `mp` 时：


-   第一次循环：`pair.first = "abt"`，`pair.second = ["bat"]` → 把 `["bat"]` 加入结果；
-   第二次循环：`pair.first = "ant"`，`pair.second = ["nat","tan"]` → 把 `["nat","tan"]` 加入结果；
-   第三次循环：`pair.first = "aet"`，`pair.second = ["ate","eat","tea"]` → 把 `["ate","eat","tea"]` 加入结果。


#### 4\. 补充说明


-   迭代器方式的等价写法：如果不用范围 for 循环，用迭代器遍历的话，逻辑完全一致：

    cpp


    运行


    ```
    for (auto it = mp.begin(); it != mp.end(); ++it) {
        res.push_back(it->second);  // it是迭代器，it->second 等价于 (*it).second
    }
    ```


-   `auto& pair` 中的 `&`：加引用是为了避免拷贝（尤其是值是大的 `vector` 时），提升效率；如果不需要修改，也可以用 `const auto& pair`。


#### 总结


`pair.second` 的核心作用是：**获取键值对中的「值」部分**，在哈希表遍历中，这是提取「键对应的数据」的关键方式。在字母异位词的场景中，我们最终需要的是「分组后的字母异位词列表」（即哈希表的值），因此通过 `pair.second` 提取这部分数据即可。
