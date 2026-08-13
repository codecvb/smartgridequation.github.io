---
title: LeetCode128.最长连续序列C解答
slug: leetcode128-最长连续序列c解答
category: 算法与数据结构
summary: 128\. 最长连续序列
tags: 算法, C
---

[128\. 最长连续序列](https://leetcode.cn/problems/longest-consecutive-sequence/ "128. 最长连续序列")


给定一个未排序的整数数组 `nums` ，找出数字连续的最长序列（不要求序列元素在原数组中连续）的长度。


请你设计并实现时间复杂度为 `O(n)` 的算法解决此问题。


**示例 1：**


```
<strong>输入：</strong>nums = [100,4,200,1,3,2]
<strong>输出：</strong>4
<strong>解释：</strong>最长数字连续序列是 [1, 2, 3, 4]。它的长度为 4。
```


**示例 2：**


```
<strong>输入：</strong>nums = [0,3,7,2,5,8,4,6,0,1]
<strong>输出：</strong>9

<strong>示例 3：</strong>
```


```
<strong>输入：</strong>nums = [1,0,1,2]
<strong>输出：</strong>3
```


#### 解题思路


要在 O (n) 时间复杂度内解决这个问题，核心思路是利用**哈希集合**快速查找元素，避免重复计算：


1.  首先将数组所有元素存入哈希集合，实现 O (1) 时间的存在性检查；
2.  遍历每个元素，仅当当前元素是 “连续序列的起点”（即`num-1`不在集合中）时，才向后查找连续数字（`num+1`, `num+2`...），统计序列长度；
3.  记录所有连续序列的最大长度，即为答案。


这种方式确保每个元素最多被访问两次（一次遍历，一次作为连续序列的后续元素），整体时间复杂度为 O (n)。


#### C++ 代码实现


```cpp
#include <iostream>
#include <vector>
#include <unordered_set>
using namespace std;

class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        // 1. 将数组元素存入哈希集合，去重且支持O(1)查找
        unordered_set<int> numSet(nums.begin(), nums.end());
        int maxLength = 0;

        // 2. 遍历每个元素，寻找连续序列的起点
        for (int num : numSet) {
            // 仅当num是起点（num-1不存在）时，才统计连续长度
            if (numSet.find(num - 1) == numSet.end()) {
                int currentNum = num;
                int currentLength = 1;

                // 向后查找连续数字
                while (numSet.find(currentNum + 1) != numSet.end()) {
                    currentNum++;
                    currentLength++;
                }

                // 更新最大长度
                maxLength = max(maxLength, currentLength);
            }
        }

        return maxLength;
    }
};

// 测试用例
int main() {
    Solution solution;

    // 示例1
    vector<int> nums1 = {100,4,200,1,3,2};
    cout << "示例1输出：" << solution.longestConsecutive(nums1) << endl; // 预期4

    // 示例2
    vector<int> nums2 = {0,3,7,2,5,8,4,6,0,1};
    cout << "示例2输出：" << solution.longestConsecutive(nums2) << endl; // 预期9

    // 示例3
    vector<int> nums3 = {1,0,1,2};
    cout << "示例3输出：" << solution.longestConsecutive(nums3) << endl; // 预期3

    return 0;
}
```


#### 代码解释


1.  **哈希集合初始化**：`unordered_set numSet(nums.begin(), nums.end())` 将数组元素存入集合，自动去重，且`find`操作时间复杂度为 O (1)；
2.  **遍历集合找起点**：对每个元素`num`，检查`num-1`是否存在，若不存在则说明`num`是连续序列的起点；
3.  **统计连续长度**：从起点开始，循环查找`num+1`、`num+2`...，直到找不到为止，记录当前序列长度；
4.  **更新最大长度**：每次统计完一个序列后，对比并更新全局最大长度；
5.  **测试用例**：主函数中验证了题目给出的三个示例，确保代码正确性。


#### 复杂度分析


-   **时间复杂度**：O (n)。每个元素最多被访问两次（一次遍历，一次作为连续序列的后续元素），哈希集合的查找操作是 O (1)；
-   **空间复杂度**：O (n)。哈希集合需要存储所有元素，最坏情况下占用 O (n) 空间。
