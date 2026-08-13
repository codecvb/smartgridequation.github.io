---
title: 修复代码漏洞的具体案例C HTML PHP SQL JavaScript
slug: 修复代码漏洞的具体案例c-html-php-sql-javascript
category: C/C++ 与 Rust
summary: 以下是一些修复代码漏洞的具体案例：
tags: C/C++, Rust, C
---

以下是一些修复代码漏洞的具体案例：


## **案例一：SQL 注入漏洞修复（Web 应用程序）**


1.  **漏洞描述**
    -   假设一个简单的用户登录功能的 PHP 代码存在 SQL 注入漏洞。代码可能类似于以下部分：


php


```php
   $username = $_POST['username'];
   $password = $_POST['password'];
   $query = "SELECT * FROM users WHERE username = '$username' AND password = '$password'";
   $result = mysqli_query($conn, $query);
```


-   攻击者可以通过在用户名或密码输入框中输入恶意的 SQL 语句，如`' OR '1'='1`作为用户名，来绕过登录验证，因为最终生成的 SQL 查询会变成`SELECT * FROM users WHERE username = '' OR '1'='1' AND password = '$password'`，这样就可以获取未经授权的访问权限。


1.  **修复过程**
    -   **使用预处理语句**：
        -   改写后的代码如下：


php


```php
     $username = $_POST['username'];
     $password = $_POST['password'];
     $stmt = $conn->prepare("SELECT * FROM users WHERE username =? AND password =?");
     $stmt->bind_param("ss", $username, $password);
     $stmt->execute();
     $result = $stmt->get_result();
```


-   这里使用了`mysqli`的预处理语句。`prepare`函数创建一个预处理语句对象，`bind_param`函数将用户输入的变量绑定到 SQL 语句中的参数位置，并且指定参数类型（这里的`ss`表示两个字符串参数）。这样，用户输入的数据就会被当作普通的字符串处理，而不是 SQL 代码的一部分，从而有效地防止了 SQL 注入攻击。


## **案例二：跨站脚本攻击（XSS）漏洞修复（JavaScript 代码）**


1.  **漏洞描述**
    -   考虑一个简单的网页，它会显示用户评论。原始的 JavaScript 代码可能如下：


html


```html
   <div id="comments"></div>
   <script>
     const comment = getCommentFromServer(); // 从服务器获取评论内容
     document.getElementById('comments').innerHTML = comment;
   </script>
```


-   如果攻击者提交包含恶意 JavaScript 代码的评论，如`alert('XSS');`，那么当这段评论被显示在页面上时，浏览器会执行这个恶意脚本，可能导致信息泄露、用户会话劫持等安全问题。


1.  **修复过程**
    -   **对用户输入进行编码**：
        -   一种修复方法是使用合适的编码函数来处理用户输入的评论内容。在 JavaScript 中，可以使用`textContent`属性来设置文本内容，而不是`innerHTML`，或者对内容进行 HTML 实体编码。例如：


html


```html
     <div id="comments"></div>
     <script>
       const comment = getCommentFromServer();
       const escapedComment = escapeHTML(comment); // 自定义的HTML实体编码函数
       document.getElementById('comments').textContent = escapedComment;
     </script>
```


-   自定义的`escapeHTML`函数可以将特殊字符（如`<`、`>`、`&`等）转换为对应的 HTML 实体，例如将`<`转换为`<`，这样浏览器就会将其当作普通文本显示，而不会执行其中的脚本。


## **案例三：缓冲区溢出漏洞修复（C/C++ 代码）**


1.  **漏洞描述**
    -   以下是一个简单的 C 语言代码示例，存在缓冲区溢出漏洞：


c


```cpp
   #include <stdio.h>
   #include <string.h>
   int main() {
       char buffer[10];
       char input[100];
       scanf("%s", input);
       strcpy(buffer, input);
       printf("%s", buffer);
       return 0;
   }
```


-   如果用户输入的字符串长度超过`buffer`的大小（10 个字节），就会发生缓冲区溢出。这可能导致程序崩溃，或者更严重的是，攻击者可以利用这个漏洞来修改程序的其他内存区域，执行恶意代码。


1.  **修复过程**
    -   **使用安全的字符串处理函数**：
        -   可以将`strcpy`函数替换为`strncpy`函数，修改后的代码如下：


展开过程


-   `strncpy`函数会限制复制的字符数量，最多复制`sizeof(buffer)-1`个字符，以确保不会超出`buffer`的范围。并且在最后手动添加字符串结束符`\0`，以保证`buffer`始终是一个有效的字符串。这样就可以避免缓冲区溢出漏洞。


## 修复C++代码漏洞并执行恶意代码的具体案例


以下是一个关于修复 C++ 代码漏洞以及该漏洞可能被利用执行恶意代码的具体案例示例，请注意，此仅用于演示安全问题及修复，绝不可用于非法用途：


#### 案例背景


假设有如下一个简单的 C++ 程序，用于处理用户输入的用户名，并根据用户名来进行一些后续操作（比如验证登录等，这里简化示意），代码原本如下：


cpp


```cpp
#include <iostream>
#include <cstring>

class User {
private:
    char username[10];
public:
    void setUsername(const char* input) {
        // 直接将输入复制到 username 数组，这里存在漏洞
        strcpy(username, input);
    }

    void printUsername() {
        std::cout << "Username: " << username << std::endl;
    }
};

int main() {
    User user;
    char userInput[100];
    std::cout << "Please enter your username: ";
    std::cin >> userInput;
    user.setUsername(userInput);
    user.printUsername();
    return 0;
}
```


#### 漏洞描述


上述代码中，在 `User` 类的 `setUsername` 方法里使用了 `strcpy` 函数将外部输入的字符串直接复制到固定长度为 `10` 字节的 `username` 数组中。如果用户输入的字符串长度超过了 `10` 个字符，就会发生缓冲区溢出。


例如，攻击者可以精心构造一个超长的输入字符串，这个字符串除了填满 `username` 数组的空间外，还能覆盖内存中相邻的数据，比如函数的返回地址等关键信息。假如攻击者知道程序的内存布局，就可以通过覆盖返回地址，让程序在函数返回时跳转到攻击者指定的恶意代码所在的内存位置，从而执行恶意代码。


比如，攻击者构造的输入类似如下（这里只是简单示意，实际利用会更复杂且依赖具体环境）：


`"AAAAAAAABBBBBBBBCCCCCCCCDDDDDDDD" + 恶意代码的内存地址（假设为十六进制表示的地址，比如 0x401000 等）`


#### 修复过程


为了修复这个缓冲区溢出漏洞，我们可以使用更安全的字符串处理函数，比如 `strncpy` ，并且要确保正确处理字符串结尾的 `'\0'` 字符，修改后的代码如下：


cpp


```cpp
#include <iostream>
#include <cstring>

class User {
private:
    char username[10];
public:
    void setUsername(const char* input) {
        // 使用 strncpy 限制复制的字符数量，并确保结尾添加 '\0'
        strncpy(username, input, sizeof(username) - 1);
        username[sizeof(username) - 1] = '\0';
    }

    void printUsername() {
        std::cout << "Username: " << username << std::endl;
    }
};

int main() {
    User user;
    char userInput[100];
    std::cout << "Please enter your username: ";
    std::cin >> userInput;
    user.setUsername(userInput);
    user.printUsername();
    return 0;
}
```


在修改后的 `setUsername` 方法中，`strncpy` 函数只会复制最多 `sizeof(username) - 1` 个字符（也就是 `9` 个字符），这样就可以避免写入超出 `username` 数组范围的数据，然后手动将最后一个字节设置为 `'\0'` ，保证 `username` 始终是一个合法的、以 `'\0'` 结尾的字符串，从而消除了缓冲区溢出的漏洞，也就阻断了攻击者利用该漏洞执行恶意代码的途径。


再次强调，以上只是从安全角度进行的原理性示例讲解，在实际中，软件的安全保障需要综合考虑众多因素，并且利用代码漏洞执行恶意代码是非法和违背道德伦理的行为，安全工作者们致力于不断发现并修复这些漏洞来保障系统的安全稳定运行。
