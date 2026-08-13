---
title: Python制作太空人电子手表
slug: python制作太空人电子手表
category: Python 编程
summary: 这段代码实现了一个缩放版的太空人智能手表表盘界面，具有以下特点：
tags: Python
---

这段代码实现了一个缩放版的太空人智能手表表盘界面，具有以下特点：


1.  界面设计采用960x960圆形表盘，所有内容按80%比例缩放
2.  包含静态元素：表盘框架、刻度线、天气信息（温湿度/空气质量）、健康数据（血压/心率/步数/睡眠）、农历日期等
3.  动态显示当前时间（时分秒）并每秒更新
4.  中央太空人形象实现上下漂浮动画效果，伴有随机分布的星空背景
5.  使用Tkinter的Canvas绘图，通过图层管理实现动态刷新
6.  提供图片加载失败时的简单手绘太空人兜底方案


代码结构清晰，分为静态背景绘制、动态时间更新和太空人动画三个主要部分，通过定时器实现40ms刷新率的动画效果。


![](/uploads/csdn/python制作太空人电子手表/img-01.png)


代码


```python
import tkinter as tk
from tkinter import Canvas
import math
import random
from datetime import datetime
from PIL import Image, ImageTk

# ====================== 全局常量配置 ======================
WINDOW_SIZE = 960
CENTER = WINDOW_SIZE // 2
DIAL_RADIUS = 440       # 表盘白色大圆半径
SCALE = 0.8             # 内容压缩1/5，缩放至原80%
SAFE_MARGIN = 30
BG_WHITE = "#ffffff"
BLACK = "#000000"
RED_KEY = "#e62222"

# 表盘静态数据（和原图保持一致）
static_data = {
    "humidity": "80%",
    "air_quality": "空气(优质)",
    "temp_now": 24,
    "temp_high": 26,
    "temp_low": 20,
    "bp_low": 80,
    "bp_high": 128,
    "heart_rate": 97,
    "steps": 7645,
    "sleep_h": 7,
    "sleep_m": 30,
    "distance": 3.66,
    "lunar": "正月初五",
    "week_date": "周五 10-18",
    "solar_term": "冬至"
}

# 动画参数
astro_float_offset = 0
float_dir = 1
star_list = []
for _ in range(8):
    star_list.append({
        "dx": random.randint(-160, 160),
        "dy": random.randint(-100, 120),
        "size": random.randint(2, 5),
    })

# ====================== 初始化窗口 ======================
root = tk.Tk()
root.title("太空人表盘 - 内部内容压缩1/5版")
canvas = Canvas(root, width=WINDOW_SIZE, height=WINDOW_SIZE, bg="#222222")
canvas.pack()

# 图层标签
TAG_STATIC = "static"
TAG_DYNAMIC_TIME = "time"
TAG_DYNAMIC_ASTRO = "astro"
TAG_DYNAMIC_STAR = "star"

# 加载太空人图片，同步缩放
astro_tk_img = None
try:
    astro_img_raw = Image.open("person.png").convert("RGBA")
    base_w, base_h = 160, 160
    new_w, new_h = int(base_w * SCALE), int(base_h * SCALE)
    astro_img_raw = astro_img_raw.resize((new_w, new_h), Image.Resampling.LANCZOS)
    astro_tk_img = ImageTk.PhotoImage(astro_img_raw)
except Exception as e:
    print(f"未找到person.png，使用手绘替代：{e}")

# 坐标缩放工具函数：以屏幕中心为基准缩放
def scale_pos(x, y):
    dx = x - CENTER
    dy = y - CENTER
    return CENTER + dx * SCALE, CENTER + dy * SCALE

# 字号缩放工具
def scale_font(size):
    return int(size * SCALE)

# ====================== 绘制静态背景 ======================
def draw_static_background():
    c = CENTER
    outer_r = DIAL_RADIUS + SAFE_MARGIN
    # 手表黑色外框（不缩放）
    canvas.create_oval(
        c - outer_r - 35, c - outer_r - 35,
        c + outer_r + 35, c + outer_r + 35,
        fill="#101010", outline="#2a2a2a", width=12, tags=TAG_STATIC
    )
    # 白色表盘大圆（不缩放）
    canvas.create_oval(
        c - DIAL_RADIUS, c - DIAL_RADIUS,
        c + DIAL_RADIUS, c + DIAL_RADIUS,
        fill=BG_WHITE, outline=BLACK, width=5, tags=TAG_STATIC
    )
    # 顶部三角标识（缩放）
    tri_x1, tri_y1 = scale_pos(c, c - DIAL_RADIUS + 20)
    tri_x2, tri_y2 = scale_pos(c - 28, c - DIAL_RADIUS + 55)
    tri_x3, tri_y3 = scale_pos(c + 28, c - DIAL_RADIUS + 55)
    canvas.create_polygon(tri_x1, tri_y1, tri_x2, tri_y2, tri_x3, tri_y3, fill=BLACK, tags=TAG_STATIC)

    # 侧边红色按键（不缩放，表盘边框部件）
    canvas.create_rectangle(
        c + DIAL_RADIUS + 18, c - 160,
        c + DIAL_RADIUS + 68, c - 75,
        fill=RED_KEY, outline=BLACK, width=3, tags=TAG_STATIC
    )
    canvas.create_rectangle(
        c + DIAL_RADIUS + 18, c + 75,
        c + DIAL_RADIUS + 68, c + 160,
        fill=RED_KEY, outline=BLACK, width=3, tags=TAG_STATIC
    )

    # 表盘刻度线（缩放）
    for i in range(60):
        ang = math.radians(i * 6 - 90)
        r_out = DIAL_RADIUS * SCALE
        r_in = (DIAL_RADIUS - 65) * SCALE if i % 5 == 0 else (DIAL_RADIUS - 36) * SCALE
        x1 = c + r_out * math.cos(ang)
        y1 = c + r_out * math.sin(ang)
        x2 = c + r_in * math.cos(ang)
        y2 = c + r_in * math.sin(ang)
        w = 3 if i % 5 == 0 else 1
        canvas.create_line(x1, y1, x2, y2, fill=BLACK, width=w, tags=TAG_STATIC)

    # ---------------------- 顶部天气区（全部缩放） ----------------------
    top_x, top_y = scale_pos(0, c - 330)
    # 湿度
    x_hum, y_hum = scale_pos(c - 320, c - 330)
    canvas.create_text(x_hum, y_hum, text=static_data["humidity"],
                       font=("Arial", scale_font(42), "bold"), fill=BLACK, tags=TAG_STATIC)
    # 空气质量
    x_air, y_air = scale_pos(c - 100, c - 330 - 38)
    canvas.create_text(x_air, y_air, text=static_data["air_quality"],
                       font=("Arial", scale_font(26)), fill=BLACK, tags=TAG_STATIC)
    x_temp, y_temp = scale_pos(c - 100, c - 330)
    canvas.create_text(x_temp, y_temp, text=f'{static_data["temp_now"]}℃',
                       font=("Arial", scale_font(46), "bold"), fill=BLACK, tags=TAG_STATIC)
    # 高低温
    x_hight, y_hight = scale_pos(c + 80, c - 330 - 36)
    canvas.create_text(x_hight, y_hight, text=f'{static_data["temp_high"]}△',
                       font=("Arial", scale_font(40), "bold"), fill=BLACK, tags=TAG_STATIC)
    x_lowt, y_lowt = scale_pos(c + 80, c - 330 + 32)
    canvas.create_text(x_lowt, y_lowt, text=f'{static_data["temp_low"]}▽',
                       font=("Arial", scale_font(40), "bold"), fill=BLACK, tags=TAG_STATIC)
    # 雷雨云朵
    cx_cloud, cy_cloud = scale_pos(c + 240, c - 330)
    cloud_r = 60 * SCALE
    canvas.create_oval(cx_cloud - cloud_r, cy_cloud - cloud_r*0.43,
                       cx_cloud + cloud_r, cy_cloud + cloud_r*0.43,
                       fill=BG_WHITE, outline=BLACK, width=3, tags=TAG_STATIC)
    l1x1, l1y1 = scale_pos(c + 240 - 20, c - 330 + 24)
    l1x2, l1y2 = scale_pos(c + 240 - 5, c - 330 + 60)
    canvas.create_line(l1x1, l1y1, l1x2, l1y2, fill=BLACK, width=3, tags=TAG_STATIC)
    l2x1, l2y1 = scale_pos(c + 240 + 10, c - 330 + 24)
    l2x2, l2y2 = scale_pos(c + 240 + 25, c - 330 + 56)
    canvas.create_line(l2x1, l2y1, l2x2, l2y2, fill=BLACK, width=3, tags=TAG_STATIC)

    # ---------------------- 左侧血压心率 ----------------------
    x_bp, y_bp = scale_pos(c - 350, c + 160)
    canvas.create_text(x_bp, y_bp, text=f'{static_data["bp_low"]}-{static_data["bp_high"]}',
                       font=("Arial", scale_font(50), "bold"), fill=BLACK, tags=TAG_STATIC)
    # 心形图标
    h1x, h1y = scale_pos(c - 395, c + 160 + 68)
    h2x, h2y = scale_pos(c - 422, c + 160 + 110)
    h3x, h3y = scale_pos(c - 360, c + 160 + 110)
    canvas.create_polygon(h1x, h1y, h2x, h2y, h3x, h3y, fill=BLACK, tags=TAG_STATIC)
    x_hr, y_hr = scale_pos(c - 265, c + 160 + 90)
    canvas.create_text(x_hr, y_hr, text=f'{static_data["heart_rate"]}',
                       font=("Arial", scale_font(60), "bold"), fill=BLACK, tags=TAG_STATIC)

    # ---------------------- 右侧农历步数 ----------------------
    x_lunar, y_lunar = scale_pos(c + 250, c + 80)
    canvas.create_text(x_lunar, y_lunar, text=static_data["lunar"],
                       font=("Arial", scale_font(44)), fill=BLACK, tags=TAG_STATIC)
    x_wd, y_wd = scale_pos(c + 250, c + 80 + 70)
    canvas.create_text(x_wd, y_wd, text=static_data["week_date"],
                       font=("Arial", scale_font(44)), fill=BLACK, tags=TAG_STATIC)
    # 鞋子矩形
    s_x1, s_y1 = scale_pos(c + 90, c + 80 + 120)
    s_x2, s_y2 = scale_pos(c + 180, c + 80 + 168)
    canvas.create_rectangle(s_x1, s_y1, s_x2, s_y2, fill=BLACK, tags=TAG_STATIC)
    x_step, y_step = scale_pos(c + 310, c + 80 + 140)
    canvas.create_text(x_step, y_step, text=f'{static_data["steps"]}',
                       font=("Arial", scale_font(60), "bold"), fill=BLACK, tags=TAG_STATIC)

    # ---------------------- 底部睡眠、距离栏 ----------------------
    b_y_base = c + 320
    # 睡眠框
    sl_x1, sl_y1 = scale_pos(c - 370, b_y_base)
    sl_x2, sl_y2 = scale_pos(c - 30, b_y_base + 100)
    canvas.create_rectangle(sl_x1, sl_y1, sl_x2, sl_y2, outline=BLACK, width=3, tags=TAG_STATIC)
    x_sleep_txt, y_sleep_txt = scale_pos(c - 290, b_y_base + 40)
    canvas.create_text(x_sleep_txt, y_sleep_txt, text="睡眠",
                       font=("Arial", scale_font(36)), fill=BLACK, tags=TAG_STATIC)
    x_sleep_tm, y_sleep_tm = scale_pos(c - 120, b_y_base + 40)
    canvas.create_text(x_sleep_tm, y_sleep_tm, text=f'{static_data["sleep_h"]}h{static_data["sleep_m"]}m',
                       font=("Arial", scale_font(44), "bold"), fill=BLACK, tags=TAG_STATIC)
    # 距离框
    dis_x1, dis_y1 = scale_pos(c + 30, b_y_base)
    dis_x2, dis_y2 = scale_pos(c + 370, b_y_base + 100)
    canvas.create_rectangle(dis_x1, dis_y1, dis_x2, dis_y2, outline=BLACK, width=3, tags=TAG_STATIC)
    x_dis_txt, y_dis_txt = scale_pos(c + 250, b_y_base + 40)
    canvas.create_text(x_dis_txt, y_dis_txt, text="距离",
                       font=("Arial", scale_font(36)), fill=BLACK, tags=TAG_STATIC)
    x_dis_val, y_dis_val = scale_pos(c, b_y_base + 125)
    canvas.create_text(x_dis_val, y_dis_val, text=f'{static_data["distance"]} km',
                       font=("Arial", scale_font(50), "bold"), fill=BLACK, tags=TAG_STATIC)

# ====================== 动态时间绘制（缩放） ======================
def draw_dynamic_time():
    canvas.delete(TAG_DYNAMIC_TIME)
    c = CENTER
    now = datetime.now()
    h = now.hour
    m = now.minute
    s = now.second

    time_base_y = c - 110
    tx_h, ty_h = scale_pos(c - 150, time_base_y)
    canvas.create_text(tx_h, ty_h, text=f"{h:02d}",
                       font=("Arial", scale_font(160), "bold"), fill=BLACK, tags=TAG_DYNAMIC_TIME)
    tx_col, ty_col = scale_pos(c, time_base_y)
    canvas.create_text(tx_col, ty_col, text=":",
                       font=("Arial", scale_font(160), "bold"), fill=BLACK, tags=TAG_DYNAMIC_TIME)
    tx_m, ty_m = scale_pos(c + 140, time_base_y)
    canvas.create_text(tx_m, ty_m, text=f"{m:02d}",
                       font=("Arial", scale_font(160), "bold"), fill=BLACK, tags=TAG_DYNAMIC_TIME)
    # 节气秒数
    tx_term, ty_term = scale_pos(c + 320, time_base_y - 40)
    canvas.create_text(tx_term, ty_term, text=static_data["solar_term"],
                       font=("Arial", scale_font(38)), fill=BLACK, tags=TAG_DYNAMIC_TIME)
    tx_sec, ty_sec = scale_pos(c + 320, time_base_y + 32)
    canvas.create_text(tx_sec, ty_sec, text=f"{s:02d}",
                       font=("Arial", scale_font(110), "bold"), fill=BLACK, tags=TAG_DYNAMIC_TIME)

# ====================== 漂浮太空人动画（坐标缩放） ======================
def draw_astro_animation():
    global astro_float_offset, float_dir
    canvas.delete(TAG_DYNAMIC_ASTRO)
    canvas.delete(TAG_DYNAMIC_STAR)
    c = CENTER
    base_y = c + 60
    float_y = base_y + astro_float_offset

    # 浮动逻辑
    astro_float_offset += float_dir * 0.4
    if astro_float_offset > 16:
        float_dir = -1
    if astro_float_offset < -16:
        float_dir = 1

    astro_x, astro_y = scale_pos(c, float_y)
    if astro_tk_img is not None:
        canvas.create_image(astro_x, astro_y, image=astro_tk_img, tags=TAG_DYNAMIC_ASTRO)
    else:
        # 兜底手绘太空人同步缩放
        ox1, oy1 = scale_pos(c - 80, float_y - 100)
        ox2, oy2 = scale_pos(c + 10, float_y - 5)
        canvas.create_oval(ox1, oy1, ox2, oy2, fill=BLACK, tags=TAG_DYNAMIC_ASTRO)
        l1x1, l1y1 = scale_pos(c - 35, float_y)
        l1x2, l1y2 = scale_pos(c - 55, float_y + 110)
        canvas.create_line(l1x1, l1y1, l1x2, l1y2, fill=BLACK, width=4, tags=TAG_DYNAMIC_ASTRO)
        l2x1, l2y1 = scale_pos(c - 35, float_y)
        l2x2, l2y2 = scale_pos(c + 28, float_y + 100)
        canvas.create_line(l2x1, l2y1, l2x2, l2y2, fill=BLACK, width=4, tags=TAG_DYNAMIC_ASTRO)
        l3x1, l3y1 = scale_pos(c - 55, float_y + 110)
        l3x2, l3y2 = scale_pos(c + 8, float_y + 130)
        canvas.create_line(l3x1, l3y1, l3x2, l3y2, fill=BLACK, width=4, tags=TAG_DYNAMIC_ASTRO)
        l4x1, l4y1 = scale_pos(c + 28, float_y + 100)
        l4x2, l4y2 = scale_pos(c + 8, float_y + 130)
        canvas.create_line(l4x1, l4y1, l4x2, l4y2, fill=BLACK, width=4, tags=TAG_DYNAMIC_ASTRO)

    # 星空小点缩放坐标
    for star in star_list:
        sx_raw = c + star["dx"]
        sy_raw = float_y + star["dy"]
        sx, sy = scale_pos(sx_raw, sy_raw)
        s_size = star["size"] * SCALE
        if random.random() > 0.4:
            canvas.create_oval(sx - s_size, sy - s_size, sx + s_size, sy + s_size, fill=BLACK, tags=TAG_DYNAMIC_STAR)

# ====================== 主刷新循环 ======================
def main_loop():
    draw_dynamic_time()
    draw_astro_animation()
    root.after(40, main_loop)

# 启动绘制
draw_static_background()
main_loop()
root.mainloop()
```
