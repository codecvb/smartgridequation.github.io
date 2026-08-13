---
title: 无人机表演点云路径规划Python版
slug: 无人机表演点云路径规划python版
category: 人工智能
summary: 摘要：本文介绍了一个无人机表演路径规划系统，支持加载两个TXT格式的点云数据文件进行路径规划。系统采用PyQt5框架开发3D可视化界面，包含点云加载、路径优化、动画控制等功能模块。核心算法通过KD树实现点云匹配和路径优化，支持多种插值方式生成平滑动画。系统可调整无人机数量、大小、颜色等参数，提供3D可视化视图和轨迹显示功能，适用于大型无人机编队表演的路径规划需求。
tags: 人工智能, Python
---

摘要：本文介绍了一个无人机表演路径规划系统，支持加载两个TXT格式的点云数据文件进行路径规划。系统采用PyQt5框架开发3D可视化界面，包含点云加载、路径优化、动画控制等功能模块。核心算法通过KD树实现点云匹配和路径优化，支持多种插值方式生成平滑动画。系统可调整无人机数量、大小、颜色等参数，提供3D可视化视图和轨迹显示功能，适用于大型无人机编队表演的路径规划需求。


![](/uploads/csdn/无人机表演点云路径规划python版/img-01.png)


![](/uploads/csdn/无人机表演点云路径规划python版/img-02.png)


```python
"""
无人机表演路径规划系统
支持加载两个TXT点云数据文件进行路径规划
"""

import sys
import numpy as np
from scipy.spatial import KDTree
from PyQt5.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout,
                             QHBoxLayout, QPushButton, QLabel, QSlider, QGroupBox,
                             QSpinBox, QDoubleSpinBox, QGridLayout, QProgressBar,
                             QComboBox, QCheckBox, QFileDialog, QMessageBox, QLineEdit)
from PyQt5.QtCore import Qt, QTimer, pyqtSignal, QThread
from PyQt5.QtGui import QFont, QColor, QPalette
import pyqtgraph as pg
import pyqtgraph.opengl as gl
from pyqtgraph.opengl import GLViewWidget, GLScatterPlotItem, GLLinePlotItem, GLGridItem, GLAxisItem


class TXTPointCloudLoader:
    """TXT点云数据加载器"""

    @staticmethod
    def load_txt(file_path):
        """从TXT文件加载点云数据"""
        points = []
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith('#'):
                        continue
                    parts = line.split()
                    if len(parts) >= 3:
                        try:
                            x, y, z = float(parts[0]), float(parts[1]), float(parts[2])
                            points.append([x, y, z])
                        except ValueError:
                            continue

            if len(points) == 0:
                print(f"警告: 文件 {file_path} 中没有找到有效的点数据")
                return None

            points = np.array(points)
            print(f"成功加载 {len(points)} 个点")

            # 数据清洗：移除异常值
            mean = np.mean(points, axis=0)
            std = np.std(points, axis=0)
            points = points[np.all(np.abs(points - mean) < 3 * std, axis=1)]
            print(f"清洗后剩余 {len(points)} 个点")

            return points
        except Exception as e:
            print(f"加载点云失败: {e}")
            return None

    @staticmethod
    def preprocess_pointcloud(points, target_count=None):
        """预处理点云：下采样/上采样到目标数量"""
        if target_count is None:
            return points

        current_count = len(points)
        if current_count == target_count:
            return points

        if current_count > target_count:
            # 下采样
            indices = np.random.choice(current_count, target_count, replace=False)
            return points[indices]
        else:
            # 上采样：随机复制并添加噪声
            indices = np.random.choice(current_count, target_count - current_count, replace=True)
            new_points = points[indices].copy()
            # 添加微小噪声
            noise = np.random.normal(0, 0.005, new_points.shape)
            new_points += noise
            return np.vstack([points, new_points])

    @staticmethod
    def normalize_pointcloud(points):
        """归一化点云到标准范围"""
        # 计算中心
        center = np.mean(points, axis=0)
        # 移动到原点
        centered = points - center
        # 缩放以适应[-2, 2]范围
        max_dist = np.max(np.abs(centered))
        if max_dist == 0:
            max_dist = 1
        scale = 2.0 / max_dist
        return centered * scale, center, scale


class DronePathPlanner:
    """无人机路径规划器"""

    def __init__(self):
        self.source_positions = None
        self.target_positions = None
        self.num_drones = 800

    def load_pointcloud_from_txt(self, file_path, target_count=None):
        """从TXT文件加载点云"""
        points = TXTPointCloudLoader.load_txt(file_path)
        if points is None:
            return None

        if target_count is not None:
            points = TXTPointCloudLoader.preprocess_pointcloud(points, target_count)

        # 归一化
        points, center, scale = TXTPointCloudLoader.normalize_pointcloud(points)

        print(f"点云加载完成: {len(points)} 点")
        return points

    def optimize_paths(self, start_points, end_points):
        """优化路径规划，避免交叉碰撞"""
        n_points = len(start_points)

        # 使用KD树找到最近点对应
        kdtree_start = KDTree(start_points)
        kdtree_end = KDTree(end_points)

        # 双向匹配算法
        _, indices_start = kdtree_start.query(end_points)
        _, indices_end = kdtree_end.query(start_points)

        # 创建优化映射
        mapping = np.zeros(n_points, dtype=int)
        used_end = set()
        used_start = set()

        # 第一阶段：匹配双向最优的点对
        for i in range(n_points):
            if indices_end[indices_start[i]] == i and i not in used_end and indices_start[i] not in used_start:
                mapping[indices_start[i]] = i
                used_end.add(i)
                used_start.add(indices_start[i])

        # 第二阶段：处理剩余点
        remaining_start = [i for i in range(n_points) if i not in used_start]
        remaining_end = [i for i in range(n_points) if i not in used_end]

        if remaining_start and remaining_end:
            remaining_start_arr = np.array(remaining_start)
            remaining_end_arr = np.array(remaining_end)

            # 计算剩余点的距离矩阵
            dist_matrix = np.linalg.norm(
                start_points[remaining_start_arr][:, np.newaxis] - end_points[remaining_end_arr][np.newaxis, :],
                axis=2
            )

            # 贪心匹配
            for _ in range(min(len(remaining_start), len(remaining_end))):
                min_idx = np.unravel_index(np.argmin(dist_matrix), dist_matrix.shape)
                start_idx = remaining_start[min_idx[0]]
                end_idx = remaining_end[min_idx[1]]

                mapping[start_idx] = end_idx
                dist_matrix[min_idx[0], :] = np.inf
                dist_matrix[:, min_idx[1]] = np.inf

        # 重新排列终点
        return end_points[mapping]

    def interpolate_positions(self, start_pos, end_pos, progress, method='smooth'):
        """插值计算中间位置"""
        if method == 'linear':
            return start_pos + (end_pos - start_pos) * progress
        elif method == 'smooth':
            # 五次缓动函数
            t = progress
            smooth_t = t * t * t * (t * (6 * t - 15) + 10)
            return start_pos + (end_pos - start_pos) * smooth_t
        elif method == 'elastic':
            t = progress
            if t == 0 or t == 1:
                return start_pos + (end_pos - start_pos) * t
            c4 = (2 * np.pi) / 3
            elastic_t = -np.power(2, 10 * t - 10) * np.sin((t * 10 - 10.75) * c4)
            return start_pos + (end_pos - start_pos) * elastic_t
        elif method == 'bounce':
            t = progress
            n1 = 7.5625
            d1 = 2.75
            if t < 1 / d1:
                bounce_t = n1 * t * t
            elif t < 2 / d1:
                t = t - 1.5 / d1
                bounce_t = n1 * t * t + 0.75
            elif t < 2.5 / d1:
                t = t - 2.25 / d1
                bounce_t = n1 * t * t + 0.9375
            else:
                t = t - 2.625 / d1
                bounce_t = n1 * t * t + 0.984375
            return start_pos + (end_pos - start_pos) * bounce_t
        else:
            return start_pos + (end_pos - start_pos) * progress


class AnimationThread(QThread):
    """动画线程"""
    frame_ready = pyqtSignal(np.ndarray, float)
    finished_signal = pyqtSignal()

    def __init__(self, planner, start_pos, end_pos, duration=5.0, fps=30, method='smooth'):
        super().__init__()
        self.planner = planner
        self.start_pos = start_pos
        self.end_pos = end_pos
        self.duration = duration
        self.fps = fps
        self.method = method
        self.running = True
        self.paused = False

    def run(self):
        total_frames = int(self.duration * self.fps)
        for frame in range(total_frames):
            if not self.running:
                break
            while self.paused:
                if not self.running:
                    break
                self.msleep(100)
            if not self.running:
                break
            progress = frame / total_frames
            current_pos = self.planner.interpolate_positions(
                self.start_pos, self.end_pos, progress, self.method
            )
            self.frame_ready.emit(current_pos, progress)
            self.msleep(int(1000 / self.fps))
        self.finished_signal.emit()

    def stop(self):
        self.running = False
        self.paused = False

    def pause(self):
        self.paused = True

    def resume(self):
        self.paused = False


class DroneShowMainWindow(QMainWindow):
    """主窗口"""

    def __init__(self):
        super().__init__()
        self.setWindowTitle("🚁 无人机表演路径规划系统")
        self.setGeometry(100, 100, 1600, 1000)

        self.planner = DronePathPlanner()
        self.source_positions = None
        self.target_positions = None
        self.current_positions = None
        self.animation_thread = None
        self.trail_items = []

        self.source_file_path = ""
        self.target_file_path = ""

        self.init_ui()

    def init_ui(self):
        """初始化UI"""
        central = QWidget()
        self.setCentralWidget(central)
        main_layout = QHBoxLayout(central)
        main_layout.setSpacing(10)

        # 左侧控制面板
        control_panel = self._create_control_panel()
        main_layout.addWidget(control_panel, 1)

        # 右侧3D视图
        right_panel = self._create_right_panel()
        main_layout.addWidget(right_panel, 3)

        self._apply_styles()

    def _create_control_panel(self):
        """创建控制面板"""
        panel = QWidget()
        layout = QVBoxLayout(panel)
        layout.setSpacing(10)

        # 标题
        title = QLabel("🚁 无人机路径规划")
        title.setFont(QFont("Microsoft YaHei", 16, QFont.Bold))
        title.setStyleSheet("color: #ff6b6b;")
        title.setAlignment(Qt.AlignCenter)
        layout.addWidget(title)

        # 文件加载区域
        file_group = QGroupBox("📁 点云数据加载")
        file_layout = QGridLayout()

        # 源点云文件
        file_layout.addWidget(QLabel("源点云 (起点):"), 0, 0)
        self.source_path_edit = QLineEdit()
        self.source_path_edit.setPlaceholderText("选择源点云TXT文件...")
        file_layout.addWidget(self.source_path_edit, 0, 1)
        source_btn = QPushButton("浏览...")
        source_btn.clicked.connect(lambda: self.load_file('source'))
        file_layout.addWidget(source_btn, 0, 2)

        # 目标点云文件
        file_layout.addWidget(QLabel("目标点云 (终点):"), 1, 0)
        self.target_path_edit = QLineEdit()
        self.target_path_edit.setPlaceholderText("选择目标点云TXT文件...")
        file_layout.addWidget(self.target_path_edit, 1, 1)
        target_btn = QPushButton("浏览...")
        target_btn.clicked.connect(lambda: self.load_file('target'))
        file_layout.addWidget(target_btn, 1, 2)

        file_group.setLayout(file_layout)
        layout.addWidget(file_group)

        # 无人机设置
        drone_group = QGroupBox("⚙️ 无人机设置")
        drone_layout = QGridLayout()

        drone_layout.addWidget(QLabel("无人机数量:"), 0, 0)
        self.drone_count_spin = QSpinBox()
        self.drone_count_spin.setRange(100, 3000)
        self.drone_count_spin.setValue(800)
        self.drone_count_spin.setSingleStep(100)
        drone_layout.addWidget(self.drone_count_spin, 0, 1)

        drone_layout.addWidget(QLabel("无人机大小:"), 1, 0)
        self.drone_size_spin = QDoubleSpinBox()
        self.drone_size_spin.setRange(0.01, 0.3)
        self.drone_size_spin.setValue(0.05)
        self.drone_size_spin.setSingleStep(0.01)
        drone_layout.addWidget(self.drone_size_spin, 1, 1)

        drone_layout.addWidget(QLabel("颜色模式:"), 2, 0)
        self.color_combo = QComboBox()
        self.color_combo.addItems(["高度渐变", "彩虹色", "单色"])
        drone_layout.addWidget(self.color_combo, 2, 1)

        drone_group.setLayout(drone_layout)
        layout.addWidget(drone_group)

        # 动画设置
        anim_group = QGroupBox("🎬 动画设置")
        anim_layout = QGridLayout()

        anim_layout.addWidget(QLabel("动画时长(秒):"), 0, 0)
        self.duration_spin = QDoubleSpinBox()
        self.duration_spin.setRange(1, 30)
        self.duration_spin.setValue(5)
        self.duration_spin.setSingleStep(0.5)
        drone_layout.addWidget(self.duration_spin, 0, 1)

        anim_layout.addWidget(QLabel("帧率(FPS):"), 1, 0)
        self.fps_spin = QSpinBox()
        self.fps_spin.setRange(10, 120)
        self.fps_spin.setValue(30)
        anim_layout.addWidget(self.fps_spin, 1, 1)

        anim_layout.addWidget(QLabel("插值方式:"), 2, 0)
        self.interp_combo = QComboBox()
        self.interp_combo.addItems(["平滑过渡", "弹性效果", "弹跳效果", "线性过渡"])
        anim_layout.addWidget(self.interp_combo, 2, 1)

        anim_group.setLayout(anim_layout)
        layout.addWidget(anim_group)

        # 视图控制
        view_group = QGroupBox("👁️ 视图控制")
        view_layout = QVBoxLayout()

        self.show_source_btn = QPushButton("📍 显示源点云")
        self.show_source_btn.clicked.connect(self.show_source)
        self.show_source_btn.setEnabled(False)
        view_layout.addWidget(self.show_source_btn)

        self.show_target_btn = QPushButton("🎯 显示目标点云")
        self.show_target_btn.clicked.connect(self.show_target)
        self.show_target_btn.setEnabled(False)
        view_layout.addWidget(self.show_target_btn)

        self.toggle_rotation_btn = QPushButton("🔄 自动旋转")
        self.toggle_rotation_btn.setCheckable(True)
        self.toggle_rotation_btn.clicked.connect(self.toggle_rotation)
        view_layout.addWidget(self.toggle_rotation_btn)

        self.reset_view_btn = QPushButton("🔃 重置视图")
        self.reset_view_btn.clicked.connect(self.reset_view)
        view_layout.addWidget(self.reset_view_btn)

        view_group.setLayout(view_layout)
        layout.addWidget(view_group)

        # 动画控制
        play_group = QGroupBox("▶️ 动画控制")
        play_layout = QVBoxLayout()

        self.play_btn = QPushButton("▶️ 开始变换")
        self.play_btn.clicked.connect(self.start_animation)
        self.play_btn.setStyleSheet("background-color: #ff6b6b;")
        self.play_btn.setEnabled(False)
        play_layout.addWidget(self.play_btn)

        btn_layout = QHBoxLayout()
        self.pause_btn = QPushButton("⏸️ 暂停")
        self.pause_btn.clicked.connect(self.pause_animation)
        self.pause_btn.setEnabled(False)
        btn_layout.addWidget(self.pause_btn)

        self.stop_btn = QPushButton("⏹️ 停止")
        self.stop_btn.clicked.connect(self.stop_animation)
        self.stop_btn.setEnabled(False)
        btn_layout.addWidget(self.stop_btn)
        play_layout.addLayout(btn_layout)

        # 进度条
        self.progress_bar = QProgressBar()
        self.progress_bar.setValue(0)
        play_layout.addWidget(self.progress_bar)

        # 进度滑块
        self.progress_slider = QSlider(Qt.Horizontal)
        self.progress_slider.setRange(0, 100)
        self.progress_slider.setValue(0)
        self.progress_slider.valueChanged.connect(self.on_slider_changed)
        play_layout.addWidget(self.progress_slider)

        play_group.setLayout(play_layout)
        layout.addWidget(play_group)

        # 显示选项
        display_group = QGroupBox("📊 显示选项")
        display_layout = QVBoxLayout()

        self.show_grid_check = QCheckBox("显示网格")
        self.show_grid_check.setChecked(True)
        self.show_grid_check.stateChanged.connect(self.toggle_grid)
        display_layout.addWidget(self.show_grid_check)

        self.show_axes_check = QCheckBox("显示坐标轴")
        self.show_axes_check.setChecked(True)
        self.show_axes_check.stateChanged.connect(self.toggle_axes)
        display_layout.addWidget(self.show_axes_check)

        self.show_trails_check = QCheckBox("显示轨迹")
        self.show_trails_check.setChecked(False)
        display_layout.addWidget(self.show_trails_check)

        display_group.setLayout(display_layout)
        layout.addWidget(display_group)

        # 状态信息
        status_group = QGroupBox("📈 状态信息")
        status_layout = QVBoxLayout()

        self.status_label = QLabel("请加载两个点云文件")
        self.status_label.setAlignment(Qt.AlignCenter)
        status_layout.addWidget(self.status_label)

        self.source_info_label = QLabel("源点云: 未加载")
        status_layout.addWidget(self.source_info_label)

        self.target_info_label = QLabel("目标点云: 未加载")
        status_layout.addWidget(self.target_info_label)

        self.drone_info_label = QLabel("无人机数量: 0")
        status_layout.addWidget(self.drone_info_label)

        status_group.setLayout(status_layout)
        layout.addWidget(status_group)

        layout.addStretch()
        return panel

    def _create_right_panel(self):
        """创建右侧3D视图面板"""
        panel = QWidget()
        layout = QVBoxLayout(panel)
        layout.setContentsMargins(0, 0, 0, 0)

        # 3D视图
        self.view = GLViewWidget()
        self.view.setCameraPosition(distance=12, elevation=30, azimuth=45)
        self.view.setBackgroundColor('#0a0a1a')

        # 添加网格
        self.grid = GLGridItem()
        self.grid.setSize(20, 20)
        self.grid.setSpacing(1, 1)
        self.grid.setColor((0.2, 0.2, 0.3, 0.5))
        self.view.addItem(self.grid)

        # 添加坐标轴
        self.axis = GLAxisItem()
        self.axis.setSize(4, 4, 4)
        self.view.addItem(self.axis)

        # 散点图
        self.scatter = GLScatterPlotItem()
        self.view.addItem(self.scatter)

        layout.addWidget(self.view)

        # 创建自动旋转定时器
        self.rotation_timer = QTimer()
        self.rotation_timer.timeout.connect(self.auto_rotate)
        self.rotation_angle = 45

        return panel

    def _apply_styles(self):
        """应用样式"""
        self.setStyleSheet("""
            QMainWindow {
                background-color: #1a1a2e;
            }
            QGroupBox {
                background-color: #16213e;
                color: #e6e6e6;
                border: 2px solid #0f3460;
                border-radius: 8px;
                margin-top: 10px;
                padding-top: 15px;
                font-size: 12px;
                font-weight: bold;
            }
            QGroupBox::title {
                subcontrol-origin: margin;
                left: 15px;
                padding: 0 8px;
                color: #ff6b6b;
            }
            QPushButton {
                background-color: #0f3460;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                font-weight: bold;
                font-size: 12px;
            }
            QPushButton:hover {
                background-color: #e94560;
            }
            QPushButton:pressed {
                background-color: #c13651;
            }
            QPushButton:disabled {
                background-color: #444;
                color: #888;
            }
            QLabel {
                color: #e6e6e6;
                font-size: 12px;
            }
            QLineEdit {
                background-color: #0f3460;
                color: white;
                border: 1px solid #1a4a7a;
                padding: 5px;
                border-radius: 4px;
            }
            QSlider::groove:horizontal {
                height: 8px;
                background: #0f3460;
                border-radius: 4px;
            }
            QSlider::handle:horizontal {
                background: #ff6b6b;
                width: 18px;
                margin: -5px 0;
                border-radius: 9px;
            }
            QProgressBar {
                border: 2px solid #0f3460;
                border-radius: 5px;
                text-align: center;
                color: white;
            }
            QProgressBar::chunk {
                background-color: #ff6b6b;
                border-radius: 3px;
            }
            QSpinBox, QDoubleSpinBox, QComboBox {
                background-color: #0f3460;
                color: white;
                border: none;
                padding: 5px;
                border-radius: 4px;
            }
            QCheckBox {
                color: #e6e6e6;
            }
            QCheckBox::indicator {
                width: 18px;
                height: 18px;
            }
        """)

    def load_file(self, file_type):
        """加载点云文件"""
        file_path, _ = QFileDialog.getOpenFileName(
            self,
            f"选择{'源' if file_type == 'source' else '目标'}点云文件",
            "",
            "TXT Files (*.txt);;All Files (*)"
        )

        if not file_path:
            return

        target_count = self.drone_count_spin.value()
        points = self.planner.load_pointcloud_from_txt(file_path, target_count)

        if points is None:
            QMessageBox.warning(self, "加载失败", f"无法加载文件:\n{file_path}")
            return

        if file_type == 'source':
            self.source_positions = points
            self.source_file_path = file_path
            self.source_path_edit.setText(file_path)
            self.source_info_label.setText(f"源点云: {len(points)} 点")
            self.show_source_btn.setEnabled(True)
        else:
            self.target_positions = points
            self.target_file_path = file_path
            self.target_path_edit.setText(file_path)
            self.target_info_label.setText(f"目标点云: {len(points)} 点")
            self.show_target_btn.setEnabled(True)

        # 更新无人机数量
        self.drone_count_spin.setValue(len(points))
        self.drone_info_label.setText(f"无人机数量: {len(points)}")

        # 检查是否可以开始动画
        if self.source_positions is not None and self.target_positions is not None:
            # 确保两个点云数量一致
            if len(self.source_positions) != len(self.target_positions):
                # 重新采样到相同数量
                count = max(len(self.source_positions), len(self.target_positions))
                self.source_positions = TXTPointCloudLoader.preprocess_pointcloud(
                    self.source_positions, count
                )
                self.target_positions = TXTPointCloudLoader.preprocess_pointcloud(
                    self.target_positions, count
                )
                self.drone_count_spin.setValue(count)
                self.drone_info_label.setText(f"无人机数量: {count}")

            # 优化路径
            self.target_positions = self.planner.optimize_paths(
                self.source_positions, self.target_positions
            )

            self.play_btn.setEnabled(True)
            self.status_label.setText("✅ 准备就绪，可以开始动画")
            self.show_source()
        else:
            self.status_label.setText(f"✅ {'源' if file_type == 'source' else '目标'}点云已加载，请加载另一个")

    def show_source(self):
        """显示源点云"""
        if self.source_positions is not None:
            self.current_positions = self.source_positions.copy()
            self.update_scatter()
            self.clear_trails()
            self.progress_slider.setValue(0)
            self.progress_bar.setValue(0)
            self.status_label.setText("📍 显示: 源点云")

    def show_target(self):
        """显示目标点云"""
        if self.target_positions is not None:
            self.current_positions = self.target_positions.copy()
            self.update_scatter()
            self.clear_trails()
            self.progress_slider.setValue(100)
            self.progress_bar.setValue(100)
            self.status_label.setText("🎯 显示: 目标点云")

    def update_scatter(self):
        """更新散点显示"""
        if self.current_positions is None:
            return

        pos = self.current_positions
        size = self.drone_size_spin.value()

        # 根据颜色模式设置颜色
        color_mode = self.color_combo.currentIndex()
        colors = []

        if color_mode == 0:  # 高度渐变
            for p in pos:
                y = p[1]
                r = min(1.0, max(0.0, (y + 2) / 4))
                b = min(1.0, max(0.0, (2 - y) / 4))
                g = 0.3
                colors.append([r, g, b, 1.0])
        elif color_mode == 1:  # 彩虹色
            for i, p in enumerate(pos):
                hue = (i / len(pos)) * 360
                r, g, b = self.hsv_to_rgb(hue, 0.8, 1.0)
                colors.append([r, g, b, 1.0])
        else:  # 单色
            colors = [[0.2, 0.8, 1.0, 1.0]] * len(pos)

        colors = np.array(colors)

        self.scatter.setData(
            pos=pos,
            size=size,
            color=colors,
            pxMode=False
        )

    def hsv_to_rgb(self, h, s, v):
        """HSV转RGB"""
        h = h / 360.0
        i = int(h * 6)
        f = h * 6 - i
        p = v * (1 - s)
        q = v * (1 - f * s)
        t = v * (1 - (1 - f) * s)

        i = i % 6
        if i == 0: return v, t, p
        if i == 1: return q, v, p
        if i == 2: return p, v, t
        if i == 3: return p, q, v
        if i == 4: return t, p, v
        return v, p, q

    def clear_trails(self):
        """清除轨迹"""
        for item in self.trail_items:
            self.view.removeItem(item)
        self.trail_items = []

    def auto_rotate(self):
        """自动旋转视图"""
        self.rotation_angle += 0.5
        self.view.setCameraPosition(azimuth=self.rotation_angle)

    def toggle_rotation(self):
        """切换自动旋转"""
        if self.toggle_rotation_btn.isChecked():
            self.rotation_timer.start(30)
        else:
            self.rotation_timer.stop()

    def reset_view(self):
        """重置视图"""
        self.rotation_angle = 45
        self.view.setCameraPosition(distance=12, elevation=30, azimuth=45)

    def toggle_grid(self):
        """切换网格显示"""
        self.grid.setVisible(self.show_grid_check.isChecked())

    def toggle_axes(self):
        """切换坐标轴显示"""
        self.axis.setVisible(self.show_axes_check.isChecked())

    def start_animation(self):
        """开始动画"""
        if self.animation_thread and self.animation_thread.isRunning():
            return

        self.clear_trails()
        self.status_label.setText("🚀 动画播放中...")
        self.play_btn.setEnabled(False)
        self.pause_btn.setEnabled(True)
        self.stop_btn.setEnabled(True)

        # 获取动画参数
        interpolation_map = {
            "平滑过渡": 'smooth',
            "弹性效果": 'elastic',
            "弹跳效果": 'bounce',
            "线性过渡": 'linear'
        }
        method = interpolation_map.get(self.interp_combo.currentText(), 'smooth')

        self.animation_thread = AnimationThread(
            self.planner,
            self.source_positions,
            self.target_positions,
            self.duration_spin.value(),
            self.fps_spin.value(),
            method
        )
        self.animation_thread.frame_ready.connect(self.on_frame_ready)
        self.animation_thread.finished_signal.connect(self.on_animation_finished)
        self.animation_thread.start()

    def pause_animation(self):
        """暂停/继续动画"""
        if self.animation_thread and self.animation_thread.isRunning():
            if self.animation_thread.paused:
                self.animation_thread.resume()
                self.pause_btn.setText("⏸️ 暂停")
                self.status_label.setText("🚀 动画播放中...")
            else:
                self.animation_thread.pause()
                self.pause_btn.setText("▶️ 继续")
                self.status_label.setText("⏸️ 动画已暂停")

    def stop_animation(self):
        """停止动画"""
        if self.animation_thread:
            self.animation_thread.stop()
            self.animation_thread.wait()
        self.show_source()
        self.play_btn.setEnabled(True)
        self.pause_btn.setEnabled(False)
        self.stop_btn.setEnabled(False)
        self.pause_btn.setText("⏸️ 暂停")
        self.status_label.setText("⏹️ 动画已停止")

    def on_frame_ready(self, positions, progress):
        """帧就绪回调"""
        self.current_positions = positions
        self.update_scatter()

        progress_percent = int(progress * 100)
        self.progress_bar.setValue(progress_percent)
        self.progress_slider.setValue(progress_percent)

        # 显示轨迹
        if self.show_trails_check.isChecked() and progress > 0:
            self._add_trail_segment(positions, progress)

    def _add_trail_segment(self, positions, progress):
        """添加轨迹段"""
        if len(self.trail_items) > 20:  # 限制轨迹数量
            old_item = self.trail_items.pop(0)
            self.view.removeItem(old_item)

        # 采样部分点显示轨迹
        sample_indices = np.random.choice(len(positions), min(50, len(positions)), replace=False)
        trail_points = positions[sample_indices]

        alpha = 0.3 + progress * 0.4
        color = (0.9, 0.5, 0.1, alpha)

        # 创建小点表示轨迹
        trail_scatter = GLScatterPlotItem(
            pos=trail_points,
            size=0.02,
            color=[color] * len(trail_points),
            pxMode=False
        )
        self.view.addItem(trail_scatter)
        self.trail_items.append(trail_scatter)

    def on_animation_finished(self):
        """动画完成回调"""
        self.play_btn.setEnabled(True)
        self.pause_btn.setEnabled(False)
        self.stop_btn.setEnabled(False)
        self.pause_btn.setText("⏸️ 暂停")
        self.status_label.setText("✅ 动画完成")

    def on_slider_changed(self, value):
        """滑块变化回调"""
        if self.animation_thread and self.animation_thread.isRunning():
            return

        if self.source_positions is None or self.target_positions is None:
            return

        progress = value / 100.0
        self.current_positions = self.planner.interpolate_positions(
            self.source_positions,
            self.target_positions,
            progress,
            'smooth'
        )
        self.update_scatter()
        self.progress_bar.setValue(value)

    def closeEvent(self, event):
        """关闭事件"""
        if self.animation_thread:
            self.animation_thread.stop()
            self.animation_thread.wait()
        event.accept()


def main():
    app = QApplication(sys.argv)

    # 设置应用样式
    app.setStyle('Fusion')
    palette = QPalette()
    palette.setColor(QPalette.Window, QColor(26, 26, 46))
    palette.setColor(QPalette.WindowText, Qt.white)
    app.setPalette(palette)

    window = DroneShowMainWindow()
    window.show()
    sys.exit(app.exec_())


if __name__ == "__main__":
    main()
```


点云推荐下载地址


[https://gitcode.com/open-source-toolkit/d98ff](https://gitcode.com/open-source-toolkit/d98ff "https://gitcode.com/open-source-toolkit/d98ff")
