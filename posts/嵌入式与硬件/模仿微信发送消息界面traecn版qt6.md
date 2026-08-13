---
title: 模仿微信发送消息界面traecn版QT6
slug: 模仿微信发送消息界面traecn版qt6
category: 嵌入式与硬件
summary: 本文介绍了一个基于Qt框架的微信克隆应用主窗口实现。该应用采用左右布局设计，左侧为聊天列表（包含搜索栏和联系人列表），右侧为聊天窗口堆栈。通过QListWidget管理联系人列表，QStackedWidget实现多聊天窗口切换，并支持点击联系人切换对应聊天界面。代码展示了UI初始化、示例联系人创建和信号槽连接等核心功能实现，为开发类微信应用提供了基础框架参考。
tags: 嵌入式, 物联网, QT6
---

本文介绍了一个基于Qt框架的微信克隆应用主窗口实现。该应用采用左右布局设计，左侧为聊天列表（包含搜索栏和联系人列表），右侧为聊天窗口堆栈。通过QListWidget管理联系人列表，QStackedWidget实现多聊天窗口切换，并支持点击联系人切换对应聊天界面。代码展示了UI初始化、示例联系人创建和信号槽连接等核心功能实现，为开发类微信应用提供了基础框架参考。


![](/uploads/csdn/模仿微信发送消息界面traecn版qt6/img-01.png)


```cpp
#include "mainwindow.h"
#include "ui_mainwindow.h"
#include "chatlistitem.h"
#include <QHBoxLayout>
#include <QVBoxLayout>
#include <QPushButton>
#include <QLineEdit>
#include <QLabel>
#include <QListWidgetItem>

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
{
    setupUI();
    createSampleChats();
    connectSignalsSlots();
}

MainWindow::~MainWindow()
{
}

void MainWindow::setupUI()
{
    // 设置窗口标题和大小
    setWindowTitle("WeChatClone");
    setMinimumSize(900, 600);

    // 创建中央部件和主布局
    QWidget *centralWidget = new QWidget(this);
    QHBoxLayout *mainLayout = new QHBoxLayout(centralWidget);
    mainLayout->setContentsMargins(0, 0, 0, 0);
    mainLayout->setSpacing(0);

    // 左侧聊天列表
    chatListWidget = new QListWidget(this);
    chatListWidget->setMaximumWidth(300);
    chatListWidget->setMinimumWidth(280);
    chatListWidget->setStyleSheet("QListWidget { border-right: 1px solid #e0e0e0; }");
    chatListWidget->setSelectionMode(QAbstractItemView::SingleSelection);
    chatListWidget->setSpacing(1);

    // 添加搜索栏
    QWidget *searchWidget = new QWidget(chatListWidget);
    QHBoxLayout *searchLayout = new QHBoxLayout(searchWidget);
    QLineEdit *searchEdit = new QLineEdit(searchWidget);
    searchEdit->setPlaceholderText("搜索");
    searchEdit->setStyleSheet("QLineEdit { border-radius: 15px; padding: 5px 10px; background-color: #f5f5f5; }");
    searchLayout->addWidget(searchEdit);
    searchWidget->setFixedHeight(50);

    // 添加搜索栏到列表顶部
    chatListWidget->setItemWidget(new QListWidgetItem(chatListWidget), searchWidget);

    // 右侧聊天窗口堆栈
    chatStackWidget = new QStackedWidget(this);
    chatStackWidget->setMinimumSize(600, 500);

    // 添加到主布局
    mainLayout->addWidget(chatListWidget);
    mainLayout->addWidget(chatStackWidget);

    setCentralWidget(centralWidget);
}

void MainWindow::createSampleChats()
{
    // 创建一些示例聊天 - 简化版本
    // 用户名使用字母替代，群聊使用聊天群1、聊天群2等格式
    QStringList contacts = {"UserA", "UserB", "UserC", "UserD", "聊天群1", "聊天群2", "聊天群3", "UserE"};

    for (const QString &contact : contacts) {
        // 创建聊天列表项
        ChatListItem *listItem = new ChatListItem(contact, this);
        listItem->setMessage("新消息");
        listItem->setTime("12:00");

        QListWidgetItem *item = new QListWidgetItem(chatListWidget);
        item->setSizeHint(listItem->sizeHint());
        item->setData(Qt::UserRole, contact); // 存储联系人名称作为Item的数据
        chatListWidget->setItemWidget(item, listItem);

        // 创建对应的聊天窗口
        ChatWidget *chatWidget = new ChatWidget(contact, this);
        chatStackWidget->addWidget(chatWidget);
        chatWidgets[contact] = chatWidget;
    }
}

void MainWindow::connectSignalsSlots()
{
    connect(chatListWidget, &QListWidget::itemClicked, this, &MainWindow::onChatListItemClicked);
}

// 暂时移除更新聊天列表项的功能

void MainWindow::onChatListItemClicked(QListWidgetItem *item)
{
    // 跳过搜索栏项
    if (chatListWidget->row(item) == 0) return;

    // 从Item数据中获取联系人名称
    QString contactName = item->data(Qt::UserRole).toString();

    if (!contactName.isEmpty() && chatWidgets.contains(contactName)) {
        // 切换到对应的聊天窗口
        int index = chatStackWidget->indexOf(chatWidgets[contactName]);
        chatStackWidget->setCurrentIndex(index);
        setWindowTitle(contactName);

        // 高亮选中的项
        item->setSelected(true);
        chatListWidget->scrollToItem(item, QAbstractItemView::EnsureVisible);
    }
}
```


需要源码请私信或者留下邮箱！
