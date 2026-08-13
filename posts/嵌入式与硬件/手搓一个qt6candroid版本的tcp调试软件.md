---
title: 手搓一个QT6CANDROID版本的TCP调试软件
slug: 手搓一个qt6candroid版本的tcp调试软件
category: 嵌入式与硬件
summary: 文章摘要： 这是一个基于Qt框架开发的TCP调试工具程序，包含MainWindow类和TCP通信功能。
tags: 嵌入式, 物联网, QT6
---

文章摘要： 这是一个基于Qt框架开发的TCP调试工具程序，包含MainWindow类和TCP通信功能。


程序实现了TCP客户端功能，支持连接/断开服务器、发送/接收数据，并显示通信状态和消息日志。


关键功能包括：


通过QTcpSocket建立TCP连接、处理连接状态变化、数据收发、错误处理以及界面状态更新。


接收和发送的消息会附带时间戳并以不同颜色区分显示。


程序默认使用127.0.0.1:8080作为连接地址，并包含输入验证功能。


效果如下


![](/uploads/csdn/手搓一个qt6candroid版本的tcp调试软件/img-01.png)


mainwindow.h


```cpp
#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <QTcpSocket>
#include <QHostAddress>
#include <QTimer>
#include <QDateTime>

QT_BEGIN_NAMESPACE
namespace Ui { class MainWindow; }
QT_END_NAMESPACE

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    MainWindow(QWidget *parent = nullptr);
    ~MainWindow();

private slots:
    void on_connectButton_clicked();
    void on_sendButton_clicked();
    void on_clearButton_clicked();
    void on_disconnectButton_clicked();

    void onConnected();
    void onDisconnected();
    void onReadyRead();
    void onErrorOccurred(QAbstractSocket::SocketError socketError);

private:
    Ui::MainWindow *ui;
    QTcpSocket *tcpSocket;
    bool isConnected;

    void updateConnectionStatus();
    void appendMessage(const QString &message, bool isReceived = true);
};
#endif // MAINWINDOW_H
```


mainwindow.cpp


```cpp
#include "mainwindow.h"
#include "ui_mainwindow.h"
#include <QMessageBox>
#include <QHostAddress>

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
    , ui(new Ui::MainWindow)
    , tcpSocket(nullptr)
    , isConnected(false)
{
    ui->setupUi(this);
    setWindowTitle("TCP调试工具");

    // 初始化UI状态
    ui->disconnectButton->setEnabled(false);
    ui->sendButton->setEnabled(false);

    // 设置默认值
    ui->ipEdit->setText("127.0.0.1");
    ui->portEdit->setText("8080");

    // 创建TCP socket
    tcpSocket = new QTcpSocket(this);

    // 连接信号槽
    connect(tcpSocket, &QTcpSocket::connected, this, &MainWindow::onConnected);
    connect(tcpSocket, &QTcpSocket::disconnected, this, &MainWindow::onDisconnected);
    connect(tcpSocket, &QTcpSocket::readyRead, this, &MainWindow::onReadyRead);
    connect(tcpSocket, &QTcpSocket::errorOccurred, this, &MainWindow::onErrorOccurred);
}

MainWindow::~MainWindow()
{
    if (tcpSocket && tcpSocket->state() == QAbstractSocket::ConnectedState) {
        tcpSocket->disconnectFromHost();
    }
    delete ui;
}

void MainWindow::on_connectButton_clicked()
{
    if (isConnected) {
        return;
    }

    QString ip = ui->ipEdit->text();
    QString portStr = ui->portEdit->text();

    if (ip.isEmpty() || portStr.isEmpty()) {
        QMessageBox::warning(this, "警告", "请输入IP地址和端口号");
        return;
    }

    bool ok;
    quint16 port = portStr.toUInt(&ok);
    if (!ok || port <= 0 || port > 65535) {
        QMessageBox::warning(this, "警告", "请输入有效的端口号(1-65535)");
        return;
    }

    // 连接到服务器
    tcpSocket->connectToHost(QHostAddress(ip), port);
    appendMessage("正在连接到 " + ip + ":" + portStr + "...");
}

void MainWindow::on_sendButton_clicked()
{
    if (!isConnected) {
        return;
    }

    QString message = ui->sendEdit->text();
    if (message.isEmpty()) {
        return;
    }

    // 发送数据
    qint64 bytesSent = tcpSocket->write(message.toUtf8());
    if (bytesSent != -1) {
        appendMessage("发送: " + message, false);
        ui->sendEdit->clear();
    } else {
        appendMessage("发送失败: " + tcpSocket->errorString());
    }
}

void MainWindow::on_clearButton_clicked()
{
    ui->receiveText->clear();
}

void MainWindow::on_disconnectButton_clicked()
{
    if (isConnected) {
        tcpSocket->disconnectFromHost();
    }
}

void MainWindow::onConnected()
{
    isConnected = true;
    updateConnectionStatus();
    appendMessage("已连接到 " + tcpSocket->peerAddress().toString() +
                 ":" + QString::number(tcpSocket->peerPort()));
}

void MainWindow::onDisconnected()
{
    isConnected = false;
    updateConnectionStatus();
    appendMessage("已断开连接");
}

void MainWindow::onReadyRead()
{
    QByteArray data = tcpSocket->readAll();
    appendMessage("接收: " + QString::fromUtf8(data));
}

void MainWindow::onErrorOccurred(QAbstractSocket::SocketError socketError)
{
    Q_UNUSED(socketError);
    appendMessage("错误: " + tcpSocket->errorString());
    isConnected = false;
    updateConnectionStatus();
}

void MainWindow::updateConnectionStatus()
{
    if (isConnected) {
        ui->statusLabel->setText("状态: 已连接到 " +
                               tcpSocket->peerAddress().toString() +
                               ":" + QString::number(tcpSocket->peerPort()));
        ui->connectButton->setEnabled(false);
        ui->disconnectButton->setEnabled(true);
        ui->sendButton->setEnabled(true);
        ui->ipEdit->setEnabled(false);
        ui->portEdit->setEnabled(false);
    } else {
        ui->statusLabel->setText("状态: 未连接");
        ui->connectButton->setEnabled(true);
        ui->disconnectButton->setEnabled(false);
        ui->sendButton->setEnabled(false);
        ui->ipEdit->setEnabled(true);
        ui->portEdit->setEnabled(true);
    }
}

void MainWindow::appendMessage(const QString &message, bool isReceived)
{
    QString timeStr = QDateTime::currentDateTime().toString("HH:mm:ss");
    QString logMessage = "[" + timeStr + "] " + message + "\n";

    // 保存当前光标位置
    QTextCursor cursor = ui->receiveText->textCursor();
    bool atEnd = cursor.atEnd();

    // 添加文本
    if (isReceived) {
        ui->receiveText->setTextColor(Qt::blue);
    } else {
        ui->receiveText->setTextColor(Qt::darkGreen);
    }
    ui->receiveText->insertPlainText(logMessage);
    ui->receiveText->setTextColor(Qt::black);

    // 如果之前在末尾，则自动滚动到末尾
    if (atEnd) {
        ui->receiveText->moveCursor(QTextCursor::End);
    }
}
```


main.cpp


```cpp
#include "mainwindow.h"

#include <QApplication>
#include <QFont>
#include <QFontDatabase>

int main(int argc, char *argv[])
{
    QApplication a(argc, argv);

    // 为Android设置合适的字体大小
    QFont font = a.font();
    font.setPointSize(14);
    a.setFont(font);

    MainWindow w;
    w.show();

    return a.exec();
}
```


tcp\_test.pro


```cpp
QT       += core gui network  # 确保这里包含了 network

greaterThan(QT_MAJOR_VERSION, 4): QT += widgets

CONFIG += c++17

# You can make your code fail to compile if it uses deprecated APIs.
# In order to do so, uncomment the following line.
#DEFINES += QT_DISABLE_DEPRECATED_BEFORE=0x060000    # disables all the APIs deprecated before Qt 6.0.0

SOURCES += \
    main.cpp \
    mainwindow.cpp

HEADERS += \
    mainwindow.h

FORMS += \
    mainwindow.ui

# Default rules for deployment.
qnx: target.path = /tmp/$${TARGET}/bin
else: unix:!android: target.path = /opt/$${TARGET}/bin
!isEmpty(target.path): INSTALLS += target
```
