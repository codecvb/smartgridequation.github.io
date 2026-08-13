---
title: LVGL8制作大学生校园课程表课表成绩计时提醒功能界面
slug: lvgl8制作大学生校园课程表课表成绩计时提醒功能界面
category: 嵌入式与硬件
summary: 本文介绍了一个基于LVGL的大学课表应用，采用甜美风格设计，包含课程表展示、上课提醒和成绩查询三大功能。系统使用C语言开发，在Windows平台运行，采用柔和色彩和圆润UI元素，定义了粉色系主题色。应用包含三个主要模块：课表展示模块支持按周/日切换查看课程；成绩查询模块显示各科成绩和GPA统计；提醒模块可设置课前通知。文中详细阐述了UI组件实现、数据结构设计以及事件处理机制，展示了完整的代码框架和…
tags: 科技, 社会, LVGL
---

本文介绍了一个基于LVGL的大学课表应用，采用甜美风格设计，包含课程表展示、上课提醒和成绩查询三大功能。系统使用C语言开发，在Windows平台运行，采用柔和色彩和圆润UI元素，定义了粉色系主题色。应用包含三个主要模块：课表展示模块支持按周/日切换查看课程；成绩查询模块显示各科成绩和GPA统计；提醒模块可设置课前通知。文中详细阐述了UI组件实现、数据结构设计以及事件处理机制，展示了完整的代码框架和交互逻辑。该应用实现了大学生课程管理的核心需求，具有美观友好的界面和实用的功能特性。


![](/uploads/csdn/lvgl8制作大学生校园课程表课表成绩计时提醒功能界面/img-01.png)


![](/uploads/csdn/lvgl8制作大学生校园课程表课表成绩计时提醒功能界面/img-02.png)


![](/uploads/csdn/lvgl8制作大学生校园课程表课表成绩计时提醒功能界面/img-03.png)


![](/uploads/csdn/lvgl8制作大学生校园课程表课表成绩计时提醒功能界面/img-04.png)


代码


```cpp
/**
 * LVGL大学课表应用 - 甜美风格设计
 * 功能：课程表展示、上课提醒、成绩查询
 * 设计风格：甜美可爱，采用柔和色彩和圆润元素
 */

#include "lvgl.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <windows.h>

/* Windows驱动支持 */
#include "lvgl/src/drivers/windows/lv_windows_display.h"
#include "lvgl/src/drivers/windows/lv_windows_context.h"

/* 简化版鼠标输入处理 */
extern lv_indev_t * lv_windows_acquire_pointer_indev(lv_display_t * display);
extern bool lv_windows_pointer_device_window_message_handler(HWND hWnd, UINT uMsg, WPARAM wParam, LPARAM lParam, LRESULT * plResult);

/* 甜美风格颜色定义 */
#define COLOR_BG          lv_color_make(255, 245, 250)    /* 浅粉背景 */
#define COLOR_CARD        lv_color_make(255, 255, 255)    /* 白色卡片 */
#define COLOR_PRIMARY     lv_color_make(255, 182, 193)    /* 浅粉色 */
#define COLOR_SECONDARY   lv_color_make(173, 216, 230)    /* 浅蓝色 */
#define COLOR_ACCENT      lv_color_make(255, 209, 220)    /* 粉色强调 */
#define COLOR_TEXT        lv_color_make(105, 105, 105)    /* 深灰色文字 */
#define COLOR_TEXT_LIGHT  lv_color_make(180, 180, 180)    /* 浅灰色文字 */
#define COLOR_SUCCESS     lv_color_make(152, 251, 152)    /* 浅绿色 */
#define COLOR_WARNING     lv_color_make(255, 228, 181)    /* 浅橙色 */
#define COLOR_DANGER      lv_color_make(255, 182, 193)    /* 浅红色 */

/* 课程数据结构 */
typedef struct {
    char name[32];
    char teacher[24];
    char location[24];
    int weekday;        /* 1-5: 周一至周五 */
    int start_time;     /* 8, 10, 14, 16, 19等 */
    int duration;       /* 通常为2小时 */
    int credit;         /* 学分 */
    char color[16];     /* 课程颜色 */
} Course;

/* 成绩数据结构 */
typedef struct {
    char course_name[32];
    float score;
    int credit;
    char grade[4];      /* A, B, C, D, F */
} Grade;

/* 提醒数据结构 */
typedef struct {
    char course_name[32];
    int time_before;    /* 提前多少分钟提醒 */
    int enabled;
} Reminder;

/* 函数原型 */
static void weekday_btn_clicked(lv_event_t *e);
static void week_minus_clicked(lv_event_t *e);
static void week_plus_clicked(lv_event_t *e);
static void add_reminder_clicked(lv_event_t *e);
static void nav_btn_clicked(lv_event_t *e);
static void reminder_btn_clicked(lv_event_t *e);
static void update_timetable_display(void);

/* 全局变量 */
static Course courses[] = {
    {"Advanced Mathematics", "Prof. Zhang", "Yifu Building 201", 1, 8, 2, 4, "primary"},
    {"College English", "Mr. Wang", "Foreign Language Building 101", 1, 10, 2, 3, "secondary"},
    {"Programming", "Prof. Li", "Computer Center 302", 2, 14, 2, 4, "accent"},
    {"Physical Education", "Mr. Liu", "Gymnasium", 3, 10, 2, 1, "success"},
    {"Physics Lab", "Prof. Zhao", "Physics Lab Building", 4, 14, 2, 2, "warning"},
    {"Ideological and Political Education", "Mr. Chen", "Teaching Building 105", 5, 8, 2, 2, "primary"},
    {"Data Structures", "Prof. Li", "Computer Center 305", 2, 16, 2, 4, "secondary"},
    {"Art Appreciation", "Mr. Sun", "Art Building 101", 4, 10, 2, 2, "accent"},
};

static Grade grades[] = {
    {"Advanced Mathematics", 92.5, 4, "A"},
    {"College English", 85.0, 3, "B+"},
    {"Programming", 88.0, 4, "B+"},
    {"Physical Education", 95.0, 1, "A"},
    {"Physics Lab", 78.5, 2, "C+"},
    {"Ideological and Political Education", 90.0, 2, "A-"},
    {"Data Structures", 87.0, 4, "B+"},
    {"Art Appreciation", 93.0, 2, "A"},
};

static Reminder reminders[] = {
    {"Advanced Mathematics", 10, 1},
    {"College English", 15, 1},
    {"Programming", 5, 0},
    {"Physical Education", 30, 1},
};

static int current_day = 1;  /* 默认显示周一 */
static int current_week = 1; /* 当前周数 */
static lv_obj_t *timetable_grid;
static lv_obj_t *grade_list;
static lv_obj_t *reminder_list;
static lv_obj_t *current_day_label;
static lv_obj_t *current_week_label;

/* 获取课程颜色 */
static lv_color_t get_course_color(const char *color_name) {
    if (strcmp(color_name, "primary") == 0) return COLOR_PRIMARY;
    if (strcmp(color_name, "secondary") == 0) return COLOR_SECONDARY;
    if (strcmp(color_name, "accent") == 0) return COLOR_ACCENT;
    if (strcmp(color_name, "success") == 0) return COLOR_SUCCESS;
    if (strcmp(color_name, "warning") == 0) return COLOR_WARNING;
    if (strcmp(color_name, "danger") == 0) return COLOR_DANGER;
    return COLOR_PRIMARY; /* 默认颜色 */
}

/* 创建圆形图标按钮 */
static lv_obj_t *create_round_btn(lv_obj_t *parent, const void *icon, lv_color_t color) {
    lv_obj_t *btn = lv_btn_create(parent);
    lv_obj_set_size(btn, 60, 60); // 默认增大按钮
    lv_obj_set_style_bg_color(btn, color, 0);
    lv_obj_set_style_radius(btn, 30, 0); // 相应调整圆角半径
    lv_obj_set_style_bg_opa(btn, LV_OPA_100, 0);
    lv_obj_set_style_shadow_color(btn, lv_color_darken(color, LV_OPA_30), 0);
    lv_obj_set_style_shadow_width(btn, 10, 0);
    lv_obj_set_style_shadow_spread(btn, 2, 0);

    if (icon) {
        lv_obj_t *icon_obj = lv_img_create(btn);
        lv_img_set_src(icon_obj, icon);
        lv_obj_center(icon_obj);
    }

    return btn;
}

/* 创建课程卡片 */
static lv_obj_t *create_course_card(lv_obj_t *parent, Course *course) {
    lv_obj_t *card = lv_obj_create(parent);
    lv_obj_set_size(card, lv_pct(100), LV_SIZE_CONTENT);
    lv_obj_set_style_bg_color(card, get_course_color(course->color), 0);
    lv_obj_set_style_bg_opa(card, LV_OPA_70, 0);
    lv_obj_set_style_radius(card, 15, 0);
    lv_obj_set_style_pad_all(card, 12, 0);
    lv_obj_set_style_border_width(card, 0, 0);
    lv_obj_set_style_shadow_color(card, lv_color_darken(get_course_color(course->color), LV_OPA_20), 0);
    lv_obj_set_style_shadow_width(card, 8, 0);
    lv_obj_set_style_shadow_spread(card, 2, 0);
    lv_obj_set_style_shadow_ofs_y(card, 3, 0);

    /* 课程名称 */
    lv_obj_t *name_label = lv_label_create(card);
    lv_label_set_text_fmt(name_label, "%s", course->name);
    lv_obj_set_style_text_color(name_label, lv_color_white(), 0);
    lv_obj_set_style_text_font(name_label, &lv_font_montserrat_16, 0);
    lv_obj_set_style_text_opa(name_label, LV_OPA_100, 0);
    lv_obj_align(name_label, LV_ALIGN_TOP_LEFT, 0, 0);

    /* 课程详情 */
    lv_obj_t *details_label = lv_label_create(card);
    lv_label_set_text_fmt(details_label, "%s\n%s Period %d-%d",
                         course->teacher, course->location,
                         course->start_time, course->start_time + course->duration - 1);
    lv_obj_set_style_text_color(details_label, lv_color_white(), 0);
    lv_obj_set_style_text_font(details_label, &lv_font_montserrat_12, 0);
    lv_obj_set_style_text_opa(details_label, LV_OPA_90, 0);
    lv_obj_align_to(details_label, name_label, LV_ALIGN_OUT_BOTTOM_LEFT, 0, 5);

    /* 学分标签 */
    lv_obj_t *credit_label = lv_label_create(card);
    lv_label_set_text_fmt(credit_label, "%d Credits", course->credit);
    lv_obj_set_style_text_color(credit_label, lv_color_white(), 0);
    lv_obj_set_style_text_font(credit_label, &lv_font_montserrat_12, 0);
    lv_obj_set_style_text_opa(credit_label, LV_OPA_100, 0);
    lv_obj_align(credit_label, LV_ALIGN_TOP_RIGHT, 0, 0);

    return card;
}

/* 创建课表页面 */
static void create_timetable_tab(lv_obj_t *parent) {
    /* 顶部栏 */
    lv_obj_t *top_bar = lv_obj_create(parent);
    lv_obj_set_size(top_bar, lv_pct(100), 70);
    lv_obj_set_style_bg_color(top_bar, COLOR_CARD, 0);
    lv_obj_set_style_bg_opa(top_bar, LV_OPA_100, 0);
    lv_obj_set_style_radius(top_bar, 0, 0);
    lv_obj_set_style_border_width(top_bar, 0, 0);
    lv_obj_set_style_shadow_color(top_bar, lv_color_hex(0x888888), 0);
    lv_obj_set_style_shadow_width(top_bar, 10, 0);
    lv_obj_set_style_shadow_spread(top_bar, 2, 0);
    lv_obj_align(top_bar, LV_ALIGN_TOP_MID, 0, 0);

    /* 星期选择器 */
    lv_obj_t *weekday_selector = lv_obj_create(top_bar);
    lv_obj_set_size(weekday_selector, lv_pct(80), 40);
    lv_obj_align(weekday_selector, LV_ALIGN_BOTTOM_MID, 0, -5);
    lv_obj_set_flex_flow(weekday_selector, LV_FLEX_FLOW_ROW);
    lv_obj_set_flex_align(weekday_selector, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
    lv_obj_set_style_pad_all(weekday_selector, 5, 0);
    lv_obj_set_style_bg_opa(weekday_selector, LV_OPA_0, 0);
    lv_obj_set_style_border_width(weekday_selector, 0, 0);

    const char *weekdays[] = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
    for (int i = 0; i < 7; i++) {
        lv_obj_t *btn = lv_btn_create(weekday_selector);
        lv_obj_set_size(btn, 50, 30);
        lv_obj_set_style_bg_color(btn, (i+1 == current_day) ? COLOR_PRIMARY : lv_color_hex(0xF0F0F0), 0);
        lv_obj_set_style_radius(btn, 15, 0);
        lv_obj_set_style_border_width(btn, 0, 0);

        lv_obj_t *label = lv_label_create(btn);
        lv_label_set_text(label, weekdays[i]);
        lv_obj_set_style_text_color(label, (i+1 == current_day) ? lv_color_white() : COLOR_TEXT, 0);
        lv_obj_center(label);

        lv_obj_set_user_data(btn, (void *)(intptr_t)(i+1));
        lv_obj_add_event_cb(btn, weekday_btn_clicked, LV_EVENT_CLICKED, NULL);
    }

    /* 当前日期显示 */
    current_day_label = lv_label_create(top_bar);
    lv_label_set_text_fmt(current_day_label, "Today: Mon Week %d", current_week);
    lv_obj_set_style_text_color(current_day_label, COLOR_TEXT, 0);
    lv_obj_set_style_text_font(current_day_label, &lv_font_montserrat_14, 0);
    lv_obj_align(current_day_label, LV_ALIGN_TOP_LEFT, 15, 15);

    /* 周数调整按钮 */
    lv_obj_t *week_cont = lv_obj_create(top_bar);
    lv_obj_set_size(week_cont, 100, 30);
    lv_obj_align(week_cont, LV_ALIGN_TOP_RIGHT, -15, 15);
    lv_obj_set_flex_flow(week_cont, LV_FLEX_FLOW_ROW);
    lv_obj_set_flex_align(week_cont, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
    lv_obj_set_style_pad_all(week_cont, 0, 0);
    lv_obj_set_style_bg_opa(week_cont, LV_OPA_0, 0);
    lv_obj_set_style_border_width(week_cont, 0, 0);

    lv_obj_t *week_minus = lv_btn_create(week_cont);
    lv_obj_set_size(week_minus, 30, 30);
    lv_obj_set_style_bg_color(week_minus, COLOR_PRIMARY, 0);
    lv_obj_set_style_radius(week_minus, 15, 0);
    lv_obj_set_style_border_width(week_minus, 0, 0);
    lv_obj_t *minus_label = lv_label_create(week_minus);
    lv_label_set_text(minus_label, "-");
    lv_obj_set_style_text_color(minus_label, lv_color_white(), 0);
    lv_obj_center(minus_label);

    current_week_label = lv_label_create(week_cont);
    lv_label_set_text_fmt(current_week_label, "Week %d", current_week);
    lv_obj_set_style_text_color(current_week_label, COLOR_TEXT, 0);
    lv_obj_set_style_text_font(current_week_label, &lv_font_montserrat_14, 0);
    lv_obj_set_style_pad_hor(current_week_label, 5, 0);

    lv_obj_t *week_plus = lv_btn_create(week_cont);
    lv_obj_set_size(week_plus, 30, 30);
    lv_obj_set_style_bg_color(week_plus, COLOR_PRIMARY, 0);
    lv_obj_set_style_radius(week_plus, 15, 0);
    lv_obj_set_style_border_width(week_plus, 0, 0);
    lv_obj_t *plus_label = lv_label_create(week_plus);
    lv_label_set_text(plus_label, "+");
    lv_obj_set_style_text_color(plus_label, lv_color_white(), 0);
    lv_obj_center(plus_label);

    lv_obj_add_event_cb(week_minus, week_minus_clicked, LV_EVENT_CLICKED, NULL);

    lv_obj_add_event_cb(week_plus, week_plus_clicked, LV_EVENT_CLICKED, NULL);

    /* 课表内容区域 */
    lv_obj_t *content = lv_obj_create(parent);
    lv_obj_set_size(content, lv_pct(100), lv_pct(100) - 70);
    lv_obj_align_to(content, top_bar, LV_ALIGN_OUT_BOTTOM_MID, 0, 0);
    lv_obj_set_style_bg_color(content, COLOR_BG, 0);
    lv_obj_set_style_bg_opa(content, LV_OPA_100, 0);
    lv_obj_set_style_pad_all(content, 10, 0);
    lv_obj_set_style_border_width(content, 0, 0);

    /* 时间表网格 */
    timetable_grid = lv_obj_create(content);
    lv_obj_set_size(timetable_grid, lv_pct(100), lv_pct(100));
    lv_obj_set_style_bg_color(timetable_grid, COLOR_BG, 0);
    lv_obj_set_style_bg_opa(timetable_grid, LV_OPA_0, 0);
    lv_obj_set_style_border_width(timetable_grid, 0, 0);
    lv_obj_set_flex_flow(timetable_grid, LV_FLEX_FLOW_COLUMN);
    lv_obj_set_flex_align(timetable_grid, LV_FLEX_ALIGN_START, LV_FLEX_ALIGN_START, LV_FLEX_ALIGN_START);
    lv_obj_set_style_pad_all(timetable_grid, 0, 0);
    lv_obj_set_style_pad_row(timetable_grid, 10, 0);

    /* 初始化课表显示 */
    update_timetable_display();
}

/* 更新课表显示 */
static void update_timetable_display() {
    printf("Updating timetable display for day %d\n", current_day);
    if (!timetable_grid) {
        printf("Error: timetable_grid is NULL!\n");
        return;
    }
    lv_obj_clean(timetable_grid);

    /* 时间槽位 */
    int time_slots[] = {8, 10, 14, 16, 19};

    for (int i = 0; i < 5; i++) {
        printf("Processing time slot %d: %02d:00-%02d:00\n", i, time_slots[i], time_slots[i] + 2);
        lv_obj_t *time_slot = lv_obj_create(timetable_grid);
        if (!time_slot) {
            printf("Error: failed to create time_slot!\n");
            continue;
        }
        lv_obj_set_size(time_slot, lv_pct(100), 80); /* 固定高度 */
        lv_obj_set_style_bg_color(time_slot, COLOR_BG, 0);
        lv_obj_set_style_bg_opa(time_slot, LV_OPA_100, 0);
        lv_obj_set_style_border_width(time_slot, 0, 0);
        lv_obj_set_flex_flow(time_slot, LV_FLEX_FLOW_ROW);
        lv_obj_set_flex_align(time_slot, LV_FLEX_ALIGN_START, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
        lv_obj_set_style_pad_all(time_slot, 5, 0);

        /* 时间标签 */
        lv_obj_t *time_label = lv_label_create(time_slot);
        lv_label_set_text_fmt(time_label, "%02d:00", time_slots[i]);
        lv_obj_set_width(time_label, 80);
        lv_obj_set_style_text_color(time_label, COLOR_TEXT, 0);
        lv_obj_set_style_text_font(time_label, &lv_font_montserrat_14, 0);

        /* 查找当前时间段的课程 */
        int course_found = 0;
        for (int j = 0; j < sizeof(courses) / sizeof(courses[0]); j++) {
            if (courses[j].weekday == current_day &&
                courses[j].start_time == time_slots[i]) {
                printf("Found course: %s at %02d:00\n", courses[j].name, courses[j].start_time);
                create_course_card(time_slot, &courses[j]);
                course_found = 1;
                break;
            }
        }

        /* 如果没有课程，显示空白卡片 */
        if (!course_found) {
            printf("No course found for time slot %d\n", i);
            lv_obj_t *empty_card = lv_obj_create(time_slot);
            lv_obj_set_size(empty_card, lv_pct(100) - 80, 60);
            lv_obj_set_style_bg_color(empty_card, COLOR_CARD, 0);
            lv_obj_set_style_bg_opa(empty_card, LV_OPA_100, 0);
            lv_obj_set_style_radius(empty_card, 10, 0);
            lv_obj_set_style_border_width(empty_card, 1, 0);
            lv_obj_set_style_border_color(empty_card, lv_color_hex(0xE0E0E0), 0);

            lv_obj_t *empty_label = lv_label_create(empty_card);
            lv_label_set_text(empty_label, "No Class");
            lv_obj_set_style_text_color(empty_label, COLOR_TEXT_LIGHT, 0);
            lv_obj_set_style_text_font(empty_label, &lv_font_montserrat_14, 0);
            lv_obj_center(empty_label);
        }
    }
    printf("Timetable display updated\n");
}

/* 创建成绩页面 */
static void create_grades_tab(lv_obj_t *parent) {
    /* 顶部栏 */
    lv_obj_t *top_bar = lv_obj_create(parent);
    lv_obj_set_size(top_bar, lv_pct(100), 70);
    lv_obj_set_style_bg_color(top_bar, COLOR_CARD, 0);
    lv_obj_set_style_bg_opa(top_bar, LV_OPA_100, 0);
    lv_obj_set_style_radius(top_bar, 0, 0);
    lv_obj_set_style_border_width(top_bar, 0, 0);
    lv_obj_set_style_shadow_color(top_bar, lv_color_hex(0x888888), 0);
    lv_obj_set_style_shadow_width(top_bar, 10, 0);
    lv_obj_set_style_shadow_spread(top_bar, 2, 0);
    lv_obj_align(top_bar, LV_ALIGN_TOP_MID, 0, 0);

    /* 标题 */
    lv_obj_t *title = lv_label_create(top_bar);
    lv_label_set_text(title, "Grade Query");
    lv_obj_set_style_text_color(title, COLOR_TEXT, 0);
    lv_obj_set_style_text_font(title, &lv_font_montserrat_20, 0);
    lv_obj_center(title);

    /* 平均分计算 */
    float total_score = 0;
    float total_weighted_score = 0;
    int total_credits = 0;

    for (int i = 0; i < sizeof(grades) / sizeof(grades[0]); i++) {
        total_score += grades[i].score;
        total_weighted_score += grades[i].score * grades[i].credit;
        total_credits += grades[i].credit;
    }

    float avg_score = total_score / (sizeof(grades) / sizeof(grades[0]));
    float gpa = total_weighted_score / total_credits / 20.0; /* 简化GPA计算 */

    /* 统计信息 */
    lv_obj_t *stats_cont = lv_obj_create(top_bar);
    lv_obj_set_size(stats_cont, lv_pct(100), 30);
    lv_obj_align(stats_cont, LV_ALIGN_BOTTOM_MID, 0, -5);
    lv_obj_set_flex_flow(stats_cont, LV_FLEX_FLOW_ROW);
    lv_obj_set_flex_align(stats_cont, LV_FLEX_ALIGN_SPACE_AROUND, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
    lv_obj_set_style_pad_all(stats_cont, 0, 0);
    lv_obj_set_style_bg_opa(stats_cont, LV_OPA_0, 0);
    lv_obj_set_style_border_width(stats_cont, 0, 0);

    lv_obj_t *avg_label = lv_label_create(stats_cont);
    lv_label_set_text_fmt(avg_label, "Avg: %.1f", avg_score);
    lv_obj_set_style_text_color(avg_label, COLOR_TEXT, 0);

    lv_obj_t *gpa_label = lv_label_create(stats_cont);
    lv_label_set_text_fmt(gpa_label, "GPA: %.2f", gpa);
    lv_obj_set_style_text_color(gpa_label, COLOR_TEXT, 0);

    lv_obj_t *credit_label = lv_label_create(stats_cont);
    lv_label_set_text_fmt(credit_label, "Total Credits: %d", total_credits);
    lv_obj_set_style_text_color(credit_label, COLOR_TEXT, 0);

    /* 成绩列表 */
    lv_obj_t *content = lv_obj_create(parent);
    lv_obj_set_size(content, lv_pct(100), lv_pct(100) - 70);
    lv_obj_align_to(content, top_bar, LV_ALIGN_OUT_BOTTOM_MID, 0, 0);
    lv_obj_set_style_bg_color(content, COLOR_BG, 0);
    lv_obj_set_style_bg_opa(content, LV_OPA_100, 0);
    lv_obj_set_style_pad_all(content, 10, 0);
    lv_obj_set_style_border_width(content, 0, 0);

    grade_list = lv_obj_create(content);
    lv_obj_set_size(grade_list, lv_pct(100), lv_pct(100));
    lv_obj_set_style_bg_color(grade_list, COLOR_BG, 0);
    lv_obj_set_style_bg_opa(grade_list, LV_OPA_0, 0);
    lv_obj_set_style_border_width(grade_list, 0, 0);
    lv_obj_set_flex_flow(grade_list, LV_FLEX_FLOW_COLUMN);
    lv_obj_set_flex_align(grade_list, LV_FLEX_ALIGN_START, LV_FLEX_ALIGN_START, LV_FLEX_ALIGN_START);
    lv_obj_set_style_pad_all(grade_list, 0, 0);
    lv_obj_set_style_pad_row(grade_list, 10, 0);

    for (int i = 0; i < sizeof(grades) / sizeof(grades[0]); i++) {
        /* 成绩卡片 */
        lv_color_t grade_color;
        if (grades[i].score >= 90) grade_color = COLOR_SUCCESS;
        else if (grades[i].score >= 80) grade_color = COLOR_SECONDARY;
        else if (grades[i].score >= 70) grade_color = COLOR_WARNING;
        else grade_color = COLOR_DANGER;

        lv_obj_t *card = lv_obj_create(grade_list);
        lv_obj_set_size(card, lv_pct(100), 80);
        lv_obj_set_style_bg_color(card, COLOR_CARD, 0);
        lv_obj_set_style_bg_opa(card, LV_OPA_100, 0);
        lv_obj_set_style_radius(card, 15, 0);
        lv_obj_set_style_pad_all(card, 15, 0);
        lv_obj_set_style_border_width(card, 3, 0);
        lv_obj_set_style_border_color(card, grade_color, 0);
        lv_obj_set_style_shadow_color(card, lv_color_darken(grade_color, LV_OPA_20), 0);
        lv_obj_set_style_shadow_width(card, 8, 0);
        lv_obj_set_style_shadow_spread(card, 2, 0);
        lv_obj_set_style_shadow_ofs_y(card, 3, 0);

        /* 课程名称和学分 */
        lv_obj_t *name_cont = lv_obj_create(card);
        lv_obj_set_size(name_cont, lv_pct(60), LV_SIZE_CONTENT);
        lv_obj_align(name_cont, LV_ALIGN_TOP_LEFT, 0, 0);
        lv_obj_set_style_bg_opa(name_cont, LV_OPA_0, 0);
        lv_obj_set_style_border_width(name_cont, 0, 0);
        lv_obj_set_flex_flow(name_cont, LV_FLEX_FLOW_COLUMN);
        lv_obj_set_flex_align(name_cont, LV_FLEX_ALIGN_START, LV_FLEX_ALIGN_START, LV_FLEX_ALIGN_START);
        lv_obj_set_style_pad_all(name_cont, 0, 0);

        lv_obj_t *name_label = lv_label_create(name_cont);
        lv_label_set_text_fmt(name_label, "%s", grades[i].course_name);
        lv_obj_set_style_text_color(name_label, COLOR_TEXT, 0);
        lv_obj_set_style_text_font(name_label, &lv_font_montserrat_16, 0);

        lv_obj_t *credit_label = lv_label_create(name_cont);
        lv_label_set_text_fmt(credit_label, "%d Credits", grades[i].credit);
        lv_obj_set_style_text_color(credit_label, COLOR_TEXT_LIGHT, 0);
        lv_obj_set_style_text_font(credit_label, &lv_font_montserrat_12, 0);

        /* 成绩和等级 */
        lv_obj_t *score_cont = lv_obj_create(card);
        lv_obj_set_size(score_cont, lv_pct(40), LV_SIZE_CONTENT);
        lv_obj_align(score_cont, LV_ALIGN_TOP_RIGHT, 0, 0);
        lv_obj_set_style_bg_opa(score_cont, LV_OPA_0, 0);
        lv_obj_set_style_border_width(score_cont, 0, 0);
        lv_obj_set_flex_flow(score_cont, LV_FLEX_FLOW_COLUMN);
        lv_obj_set_flex_align(score_cont, LV_FLEX_ALIGN_END, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
        lv_obj_set_style_pad_all(score_cont, 0, 0);

        lv_obj_t *score_label = lv_label_create(score_cont);
        lv_label_set_text_fmt(score_label, "%.1f", grades[i].score);
        lv_obj_set_style_text_color(score_label, COLOR_TEXT, 0);
        lv_obj_set_style_text_font(score_label, &lv_font_montserrat_18, 0);

        lv_obj_t *grade_label = lv_label_create(score_cont);
        lv_label_set_text_fmt(grade_label, "Grade: %s", grades[i].grade);
        lv_obj_set_style_text_color(grade_label, grade_color, 0);
        lv_obj_set_style_text_font(grade_label, &lv_font_montserrat_14, 0);
    }
}

/* 创建提醒页面 */
static void create_reminders_tab(lv_obj_t *parent) {
    /* 顶部栏 */
    lv_obj_t *top_bar = lv_obj_create(parent);
    lv_obj_set_size(top_bar, lv_pct(100), 70);
    lv_obj_set_style_bg_color(top_bar, COLOR_CARD, 0);
    lv_obj_set_style_bg_opa(top_bar, LV_OPA_100, 0);
    lv_obj_set_style_radius(top_bar, 0, 0);
    lv_obj_set_style_border_width(top_bar, 0, 0);
    lv_obj_set_style_shadow_color(top_bar, lv_color_hex(0x888888), 0);
    lv_obj_set_style_shadow_width(top_bar, 10, 0);
    lv_obj_set_style_shadow_spread(top_bar, 2, 0);
    lv_obj_align(top_bar, LV_ALIGN_TOP_MID, 0, 0);

    /* 标题 */
    lv_obj_t *title = lv_label_create(top_bar);
    lv_label_set_text(title, "Class Reminders");
    lv_obj_set_style_text_color(title, COLOR_TEXT, 0);
    lv_obj_set_style_text_font(title, &lv_font_montserrat_20, 0);
    lv_obj_center(title);

    /* 添加提醒按钮 */
    lv_obj_t *add_btn = create_round_btn(top_bar, NULL, COLOR_PRIMARY);
    lv_obj_align(add_btn, LV_ALIGN_RIGHT_MID, -15, 0);

    lv_obj_t *add_label = lv_label_create(add_btn);
    lv_label_set_text(add_label, "+");
    lv_obj_set_style_text_color(add_label, lv_color_white(), 0);
    lv_obj_set_style_text_font(add_label, &lv_font_montserrat_24, 0);
    lv_obj_center(add_label);

    lv_obj_add_event_cb(add_btn, add_reminder_clicked, LV_EVENT_CLICKED, NULL);

    /* 提醒列表 */
    lv_obj_t *content = lv_obj_create(parent);
    lv_obj_set_size(content, lv_pct(100), lv_pct(100) - 70);
    lv_obj_align_to(content, top_bar, LV_ALIGN_OUT_BOTTOM_MID, 0, 0);
    lv_obj_set_style_bg_color(content, COLOR_BG, 0);
    lv_obj_set_style_bg_opa(content, LV_OPA_100, 0);
    lv_obj_set_style_pad_all(content, 10, 0);
    lv_obj_set_style_border_width(content, 0, 0);

    reminder_list = lv_obj_create(content);
    lv_obj_set_size(reminder_list, lv_pct(100), lv_pct(100));
    lv_obj_set_style_bg_color(reminder_list, COLOR_BG, 0);
    lv_obj_set_style_bg_opa(reminder_list, LV_OPA_0, 0);
    lv_obj_set_style_border_width(reminder_list, 0, 0);
    lv_obj_set_flex_flow(reminder_list, LV_FLEX_FLOW_COLUMN);
    lv_obj_set_flex_align(reminder_list, LV_FLEX_ALIGN_START, LV_FLEX_ALIGN_START, LV_FLEX_ALIGN_START);
    lv_obj_set_style_pad_all(reminder_list, 0, 0);
    lv_obj_set_style_pad_row(reminder_list, 10, 0);

    for (int i = 0; i < sizeof(reminders) / sizeof(reminders[0]); i++) {
        /* 查找课程信息 */
        Course *course = NULL;
        for (int j = 0; j < sizeof(courses) / sizeof(courses[0]); j++) {
            if (strcmp(courses[j].name, reminders[i].course_name) == 0) {
                course = &courses[j];
                break;
            }
        }

        if (!course) continue;

        /* 提醒卡片 */
        lv_obj_t *card = lv_obj_create(reminder_list);
        lv_obj_set_size(card, lv_pct(100), 100);
        lv_obj_set_style_bg_color(card, COLOR_CARD, 0);
        lv_obj_set_style_bg_opa(card, LV_OPA_100, 0);
        lv_obj_set_style_radius(card, 15, 0);
        lv_obj_set_style_pad_all(card, 15, 0);
        lv_obj_set_style_border_width(card, 0, 0);
        lv_obj_set_style_shadow_color(card, lv_color_hex(0x888888), 0);
        lv_obj_set_style_shadow_width(card, 8, 0);
        lv_obj_set_style_shadow_spread(card, 2, 0);
        lv_obj_set_style_shadow_ofs_y(card, 3, 0);

        /* 左侧颜色指示条 */
        lv_obj_t *color_bar = lv_obj_create(card);
        lv_obj_set_size(color_bar, 8, lv_pct(100));
        lv_obj_set_style_bg_color(color_bar, get_course_color(course->color), 0);
        lv_obj_set_style_bg_opa(color_bar, LV_OPA_100, 0);
        lv_obj_set_style_radius(color_bar, 4, 0);
        lv_obj_align(color_bar, LV_ALIGN_LEFT_MID, 0, 0);

        /* 课程信息 */
        lv_obj_t *info_cont = lv_obj_create(card);
        lv_obj_set_size(info_cont, lv_pct(70), LV_SIZE_CONTENT);
        lv_obj_align_to(info_cont, color_bar, LV_ALIGN_OUT_RIGHT_MID, 10, 0);
        lv_obj_set_style_bg_opa(info_cont, LV_OPA_0, 0);
        lv_obj_set_style_border_width(info_cont, 0, 0);
        lv_obj_set_flex_flow(info_cont, LV_FLEX_FLOW_COLUMN);
        lv_obj_set_flex_align(info_cont, LV_FLEX_ALIGN_START, LV_FLEX_ALIGN_START, LV_FLEX_ALIGN_START);
        lv_obj_set_style_pad_all(info_cont, 0, 0);

        lv_obj_t *name_label = lv_label_create(info_cont);
        lv_label_set_text_fmt(name_label, "%s", course->name);
        lv_obj_set_style_text_color(name_label, COLOR_TEXT, 0);
        lv_obj_set_style_text_font(name_label, &lv_font_montserrat_16, 0);

        lv_obj_t *time_label = lv_label_create(info_cont);
        const char *weekdays[] = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
        lv_label_set_text_fmt(time_label, "%s %02d:00", weekdays[course->weekday-1], course->start_time);
        lv_obj_set_style_text_color(time_label, COLOR_TEXT_LIGHT, 0);
        lv_obj_set_style_text_font(time_label, &lv_font_montserrat_12, 0);

        lv_obj_t *reminder_label = lv_label_create(info_cont);
        lv_label_set_text_fmt(reminder_label, "%d min before", reminders[i].time_before);
        lv_obj_set_style_text_color(reminder_label, COLOR_TEXT_LIGHT, 0);
        lv_obj_set_style_text_font(reminder_label, &lv_font_montserrat_12, 0);

        /* 开关 */
        lv_obj_t *sw = lv_switch_create(card);
        lv_obj_set_size(sw, 50, 25);
        lv_obj_align(sw, LV_ALIGN_RIGHT_MID, -10, 0);
        if (reminders[i].enabled) {
            lv_obj_add_state(sw, LV_STATE_CHECKED);
        }
        lv_obj_set_style_bg_color(sw, COLOR_PRIMARY, LV_STATE_CHECKED);

        /* 开关标签 */
        lv_obj_t *sw_label = lv_label_create(card);
        lv_label_set_text(sw_label, reminders[i].enabled ? "On" : "Off");
        lv_obj_set_style_text_color(sw_label, COLOR_TEXT_LIGHT, 0);
        lv_obj_align_to(sw_label, sw, LV_ALIGN_OUT_BOTTOM_MID, 0, 5);
    }
}

/* 全局变量 - 用于标签页切换 */
static lv_obj_t *g_tabview;

/* 创建底部导航栏 */
static void create_bottom_nav(lv_obj_t *parent) {
    lv_obj_t *nav = lv_obj_create(parent);
    lv_obj_set_size(nav, lv_pct(100), 80); // 增加高度
    lv_obj_set_style_bg_color(nav, COLOR_CARD, 0);
    lv_obj_set_style_bg_opa(nav, LV_OPA_100, 0);
    lv_obj_set_style_radius(nav, 0, 0);
    lv_obj_set_style_border_width(nav, 0, 0);
    lv_obj_set_style_shadow_color(nav, lv_color_hex(0x888888), 0);
    lv_obj_set_style_shadow_width(nav, 10, 0);
    lv_obj_set_style_shadow_spread(nav, 2, 0);
    lv_obj_align(nav, LV_ALIGN_BOTTOM_MID, 0, 0);

    /* 导航按钮容器 */
    lv_obj_t *btn_cont = lv_obj_create(nav);
    lv_obj_set_size(btn_cont, lv_pct(100), lv_pct(100));
    lv_obj_set_flex_flow(btn_cont, LV_FLEX_FLOW_ROW);
    lv_obj_set_flex_align(btn_cont, LV_FLEX_ALIGN_SPACE_AROUND, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
    lv_obj_set_style_pad_all(btn_cont, 0, 0);
    lv_obj_set_style_bg_opa(btn_cont, LV_OPA_0, 0);
    lv_obj_set_style_border_width(btn_cont, 0, 0);

    /* 课表按钮 */
    lv_obj_t *timetable_btn = create_round_btn(btn_cont, NULL, COLOR_PRIMARY);
    lv_obj_set_size(timetable_btn, 60, 60); // 增大按钮
    lv_obj_t *timetable_label = lv_label_create(timetable_btn);
    lv_label_set_text(timetable_label, "Schedule");
    lv_obj_set_style_text_color(timetable_label, lv_color_white(), 0);
    lv_obj_set_style_text_font(timetable_label, &lv_font_montserrat_12, 0); // 调整字体大小
    lv_obj_center(timetable_label);
    lv_obj_set_user_data(timetable_btn, (void *)0);
    lv_obj_add_event_cb(timetable_btn, nav_btn_clicked, LV_EVENT_CLICKED, NULL);

    /* 成绩按钮 */
    lv_obj_t *grades_btn = create_round_btn(btn_cont, NULL, COLOR_SECONDARY);
    lv_obj_set_size(grades_btn, 60, 60); // 增大按钮
    lv_obj_t *grades_label = lv_label_create(grades_btn);
    lv_label_set_text(grades_label, "Grades");
    lv_obj_set_style_text_color(grades_label, lv_color_white(), 0);
    lv_obj_set_style_text_font(grades_label, &lv_font_montserrat_12, 0); // 调整字体大小
    lv_obj_center(grades_label);
    lv_obj_set_user_data(grades_btn, (void *)1);
    lv_obj_add_event_cb(grades_btn, nav_btn_clicked, LV_EVENT_CLICKED, NULL);

    /* 提醒按钮 */
    lv_obj_t *reminders_btn = create_round_btn(btn_cont, NULL, COLOR_ACCENT);
    lv_obj_set_size(reminders_btn, 60, 60); // 增大按钮
    lv_obj_t *reminders_label = lv_label_create(reminders_btn);
    lv_label_set_text(reminders_label, "Reminders");
    lv_obj_set_style_text_color(reminders_label, lv_color_white(), 0);
    lv_obj_set_style_text_font(reminders_label, &lv_font_montserrat_12, 0); // 调整字体大小
    lv_obj_center(reminders_label);
    lv_obj_set_user_data(reminders_btn, (void *)2);
    lv_obj_add_event_cb(reminders_btn, nav_btn_clicked, LV_EVENT_CLICKED, NULL);
}

/* 主函数：创建应用 */
void create_university_timetable_app(lv_obj_t *parent) {
    /* 设置背景 */
    lv_obj_set_style_bg_color(parent, COLOR_BG, 0);
    lv_obj_set_style_bg_opa(parent, LV_OPA_100, 0);

    /* 创建标签页 */
    g_tabview = lv_tabview_create(parent);
    lv_obj_set_size(g_tabview, lv_pct(100), lv_pct(100) - 140); // 为底部导航留出更多空间
    lv_obj_set_style_bg_opa(g_tabview, LV_OPA_0, 0);
    lv_obj_set_style_border_width(g_tabview, 0, 0);

    /* 隐藏标签页头部 */
    lv_obj_t *tab_btns = lv_tabview_get_tab_btns(g_tabview);
    lv_obj_set_height(tab_btns, 0);

    /* 创建三个标签页 */
    lv_obj_t *timetable_tab = lv_tabview_add_tab(g_tabview, "Schedule");
    lv_obj_t *grades_tab = lv_tabview_add_tab(g_tabview, "Grades");
    lv_obj_t *reminders_tab = lv_tabview_add_tab(g_tabview, "Reminders");

    /* 创建各页面内容 */
    create_timetable_tab(timetable_tab);
    create_grades_tab(grades_tab);
    create_reminders_tab(reminders_tab);

    /* 创建底部导航栏 */
    create_bottom_nav(parent);
}

/* 模拟课程提醒弹窗 */
void show_class_reminder(void) {
    printf("Creating class reminder messagebox...\n");

    lv_obj_t *mbox = lv_msgbox_create(NULL);
    lv_msgbox_add_title(mbox, "Class Reminder");
    lv_msgbox_add_text(mbox, "Advanced Mathematics class in 10 minutes\n\n\nLocation: Yifu Building 201");
    //lv_msgbox_add_footer_button(mbox, "Got it");
    lv_msgbox_add_close_button(mbox);

    /* 设置消息框样式 - 只设置内容区域，不覆盖整个屏幕 */
    lv_obj_set_style_bg_color(mbox, COLOR_CARD, LV_PART_MAIN);
    lv_obj_set_style_bg_opa(mbox, LV_OPA_100, LV_PART_MAIN);
    lv_obj_set_style_text_color(mbox, COLOR_TEXT, LV_PART_MAIN);
    lv_obj_set_style_border_width(mbox, 0, LV_PART_MAIN);
    lv_obj_set_style_radius(mbox, 15, LV_PART_MAIN);
    lv_obj_set_style_shadow_color(mbox, lv_color_hex(0x888888), LV_PART_MAIN);
    lv_obj_set_style_shadow_width(mbox, 10, LV_PART_MAIN);

    /* 设置按钮样式 */
    lv_obj_t *btn = lv_msgbox_get_footer(mbox);
    if (btn) {
        lv_obj_set_style_bg_color(btn, COLOR_PRIMARY, LV_PART_MAIN);
        lv_obj_set_style_text_color(btn, lv_color_white(), LV_PART_MAIN);
    }

    lv_obj_center(mbox);

    /* 添加事件回调 */
    lv_obj_add_event_cb(mbox, reminder_btn_clicked, LV_EVENT_CLICKED, NULL);

    printf("Class reminder messagebox created and event callback added\n");

}

/* 事件处理函数 */
static void weekday_btn_clicked(lv_event_t *e) {
    lv_obj_t *btn = lv_event_get_target(e);
    int day = (int)(intptr_t)lv_obj_get_user_data(btn);
    current_day = day;

    const char *weekdays[] = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
    lv_label_set_text_fmt(current_day_label, "Today: %s Week %d", weekdays[current_day-1], current_week);

    update_timetable_display();
}

static void week_minus_clicked(lv_event_t *e) {
    if (current_week > 1) {
        current_week--;
        lv_label_set_text_fmt(current_week_label, "Week %d", current_week);
        const char *weekdays[] = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
        lv_label_set_text_fmt(current_day_label, "Today: %s Week %d", weekdays[current_day-1], current_week);
    }
}

static void week_plus_clicked(lv_event_t *e) {
    if (current_week < 20) {
        current_week++;
        lv_label_set_text_fmt(current_week_label, "Week %d", current_week);
        const char *weekdays[] = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
        lv_label_set_text_fmt(current_day_label, "Today: %s Week %d", weekdays[current_day-1], current_week);
    }
}

static void add_reminder_clicked(lv_event_t *e) {
    lv_obj_t *msgbox = lv_msgbox_create(NULL);
    lv_msgbox_add_title(msgbox, "Add Reminder");
    lv_msgbox_add_text(msgbox, "This feature requires server connection\nPlease check network settings");
    lv_msgbox_add_footer_button(msgbox, "OK");
    lv_obj_center(msgbox);

    /* 为消息框添加用户数据以便识别 */
    lv_obj_set_user_data(msgbox, (void*)1);

    /* 添加事件回调来处理按钮点击 */
    lv_obj_add_event_cb(msgbox, reminder_btn_clicked, LV_EVENT_CLICKED, NULL);

    printf("Messagebox created and event callback added\n");
}

/* 导航按钮点击事件 */
static void nav_btn_clicked(lv_event_t *e) {
    lv_obj_t *btn = lv_event_get_target(e);
    int tab_idx = (int)(intptr_t)lv_obj_get_user_data(btn);
    if (g_tabview) {
        lv_tabview_set_act(g_tabview, tab_idx, LV_ANIM_ON);
    }
}

/* 提醒消息按钮点击事件 */
static void reminder_btn_clicked(lv_event_t *e) {

    printf("=== Event Handler Called ===\n");

    lv_event_code_t code = lv_event_get_code(e);
    printf("Event code: %d\n", code);

    lv_obj_t *target = lv_event_get_target(e);
    if (target) {
        printf("Target object type: %s\n", lv_obj_get_class(target)->name);
    }

    /* 检查是否是按钮点击事件 */
    if (code == LV_EVENT_CLICKED) {
        printf("CLICK EVENT DETECTED\n");

        /* 直接尝试删除目标对象（如果是消息框的话）*/
        if (lv_obj_check_type(target, &lv_msgbox_class)) {
            printf("Target is messagebox, deleting...\n");
            lv_obj_del(target);
            printf("Messagebox deleted successfully\n");
            return;
        }

        /* 向上查找消息框对象 */
        lv_obj_t *parent = lv_obj_get_parent(target);
        int attempts = 0;
        while (parent && attempts < 5) {
            printf("Checking parent %d: %s\n", attempts, lv_obj_get_class(parent)->name);

            if (lv_obj_check_type(parent, &lv_msgbox_class)) {
                printf("Found messagebox in parent chain, deleting...\n");
                lv_obj_del(parent);
                printf("Messagebox deleted successfully\n");
                return;
            }

            parent = lv_obj_get_parent(parent);
            attempts++;
        }
    }

    printf("Event handling completed\n");
    printf("==========================\n");
}

/**
 * 主函数
 * 初始化LVGL并启动大学课表应用
 */
int main(void) {
    /* 初始化LVGL库 */
    lv_init();

    /* 初始化Windows显示驱动 */
     lv_display_t *display = lv_windows_create_display(
        L"University Schedule",
        800,
        600,
        100,
        FALSE,
        FALSE
    );

    if (display == NULL) {
        printf("Failed to create Windows display\n");
        return -1;
    }

    /* 只初始化指针输入设备（鼠标），跳过键盘以避免缺少组件的错误 */
    lv_indev_t *mouse_indev = lv_windows_acquire_pointer_indev(display);
    if (!mouse_indev) {
        printf("Warning: pointer indev not created. Mouse won't work.\n");
    }
    lv_indev_t *kb_indev = lv_windows_acquire_keypad_indev(display);
    if (!kb_indev) {
        printf("Warning: keypad indev not created.\n");
    }
    /* 确保 LVGL 事件系统正常工作 */
    printf("LVGL event system initialized.\n");

    lv_obj_t *scr = lv_scr_act();
    if (scr == NULL) {
        printf("Failed to get active screen\n");
        return -1;
    }

    lv_obj_set_style_bg_color(scr, COLOR_BG, 0);
    lv_obj_set_style_bg_opa(scr, LV_OPA_100, 0);

    create_university_timetable_app(scr);
    // 暂时不显示提醒弹窗，避免遮挡界面
    show_class_reminder();

    const uint32_t loop_delay = 5; /* ms */
    /* 主循环：先 lv_tick_inc，再 lv_timer_handler */
    while (1) {
        lv_tick_inc(loop_delay);
        lv_timer_handler();
        Sleep(loop_delay);
    }

    return 0;
}
```
