---
title: 使用androidstudio写一个Android的远程通信软件APP有通讯的发送和接收消息界面
slug: 使用androidstudio写一个android的远程通信软件app有通讯的发送和接收消息界面
category: 嵌入式与硬件
summary: 以下是使用 Android Studio 基于 Java 语言编写一个简单的 Android APP 实现远程通信（这里以 TCP 通信为例）的代码示例，包含基本的通信界面以及发送和接收消息功能。
tags: 嵌入式, 物联网, Android
---

以下是使用 Android Studio 基于 Java 语言编写一个简单的 Android APP 实现远程通信（这里以 TCP 通信为例）的代码示例，包含基本的通信界面以及发送和接收消息功能。


#### 1\. 创建项目


打开 Android Studio，新建一个 Empty Activity 的 Android 项目，填写好项目相关信息后等待项目构建完成。


#### 2\. 设计界面布局（activity\_main.xml）


在`res/layout`目录下的`activity_main.xml`文件中，设计如下简单布局，包含一个用于输入消息的编辑文本框、发送按钮以及一个用于显示接收消息的文本视图：


```XML
<?xml version="1.0" encoding="utf-8"?>

<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="16dp">

    <EditText
        android:id="@+id/editTextMessage"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:padding="16dp"
        android:layout_marginTop="16dp"
        android:layout_marginLeft="0dp"
        android:hint="输入要发送的消息" />

    <TextView
        android:id="@+id/textViewReceivedMessages"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="64dp"
        android:layout_marginLeft="0dp"
        android:text="接收的消息：" />

    <Button
        android:id="@+id/buttonSend"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="100dp"
        android:layout_marginLeft="128dp"
        android:text="发送" />

</LinearLayout>
```


#### 3\. 编写远程通信及逻辑代码（MainActivity.java）


在`MainActivity.java`文件中，添加以下代码来实现 TCP 通信以及相关的界面交互逻辑：


java


```java
package com.example.myapplication;

import android.os.Bundle;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import androidx.appcompat.app.AppCompatActivity;
import java.io.FileOutputStream;
import java.io.OutputStream;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.Socket;

public class MainActivity extends AppCompatActivity {

    private EditText editTextMessage;
    private TextView textViewReceivedMessages;
    private Socket socket;
    private BufferedReader reader;
    private BufferedWriter writer;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        EdgeToEdge.enable(this);

        setContentView(R.layout.activity_main);

        editTextMessage = findViewById(R.id.editTextMessage);
        Button buttonSend = findViewById(R.id.buttonSend);
        textViewReceivedMessages = findViewById(R.id.textViewReceivedMessages);

        // 尝试连接服务器，这里假设服务器IP是192.168.0.100，端口是8888，根据实际情况修改
        new Thread(() -> {
            try {
                socket = new Socket("192.168.1.6", 8888);
                reader = new BufferedReader(new InputStreamReader(socket.getInputStream()));
                writer = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream()));
                // 开启线程接收服务器消息
                receiveMessages();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }).start();

        buttonSend.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String message = editTextMessage.getText().toString().trim();
                if (!message.isEmpty()) {
                    new Thread(() -> {
                        try {
                            writer.write(message + "\n");
                            writer.flush();
                        } catch (IOException e) {
                            e.printStackTrace();
                        }
                    }).start();
                }
            }
        });
    }

    private void receiveMessages() {
        try {
            while (true) {
                String receivedMessage = reader.readLine();
                if (receivedMessage!= null) {
                    runOnUiThread(() -> {
                        textViewReceivedMessages.append("\n" + receivedMessage);
                    });
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        try {
            if (socket!= null) {
                socket.close();
            }
            if (reader!= null) {
                reader.close();
            }
            if (writer!= null) {
                writer.close();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```


代码解释如下：


-   在`onCreate`方法中：
    -   首先通过`findViewById`方法找到界面布局中的各个控件。
    -   然后开启一个新线程去尝试连接远程服务器（IP 和端口按需修改），成功连接后获取输入输出流，并开启`receiveMessages`方法所在的线程用于接收服务器发来的消息。
    -   给发送按钮设置点击监听器，当点击按钮时，获取编辑文本框中的消息内容，若不为空则开启新线程将消息发送给服务器（注意要按协议添加换行符等规范格式，这里简单用`\n`分隔消息）。
-   `receiveMessages`方法：在一个循环中不断读取服务器发送过来的消息，每读取到一条消息，通过`runOnUiThread`方法将消息更新显示到界面的文本视图上（因为 Android 中涉及 UI 更新操作要在主线程执行）。
-   `onDestroy`方法：在 Activity 销毁时，关闭相关的套接字、输入输出流等资源，防止资源泄漏。


#### 4\. 添加网络权限


在`AndroidManifest.xml`文件中，添加网络访问权限，确保 APP 可以进行网络通信：


xml


```XML
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.remotecommunicationapp">

    <uses-permission android:name="android.permission.INTERNET" />

    <application
       ...
    </application>

</manifest>
```


请注意：


1.  上述代码中服务器的 IP 地址和端口号（示例中为`192.168.0.100`和`8888`）要根据实际部署运行的服务器情况进行修改。
2.  这只是一个简单的示例实现，实际应用中可以根据需求扩展功能，比如添加更多的界面交互、错误处理机制、加密通信等。还可以考虑使用更高级的网络通信框架来简化开发流程以及增强稳定性等。


运行这个 Android APP 后，在界面输入消息点击发送，就能将消息发送给对应的服务器，同时可以接收服务器返回的消息并显示在界面上。


界面


![](/uploads/csdn/使用androidstudio写一个android的远程通信软件app有通讯的发送和接收消息界面/img-01.png)


这里还需要要一个电脑做服务器，接受和发送消息


python


```python
import socket

# 创建套接字对象
server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# 绑定IP地址和端口
server_address = ('192.168.1.6', 8888)
server_socket.bind(server_address)

# 监听连接
server_socket.listen(5)

print('Server is listening on {}:{}'.format(*server_address))

while True:
    # 接受客户端连接
    client_socket, client_address = server_socket.accept()
    print('Connected by', client_address)

    try:
        while True:
            # 接收客户端发送的数据
            data = client_socket.recv(1024)
            if data:
                print('Received data:', data.decode('utf-8'))
                # 发送响应数据给客户端，这里简单回复一个确认消息
                #client_socket.sendall('Message received successfully!'.encode('utf-8'))
                server_socket.sendall('Message received successfully!'.encode('utf-8'))
            else:
                break
    finally:
        # 关闭客户端连接套接字
        client_socket.close()
```


最终结果,我现在只能单向发送，一旦回复消息，就必然抛出异常。如有方法改正，还请指出！谢谢！


![](/uploads/csdn/使用androidstudio写一个android的远程通信软件app有通讯的发送和接收消息界面/img-02.png)
