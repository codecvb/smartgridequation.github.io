---
title: C二进制字符串与十六进制字符串相互转换
slug: c二进制字符串与十六进制字符串相互转换
category: C/C++ 与 Rust
summary: 以下是一个将二进制字符串转换为十六进制字符串的C++函数：
tags: C/C++, Rust, C
---

以下是一个将二进制字符串转换为十六进制字符串的C++函数：


```cpp
#include <string>
#include <unordered_map>

std::string binaryToHex(const std::string& binaryStr) {
    // 预定义的二进制到十六进制映射
    std::unordered_map<std::string, char> binToHex = {
        {"0000", '0'}, {"0001", '1'}, {"0010", '2'}, {"0011", '3'},
        {"0100", '4'}, {"0101", '5'}, {"0110", '6'}, {"0111", '7'},
        {"1000", '8'}, {"1001", '9'}, {"1010", 'A'}, {"1011", 'B'},
        {"1100", 'C'}, {"1101", 'D'}, {"1110", 'E'}, {"1111", 'F'}
    };

    std::string result;
    std::string paddedBinary = binaryStr;

    // 在二进制字符串前面补0，使其长度成为4的倍数
    int remainder = paddedBinary.length() % 4;
    if (remainder != 0) {
        paddedBinary = std::string(4 - remainder, '0') + paddedBinary;
    }

    // 每4位一组进行转换
    for (size_t i = 0; i < paddedBinary.length(); i += 4) {
        std::string group = paddedBinary.substr(i, 4);
        result += binToHex[group];
    }

    return result;
}
```


使用示例：


```cpp
#include <iostream>

int main() {
    std::string binary1 = "1101";           // 二进制 1101
    std::string binary2 = "101011";         // 二进制 101011
    std::string binary3 = "111100001010";   // 二进制 111100001010

    std::cout << binary1 << " -> " << binaryToHex(binary1) << std::endl;  // 输出: D
    std::cout << binary2 << " -> " << binaryToHex(binary2) << std::endl;  // 输出: 2B
    std::cout << binary3 << " -> " << binaryToHex(binary3) << std::endl;  // 输出: F0A

    return 0;
}
```


如果你想要一个更简洁的版本，也可以使用位运算的方法：


```cpp
#include <string>
#include <sstream>

std::string binaryToHexBitwise(const std::string& binaryStr) {
    // 先将二进制字符串转换为整数
    unsigned long long decimal = 0;
    for (char c : binaryStr) {
        decimal = (decimal << 1) | (c - '0');
    }

    // 再将整数转换为十六进制字符串
    std::stringstream ss;
    ss << std::hex << std::uppercase << decimal;

    return ss.str();
}
```


**注意事项：**


1.

    第一个方法使用查表法，适合处理任意长度的二进制字符串


2.

    第二个方法使用位运算，更简洁但可能受限于整数类型的最大长度


3.

    两个函数都会自动处理前导零的情况


4.

    输出使用大写字母（A-F），如果需要小写字母，可以将映射中的字母改为小写


选择哪种方法取决于你的具体需求：


-

    如果需要处理很长的二进制字符串，建议使用第一种方法


-

    如果二进制字符串长度在64位以内，第二种方法更简洁高效


以下是一个将十六进制字符串转换为二进制字符串的C++函数：


cpp


```cpp
#include <string>
#include <unordered_map>

std::string hexToBinary(const std::string& hexStr) {
    // 预定义的十六进制到二进制映射
    std::unordered_map<char, std::string> hexToBin = {
        {'0', "0000"}, {'1', "0001"}, {'2', "0010"}, {'3', "0011"},
        {'4', "0100"}, {'5', "0101"}, {'6', "0110"}, {'7', "0111"},
        {'8', "1000"}, {'9', "1001"}, {'A', "1010"}, {'B', "1011"},
        {'C', "1100"}, {'D', "1101"}, {'E', "1110"}, {'F', "1111"},
        {'a', "1010"}, {'b', "1011"}, {'c', "1100"}, {'d', "1101"},
        {'e', "1110"}, {'f', "1111"}
    };

    std::string result;

    for (char c : hexStr) {
        // 跳过空格等无关字符
        if (c == ' ' || c == '\t' || c == '\n') {
            continue;
        }

        // 检查是否为有效的十六进制字符
        if (hexToBin.find(c) != hexToBin.end()) {
            result += hexToBin[c];
        } else {
            // 如果遇到无效字符，可以抛出异常或返回空字符串
            throw std::invalid_argument("Invalid hexadecimal character: " + std::string(1, c));
            // 或者返回空字符串：return "";
        }
    }

    // 移除前导零（可选）
    size_t firstOne = result.find_first_not_of('0');
    if (firstOne != std::string::npos) {
        result = result.substr(firstOne);
    } else {
        // 如果全是零，返回"0"
        result = "0";
    }

    return result;
}
```


使用示例：


cpp


```cpp
#include <iostream>
#include <stdexcept>

int main() {
    try {
        std::string hex1 = "D";      // 十六进制 D
        std::string hex2 = "2B";     // 十六进制 2B
        std::string hex3 = "F0A";    // 十六进制 F0A
        std::string hex4 = "1F";     // 十六进制 1F

        std::cout << hex1 << " -> " << hexToBinary(hex1) << std::endl;  // 输出: 1101
        std::cout << hex2 << " -> " << hexToBinary(hex2) << std::endl;  // 输出: 101011
        std::cout << hex3 << " -> " << hexToBinary(hex3) << std::endl;  // 输出: 111100001010
        std::cout << hex4 << " -> " << hexToBinary(hex4) << std::endl;  // 输出: 11111

        // 测试小写字母
        std::cout << "a" << " -> " << hexToBinary("a") << std::endl;    // 输出: 1010

    } catch (const std::exception& e) {
        std::cout << "Error: " << e.what() << std::endl;
    }

    return 0;
}
```


如果你想要一个不使用异常处理的版本：


cpp


```cpp
#include <string>
#include <unordered_map>

std::string hexToBinarySafe(const std::string& hexStr) {
    std::unordered_map<char, std::string> hexToBin = {
        {'0', "0000"}, {'1', "0001"}, {'2', "0010"}, {'3', "0011"},
        {'4', "0100"}, {'5', "0101"}, {'6', "0110"}, {'7', "0111"},
        {'8', "1000"}, {'9', "1001"}, {'A', "1010"}, {'B', "1011"},
        {'C', "1100"}, {'D', "1101"}, {'E', "1110"}, {'F', "1111"},
        {'a', "1010"}, {'b', "1011"}, {'c', "1100"}, {'d', "1101"},
        {'e', "1110"}, {'f', "1111"}
    };

    std::string result;

    for (char c : hexStr) {
        if (c == ' ' || c == '\t' || c == '\n') {
            continue;
        }

        auto it = hexToBin.find(c);
        if (it != hexToBin.end()) {
            result += it->second;
        } else {
            // 遇到无效字符时返回空字符串
            return "";
        }
    }

    // 处理全零的情况
    if (result.empty()) {
        return "0";
    }

    // 移除前导零
    size_t firstOne = result.find_first_not_of('0');
    if (firstOne != std::string::npos) {
        result = result.substr(firstOne);
    } else {
        result = "0";
    }

    return result;
}
```


**函数特点：**


1.

    **大小写支持**：同时支持大写和小写十六进制字符


2.

    **空格处理**：自动跳过空格、制表符和换行符


3.

    **错误处理**：提供异常处理和安全返回两种方式


4.

    **前导零处理**：可选是否移除前导零


5.

    **完整性**：每个十六进制字符转换为4位二进制


**注意事项：**


-

    如果需要保留前导零，可以注释掉移除前导零的代码部分


-

    可以根据需要调整错误处理策略（抛出异常或返回特定值）


-

    函数会验证输入的有效性，确保只处理合法的十六进制字符
