---
title: lvgl智能手表心跳脉搏波动显示数字动态图像
slug: lvgl智能手表心跳脉搏波动显示数字动态图像
category: 嵌入式与硬件
summary: 本文实现了一个基于LVGL的智能手表心率监测界面，主要功能包括：1) 动态显示心率数值(65-95随机变化)；2) 双色波纹扩散动画模拟心跳；3) 使用正弦波组合算法生成逼真的心电图波形；4) 可缩放跳动的3D心形图标；5) 圆形表盘UI设计。代码通过定时器驱动动画效果，包括波纹透明度渐变、心电图滚动显示和心形缩放效果。界面采用深灰背景配红白元素，包含心率数值显示区、心电图波形区和动态心形图标，模…
tags: 嵌入式, 物联网, LVGL, 图像处理
---

本文实现了一个基于LVGL的智能手表心率监测界面，主要功能包括：1) 动态显示心率数值(65-95随机变化)；2) 双色波纹扩散动画模拟心跳；3) 使用正弦波组合算法生成逼真的心电图波形；4) 可缩放跳动的3D心形图标；5) 圆形表盘UI设计。代码通过定时器驱动动画效果，包括波纹透明度渐变、心电图滚动显示和心形缩放效果。界面采用深灰背景配红白元素，包含心率数值显示区、心电图波形区和动态心形图标，模拟了智能手表的心率监测功能。


![](/uploads/csdn/lvgl智能手表心跳脉搏波动显示数字动态图像/img-01.gif)


```cpp
#include "lvgl/lvgl.h"
#include "lvgl/demos/lv_demos.h"
#include "lvgl/src/drivers/windows/lv_windows_display.h"
#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <math.h>

/* 定义手表尺寸和颜色 */
#define WATCH_SIZE 240
#define WATCH_BG_COLOR lv_color_hex(0x121212)    // 手表背景色（深灰）
#define WAVE_COLOR1 lv_color_hex(0xFF5252)       // 波纹颜色1（红色）
#define WAVE_COLOR2 lv_color_hex(0xFF8A80)       // 波纹颜色2（浅红）
#define TEXT_COLOR lv_color_hex(0xFFFFFF)        // 文字颜色（白色）

/* 全局变量 */
static lv_obj_t *watch_bg;          // 手表背景
static lv_obj_t *wave1, *wave2;     // 两层波纹
static lv_obj_t *hr_label;          // 心率数字标签
static lv_obj_t *ecg_chart;         // 心电图线条
static lv_point_precise_t ecg_points[40];   // 心电图点数组
static int current_hr = 78;         // 当前心率值
static lv_obj_t *heart_canvas;      // 心形画布
static int heart_beat_scale = 100;  // 心跳缩放比例
static int heart_beat_dir = 2;      // 心跳缩放方向

/* 生成柔和的心电图波形数据 - 使用正弦波组合 */
static int generate_ecg_value(int index)
{
    double t = (index % 60) / 60.0 * 2 * 3.14159265;  // 归一化到0-2π
    double value = 0;

    /* 基线 */
    value += 20;

    /* P波 - 小正弦波 (柔和的心跳前波) */
    value += 8 * sin(t * 1.0) * exp(-pow((t - 0.8) * 3, 2));

    /* QRS波群 - 主心跳 (使用多个正弦波组合) */
    /* Q波 - 小下陷 */
    value -= 5 * exp(-pow((t - 2.5) * 8, 2));
    /* R波 - 高峰 */
    value += 35 * exp(-pow((t - 2.8) * 5, 2));
    /* S波 - 下陷 */
    value -= 15 * exp(-pow((t - 3.1) * 6, 2));

    /* T波 - 大正弦波 (心跳后波) */
    value += 12 * sin(t * 0.8 + 1.0) * exp(-pow((t - 4.5) * 2, 2));

    /* 添加微小噪声使波形更自然 */
    value += (rand() % 3) - 1;

    return (int)value;
}

/* 绘制心形到画布 */
static void draw_heart_shape(lv_obj_t *canvas, int size, lv_color_t color)
{
    lv_draw_rect_dsc_t rect_dsc;
    lv_draw_rect_dsc_init(&rect_dsc);
    rect_dsc.bg_color = color;
    rect_dsc.bg_opa = LV_OPA_COVER;
    rect_dsc.radius = LV_RADIUS_CIRCLE;

    /* 清除画布 */
    lv_canvas_fill_bg(canvas, lv_color_hex(0x000000), LV_OPA_TRANSP);

    /* 初始化绘制层 */
    lv_layer_t layer;
    lv_canvas_init_layer(canvas, &layer);

    /* 使用数学公式绘制心形 */
    /* 心形参数方程: x = 16sin³(t), y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t) */
    int center_x = size / 2;
    int center_y = size / 2 + 2;
    float scale = size / 36.0f;

    for(float t = 0; t < 2 * 3.14159265; t += 0.05) {
        float x = 16 * pow(sin(t), 3);
        float y = 13 * cos(t) - 5 * cos(2*t) - 2 * cos(3*t) - cos(4*t);

        int px = center_x + (int)(x * scale);
        int py = center_y - (int)(y * scale);  /* 翻转Y轴 */

        /* 绘制小圆点形成心形 */
        lv_area_t area;
        area.x1 = px - 1;
        area.y1 = py - 1;
        area.x2 = px + 1;
        area.y2 = py + 1;
        lv_draw_rect(&layer, &rect_dsc, &area);
    }

    /* 完成绘制 */
    lv_canvas_finish_layer(canvas, &layer);
}

/* 心跳波纹动画定时器回调 */
static void wave_anim_timer(lv_timer_t *timer)
{
    static int angle = 0;
    static int alpha1 = 255, alpha2 = 180;
    static int dir1 = -5, dir2 = -3;
    static int ecg_offset = 0;

    /* 更新波纹角度（模拟扩散） */
    angle += 2;
    if(angle >= 360) angle = 0;

    /* 设置波纹角度 */
    lv_arc_set_angles(wave1, angle, angle + 180);
    lv_arc_set_angles(wave2, angle + 90, angle + 270);

    /* 更新波纹透明度（模拟淡入淡出） */
    alpha1 += dir1;
    alpha2 += dir2;

    if(alpha1 <= 50) dir1 = 5;
    if(alpha1 >= 255) dir1 = -5;
    if(alpha2 <= 50) dir2 = 3;
    if(alpha2 >= 200) dir2 = -3;

    /* 设置透明度 */
    lv_obj_set_style_opa(wave1, alpha1, LV_PART_MAIN);
    lv_obj_set_style_opa(wave2, alpha2, LV_PART_MAIN);

    /* 更新心电图波形 */
    ecg_offset++;
    for(int i = 0; i < 40; i++) {
        int value = generate_ecg_value(i + ecg_offset);
        /* 将波形倒置（因为屏幕Y轴向下）并居中 */
        ecg_points[i].y = 50 - value;
    }
    lv_line_set_points(ecg_chart, (const lv_point_t *)ecg_points, 40);

    /* 心跳动画 - 缩放效果 */
    heart_beat_scale += heart_beat_dir;
    if(heart_beat_scale >= 110) heart_beat_dir = -2;
    if(heart_beat_scale <= 100) heart_beat_dir = 2;

    /* 应用缩放 */
    int new_size = (30 * heart_beat_scale) / 100;
    lv_obj_set_size(heart_canvas, new_size, new_size);
    lv_obj_center(heart_canvas);
    lv_obj_align(heart_canvas, LV_ALIGN_CENTER, 0, 75);

    /* 随机更新心率值（模拟真实心率变化） */
    static int cnt = 0;
    if(++cnt >= 20) {
        cnt = 0;
        current_hr = 65 + rand() % 30;  // 心率范围 65-95
        char buf[8];
        snprintf(buf, sizeof(buf), "%d", current_hr);
        lv_label_set_text(hr_label, buf);
    }
}

/* 创建智能手表心率界面 */
static void create_watch_hr_ui(void)
{
    /* 1. 创建手表背景（圆形容器） */
    watch_bg = lv_obj_create(lv_scr_act());
    lv_obj_set_size(watch_bg, WATCH_SIZE, WATCH_SIZE);
    lv_obj_center(watch_bg);
    lv_obj_set_style_radius(watch_bg, LV_RADIUS_CIRCLE, LV_PART_MAIN);  // 设置为圆形
    lv_obj_set_style_bg_color(watch_bg, WATCH_BG_COLOR, LV_PART_MAIN);
    lv_obj_set_style_border_width(watch_bg, 2, LV_PART_MAIN);
    lv_obj_set_style_border_color(watch_bg, TEXT_COLOR, LV_PART_MAIN);
    lv_obj_set_style_border_opa(watch_bg, 50, LV_PART_MAIN);

    /* 2. 创建第一层心跳波纹（使用arc模拟） */
    wave1 = lv_arc_create(watch_bg);
    lv_obj_set_size(wave1, WATCH_SIZE * 0.7, WATCH_SIZE * 0.7);
    lv_obj_center(wave1);
    lv_arc_set_angles(wave1, 0, 180);
    lv_arc_set_bg_angles(wave1, 0, 360);
    lv_obj_set_style_arc_color(wave1, WAVE_COLOR1, LV_PART_MAIN);
    lv_obj_set_style_arc_width(wave1, 8, LV_PART_MAIN);
    lv_obj_set_style_arc_opa(wave1, 255, LV_PART_MAIN);
    lv_arc_set_mode(wave1, LV_ARC_MODE_NORMAL);
    lv_obj_add_flag(wave1, LV_OBJ_FLAG_HIDDEN);  // 隐藏背景圆弧
    lv_obj_clear_flag(wave1, LV_OBJ_FLAG_CLICKABLE);  // 禁用点击

    /* 3. 创建第二层心跳波纹 */
    wave2 = lv_arc_create(watch_bg);
    lv_obj_set_size(wave2, WATCH_SIZE * 0.8, WATCH_SIZE * 0.8);
    lv_obj_center(wave2);
    lv_arc_set_angles(wave2, 90, 270);
    lv_arc_set_bg_angles(wave2, 0, 360);
    lv_obj_set_style_arc_color(wave2, WAVE_COLOR2, LV_PART_MAIN);
    lv_obj_set_style_arc_width(wave2, 6, LV_PART_MAIN);
    lv_obj_set_style_arc_opa(wave2, 180, LV_PART_MAIN);
    lv_obj_add_flag(wave2, LV_OBJ_FLAG_HIDDEN);
    lv_obj_clear_flag(wave2, LV_OBJ_FLAG_CLICKABLE);

    /* 4. 创建心率数字显示标签 */
    hr_label = lv_label_create(watch_bg);
    lv_label_set_text(hr_label, "78");
    lv_obj_set_style_text_font(hr_label, &lv_font_montserrat_48, LV_PART_MAIN);
    lv_obj_set_style_text_color(hr_label, TEXT_COLOR, LV_PART_MAIN);
    lv_obj_align(hr_label, LV_ALIGN_CENTER, 0, -25);

    /* 5. 创建心电图波形线条 */
    ecg_chart = lv_line_create(watch_bg);
    /* 初始化心电图点 */
    for(int i = 0; i < 40; i++) {
        ecg_points[i].x = i * 4;  // X轴间距
        ecg_points[i].y = 50;     // 初始Y位置（居中）
    }
    lv_line_set_points(ecg_chart, (const lv_point_t *)ecg_points, 40);
    lv_obj_set_style_line_color(ecg_chart, WAVE_COLOR1, LV_PART_MAIN);
    lv_obj_set_style_line_width(ecg_chart, 2, LV_PART_MAIN);
    lv_obj_set_size(ecg_chart, 160, 100);
    lv_obj_align(ecg_chart, LV_ALIGN_CENTER, 0, 35);

    /* 6. 创建心形画布 */
    heart_canvas = lv_canvas_create(watch_bg);
    lv_obj_set_size(heart_canvas, 32, 32);

    /* 分配画布缓冲区 */
    static lv_color_t heart_buf[32 * 32];
    lv_canvas_set_buffer(heart_canvas, heart_buf, 32, 32, LV_COLOR_FORMAT_NATIVE);

    /* 绘制心形 */
    draw_heart_shape(heart_canvas, 32, WAVE_COLOR1);

    /* 设置心形位置 */
    lv_obj_align(heart_canvas, LV_ALIGN_CENTER, 0, 75);

    /* 添加发光效果 */
    lv_obj_set_style_shadow_width(heart_canvas, 15, LV_PART_MAIN);
    lv_obj_set_style_shadow_color(heart_canvas, WAVE_COLOR1, LV_PART_MAIN);
    lv_obj_set_style_shadow_opa(heart_canvas, LV_OPA_70, LV_PART_MAIN);
    lv_obj_set_style_shadow_spread(heart_canvas, 5, LV_PART_MAIN);

    /* 6. 创建定时器驱动动画（20ms刷新一次） */
    srand(time(NULL));  // 初始化随机数种子
    lv_timer_create(wave_anim_timer, 20, NULL);
}

/* LVGL初始化和主函数适配 */
int main(void)
{
    /* 1. LVGL初始化（Code::Blocks环境） */
    lv_init();

    /* 2. 初始化Windows显示驱动（LVGL v9 Windows后端） */
    lv_windows_create_display(
        L"LVGL Watch HR Demo",  // 窗口标题
        WATCH_SIZE * 2,         // 水平分辨率
        WATCH_SIZE * 2,         // 垂直分辨率
        100,                    // 缩放级别（100%）
        false,                  // 不允许DPI覆盖
        true                    // 模拟器模式
    );

    /* 3. 创建手表心率UI */
    create_watch_hr_ui();

    /* 4. LVGL主循环 - 需要调用lv_timer_handler来处理定时器和刷新 */
    while(1) {
        lv_timer_handler();  // 处理LVGL定时器（包括动画和屏幕刷新）
        Sleep(5);           // 延时5ms
    }

    return 0;
}
```
