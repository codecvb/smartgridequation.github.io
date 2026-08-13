---
title: Python录制高清视频录制软件电脑windows版
slug: python录制高清视频录制软件电脑windows版
category: Python 编程
summary: 本文介绍了一个基于Python的高清视频录制工具，使用OpenCV、Tkinter和PyAudio等库实现。该工具提供以下功能：1) 多摄像头选择和实时预览；2) 可调节分辨率(640x480/1280x720/1920x1080)和帧率(15/24/30/60fps)；3) 支持音频录制；4) 可选GPU加速预览；5) 直观的用户界面包含摄像头预览、参数设置和录制控制。工具采用多线程处理视频采集…
tags: Python
---

本文介绍了一个基于Python的高清视频录制工具，使用OpenCV、Tkinter和PyAudio等库实现。该工具提供以下功能：1) 多摄像头选择和实时预览；2) 可调节分辨率(640x480/1280x720/1920x1080)和帧率(15/24/30/60fps)；3) 支持音频录制；4) 可选GPU加速预览；5) 直观的用户界面包含摄像头预览、参数设置和录制控制。工具采用多线程处理视频采集、音频录制和界面更新，确保流畅操作体验。系统会自动检测可用设备和GPU支持，并提供错误处理和资源清理机制。


![](/uploads/csdn/python录制高清视频录制软件电脑windows版/img-01.png)


```python
import cv2
import numpy as np
import tkinter as tk
from tkinter import ttk
from tkinter import filedialog
from PIL import Image, ImageTk
import threading
import time
import os
import wave
import pyaudio
import queue

class VideoRecorder:
    def __init__(self, root):
        self.root = root
        self.root.title("高清视频录制工具")
        self.root.geometry("1000x700")
        self.root.resizable(True, True)

        # 设置主题
        self.style = ttk.Style()
        self.style.theme_use('clam')
        self.style.configure('TButton', font=('Arial', 12), padding=10)
        self.style.configure('TLabel', font=('Arial', 12))

        # 变量
        self.cap = None
        self.out = None
        self.preview_cap = None
        self.recording = False
        self.camera_index = 0
        self.frame_rate = 30
        self.resolution = (1280, 720)
        self.codec = cv2.VideoWriter_fourcc(*'XVID')
        self.output_file = "output_video.avi"
        self.thread = None
        self.current_preview_camera = -1
        self.current_preview_resolution = None

        # 音频相关变量
        self.audio = None
        self.audio_stream = None
        self.audio_thread = None
        self.audio_frames = []
        self.audio_device_index = -1
        self.audio_channels = 2
        self.audio_sample_rate = 44100
        self.audio_sample_width = 2

        # 预览相关变量
        self.preview_thread = None
        self.preview_running = False
        self.frame_queue = queue.Queue(maxsize=5)  # 增加队列大小
        self.use_gpu = False
        self.gpu_available = False
        self.preview_lock = threading.Lock()
        self.current_frame = None  # 存储当前帧用于预览

        # 创建主框架
        self.main_frame = ttk.Frame(root, padding=20)
        self.main_frame.pack(fill=tk.BOTH, expand=True)

        # 左侧：视频显示区域
        self.video_frame = ttk.LabelFrame(self.main_frame, text="摄像头预览", padding=10)
        self.video_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=10, pady=10)

        self.canvas = tk.Canvas(self.video_frame, bg="#2c3e50")
        self.canvas.pack(fill=tk.BOTH, expand=True)

        # 右侧：控制面板
        self.control_frame = ttk.LabelFrame(self.main_frame, text="控制面板", padding=10)
        self.control_frame.pack(side=tk.RIGHT, fill=tk.Y, padx=10, pady=10)

        # 摄像头选择
        ttk.Label(self.control_frame, text="摄像头选择：").pack(pady=5, anchor=tk.W)
        self.camera_var = tk.StringVar()
        self.camera_combobox = ttk.Combobox(self.control_frame, textvariable=self.camera_var, width=20)
        self.camera_combobox.pack(pady=5, fill=tk.X)
        self.camera_combobox.bind("<<ComboboxSelected>>", self.on_camera_change)

        # 音频设备选择
        ttk.Label(self.control_frame, text="录音设备：").pack(pady=5, anchor=tk.W)
        self.audio_var = tk.StringVar()
        self.audio_combobox = ttk.Combobox(self.control_frame, textvariable=self.audio_var, width=20)
        self.audio_combobox.pack(pady=5, fill=tk.X)

        # GPU加速选项
        self.gpu_var = tk.BooleanVar(value=False)
        self.gpu_checkbox = ttk.Checkbutton(self.control_frame, text="使用GPU加速预览", variable=self.gpu_var, command=self.toggle_gpu)
        self.gpu_checkbox.pack(pady=5, anchor=tk.W)

        # 分辨率选择
        ttk.Label(self.control_frame, text="分辨率：").pack(pady=5, anchor=tk.W)
        self.resolution_var = tk.StringVar(value="1280x720")
        resolution_options = ["640x480", "1280x720", "1920x1080"]
        self.resolution_combobox = ttk.Combobox(self.control_frame, textvariable=self.resolution_var, values=resolution_options, width=20)
        self.resolution_combobox.pack(pady=5, fill=tk.X)
        self.resolution_combobox.bind("<<ComboboxSelected>>", self.on_resolution_change)

        # 帧率选择
        ttk.Label(self.control_frame, text="帧率：").pack(pady=5, anchor=tk.W)
        self.fps_var = tk.StringVar(value="30")
        fps_options = ["15", "24", "30", "60"]
        self.fps_combobox = ttk.Combobox(self.control_frame, textvariable=self.fps_var, values=fps_options, width=20)
        self.fps_combobox.pack(pady=5, fill=tk.X)

        # 输出文件选择
        ttk.Label(self.control_frame, text="输出文件：").pack(pady=5, anchor=tk.W)
        self.file_frame = ttk.Frame(self.control_frame)
        self.file_frame.pack(fill=tk.X, pady=5)
        self.file_entry = ttk.Entry(self.file_frame, textvariable=tk.StringVar(value=self.output_file), width=15)
        self.file_entry.pack(side=tk.LEFT, fill=tk.X, expand=True)
        self.browse_button = ttk.Button(self.file_frame, text="浏览", command=self.browse_file)
        self.browse_button.pack(side=tk.RIGHT, padx=5)

        # 录制时间显示
        self.time_var = tk.StringVar(value="00:00:00")
        ttk.Label(self.control_frame, text="录制时间：").pack(pady=5, anchor=tk.W)
        ttk.Label(self.control_frame, textvariable=self.time_var, font=('Arial', 14, 'bold')).pack(pady=5, fill=tk.X)

        # 控制按钮
        self.button_frame = ttk.Frame(self.control_frame)
        self.button_frame.pack(fill=tk.X, pady=20)

        self.start_button = ttk.Button(self.button_frame, text="开始录制", command=self.start_recording, style='TButton')
        self.start_button.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=5)

        self.stop_button = ttk.Button(self.button_frame, text="停止录制", command=self.stop_recording, state=tk.DISABLED, style='TButton')
        self.stop_button.pack(side=tk.RIGHT, fill=tk.X, expand=True, padx=5)

        # 状态信息
        self.status_var = tk.StringVar(value="就绪")
        ttk.Label(self.control_frame, text="状态：").pack(pady=5, anchor=tk.W)
        self.status_label = ttk.Label(self.control_frame, textvariable=self.status_var, font=('Arial', 10), foreground="green")
        self.status_label.pack(pady=5, fill=tk.X)

        # 初始化
        self.detect_cameras()
        self.detect_audio_devices()
        self.check_gpu_available()
        self.start_preview_thread()
        self.update_preview()

        # 关闭窗口时的处理
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)

    def check_gpu_available(self):
        try:
            if hasattr(cv2, 'cuda') and cv2.cuda.getCudaEnabledDeviceCount() > 0:
                self.gpu_available = True
            else:
                self.gpu_available = False
        except:
            self.gpu_available = False

    def detect_cameras(self):
        cameras = []
        for i in range(5):
            cap = cv2.VideoCapture(i)
            if cap.isOpened():
                cameras.append(f"摄像头 {i}")
                cap.release()
        if cameras:
            self.camera_combobox['values'] = cameras
            self.camera_combobox.current(0)
            self.on_camera_change(None)
        else:
            self.status_var.set("未检测到摄像头")
            self.status_label.config(foreground="red")

    def detect_audio_devices(self):
        try:
            self.audio = pyaudio.PyAudio()
            audio_devices = []
            for i in range(self.audio.get_device_count()):
                device_info = self.audio.get_device_info_by_index(i)
                if device_info.get('maxInputChannels', 0) > 0:
                    audio_devices.append(f"{device_info['name']} (设备 {i})")

            if audio_devices:
                self.audio_combobox['values'] = audio_devices
                self.audio_combobox.current(0)
                self.audio_device_index = int(audio_devices[0].split('设备 ')[1][:-1])
            else:
                self.audio_combobox.set("无录音设备")
                self.audio_device_index = -1
        except Exception as e:
            self.audio_combobox.set("无录音设备")
            self.audio_device_index = -1

    def toggle_gpu(self):
        self.use_gpu = self.gpu_var.get()
        if self.use_gpu and not self.gpu_available:
            self.gpu_var.set(False)
            self.use_gpu = False
            self.status_var.set("GPU不可用，切换为CPU模式")
        else:
            self.status_var.set("GPU加速已启用" if self.use_gpu else "CPU模式")

    def on_camera_change(self, event):
        try:
            self.camera_index = int(self.camera_var.get().split()[1])
            self.restart_preview_camera()
        except:
            pass

    def on_resolution_change(self, event):
        self.restart_preview_camera()

    def restart_preview_camera(self):
        with self.preview_lock:
            if self.preview_cap:
                self.preview_cap.release()
                self.preview_cap = None
            self.current_preview_camera = -1
            self.current_preview_resolution = None

    def browse_file(self):
        file_path = filedialog.asksaveasfilename(
            defaultextension=".avi",
            filetypes=[("AVI视频", "*.avi"), ("MP4视频", "*.mp4"), ("所有文件", "*.*")]
        )
        if file_path:
            self.file_entry.delete(0, tk.END)
            self.file_entry.insert(0, file_path)

    def start_recording(self):
        self.start_button.config(state=tk.DISABLED)
        self.status_var.set("正在初始化...")
        self.status_label.config(foreground="orange")

        def init_recording():
            try:
                camera_index = int(self.camera_var.get().split()[1])
                width, height = map(int, self.resolution_var.get().split('x'))
                frame_rate = int(self.fps_var.get())
                output_file = self.file_entry.get()

                # 录制专用摄像头
                cap = cv2.VideoCapture(camera_index)
                if not cap.isOpened():
                    raise Exception("无法打开摄像头")

                cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
                cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
                cap.set(cv2.CAP_PROP_FPS, frame_rate)

                out = cv2.VideoWriter(output_file, self.codec, frame_rate, (width, height))
                if not out.isOpened():
                    cap.release()
                    raise Exception("无法创建视频文件")

                # 音频初始化
                audio_stream = None
                audio = None
                self.audio_frames.clear()

                if self.audio_device_index != -1:
                    try:
                        audio = pyaudio.PyAudio()
                        audio_stream = audio.open(
                            format=pyaudio.paInt16,
                            channels=self.audio_channels,
                            rate=self.audio_sample_rate,
                            input=True,
                            input_device_index=self.audio_device_index,
                            frames_per_buffer=1024
                        )
                    except Exception as e:
                        print(f"音频初始化失败: {e}")
                        if audio_stream:
                            audio_stream.close()
                        if audio:
                            audio.terminate()
                        audio = None
                        audio_stream = None

                # 赋值
                self.cap = cap
                self.out = out
                self.audio = audio
                self.audio_stream = audio_stream
                self.recording = True
                self.start_time = time.time()
                self.output_file = output_file

                # 启动录制线程（同时负责预览）
                self.thread = threading.Thread(target=self.record_and_preview)
                self.thread.daemon = True
                self.thread.start()

                # 启动音频线程
                if audio_stream is not None:
                    self.audio_thread = threading.Thread(target=self.record_audio)
                    self.audio_thread.daemon = True
                    self.audio_thread.start()

                self.root.after(0, lambda: self.stop_button.config(state=tk.NORMAL))
                self.root.after(0, lambda: self.status_var.set("录制中（含音频）" if audio_stream else "录制中（无音频）"))
                self.root.after(0, lambda: self.status_label.config(foreground="red"))

                # 停止独立的预览线程，因为录制线程会负责预览
                self.preview_running = False
                if self.preview_thread:
                    self.preview_thread.join(timeout=1)

            except Exception as e:
                self.cleanup_resources()
                self.root.after(0, lambda: self.status_var.set(f"错误：{str(e)}"))
                self.root.after(0, lambda: self.status_label.config(foreground="red"))
                self.root.after(0, lambda: self.start_button.config(state=tk.NORMAL))

        threading.Thread(target=init_recording, daemon=True).start()

    def record_and_preview(self):
        """录制线程同时负责预览"""
        last_frame_time = time.time()
        frame_interval = 1.0 / self.frame_rate
        preview_interval = 1.0 / 30  # 预览帧率30fps
        last_preview_time = time.time()

        while self.recording:
            ret, frame = self.cap.read()
            if ret:
                # 写入视频文件
                self.out.write(frame)

                # 更新时间显示
                elapsed = int(time.time() - self.start_time)
                h = elapsed // 3600
                m = (elapsed % 3600) // 60
                s = elapsed % 60
                self.root.after(0, lambda: self.time_var.set(f"{h:02d}:{m:02d}:{s:02d}"))

                # 处理预览帧
                current_time = time.time()
                if current_time - last_preview_time >= preview_interval:
                    # 复制帧用于预览（避免修改原帧）
                    preview_frame = frame.copy()

                    # 颜色转换
                    if self.use_gpu and self.gpu_available:
                        try:
                            gpu_mat = cv2.cuda_GpuMat()
                            gpu_mat.upload(preview_frame)
                            gpu_rgb = cv2.cuda.cvtColor(gpu_mat, cv2.COLOR_BGR2RGB)
                            preview_frame = gpu_rgb.download()
                        except:
                            preview_frame = cv2.cvtColor(preview_frame, cv2.COLOR_BGR2RGB)
                    else:
                        preview_frame = cv2.cvtColor(preview_frame, cv2.COLOR_BGR2RGB)

                    # 放入预览队列
                    if not self.frame_queue.full():
                        try:
                            self.frame_queue.put_nowait(preview_frame)
                        except:
                            pass

                    last_preview_time = current_time

                # 控制录制帧率
                sleep_time = frame_interval - (current_time - last_frame_time)
                if sleep_time > 0:
                    time.sleep(sleep_time)
                last_frame_time = current_time
            else:
                # 读取失败，稍后重试
                time.sleep(0.001)

    def record_audio(self):
        while self.recording:
            try:
                data = self.audio_stream.read(1024, exception_on_overflow=False)
                self.audio_frames.append(data)
            except:
                break

    def stop_recording(self):
        self.recording = False
        time.sleep(0.5)

        self.cleanup_resources()

        # 保存音频
        if self.audio_device_index != -1 and len(self.audio_frames) > 0:
            audio_file = os.path.splitext(self.output_file)[0] + "_audio.wav"
            try:
                wf = wave.open(audio_file, 'wb')
                wf.setnchannels(self.audio_channels)
                wf.setsampwidth(self.audio_sample_width)
                wf.setframerate(self.audio_sample_rate)
                wf.writeframes(b''.join(self.audio_frames))
                wf.close()
                print(f"音频已保存到: {audio_file}")
            except Exception as e:
                print(f"保存音频失败: {e}")

        self.start_button.config(state=tk.NORMAL)
        self.stop_button.config(state=tk.DISABLED)
        self.status_var.set("录制完成")
        self.status_label.config(foreground="green")
        self.time_var.set("00:00:00")

        # 重新启动独立的预览线程
        self.preview_running = True
        self.start_preview_thread()

    def cleanup_resources(self):
        if self.out:
            self.out.release()
            self.out = None
        if self.cap:
            self.cap.release()
            self.cap = None
        if self.audio_stream:
            try:
                self.audio_stream.stop_stream()
                self.audio_stream.close()
            except:
                pass
            self.audio_stream = None
        if self.audio:
            self.audio.terminate()
            self.audio = None

    def start_preview_thread(self):
        if not self.preview_running:
            self.preview_running = True
            self.preview_thread = threading.Thread(target=self.preview_loop, daemon=True)
            self.preview_thread.start()

    def preview_loop(self):
        """独立的预览循环（非录制状态）"""
        last_preview_time = time.time()
        preview_interval = 1.0 / 30

        while self.preview_running:
            # 只在非录制状态下进行独立预览
            if not self.recording:
                try:
                    with self.preview_lock:
                        w, h = map(int, self.resolution_var.get().split('x'))

                        # 检查是否需要重新初始化摄像头
                        if (self.current_preview_camera != self.camera_index or
                            self.current_preview_resolution != (w, h) or
                            self.preview_cap is None or not self.preview_cap.isOpened()):

                            if self.preview_cap:
                                self.preview_cap.release()

                            self.preview_cap = cv2.VideoCapture(self.camera_index)
                            if self.preview_cap and self.preview_cap.isOpened():
                                self.preview_cap.set(cv2.CAP_PROP_FRAME_WIDTH, w)
                                self.preview_cap.set(cv2.CAP_PROP_FRAME_HEIGHT, h)
                                self.current_preview_camera = self.camera_index
                                self.current_preview_resolution = (w, h)

                        # 读取帧
                        if self.preview_cap and self.preview_cap.isOpened():
                            ret, frame = self.preview_cap.read()
                            if ret:
                                # 颜色转换
                                if self.use_gpu and self.gpu_available:
                                    try:
                                        gpu_mat = cv2.cuda_GpuMat()
                                        gpu_mat.upload(frame)
                                        gpu_rgb = cv2.cuda.cvtColor(gpu_mat, cv2.COLOR_BGR2RGB)
                                        frame = gpu_rgb.download()
                                    except:
                                        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                                else:
                                    frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

                                # 放入队列
                                if not self.frame_queue.full():
                                    try:
                                        self.frame_queue.put_nowait(frame)
                                    except:
                                        pass
                except Exception as e:
                    pass

                # 控制预览帧率
                current_time = time.time()
                sleep_time = preview_interval - (current_time - last_preview_time)
                if sleep_time > 0:
                    time.sleep(sleep_time)
                last_preview_time = current_time
            else:
                # 录制中，休眠以节省CPU
                time.sleep(0.05)

    def update_preview(self):
        """更新预览显示"""
        try:
            if not self.frame_queue.empty():
                frame = self.frame_queue.get_nowait()

                # 获取画布大小并调整显示
                cw = self.canvas.winfo_width()
                ch = self.canvas.winfo_height()
                if cw > 0 and ch > 0:
                    fh, fw = frame.shape[:2]
                    ar = fw / fh
                    canvas_ar = cw / ch

                    if canvas_ar > ar:
                        nh = ch
                        nw = int(nh * ar)
                    else:
                        nw = cw
                        nh = int(nw / ar)

                    # 缩放图像
                    if self.use_gpu and self.gpu_available:
                        try:
                            gpu_mat = cv2.cuda_GpuMat()
                            gpu_mat.upload(frame)
                            gpu_resized = cv2.cuda.resize(gpu_mat, (nw, nh))
                            frame = gpu_resized.download()
                        except:
                            frame = cv2.resize(frame, (nw, nh))
                    else:
                        frame = cv2.resize(frame, (nw, nh))

                # 转换为ImageTk
                img = Image.fromarray(frame)
                imgtk = ImageTk.PhotoImage(img)

                cw = self.canvas.winfo_width()
                ch = self.canvas.winfo_height()
                fw, fh = img.size
                x = (cw - fw) // 2
                y = (ch - fh) // 2

                self.canvas.delete("all")
                self.canvas.create_image(x, y, anchor=tk.NW, image=imgtk)
                self.canvas.photo = imgtk
        except Exception as e:
            pass
        finally:
            self.root.after(30, self.update_preview)

    def on_closing(self):
        self.preview_running = False
        self.recording = False
        time.sleep(0.2)

        with self.preview_lock:
            if self.preview_cap:
                self.preview_cap.release()

        self.cleanup_resources()
        self.root.destroy()

if __name__ == "__main__":
    root = tk.Tk()
    app = VideoRecorder(root)
    root.mainloop()
```
