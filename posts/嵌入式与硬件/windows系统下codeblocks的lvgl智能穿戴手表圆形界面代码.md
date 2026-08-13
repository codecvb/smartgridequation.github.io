---
title: windows系统下codeblocks的lvgl智能穿戴手表圆形界面代码
slug: windows系统下codeblocks的lvgl智能穿戴手表圆形界面代码
category: 嵌入式与硬件
summary: windows系统下codeblocks的lvgl智能穿戴手表圆形界面代码（需要点需添加联系方式）
tags: 嵌入式, 物联网, LVGL
---

windows系统下codeblocks的lvgl智能穿戴手表圆形界面代码（需要点需添加联系方式）


这篇文章介绍了一个基于Windows系统下CodeBlocks的LVGL智能穿戴手表圆形界面实现代码。


主要功能包括：


1) 创建圆形表盘背景和刻度线；


2) 显示时间、日期和健康数据（步数、心率）；


3) 添加电池和网络状态图标；


4) 实现定时更新功能。代码使用LVGL图形库，通过创建定时器来模拟时间变化和健康数据更新。


界面设计采用320x320圆形屏幕，包含12个刻度标记，并合理布局了各类显示信息。该实现可作为智能手表UI的基础框架，如需完整代码或进一步交流，请通过指定方式联系作者。


效果如下


![](/uploads/csdn/windows系统下codeblocks的lvgl智能穿戴手表圆形界面代码/img-01.gif)


代码如下


main.c


```python

/**
 * @file main
 *
 */

/*********************
 *      INCLUDES
 *********************/
#include <stdlib.h>
#include <unistd.h>

#include "lvgl/lvgl.h"
#include "lvgl/demos/lv_demos.h"

/*********************
 *      DEFINES
 *********************/

/**********************
 *      TYPEDEFS
 **********************/

/**********************
 *  STATIC PROTOTYPES
 **********************/

/**********************
 *  STATIC VARIABLES
 **********************/
static const wchar_t * title = L"LVGL port Windows CodeBlocks.      https://lvgl.io | https://docs.lvgl.io";

/**********************
 *      MACROS
 **********************/

/* 圆形屏幕尺寸设置 */
#define SCREEN_WIDTH  320
#define SCREEN_HEIGHT 320
#define RADIUS        160  // 屏幕半径

/* 全局变量 */
static lv_obj_t *time_label;
static lv_obj_t *date_label;
static lv_obj_t *steps_label;
static lv_obj_t *heart_rate_label;
static lv_obj_t *battery_icon;
static lv_obj_t *wifi_icon;
static lv_obj_t *network_icon;

/* 虚构时间变量 */
static int fake_hour = 15;
static int fake_minute = 30;
static int fake_second = 0;
static int fake_day = 11;
static int fake_month = 9;
static char *months[] = {"Jan", "Feb", "Mar", "Apr", "May", "Jun",
                         "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
static char *weekdays[] = {"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"};

/* 更新虚构时间 */
static void update_fake_time(void)
{
    fake_second++;
    if(fake_second >= 60) {
        fake_second = 0;
        fake_minute++;
        if(fake_minute >= 60) {
            fake_minute = 0;
            fake_hour++;
            if(fake_hour >= 24) {
                fake_hour = 0;
                fake_day++;
                // 简单处理日期变更
            }
        }
    }
}

/* 更新时间显示 */
static void update_time(void *param)
{
    char time_str[9];
    char date_str[16];
    int weekday = (fake_day + 3) % 7; // 简单计算星期几

    // 更新虚构时间
    update_fake_time();

    /* 格式化时间字符串 */
    sprintf(time_str, "%02d:%02d:%02d", fake_hour, fake_minute, fake_second);
    lv_label_set_text(time_label, time_str);

    /* 格式化日期字符串 */
    sprintf(date_str, "%s, %s %02d", weekdays[weekday],
            months[fake_month - 1], fake_day);
    lv_label_set_text(date_label, date_str);

    /* 1秒后再次调用 */
    lv_timer_set_period(param, 1000);
}

/* 更新健康数据（模拟） */
static void update_health_data(void *param)
{
    static int steps = 5432;
    static int heart_rate = 72;

    /* 随机模拟数据变化 */
    steps += rand() % 5;
    heart_rate += (rand() % 5) - 2;
    if(heart_rate < 60) heart_rate = 60;
    if(heart_rate > 100) heart_rate = 100;

    /* 更新显示 */
    char steps_str[16];
    sprintf(steps_str, "Steps: %d", steps);
    lv_label_set_text(steps_label, steps_str);

    char hr_str[16];
    sprintf(hr_str, "Heart: %d BPM", heart_rate);
    lv_label_set_text(heart_rate_label, hr_str);

    /* 10秒后再次调用 */
    lv_timer_set_period(param, 10000);
}

/* 创建圆形表盘背景 */
static void create_circular_background(void)
{
    // 创建圆形背景
    lv_obj_t *bg = lv_obj_create(lv_scr_act());
    lv_obj_set_size(bg, SCREEN_WIDTH, SCREEN_HEIGHT);
    lv_obj_center(bg);
    lv_obj_set_style_radius(bg, LV_RADIUS_CIRCLE, 0);
    lv_obj_set_style_bg_color(bg, lv_color_hex(0x121212), 0);
    lv_obj_set_style_border_width(bg, 2, 0);
    lv_obj_set_style_border_color(bg, lv_color_hex(0x333333), 0);

    // 修改create_circular_background函数中的刻度线部分
    for(int i = 0; i < 12; i++) {
    lv_obj_t *mark = lv_obj_create(bg);
    // 根据位置调整刻度线的尺寸和方向，避免使用旋转
    if(i % 3 == 0) {
        lv_obj_set_size(mark, 2, 10);  // 长刻度
    } else {
        lv_obj_set_size(mark, 2, 6);   // 短刻度
    }
    lv_obj_set_style_radius(mark, 1, 0);
    lv_obj_set_style_bg_color(mark, lv_color_hex(0x555555), 0);

    // 计算刻度位置（圆形分布）
    float rad = (i * 30 - 90) * 3.1415926 / 180;  // 转换为弧度，-90度是顶部
    int x = (RADIUS - 5) * cos(rad);  // 调整位置，避免需要旋转
    int y = (RADIUS - 5) * sin(rad);

    lv_obj_align(mark, LV_ALIGN_CENTER, x, y);
    // 移除旋转相关代码
}
}

/* 创建电池图标 */
static void create_battery_icon(void)
{
    // 计算右上角位置（圆形屏幕边缘）
    float rad = (-45) * 3.1415926 / 180;  // 右上角45度位置
    int x = (RADIUS - 25) * cos(rad);
    int y = (RADIUS - 25) * sin(rad);

    battery_icon = lv_obj_create(lv_scr_act());
    lv_obj_set_size(battery_icon, 30, 15);
    lv_obj_align(battery_icon, LV_ALIGN_CENTER, x, y);
    lv_obj_set_style_radius(battery_icon, 2, 0);
    lv_obj_set_style_bg_color(battery_icon, lv_color_hex(0x00FF00), 0);

    /* 电池正极 */
    lv_obj_t *batt_pos = lv_obj_create(lv_scr_act());
    lv_obj_set_size(batt_pos, 3, 8);
    lv_obj_align_to(batt_pos, battery_icon, LV_ALIGN_OUT_RIGHT_MID, 0, 0);
    lv_obj_set_style_radius(batt_pos, 1, 0);
    lv_obj_set_style_bg_color(batt_pos, lv_color_hex(0x00FF00), 0);
}

/* 创建网络状态图标 */
static void create_network_icons(void)
{
    // 计算左上角位置（圆形屏幕边缘）
    float wifi_rad = (135) * 3.1415926 / 180;  // 左上角135度位置
    int wifi_x = (RADIUS - 30) * cos(wifi_rad);
    int wifi_y = (RADIUS - 30) * sin(wifi_rad)-200;

    // 创建WiFi图标（使用LVGL的符号字体）
    wifi_icon = lv_label_create(lv_scr_act());
    lv_obj_set_style_text_font(wifi_icon, &lv_font_montserrat_14, 0);
    lv_obj_set_style_text_color(wifi_icon, lv_color_hex(0xFFFFFF), 0);
    lv_label_set_text(wifi_icon, LV_SYMBOL_WIFI);
    lv_obj_align(wifi_icon, LV_ALIGN_CENTER, wifi_x, wifi_y);

    // 4G图标位置（在WiFi右侧）
    float net_rad = (120) * 3.1415926 / 180;  // 稍右一点
    int net_x = (RADIUS - 30) * cos(net_rad);
    int net_y = (RADIUS - 30) * sin(net_rad)-240;

    network_icon = lv_label_create(lv_scr_act());
    lv_obj_set_style_text_font(network_icon, &lv_font_montserrat_14, 0);
    lv_obj_set_style_text_color(network_icon, lv_color_hex(0xFFFFFF), 0);
    lv_label_set_text(network_icon, "4G");
    lv_obj_align(network_icon, LV_ALIGN_CENTER, net_x, net_y);
}

/* 创建主界面 */
static void create_main_screen(void)
{
    /* 设置背景为黑色 */
    lv_obj_set_style_bg_color(lv_scr_act(), lv_color_hex(0x000000), 0);

    /* 创建圆形表盘背景和刻度 */
    create_circular_background();

    /* 创建时间标签（居中显示） */
    time_label = lv_label_create(lv_scr_act());
    lv_obj_set_style_text_font(time_label, &lv_font_montserrat_48, 0);
    lv_obj_set_style_text_color(time_label, lv_color_hex(0xFFFFFF), 0);
    lv_label_set_text(time_label, "00:00:00");
    lv_obj_align(time_label, LV_ALIGN_CENTER, 0, -20);

    /* 创建日期标签（时间下方） */
    date_label = lv_label_create(lv_scr_act());
    lv_obj_set_style_text_font(date_label, &lv_font_montserrat_20, 0);
    lv_obj_set_style_text_color(date_label, lv_color_hex(0xBBBBBB), 0);
    lv_label_set_text(date_label, "Mon, Jan 01");
    lv_obj_align_to(date_label, time_label, LV_ALIGN_OUT_BOTTOM_MID, 0, 10);

    /* 创建步数标签（左下位置） */
    steps_label = lv_label_create(lv_scr_act());
    lv_obj_set_style_text_font(steps_label, &lv_font_montserrat_16, 0);
    lv_obj_set_style_text_color(steps_label, lv_color_hex(0xFFFFFF), 0);
    lv_label_set_text(steps_label, "Steps: 0");
    lv_obj_align(steps_label, LV_ALIGN_CENTER, -80, 100);

    /* 创建心率标签（右下位置） */
    heart_rate_label = lv_label_create(lv_scr_act());
    lv_obj_set_style_text_font(heart_rate_label, &lv_font_montserrat_16, 0);
    lv_obj_set_style_text_color(heart_rate_label, lv_color_hex(0xFFFFFF), 0);
    lv_label_set_text(heart_rate_label, "Heart: 0 BPM");
    lv_obj_align(heart_rate_label, LV_ALIGN_CENTER, 80, 100);

    /* 创建电池图标 */
    create_battery_icon();

    /* 创建网络状态图标 */
    create_network_icons();

    /* 创建定时器更新时间 */
    lv_timer_create(update_time, 1000, NULL);

    /* 创建定时器更新健康数据 */
    lv_timer_create(update_health_data, 10000, NULL);
}
/**********************
 *   GLOBAL FUNCTIONS
 **********************/
int APIENTRY WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR szCmdLine, int nCmdShow)
{
    /*Initialize LVGL*/
    lv_init();

    /*Initialize the HAL for LVGL*/
    lv_display_t * display = lv_windows_create_display(title, 800, 480, 100, FALSE, FALSE);
    lv_windows_acquire_pointer_indev(display);

    /*Output prompt information to the console, you can also use printf() to print directly*/
    LV_LOG_USER("LVGL initialization completed!");

    /* 创建主界面 */
    create_main_screen();

    while(1) {
        /* Periodically call the lv_task handler.
         * It could be done in a timer interrupt or an OS task too.*/
        lv_task_handler();
        usleep(5000);       /*Just to let the system breath*/
    }
    return 0;
}
```
