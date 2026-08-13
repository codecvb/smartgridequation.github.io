---
title: QT6写一个诗词鉴赏朗诵阅读程序智谱清言AI赏析接口
slug: qt6写一个诗词鉴赏朗诵阅读程序智谱清言ai赏析接口
category: 嵌入式与硬件
summary: 实现了一个基于Qt框架的古诗词浏览应用。主要功能包括：通过PoemDatabase类管理诗词数据，首次运行时自动检查并导入Chinese-poetry目录中的数据；提供朝代筛选、关键词搜索和诗词浏览功能；双击诗词可查看详情和朗诵；界面采用qss样式表实现古风设计。核心类包括MainWindow、PoemDetailDialog和PoemPlayer，实现了数据管理、界面交互和语音朗诵功能。代码结构…
tags: 读书笔记, QT6, AI
---

实现了一个基于Qt框架的古诗词浏览应用。主要功能包括：通过PoemDatabase类管理诗词数据，首次运行时自动检查并导入Chinese-poetry目录中的数据；提供朝代筛选、关键词搜索和诗词浏览功能；双击诗词可查看详情和朗诵；界面采用qss样式表实现古风设计。核心类包括MainWindow、PoemDetailDialog和PoemPlayer，实现了数据管理、界面交互和语音朗诵功能。代码结构清晰，包含数据加载、UI初始化、样式应用和事件处理等模块。


![](/uploads/csdn/qt6写一个诗词鉴赏朗诵阅读程序智谱清言ai赏析接口/img-01.png)


![](/uploads/csdn/qt6写一个诗词鉴赏朗诵阅读程序智谱清言ai赏析接口/img-02.png)


使用网络上Chinese-poetry数据，github上有，gitee也有


以下是mainwindow.cpp


```cpp
#include "mainwindow.h"
#include "ui_mainwindow.h"
#include "poemdetaildialog.h"
#include <QFile>
#include <QMessageBox>

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
    , ui(new Ui::MainWindow)
    , poemDB(new PoemDatabase(this))
    , poemPlayer(new PoemPlayer(this))
{
    ui->setupUi(this);

    // 检查是否需要导入诗词数据
    if (poemDB->isDatabaseEmpty()) {
        // 导入数据（这里假设有一个默认的Chinese-poetry目录）
        QString poetryDir = QDir::currentPath() + "/Chinese-poetry";
        if (QDir(poetryDir).exists()) {
            QProgressDialog progressDialog("正在导入诗词数据...", "取消", 0, 100, this);
            progressDialog.setWindowModality(Qt::WindowModal);

            // 连接进度信号
            connect(poemDB, &PoemDatabase::importProgress, &progressDialog, [&progressDialog](int progress, const QString &message) {
                progressDialog.setValue(progress);
                progressDialog.setLabelText(message);
            });

            poemDB->importPoetryData(poetryDir);
        }
    }

    setupUI();
    applyStyleSheet();

    // 导入按钮暂时不在UI中，通过其他方式触发导入功能
}

MainWindow::~MainWindow()
{
    delete ui;
    delete poemDB;
    delete poemPlayer;
}

void MainWindow::setupUI()
{
    // 设置朝代下拉框
    setupDynastyComboBox();

    // 初始加载所有古诗
    loadPoemsList(poemDB->getAllPoems());

    // 设置列表项的提示
    ui->statusLabel->setText("双击诗句查看详情、赏析和朗诵");

    // 连接信号和槽
    connect(ui->searchButton, &QPushButton::clicked, this, &MainWindow::on_searchButton_clicked);
    connect(ui->dynastyComboBox, &QComboBox::currentTextChanged, this, &MainWindow::on_dynastyComboBox_currentIndexChanged);
    connect(ui->poemList, &QListWidget::itemDoubleClicked, this, &MainWindow::on_poemList_itemDoubleClicked);
    connect(ui->refreshButton, &QPushButton::clicked, this, &MainWindow::on_refreshButton_clicked);
}

void MainWindow::loadPoemsList(const QList<Poem> &poems)
{
    ui->poemList->clear();

    for (const Poem &poem : poems) {
        QString displayText = QString("《%1》 - %2 (%3)")
            .arg(poem.title)
            .arg(poem.author)
            .arg(poem.dynasty);

        QListWidgetItem *item = new QListWidgetItem(displayText, ui->poemList);
        item->setData(Qt::UserRole, poem.id);
        item->setToolTip(poem.content.left(100) + (poem.content.length() > 100 ? "..." : ""));
    }

    ui->statusLabel->setText(QString("共找到 %1 首诗词").arg(poems.size()));
}

void MainWindow::applyStyleSheet()
{
    QFile styleFile("qrc:/styles/ancient_style.qss");
    if (styleFile.open(QIODevice::ReadOnly)) {
        QString styleSheet = QLatin1String(styleFile.readAll());
        this->setStyleSheet(styleSheet);
        styleFile.close();
    } else {
        // 如果无法从资源加载，尝试从本地文件加载
        QFile localStyleFile("./ancient_style.qss");
        if (localStyleFile.open(QIODevice::ReadOnly)) {
            QString styleSheet = QLatin1String(localStyleFile.readAll());
            this->setStyleSheet(styleSheet);
            localStyleFile.close();
        }
    }
}

void MainWindow::setupDynastyComboBox()
{
    ui->dynastyComboBox->clear();
    ui->dynastyComboBox->addItem("所有朝代");

    // 从数据库获取所有朝代
    QStringList dynasties = poemDB->getAllDynasties();

    // 添加固定的朝代顺序（如果数据库中存在）
    QStringList orderedDynasties = {"先秦", "两汉", "魏晋南北朝", "唐代", "五代", "宋代", "元代", "明代", "清代"};
    QStringList resultDynasties;

    // 按固定顺序添加存在的朝代
    foreach (const QString &dynasty, orderedDynasties) {
        if (dynasties.contains(dynasty)) {
            resultDynasties << dynasty;
            dynasties.removeOne(dynasty);
        }
    }

    // 添加剩余的朝代
    resultDynasties << dynasties;

    ui->dynastyComboBox->addItems(resultDynasties);
}

// 导入功能暂时通过程序启动时自动检测实现
// 后续可以添加到菜单或工具栏中


// 朝代筛选功能已移至on_dynastyComboBox_currentIndexChanged方法中

void MainWindow::on_searchButton_clicked()
{
    QString keyword = ui->searchLineEdit->text().trimmed();
    if (keyword.isEmpty()) {
        // 如果搜索框为空，显示所有诗词
        if (ui->dynastyComboBox->currentText() == "所有朝代") {
            loadPoemsList(poemDB->getAllPoems());
        } else {
            loadPoemsList(poemDB->filterByDynasty(ui->dynastyComboBox->currentText()));
        }
    } else {
        // 执行搜索
        QList<Poem> results = poemDB->searchPoems(keyword);

        // 如果选择了特定朝代，进一步筛选
        if (ui->dynastyComboBox->currentText() != "所有朝代") {
            QList<Poem> filteredResults;
            for (const Poem &poem : results) {
                if (poem.dynasty == ui->dynastyComboBox->currentText()) {
                    filteredResults.append(poem);
                }
            }
            results = filteredResults;
        }

        loadPoemsList(results);
    }
}

void MainWindow::on_poemList_itemDoubleClicked(QListWidgetItem *item)
{
    int poemId = item->data(Qt::UserRole).toInt();
    Poem poem = poemDB->getPoemById(poemId);

    if (poem.id != 0) { // 确保找到了有效的诗词
        PoemDetailDialog *dialog = new PoemDetailDialog(poem, poemDB, poemPlayer, this);
        connect(dialog, &PoemDetailDialog::dialogClosed, this, &MainWindow::onPoemDetailClosed);
        dialog->setAttribute(Qt::WA_DeleteOnClose);
        dialog->show();
    }
}

void MainWindow::on_dynastyComboBox_currentIndexChanged(const QString &arg1)
{
    Q_UNUSED(arg1);
    on_searchButton_clicked(); // 朝代改变时重新搜索
}

void MainWindow::on_refreshButton_clicked()
{
    ui->searchLineEdit->clear();
    ui->dynastyComboBox->setCurrentIndex(0); // 重置为"所有朝代"
    loadPoemsList(poemDB->getAllPoems());
}

void MainWindow::onPoemDetailClosed()
{
    // 当诗歌详情对话框关闭时的处理逻辑
    // 这里可以添加清理或更新UI的代码
}
```


需要完整代码可以私信获取。
