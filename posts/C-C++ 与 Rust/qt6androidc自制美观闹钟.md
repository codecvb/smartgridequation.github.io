---
title: QT6AndroidC自制美观闹钟
slug: qt6androidc自制美观闹钟
category: C/C++ 与 Rust
summary: 该代码实现了一个基于Qt的闹钟应用，主要功能包括：
tags: C/C++, Rust, QT6, Android
---

该代码实现了一个基于Qt的闹钟应用，主要功能包括：


1.  闹钟管理：添加、编辑、删除和开关闹钟，支持单次和重复闹钟设置
2.  界面显示：实时显示当前时间、日期和问候语，提供下次闹钟提醒时间
3.  闹钟提醒：到达设定时间时全屏显示提醒界面，支持稍后提醒功能
4.  数据持久化：使用QSettings保存和加载闹钟设置


核心功能通过MainWindow类实现，包含时间更新、闹钟检查、界面布局和用户交互处理。代码结构清晰，使用了Qt的信号槽机制处理事件，并考虑了触摸屏适配和界面美化效果。


![](/uploads/csdn/qt6androidc自制美观闹钟/img-01.jpeg)![](/uploads/csdn/qt6androidc自制美观闹钟/img-02.jpeg)![](/uploads/csdn/qt6androidc自制美观闹钟/img-03.jpeg)


mainwindow.cpp


```cpp
#include "mainwindow.h"
#include "alarmsettings.h"
#include "alarmringing.h"
#include <QDateTime>
#include <QGraphicsDropShadowEffect>
#include <QDebug>
#include <limits>
#include <QLabel>
#include <QPushButton>
#include <QCheckBox>
#include <QVBoxLayout>
#include <QHBoxLayout>
#include <QLayout>


MainWindow::MainWindow(QWidget *parent)
    : QWidget(parent)
    , ui(new Ui::MainWindow)
    , m_ringingDialog(nullptr)
    , m_nextId(0)
    , m_settings("AlarmClock", "AlarmClock")
{
    ui->setupUi(this);
    setWindowTitle("闹钟");

    // 添加阴影效果到header
    QGraphicsDropShadowEffect *headerShadow = new QGraphicsDropShadowEffect(this);
    headerShadow->setBlurRadius(20);
    headerShadow->setOffset(0, 4);
    headerShadow->setColor(QColor(0, 0, 0, 30));
    ui->headerWidget->setGraphicsEffect(headerShadow);

    loadAlarms();
    updateAlarmList();

    m_clockTimer = new QTimer(this);
    connect(m_clockTimer, &QTimer::timeout, this, &MainWindow::updateTime);
    m_clockTimer->start(1000);

    m_alarmCheckTimer = new QTimer(this);
    connect(m_alarmCheckTimer, &QTimer::timeout, this, &MainWindow::checkAlarms);
    m_alarmCheckTimer->start(1000);

    connect(ui->addButton, &QPushButton::clicked, this, &MainWindow::addAlarm);

    updateTime();
}

MainWindow::~MainWindow()
{
    saveAlarms();
    qDeleteAll(m_alarms);
    delete ui;
}

void MainWindow::resizeEvent(QResizeEvent *event)
{
    QWidget::resizeEvent(event);
}

void MainWindow::loadAlarms()
{
    int size = m_settings.beginReadArray("alarms");
    for (int i = 0; i < size; ++i) {
        m_settings.setArrayIndex(i);
        Alarm *alarm = new Alarm(this);
        alarm->load(m_settings, i);
        m_alarms.append(alarm);
        if (alarm->id() >= m_nextId) {
            m_nextId = alarm->id() + 1;
        }
    }
    m_settings.endArray();

    if (m_alarms.isEmpty()) {
        Alarm *defaultAlarm = new Alarm(m_nextId++, QTime(7, 0), "起床闹钟", true, this);
        m_alarms.append(defaultAlarm);
    }
}

void MainWindow::saveAlarms()
{
    m_settings.beginWriteArray("alarms");
    for (int i = 0; i < m_alarms.size(); ++i) {
        m_settings.setArrayIndex(i);
        m_alarms[i]->save(m_settings);
    }
    m_settings.endArray();
}

QWidget *MainWindow::createAlarmWidget(Alarm *alarm)
{
    QWidget *alarmWidget = new QWidget();
    alarmWidget->setObjectName("alarmItem");
    alarmWidget->setProperty("enabled", alarm->isEnabled());
    alarmWidget->setProperty("alarmId", alarm->id());

    QHBoxLayout *itemLayout = new QHBoxLayout(alarmWidget);
    itemLayout->setContentsMargins(16, 14, 12, 14);
    itemLayout->setSpacing(12);

    QVBoxLayout *textLayout = new QVBoxLayout();
    textLayout->setSpacing(4);

    QLabel *timeLbl = new QLabel(alarm->timeDisplay(), alarmWidget);
    timeLbl->setObjectName("alarmTime");
    timeLbl->setSizePolicy(QSizePolicy::Maximum, QSizePolicy::Preferred);

    QLabel *labelLbl = new QLabel(alarm->label() + " · " + alarm->repeatDisplay(), alarmWidget);
    labelLbl->setObjectName("alarmLabel");
    labelLbl->setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Preferred);

    textLayout->addWidget(timeLbl);
    textLayout->addWidget(labelLbl);

    QCheckBox *toggleCheck = new QCheckBox(alarmWidget);
    toggleCheck->setObjectName("alarmToggle");
    toggleCheck->setChecked(alarm->isEnabled());
    toggleCheck->setCursor(Qt::PointingHandCursor);
    toggleCheck->setFixedSize(QSize(60, 44));
    toggleCheck->setFocusPolicy(Qt::NoFocus);
    int alarmId = alarm->id();
    connect(toggleCheck, &QCheckBox::toggled, this, [this, alarmId](bool checked) {
        toggleAlarm(alarmId, checked);
    });

    QPushButton *deleteBtn = new QPushButton("删除", alarmWidget);
    deleteBtn->setObjectName("deleteBtn");
    deleteBtn->setCursor(Qt::PointingHandCursor);
    deleteBtn->setFixedSize(QSize(64, 44));
    deleteBtn->setFocusPolicy(Qt::NoFocus);
    connect(deleteBtn, &QPushButton::clicked, this, [this, alarmId]() {
        qDebug() << "Delete button clicked for alarm" << alarmId;
        deleteAlarm(alarmId);
    });

    itemLayout->addLayout(textLayout, 1);
    itemLayout->addWidget(toggleCheck);
    itemLayout->addWidget(deleteBtn);

    // 确保子控件不接受触摸事件，让触摸事件冒泡到 TouchScrollContainer
    ui->alarmScrollArea->disableChildTouchEvents(alarmWidget);

    return alarmWidget;
}

QWidget *MainWindow::createEmptyWidget()
{
    QWidget *emptyWidget = new QWidget();
    emptyWidget->setObjectName("emptyWidget");
    QVBoxLayout *emptyLayout = new QVBoxLayout(emptyWidget);
    emptyLayout->setContentsMargins(20, 60, 20, 60);
    emptyLayout->setSpacing(12);

    QLabel *emptyIcon = new QLabel("⏰", emptyWidget);
    emptyIcon->setObjectName("emptyIcon");
    emptyIcon->setAlignment(Qt::AlignCenter);

    QLabel *emptyText = new QLabel("暂无闹钟\n点击上方按钮添加新闹钟", emptyWidget);
    emptyText->setObjectName("emptyText");
    emptyText->setAlignment(Qt::AlignCenter);
    emptyText->setWordWrap(true);

    emptyLayout->addWidget(emptyIcon);
    emptyLayout->addWidget(emptyText);

    return emptyWidget;
}

void MainWindow::updateAlarmList()
{
    // 清除 layout 中的所有 widget
    QVBoxLayout *layout = ui->alarmScrollArea->contentLayout();
    while (layout->count() > 0) {
        QLayoutItem *item = layout->takeAt(0);
        if (item->widget()) {
            item->widget()->deleteLater();
        }
        delete item;
    }

    if (m_alarms.isEmpty()) {
        layout->addWidget(createEmptyWidget());
    } else {
        for (Alarm *alarm : m_alarms) {
            layout->addWidget(createAlarmWidget(alarm));
        }
    }

    // 添加底部弹簧
    layout->addStretch();
}

void MainWindow::updateTime()
{
    QDateTime now = QDateTime::currentDateTime();
    ui->timeLabel->setText(now.time().toString("HH:mm"));
    ui->dateLabel->setText(getDateString());
    ui->greetingLabel->setText(getGreeting());
    ui->nextAlarmLabel->setText(getNextAlarmTime());

    // 每天零点重置已触发闹钟记录
    if (now.time().hour() == 0 && now.time().minute() == 0) {
        m_triggeredAlarmsToday.clear();
        qDebug() << "Reset triggered alarms for new day";
    }
}

QString MainWindow::getGreeting() const
{
    int hour = QTime::currentTime().hour();
    if (hour >= 5 && hour < 12) {
        return "早上好 ☀️";
    } else if (hour >= 12 && hour < 18) {
        return "下午好 🌤️";
    } else if (hour >= 18 && hour < 22) {
        return "晚上好 🌙";
    } else {
        return "夜深了 🌟";
    }
}

QString MainWindow::getDateString() const
{
    QDate date = QDate::currentDate();
    QStringList weekDays = {"周日", "周一", "周二", "周三", "周四", "周五", "周六"};
    return QString("%1年%2月%3日 %4")
        .arg(date.year())
        .arg(date.month())
        .arg(date.day())
        .arg(weekDays[date.dayOfWeek() % 7]);
}

QString MainWindow::getNextAlarmTime() const
{
    QTime now = QTime::currentTime();
    QDate today = QDate::currentDate();
    int dayOfWeek = today.dayOfWeek();

    QTime nextTime;
    int minDaysUntil = INT_MAX;

    for (Alarm *alarm : m_alarms) {
        if (!alarm->isEnabled()) continue;

        QTime alarmTime = alarm->time();
        int daysUntil = 0;

        if (alarm->isRepeating()) {
            QList<int> repeatDays = alarm->repeatDays();
            if (repeatDays.isEmpty()) continue;

            if (repeatDays.contains(dayOfWeek) && alarmTime > now) {
                daysUntil = 0;
            } else {
                bool found = false;
                for (int i = 1; i <= 7; ++i) {
                    int nextDay = (dayOfWeek + i - 1) % 7 + 1;
                    if (repeatDays.contains(nextDay)) {
                        daysUntil = i;
                        found = true;
                        break;
                    }
                }
                if (!found) continue;
            }
        } else {
            if (alarmTime > now) {
                daysUntil = 0;
            } else {
                continue;
            }
        }

        if (daysUntil < minDaysUntil ||
            (daysUntil == minDaysUntil && alarmTime < nextTime)) {
            nextTime = alarmTime;
            minDaysUntil = daysUntil;
        }
    }

    if (nextTime.isNull()) return "";

    int totalMinutes = minDaysUntil * 24 * 60;
    if (minDaysUntil == 0) {
        totalMinutes = (nextTime.hour() * 60 + nextTime.minute()) -
                       (now.hour() * 60 + now.minute());
    } else {
        totalMinutes = minDaysUntil * 24 * 60 +
                       (nextTime.hour() * 60 + nextTime.minute()) -
                       (now.hour() * 60 + now.minute());
    }

    int hours = totalMinutes / 60;
    int minutes = totalMinutes % 60;

    QString timeText;
    if (minDaysUntil == 0) {
        if (hours == 0) {
            timeText = QString("下次闹钟: %1分钟后").arg(minutes);
        } else {
            timeText = QString("下次闹钟: %1小时%2分钟后").arg(hours).arg(minutes);
        }
    } else if (minDaysUntil == 1) {
        timeText = QString("下次闹钟: 明天 %1").arg(nextTime.toString("HH:mm"));
    } else {
        timeText = QString("下次闹钟: %1天后 %2").arg(minDaysUntil).arg(nextTime.toString("HH:mm"));
    }

    return timeText;
}

Alarm *MainWindow::findAlarmById(int id)
{
    for (Alarm *alarm : m_alarms) {
        if (alarm->id() == id) return alarm;
    }
    return nullptr;
}

void MainWindow::addAlarm()
{
    Alarm *newAlarm = new Alarm(m_nextId++, QTime::currentTime().addSecs(60), "新闹钟", true, this);
    AlarmSettings dialog(newAlarm, this);
    if (dialog.exec() == QDialog::Accepted) {
        m_alarms.append(newAlarm);
        saveAlarms();
        updateAlarmList();
    } else {
        delete newAlarm;
        m_nextId--;
    }
}

void MainWindow::editAlarm(int alarmId)
{
    Alarm *alarm = findAlarmById(alarmId);
    if (!alarm) return;

    AlarmSettings dialog(alarm, this);
    if (dialog.exec() == QDialog::Accepted) {
        saveAlarms();
        updateAlarmList();
    }
}

void MainWindow::toggleAlarm(int alarmId, bool enabled)
{
    Alarm *alarm = findAlarmById(alarmId);
    if (alarm) {
        alarm->setEnabled(enabled);
        saveAlarms();
        updateAlarmList();
    }
}

void MainWindow::deleteAlarm(int alarmId)
{
    qDebug() << "deleteAlarm called with id:" << alarmId << "total alarms:" << m_alarms.size();
    for (int i = 0; i < m_alarms.size(); ++i) {
        qDebug() << "  checking alarm" << i << "id:" << m_alarms[i]->id();
        if (m_alarms[i]->id() == alarmId) {
            delete m_alarms.takeAt(i);
            saveAlarms();
            updateAlarmList();
            qDebug() << "Alarm deleted successfully";
            return;
        }
    }
    qDebug() << "Alarm not found with id:" << alarmId;
}

void MainWindow::stopRinging()
{
    if (m_ringingDialog) {
        m_ringingDialog->deleteLater();
        m_ringingDialog = nullptr;
    }
}

void MainWindow::onAlarmSnoozed(Alarm *alarm, int minutes)
{
    SnoozedAlarm snoozed;
    snoozed.alarm = alarm;
    snoozed.snoozeTime = QTime::currentTime().addSecs(minutes * 60);
    m_snoozedAlarms.append(snoozed);

    qDebug() << "Alarm snoozed for" << minutes << "minutes, will ring at" << snoozed.snoozeTime.toString("HH:mm");

    stopRinging();
}

void MainWindow::checkAlarms()
{
    if (m_ringingDialog) return;

    QTime now = QTime::currentTime();
    QDate today = QDate::currentDate();
    int dayOfWeek = today.dayOfWeek();

    // 先检查稍后提醒闹钟
    for (int i = 0; i < m_snoozedAlarms.size(); ++i) {
        SnoozedAlarm snoozed = m_snoozedAlarms[i];
        if (snoozed.snoozeTime.hour() == now.hour() && snoozed.snoozeTime.minute() == now.minute()) {
            m_snoozedAlarms.removeAt(i);

            m_ringingDialog = new AlarmRinging(snoozed.alarm, this);
            connect(m_ringingDialog, &AlarmRinging::stopped, this, &MainWindow::stopRinging);
            connect(m_ringingDialog, &AlarmRinging::snoozed, this, &MainWindow::onAlarmSnoozed);
            m_ringingDialog->showFullScreen();
            return;
        }
    }

    for (Alarm *alarm : m_alarms) {
        if (!alarm->isEnabled()) continue;

        if (alarm->time().hour() != now.hour() || alarm->time().minute() != now.minute())
            continue;

        if (m_triggeredAlarmsToday.contains(alarm->id()))
            continue;

        if (alarm->isRepeating()) {
            if (!alarm->repeatDays().contains(dayOfWeek))
                continue;
        }

        m_triggeredAlarmsToday.insert(alarm->id());

        m_ringingDialog = new AlarmRinging(alarm, this);
        connect(m_ringingDialog, &AlarmRinging::stopped, this, &MainWindow::stopRinging);
        connect(m_ringingDialog, &AlarmRinging::snoozed, this, &MainWindow::onAlarmSnoozed);
        m_ringingDialog->showFullScreen();

        if (!alarm->isRepeating()) {
            alarm->setEnabled(false);
            saveAlarms();
            updateAlarmList();
        }

        break;
    }
}
```


需要完整代码工程请私信留邮箱。
