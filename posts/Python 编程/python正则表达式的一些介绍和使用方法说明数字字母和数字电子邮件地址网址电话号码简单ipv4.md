---
title: Python正则表达式的一些介绍和使用方法说明数字字母和数字电子邮件地址网址电话号码简单IPv4
slug: python正则表达式的一些介绍和使用方法说明数字字母和数字电子邮件地址网址电话号码简单ipv4
category: Python 编程
summary: \## 正则表达式的概念和用途
tags: Python
---

##
\## 正则表达式的概念和用途


正则表达式（Regular Expression，简称Regex）是对字符串操作的一种逻辑公式，由一些事先定义好的特定字符以及这些特定字符的组合所构成。这些特定字符及其组合被用来描述在搜索文本时要匹配的一个或多个字符串。正则表达式的用途非常广泛，包括但不限于：


‌


```TypeScript
匹配和查找文本‌：快速匹配和查找特定模式的文本，如查找包含特定单词的句子、匹配邮箱、电话等。
‌数据清洗和处理‌：去除特定字符或标签、提取文本中的有效信息等。
‌表单验证‌：验证用户输入的表单数据，如验证邮箱地址是否合法。
‌字符串替换‌：将文本中的某个模式替换为另一个字符串。
‌提取信息‌：提取特定的信息，例如提取网页中的链接、日志中的关键信息等。
```


##
Python中正则表达式的基本语法


Python中正则表达式的处理主要通过re模块来实现。re模块提供了一系列函数来执行正则表达式的匹配、查找、替换等操作。基本语法示例


###
匹配字符串


python


```python
import re

# 使用match函数从字符串起始位置匹配
match_obj = re.match(r'hello', 'hello world')
if match_obj:
    print("Match found:", match_obj.group())
else:
    print("No match")

# 注意：match函数仅从字符串起始位置开始匹配
match_obj = re.match(r'world', 'hello world')
if not match_obj:
    print("No match from start")
```


### 搜索字符串


python


```python
# 使用search函数在字符串中搜索第一个匹配项
search_obj = re.search(r'world', 'hello world')
if search_obj:
    print("Search found:", search_obj.group())
else:
    print("No search found")
```


```php
常见特殊字符的含义
.：匹配除换行符以外的任意字符。
^：匹配字符串的开始。
$：匹配字符串的结束。
*：匹配前面的子表达式零次或多次。
+：匹配前面的子表达式一次或多次。
?：匹配前面的子表达式零次或一次。
{n}：n 是一个非负整数。匹配确定的 n 次。
{n,}：n 是一个非负整数。至少匹配n 次。
{n,m}：m 和 n 均为非负整数，其中n <= m。最少匹配 n 次且最多匹配 m 次。
[xyz]：字符集合。匹配所包含的任意一个字符。
[^xyz]：负值字符集合。匹配未包含的任意字符。
\d：匹配一个数字字符。等价于 [0-9]。
\D：匹配一个非数字字符。等价于 [^0-9]。
\s：匹配任何空白字符，包括空格、制表符、换页符等。
\S：匹配任何非空白字符。
\w：匹配包括下划线的任何单词字符。等价于[A-Za-z0-9_]。
\W：匹配任何非单词字符。等价于 [^A-Za-z0-9_]。
```


###
Python正则表达式库（re库）的高级功能和用法


####
编译正则表达式


为了提高匹配效率，特别是当需要多次使用同一个正则表达式时，可以使用re.compile()函数对正则表达式进行编译，并返回一个模式（Pattern）对象。


python


```python
pattern = re.compile(r'\bfoo\b')
match = pattern.match('foo bar')
if match:
    print("Match:", match.group())findall 和 finditer
```


```python
findall(pattern, string, flags=0)：在字符串中找到正则表达式所匹配的所有子串，并返回一个列表。
finditer(pattern, string, flags=0)：和findall类似，但返回的是一个迭代器，每个迭代元素是Match对象。
```


python


```python
# 使用findall
print(re.findall(r'\bfoo\b', 'foo bar foo baz'))  # 输出: ['foo', 'foo']

# 使用finditer
for match in re.finditer(r'\bfoo\b', 'foo bar foo baz'):
    print(match.group())  # 输出: foo foo
```


#### 分组和命名分组


正则表达式的圆括号可以实现分组功能，还可以通过?P语法给分组命名。


python


```python
# 分组
match = re.match(r'(\w+) (\w+)', 'Isaac Newton')
if match:
    print(match.group(1))  # Isaac
    print(match.group(2))  # Newton

# 命名分组
match = re.match(r'(?P<first_name>\w+) (?P<last_name>\w+)', 'Isaac Newton')
if match:
    print(match.group('first_name'))  # Isaac
    print(match.group('last_name'))   # Newton
```


#### 贪婪模式与非贪婪模式


在正则表达式中，默认是贪婪模式，即尽可能多地匹配字符。通过在量词后面加上?可以使其变为非贪婪模式，即尽可能少地匹配字符。


python


```python
# 贪婪模式
print(re.match(r'a(.*)c', 'abcabc').group(1))  # abcabc

# 非贪婪模式
print(re.match(r'a(.*?)c', 'abcabc').group(1))  # abc

分割和替换
split(pattern, string, maxsplit=0, flags=0)：根据正则表达式的匹配项来分割字符串。
sub(pattern, repl, string, count=0, flags=0)：用指定的内容替换掉与正则表达式匹配的内容。
python
Copy Code
# 分割
print(re.split(r'\s+', 'one two   three   four'))  # ['one', 'two', 'three', 'four']

# 替换
print(re.sub(r'\s+', '-', 'one two   three   four'))  # one-two-three-four
```


以上就是Python中正则表达式的基本概念、基本语法、高级功能以及示例代码。希望这能帮助你更好地理解和使用Python中的正则表达式。


##
创建一个只匹配电子邮箱地址的正则表达式


在Python中使用它，你可以使用re模块。以下是一个示例代码，它定义了一个正则表达式来匹配电子邮箱地址，并使用该正则表达式来验证输入字符串是否为有效的电子邮箱地址。


python


```python
import re

# 定义匹配电子邮箱地址的正则表达式
email_regex = re.compile(
    r"(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)"
)

def is_valid_email(email):
    """
    检查给定的字符串是否为有效的电子邮箱地址。

    参数:
    email (str): 要检查的电子邮箱地址。

    返回:
    bool: 如果字符串是有效的电子邮箱地址，则返回True；否则返回False。
    """
    return bool(email_regex.match(email))

# 测试示例
test_emails = [
    "example@example.com",
    "user.name@domain.co.in",
    "user-name@domain.org",
    "user_name@domain.com",
    "username@domain",
    "@nousername.com",
    "username@.com",
    "username@domain..com",
]

for email in test_emails:
    print(f"{email}: {is_valid_email(email)}")
```


解释‌


```cs
正则表达式‌:

^[a-zA-Z0-9_.+-]+: 匹配电子邮箱地址的开始部分（用户名），可以包含字母、数字、下划线、点、加号或减号。
@[a-zA-Z0-9-]+: 匹配@符号后面的域名部分，可以包含字母、数字或短横线。
\.[a-zA-Z0-9-.]+$: 匹配域名后面的顶级域名（TLD），可以包含字母、数字、点或短横线，并以字符串的结尾结束。

‌is_valid_email函数‌:

使用email_regex.match(email)来检查给定的电子邮箱地址是否与正则表达式匹配。
bool()函数将匹配结果转换为布尔值（True或False）。

‌测试示例‌:

列出了一些测试电子邮箱地址，并打印每个地址是否为有效的电子邮箱地址。

运行上述代码，你将看到每个测试电子邮箱地址的验证结果。
```


##
创建一个只匹配所有常用正则表达式的正则表达式


首先需要明确什么是“常用正则表达式”。由于正则表达式的功能非常广泛，不同的场景会使用不同的模式。以下是一些常见的正则表达式模式，你可以根据需求组合和扩展这些模式：


```cs
数字：\d+
字母：[a-zA-Z]+
字母和数字：[a-zA-Z\d]+
电子邮件地址：[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}
网址：https?://(?:www\.)?[a-zA-Z0-9./?=_-]+
电话号码（简单）：[0-9]{3}-[0-9]{2}-[0-9]{4} 或 \d{10}
IPv4 地址：(?:\d{1,3}\.){3}\d{1,3}
邮政编码（例如美国）：\d{5}(?:-\d{4})?
```


由于一个正则表达式无法直接匹配另一个正则表达式（正则表达式的嵌套匹配非常复杂且通常不可行），你可以创建一个包含多个常用模式的正则表达式，并使用逻辑“或”运算符（|）将它们组合在一起。


以下是一个示例代码，展示如何组合这些常用模式：


python


```python
import re

# 定义常用正则表达式模式
patterns = [
    r'\d+',                          # 数字
    r'[a-zA-Z]+',                    # 字母
    r'[a-zA-Z\d]+',                  # 字母和数字
    r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}',  # 电子邮件地址
    r'https?://(?:www\.)?[a-zA-Z0-9./?=_-]+',  # 网址
    r'[0-9]{3}-[0-9]{2}-[0-9]{4}|\d{10}',  # 电话号码
    r'(?:\d{1,3}\.){3}\d{1,3}',        # IPv4 地址
    r'\d{5}(?:-\d{4})?'               # 邮政编码
]

# 使用逻辑“或”运算符组合所有模式
combined_pattern = '|'.join(f'(?P<pattern_{i}>{p})' for i, p in enumerate(patterns))

# 编译组合后的正则表达式
regex = re.compile(combined_pattern)

# 测试字符串
test_strings = [
    "12345",
    "hello",
    "hello123",
    "example@example.com",
    "https://www.example.com",
    "123-45-6789",
    "192.168.1.1",
    "12345-6789"
]

# 匹配测试字符串
for test in test_strings:
    matches = regex.finditer(test)
    for match in matches:
        for key, value in match.groupdict().items():
            if value:
                print(f"Matched {value} with pattern {key}")
```


以上代码不能够逐个匹配，换成以下代码就可以输出结果：


```python
import re

# 定义常用正则表达式模式
patterns = [
    r'\d+',                          # 数字
    r'[a-zA-Z]+',                    # 字母
    r'[a-zA-Z\d]+',                  # 字母和数字
    r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}',  # 电子邮件地址
    r'https?://(?:www\.)?[a-zA-Z0-9./?=_-]+',  # 网址
    r'[0-9]{3}-[0-9]{2}-[0-9]{4}|\d{10}',  # 电话号码
    r'(?:\d{1,3}\.){3}\d{1,3}',        # IPv4 地址
    r'\d{5}(?:-\d{4})?'               # 邮政编码
]

# 使用逻辑“或”运算符组合所有模式
combined_pattern = '|'.join(f'(?P<pattern_{i}>{p})' for i, p in enumerate(patterns))

# 编译组合后的正则表达式
regex = re.compile(combined_pattern)

# 测试字符串
test_strings = [
    "12345",
    "hello",
    "hello123",
    "example@example.com",
    "https://www.example.com",
    "123-45-6789",
    "192.168.1.1",
    "12345-6789"
]

# 匹配测试字符串
for test in test_strings:
    #matches = regex.finditer(test)
    for pattern in patterns:
        regex = re.compile(pattern)
        match_t = regex.match(test)
        print(match_t)
    #for match in matches:
        #for key, value in match.groupdict().items():
            #if value:
                #print(f"Matched {value} with pattern {key}")
```


结果如下;


![](/uploads/csdn/python正则表达式的一些介绍和使用方法说明数字字母和数字电子邮件地址网址电话号码简单ipv4/img-01.png)
在这个示例中，每个模式都被赋予了一个命名捕获组（通过 (?P...) 语法），这样你就可以在匹配结果中区分出是由哪个模式匹配到的。


请注意，这只是一个示例，并且根据你的具体需求，你可能需要添加或修改这些模式。


## 欢迎交流，有问题就留言！
