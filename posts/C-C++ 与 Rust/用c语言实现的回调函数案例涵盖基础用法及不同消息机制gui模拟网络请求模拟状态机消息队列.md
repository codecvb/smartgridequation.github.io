---
title: 用C语言实现的回调函数案例涵盖基础用法及不同消息机制GUI模拟网络请求模拟状态机消息队列
slug: 用c语言实现的回调函数案例涵盖基础用法及不同消息机制gui模拟网络请求模拟状态机消息队列
category: C/C++ 与 Rust
summary: 以下是用 C 语言实现的回调函数案例，涵盖基础用法及不同消息机制（GUI 模拟、网络请求模拟、状态机、消息队列），包含详细注释和解释。
tags: C/C++, Rust, C
---

以下是用 C 语言实现的回调函数案例，涵盖基础用法及不同消息机制（GUI 模拟、网络请求模拟、状态机、消息队列），包含详细注释和解释。


#### 一、回调函数基础用法（计算器示例）


**核心思想**：将运算函数作为参数传递给主函数，实现逻辑解耦。


c


```cpp
#include <stdio.h>

// 回调函数类型定义：规定回调函数的参数和返回值
typedef int (*CalculateCallback)(int, int);

// 回调函数1：加法
int add(int a, int b) {
    return a + b;
}

// 回调函数2：减法
int subtract(int a, int b) {
    return a - b;
}

// 主函数：接收回调函数并执行
int calculate(int a, int b, CalculateCallback callback) {
    // 调用回调函数处理数据
    return callback(a, b);
}

int main() {
    // 传递不同的回调函数，实现不同运算
    printf("5 + 3 = %d\n", calculate(5, 3, add));       // 输出：8
    printf("5 - 3 = %d\n", calculate(5, 3, subtract));  // 输出：2
    return 0;
}
```


**解释**：


-   `typedef int (*CalculateCallback)(int, int)` 定义了回调函数类型，约束回调函数必须接收两个`int`参数并返回`int`。
-   `calculate`函数通过参数接收回调函数，实现了 “调用逻辑” 与 “具体运算逻辑” 的分离，后续新增乘法、除法只需添加新的回调函数，无需修改`calculate`。


#### 二、模拟 GUI 事件消息（按钮点击、文本输入）


**机制**：用户操作（如点击按钮）触发事件，回调函数响应事件。C 语言无原生 GUI 库，此处用输入模拟事件。


c


```cpp
#include <stdio.h>
#include <string.h>

// 回调函数类型：处理按钮点击（无参数）
typedef void (*ButtonCallback)();
// 回调函数类型：处理文本输入（带字符串参数）
typedef void (*TextCallback)(const char*);

// 按钮回调函数：点击后提示
void onButtonClick() {
    printf("[GUI事件] 按钮被点击了！\n");
}

// 文本输入回调函数：打印输入内容
void onTextInput(const char* text) {
    printf("[GUI事件] 输入内容：%s\n", text);
}

// 模拟GUI组件：绑定回调并触发事件
void simulateGUI() {
    ButtonCallback btnCallback = onButtonClick;
    TextCallback textCallback = onTextInput;

    // 模拟用户操作：先点击按钮，再输入文本
    printf("请输入操作（1=点击按钮，2=输入文本）：");
    int op;
    scanf("%d", &op);
    if (op == 1) {
        btnCallback();  // 触发按钮事件
    } else if (op == 2) {
        printf("请输入文本：");
        char text[100];
        scanf("%s", text);
        textCallback(text);  // 触发文本输入事件
    }
}

int main() {
    simulateGUI();
    return 0;
}
```


**解释**：


-   定义两种回调类型分别处理 “无参数事件”（按钮点击）和 “带参数事件”（文本输入）。
-   `simulateGUI`函数模拟 GUI 框架的事件绑定逻辑，用户操作通过输入触发，最终调用对应的回调函数响应。


#### 三、模拟网络请求消息（异步回调）


**机制**：网络请求耗时，通过多线程模拟异步操作，请求完成后调用回调处理响应。


c


```cpp
#include <stdio.h>
#include <pthread.h>
#include <stdlib.h>
#include <string.h>

// 网络响应结构体：模拟HTTP响应数据
typedef struct {
    int status_code;  // 状态码（200=成功，404=失败）
    char content[1024];  // 响应内容
} HttpResponse;

// 回调函数类型：处理网络响应
typedef void (*HttpCallback)(HttpResponse*);

// 回调函数：处理成功/失败的响应
void handleHttpResponse(HttpResponse* resp) {
    if (resp->status_code == 200) {
        printf("[网络响应] 成功！内容：%s\n", resp->content);
    } else {
        printf("[网络响应] 失败！状态码：%d\n", resp->status_code);
    }
    free(resp);  // 释放动态分配的响应内存
}

// 线程函数：模拟异步网络请求（内部调用回调）
void* asyncRequest(void* arg) {
    HttpCallback callback = (HttpCallback)arg;  // 获取回调函数

    // 模拟网络请求耗时（1秒）
    printf("[网络请求] 正在发送请求...\n");
    sleep(1);

    // 构造响应数据（模拟成功/失败）
    HttpResponse* resp = (HttpResponse*)malloc(sizeof(HttpResponse));
    resp->status_code = 200;  // 可改为404测试失败场景
    strcpy(resp->content, "这是服务器返回的数据");

    // 请求完成，调用回调处理结果
    callback(resp);
    return NULL;
}

// 发送异步请求的接口
void sendRequest(HttpCallback callback) {
    pthread_t tid;
    // 创建线程执行异步请求，传入回调函数作为参数
    pthread_create(&tid, NULL, asyncRequest, (void*)callback);
    pthread_detach(tid);  // 线程分离，自动释放资源
}

int main() {
    sendRequest(handleHttpResponse);
    printf("[主线程] 请求已发送，继续执行其他任务...\n");
    sleep(2);  // 等待异步任务完成（实际开发中无需主动sleep）
    return 0;
}
```


**编译运行**：需链接 pthread 库（`gcc test.c -o test -lpthread`）。


**解释**：


-   用`pthread`模拟异步网络请求，主线程调用`sendRequest`后不阻塞，继续执行其他逻辑。
-   网络请求完成后，在子线程中调用`handleHttpResponse`回调函数处理响应，实现 “请求发起” 与 “结果处理” 的异步解耦。


#### 四、设备状态机消息（状态变更回调）


**机制**：设备状态（启动、运行、故障）变更时，通过回调通知并处理对应状态。


c


```cpp
#include <stdio.h>

// 状态枚举：定义设备可能的状态
typedef enum {
    STATE_START,    // 启动
    STATE_RUNNING,  // 运行
    STATE_ERROR     // 故障
} DeviceState;

// 回调函数类型：处理不同状态（带参数）
typedef void (*StateCallback)(int param);  // param：状态参数（如速度、错误码）

// 状态回调函数：启动状态（无参数，param忽略）
void onStart(int unused) {
    printf("[设备状态] 启动中：初始化传感器...\n");
}

// 状态回调函数：运行状态（param=速度）
void onRunning(int speed) {
    printf("[设备状态] 运行中：当前速度 %d rpm\n", speed);
}

// 状态回调函数：故障状态（param=错误码）
void onError(int errorCode) {
    printf("[设备状态] 故障：错误码 %d，请检修！\n", errorCode);
}

// 设备结构体：存储状态和对应回调
typedef struct {
    StateCallback callbacks[3];  // 索引对应State枚举
} Device;

// 初始化设备：绑定状态与回调
void deviceInit(Device* dev) {
    dev->callbacks[STATE_START] = onStart;
    dev->callbacks[STATE_RUNNING] = onRunning;
    dev->callbacks[STATE_ERROR] = onError;
}

// 变更设备状态：触发对应回调
void deviceSetState(Device* dev, DeviceState state, int param) {
    if (state >= 0 && state < 3) {  // 检查状态合法性
        dev->callbacks[state](param);  // 调用对应回调并传递参数
    }
}

int main() {
    Device dev;
    deviceInit(&dev);

    // 模拟设备状态变更
    deviceSetState(&dev, STATE_START, 0);       // 启动
    deviceSetState(&dev, STATE_RUNNING, 3000);  // 运行（速度3000）
    deviceSetState(&dev, STATE_ERROR, 502);     // 故障（错误码502）
    return 0;
}
```


**解释**：


-   用枚举`DeviceState`定义设备状态，结构体`Device`存储每个状态对应的回调函数。
-   `deviceSetState`函数根据状态索引调用对应回调，实现 “状态变更” 与 “状态处理” 的分离，新增状态只需添加枚举和回调，无需修改状态机核心逻辑。


#### 五、消息队列（生产者 - 消费者模型）


**机制**：生产者生产消息放入队列，消费者线程循环取消息并通过回调处理。


c


```cpp
#include <stdio.h>
#include <pthread.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

#define QUEUE_SIZE 5  // 队列最大容量

// 消息结构体
typedef struct {
    char data[100];  // 消息内容
} Message;

// 消息队列结构体
typedef struct {
    Message queue[QUEUE_SIZE];
    int front;       // 队头索引
    int rear;        // 队尾索引
    int count;       // 当前消息数
    pthread_mutex_t mutex;  // 互斥锁（保护队列操作）
    pthread_cond_t cond;    // 条件变量（通知消费者）
} MessageQueue;

// 回调函数类型：处理消息
typedef void (*MessageCallback)(const Message*);

// 初始化消息队列
void queueInit(MessageQueue* q) {
    q->front = 0;
    q->rear = 0;
    q->count = 0;
    pthread_mutex_init(&q->mutex, NULL);
    pthread_cond_init(&q->cond, NULL);
}

// 入队操作（生产者调用）
void queuePush(MessageQueue* q, const Message* msg) {
    pthread_mutex_lock(&q->mutex);
    // 等待队列非满
    while (q->count == QUEUE_SIZE) {
        pthread_cond_wait(&q->cond, &q->mutex);
    }
    // 放入消息
    strcpy(q->queue[q->rear].data, msg->data);
    q->rear = (q->rear + 1) % QUEUE_SIZE;
    q->count++;
    pthread_cond_signal(&q->cond);  // 通知消费者
    pthread_mutex_unlock(&q->mutex);
}

// 出队操作（消费者调用）
int queuePop(MessageQueue* q, Message* msg) {
    pthread_mutex_lock(&q->mutex);
    // 等待队列非空
    while (q->count == 0) {
        pthread_cond_wait(&q->cond, &q->mutex);
    }
    // 取出消息
    strcpy(msg->data, q->queue[q->front].data);
    q->front = (q->front + 1) % QUEUE_SIZE;
    q->count--;
    pthread_cond_signal(&q->cond);  // 通知生产者
    pthread_mutex_unlock(&q->mutex);
    return 1;
}

// 消息处理回调函数
void processMessage(const Message* msg) {
    printf("[消费消息] 处理：%s（耗时1秒）\n", msg->data);
    sleep(1);  // 模拟处理耗时
}

// 消费者线程函数：循环取消息并调用回调
void* consumer(void* arg) {
    MessageQueue* q = (MessageQueue*)arg;
    Message msg;
    while (1) {
        queuePop(q, &msg);
        // 检查退出消息
        if (strcmp(msg.data, "exit") == 0) {
            printf("[消费者] 收到退出信号，停止运行\n");
            break;
        }
        processMessage(&msg);  // 调用回调处理消息
    }
    return NULL;
}

// 生产者：生成消息并放入队列
void producer(MessageQueue* q) {
    Message msgs[4] = {
        {"消息1：设备温度正常"},
        {"消息2：电压稳定"},
        {"消息3：网络连接成功"},
        {"exit"}  // 退出信号
    };
    for (int i = 0; i < 4; i++) {
        printf("[生产消息] 发送：%s\n", msgs[i].data);
        queuePush(q, &msgs[i]);
        sleep(0.5);  // 模拟间隔生产
    }
}

int main() {
    MessageQueue q;
    queueInit(&q);

    // 启动消费者线程
    pthread_t tid;
    pthread_create(&tid, NULL, consumer, &q);

    // 生产者生产消息
    producer(&q);

    // 等待消费者结束
    pthread_join(tid, NULL);

    // 清理资源
    pthread_mutex_destroy(&q->mutex);
    pthread_cond_destroy(&q->cond);
    return 0;
}
```


**编译运行**：`gcc queue.c -o queue -lpthread`


**解释**：


-   消息队列通过互斥锁（`mutex`）和条件变量（`cond`）实现线程安全，生产者和消费者异步操作。
-   消费者线程取出消息后，调用`processMessage`回调函数处理，实现 “消息生产” 与 “消息处理” 的解耦。若需更换处理逻辑，只需修改回调函数，无需修改队列或生产者代码。


#### 总结


C 语言中回调函数通过**函数指针**实现，核心价值在于：


1.  **解耦**：将 “触发逻辑” 与 “处理逻辑” 分离（如网络请求与响应处理）。
2.  **灵活性**：同一触发点可绑定不同回调，实现多样化处理（如状态机的多状态响应）。
3.  **异步支持**：结合多线程，可在异步操作（网络、IO）完成后通知结果。


不同消息机制的回调写法差异主要体现在**参数设计**（如带状态参数、带数据结构体）和**触发时机**（如事件发生、异步完成），但核心都是通过函数指针实现动态逻辑注入。
