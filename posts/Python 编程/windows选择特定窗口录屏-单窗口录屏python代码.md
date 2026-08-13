---
title: Windows选择特定窗口录屏 单窗口录屏Python代码
slug: windows选择特定窗口录屏-单窗口录屏python代码
category: Python 编程
summary: 以下是一个带有界面操作的单窗口录屏 Python 程序，使用 tkinter 构建界面，结合 opencv 和 numpy 实现屏幕录制功能：
tags: Python
---

以下是一个带有界面操作的单窗口录屏 Python 程序，使用 tkinter 构建界面，结合 opencv 和 numpy 实现屏幕录制功能：


单窗口录屏工具（Python）


V1


```python
import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import cv2
import numpy as np
import pyautogui
import threading
import time
import win32gui
import win32con
import os
from datetime import datetime

class WindowRecorder:
    def __init__(self, root):
        self.root = root
        self.root.title("单窗口录屏工具")
        self.root.geometry("700x500")
        self.root.resizable(True, True)

        # 设置中文字体
        self.style = ttk.Style()
        self.style.configure("TLabel", font=("SimHei", 10))
        self.style.configure("TButton", font=("SimHei", 10))
        self.style.configure("TCombobox", font=("SimHei", 10))

        # 录制状态变量
        self.is_recording = False
        self.is_paused = False
        self.recorder_thread = None
        self.selected_window = None
        self.output_file = None
        self.fps = 15
        self.recording_start_time = 0
        self.recording_duration = 0
        self.timer_running = False

        # 创建界面
        self.create_widgets()

        # 刷新窗口列表
        self.refresh_window_list()

    def create_widgets(self):
        # 主框架
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.pack(fill=tk.BOTH, expand=True)

        # 左侧：窗口列表
        left_frame = ttk.LabelFrame(main_frame, text="可用窗口", padding="10")
        left_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 10))

        # 窗口列表
        self.window_listbox = tk.Listbox(left_frame, font=("SimHei", 10), width=30, height=15)
        self.window_listbox.pack(side=tk.TOP, fill=tk.BOTH, expand=True)
        self.window_listbox.bind('<<ListboxSelect>>', self.on_window_select)

        # 刷新按钮
        refresh_btn = ttk.Button(left_frame, text="刷新窗口列表", command=self.refresh_window_list)
        refresh_btn.pack(side=tk.BOTTOM, pady=10, fill=tk.X)

        # 右侧：控制区域
        right_frame = ttk.Frame(main_frame, padding="10")
        right_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)

        # 录制设置
        settings_frame = ttk.LabelFrame(right_frame, text="录制设置", padding="10")
        settings_frame.pack(fill=tk.X, pady=(0, 10))

        # FPS设置
        ttk.Label(settings_frame, text="帧率:").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.fps_var = tk.StringVar(value="15")
        fps_combobox = ttk.Combobox(settings_frame, textvariable=self.fps_var, values=["10", "15", "20", "30"], width=10)
        fps_combobox.grid(row=0, column=1, sticky=tk.W, pady=5)
        fps_combobox.bind("<<ComboboxSelected>>", lambda e: setattr(self, 'fps', int(self.fps_var.get())))

        # 保存路径
        ttk.Label(settings_frame, text="保存路径:").grid(row=1, column=0, sticky=tk.W, pady=5)
        self.save_path_var = tk.StringVar(value=os.path.expanduser("~") + "/Videos")
        ttk.Entry(settings_frame, textvariable=self.save_path_var, width=25).grid(row=1, column=1, sticky=tk.W, pady=5)
        browse_btn = ttk.Button(settings_frame, text="浏览...", command=self.browse_save_path)
        browse_btn.grid(row=1, column=2, padx=5, pady=5)

        # 录制控制
        control_frame = ttk.LabelFrame(right_frame, text="录制控制", padding="10")
        control_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 10))

        # 控制按钮
        btn_frame = ttk.Frame(control_frame)
        btn_frame.pack(expand=True)

        self.start_btn = ttk.Button(btn_frame, text="开始录制", command=self.start_recording, width=12)
        self.start_btn.grid(row=0, column=0, padx=5, pady=10)

        self.pause_btn = ttk.Button(btn_frame, text="暂停", command=self.pause_recording, width=12, state=tk.DISABLED)
        self.pause_btn.grid(row=0, column=1, padx=5, pady=10)

        self.stop_btn = ttk.Button(btn_frame, text="停止录制", command=self.stop_recording, width=12, state=tk.DISABLED)
        self.stop_btn.grid(row=0, column=2, padx=5, pady=10)

        # 状态显示
        status_frame = ttk.LabelFrame(right_frame, text="录制状态", padding="10")
        status_frame.pack(fill=tk.X, pady=(0, 10))

        self.status_var = tk.StringVar(value="就绪")
        ttk.Label(status_frame, textvariable=self.status_var).pack(anchor=tk.W)

        # 录制时间
        self.time_var = tk.StringVar(value="00:00:00")
        ttk.Label(status_frame, text="录制时间:").pack(anchor=tk.W, pady=(5, 0))
        ttk.Label(status_frame, textvariable=self.time_var, font=("SimHei", 12, "bold")).pack(anchor=tk.W)

        # 选中窗口信息
        self.window_info_var = tk.StringVar(value="未选择窗口")
        ttk.Label(status_frame, text="选中窗口:").pack(anchor=tk.W, pady=(5, 0))
        ttk.Label(status_frame, textvariable=self.window_info_var).pack(anchor=tk.W)

        # 底部信息
        ttk.Label(right_frame, text="提示: 选择一个窗口后点击开始录制", foreground="gray").pack(side=tk.BOTTOM, pady=10)

    def refresh_window_list(self):
        """刷新窗口列表"""
        self.window_listbox.delete(0, tk.END)
        self.windows = []

        # 枚举所有顶级窗口
        def callback(hwnd, extra):
            if win32gui.IsWindowVisible(hwnd):
                title = win32gui.GetWindowText(hwnd)
                if title:  # 只添加有标题的窗口
                    self.windows.append((hwnd, title))
                    self.window_listbox.insert(tk.END, title)

        win32gui.EnumWindows(callback, None)

    def on_window_select(self, event):
        """处理窗口选择事件"""
        selection = self.window_listbox.curselection()
        if selection:
            index = selection[0]
            self.selected_window = self.windows[index]
            self.window_info_var.set(self.selected_window[1])

    def browse_save_path(self):
        """浏览保存路径"""
        path = filedialog.askdirectory()
        if path:
            self.save_path_var.set(path)

    def start_recording(self):
        """开始录制"""
        if not self.selected_window:
            messagebox.showwarning("警告", "请先选择一个窗口")
            return

        if self.is_recording:
            return

        # 更新状态
        self.is_recording = True
        self.is_paused = False
        self.status_var.set("正在录制...")
        self.start_btn.config(state=tk.DISABLED)
        self.pause_btn.config(state=tk.NORMAL)
        self.stop_btn.config(state=tk.NORMAL)

        # 创建输出文件名
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.output_file = os.path.join(
            self.save_path_var.get(),
            f"window_recording_{timestamp}.mp4"
        )

        # 记录开始时间
        self.recording_start_time = time.time() - self.recording_duration
        self.start_timer()

        # 启动录制线程
        self.recorder_thread = threading.Thread(target=self.record_window)
        self.recorder_thread.daemon = True
        self.recorder_thread.start()

    def pause_recording(self):
        """暂停录制"""
        if not self.is_recording:
            return

        if self.is_paused:
            # 继续录制
            self.is_paused = False
            self.status_var.set("正在录制...")
            self.pause_btn.config(text="暂停")
            self.recording_start_time = time.time() - self.recording_duration
            self.start_timer()
        else:
            # 暂停录制
            self.is_paused = True
            self.status_var.set("已暂停")
            self.pause_btn.config(text="继续")
            self.recording_duration = time.time() - self.recording_start_time
            self.stop_timer()

    def stop_recording(self):
        """停止录制"""
        if not self.is_recording:
            return

        self.is_recording = False
        self.is_paused = False
        self.status_var.set("录制已停止")
        self.start_btn.config(state=tk.NORMAL)
        self.pause_btn.config(state=tk.DISABLED)
        self.stop_btn.config(state=tk.DISABLED)
        self.pause_btn.config(text="暂停")

        # 停止计时器
        self.stop_timer()
        self.recording_duration = 0

        # 等待录制线程结束
        if self.recorder_thread and self.recorder_thread.is_alive():
            self.recorder_thread.join()

        messagebox.showinfo("完成", f"录制已保存至:\n{self.output_file}")

    def record_window(self):
        """录制窗口的线程函数"""
        hwnd, title = self.selected_window

        # 获取窗口位置和大小
        rect = win32gui.GetWindowRect(hwnd)
        x, y, width, height = rect
        # 调整窗口大小（去除边框）
        client_rect = win32gui.GetClientRect(hwnd)
        border_width = (width - x - client_rect[2]) // 2
        title_bar_height = (height - y - client_rect[3]) - border_width
        x += border_width
        y += title_bar_height
        width = client_rect[2]
        height = client_rect[3]

        # 确保窗口可见且有有效尺寸
        if width <= 0 or height <= 0:
            messagebox.showerror("错误", "无法获取窗口尺寸，请确保窗口可见")
            self.stop_recording()
            return

        # 定义编码器并创建VideoWriter对象
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(self.output_file, fourcc, self.fps, (width, height))

        if not out.isOpened():
            messagebox.showerror("错误", "无法创建视频文件，请检查保存路径")
            self.stop_recording()
            return

        try:
            while self.is_recording:
                if not self.is_paused:
                    # 捕获窗口区域
                    screenshot = pyautogui.screenshot(region=(x, y, width, height))
                    frame = np.array(screenshot)
                    frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)  # 转换为OpenCV格式
                    out.write(frame)

                # 控制录制帧率
                time.sleep(1 / self.fps)
        finally:
            out.release()

    def start_timer(self):
        """启动录制计时器"""
        if not self.timer_running:
            self.timer_running = True
            self.update_timer()

    def update_timer(self):
        """更新录制时间显示"""
        if self.is_recording and not self.is_paused:
            elapsed = time.time() - self.recording_start_time
            hours = int(elapsed // 3600)
            minutes = int((elapsed % 3600) // 60)
            seconds = int(elapsed % 60)
            self.time_var.set(f"{hours:02d}:{minutes:02d}:{seconds:02d}")
            self.root.after(1000, self.update_timer)
        else:
            self.timer_running = False

if __name__ == "__main__":
    # 确保中文显示正常
    root = tk.Tk()
    app = WindowRecorder(root)
    root.mainloop()
```


创建时间：09-06 23:51


这个单窗口录屏工具具有以下功能：


1.

    **窗口选择**：自动检测并列出所有可见窗口，用户可以从中选择要录制的窗口


2.

    **录制控制**：


    -   开始录制
    -   暂停 / 继续录制
    -   停止录制并保存


3.

    **录制设置**：


    -   可调整录制帧率（10/15/20/30 FPS）
    -   可自定义视频保存路径


4.

    **状态显示**：


    -   实时显示录制时间
    -   显示当前选中的窗口
    -   显示录制状态（就绪 / 录制中 / 已暂停）


使用说明：


1.  运行程序后，会自动列出所有可见窗口
2.  从列表中选择要录制的窗口
3.  可以根据需要调整帧率和保存路径
4.  点击 "开始录制" 按钮开始录制
5.  录制过程中可以暂停或继续
6.  点击 "停止录制" 完成录制，视频会保存为 MP4 格式


注意事项：


-   需要安装所需依赖库：`pip install opencv-python numpy pyautogui pywin32`
-   程序适用于 Windows 系统
-   确保录制的窗口保持可见，最小化窗口可能无法正常录制
-   录制的视频默认保存在用户的 Videos 文件夹中


这个工具界面简洁，操作直观，适合需要对特定窗口进行录制的场景，如软件演示、游戏录制等。


录制效果如下


![](/uploads/csdn/windows选择特定窗口录屏-单窗口录屏python代码/img-01.gif)
