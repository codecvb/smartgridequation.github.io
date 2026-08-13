---
title: 物联网数据检测PythonGUI代码编写
slug: 物联网数据检测pythongui代码编写
category: Python 编程
summary: 这是一个基于PyQt5的空气质量监测系统GUI程序。主要功能包括：
tags: Python
---

这是一个基于PyQt5的空气质量监测系统GUI程序。主要功能包括：


1.  界面分为左侧设备列表和右侧数据展示区
2.  右侧展示5个圆形进度条组件，分别显示PM2.5、TVOC、二氧化碳、温度和湿度的实时数据
3.  包含一个折线图组件，动态显示PM2.5历史数据变化趋势
4.  底部表格显示历史数据记录
5.  使用定时器随机模拟数据变化，每3秒更新一次


系统特点：


-   自定义圆形进度条组件，带颜色状态指示
-   响应式折线图组件
-   美观的UI设计，采用深色主题
-   支持多设备切换查看


该程序模拟了室内空气质量监测系统的核心功能，可作为实际应用的开发基础。


效果如下


![](/uploads/csdn/物联网数据检测pythongui代码编写/img-01.png)


源代码


```python
import sys
import random
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QLabel, QListWidget, QTableWidget, QTableWidgetItem,
    QFrame, QHeaderView, QGridLayout
)
from PyQt5.QtCore import Qt, QTimer, QPointF
from PyQt5.QtGui import (
    QFont, QColor, QPainter, QPen, QBrush, QPixmap,
    QPainterPath
)


# 自定义圆形进度条组件
class CircularProgressBar(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.value = 0
        self.max_value = 100
        self.label_text = "参数"
        self.unit = "单位"
        self.status = "正常"
        self.status_color = QColor(0, 255, 0)  # 绿色
        self.ranges = {
            "优": {"max": 35, "color": QColor(0, 255, 0)},
            "良": {"max": 75, "color": QColor(255, 215, 0)},
            "轻度污染": {"max": 115, "color": QColor(255, 165, 0)},
            "中度污染": {"max": 150, "color": QColor(255, 69, 0)},
            "重度污染": {"max": float('inf'), "color": QColor(255, 0, 0)}
        }
        # 设置固定大小避免布局问题
        self.setFixedSize(200, 200)

    def set_value(self, value):
        self.value = value
        self.update_status()
        self.update()

    def set_label_text(self, text):
        self.label_text = text
        self.update()

    def set_unit(self, unit):
        self.unit = unit
        self.update()

    def set_max_value(self, max_val):
        self.max_value = max_val
        self.update()

    def set_ranges(self, ranges):
        self.ranges = ranges
        self.update()

    def set_status(self, status, color):
        self.status = status
        self.status_color = color
        self.update()

    def update_status(self):
        # 根据参数类型判断状态
        for status, range_info in self.ranges.items():
            if self.value <= range_info["max"]:
                self.set_status(status, range_info["color"])
                break

    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)

        # 绘制圆形进度条
        width = min(self.width(), self.height())
        radius = width // 2 - 20
        center_x = self.width() // 2
        center_y = self.height() // 2

        # 绘制背景圆环
        pen = QPen(QColor(100, 100, 100), 15)
        painter.setPen(pen)
        painter.drawEllipse(center_x - radius, center_y - radius, radius * 2, radius * 2)

        # 绘制进度圆环
        progress_pen = QPen(self.status_color, 15)
        progress_pen.setCapStyle(Qt.RoundCap)
        painter.setPen(progress_pen)
        arc_length = int(360 * (min(self.value, self.max_value) / self.max_value))
        painter.drawArc(
            center_x - radius, center_y - radius,
            radius * 2, radius * 2,
            90 * 16, -arc_length * 16  # 从顶部开始逆时针绘制
        )

        # 绘制中心数值
        font = QFont()
        font.setPointSize(24)
        painter.setFont(font)
        painter.setPen(Qt.white)
        painter.drawText(
            center_x - radius // 2, center_y - radius // 3,
            radius, radius, Qt.AlignCenter, str(self.value)
        )

        # 绘制标签和单位
        font.setPointSize(10)
        painter.setFont(font)
        painter.drawText(
            center_x - radius // 2, center_y + radius // 3,
            radius, radius // 2, Qt.AlignCenter,
            f"{self.label_text}\n{self.unit}"
        )

        # 绘制状态
        font.setPointSize(12)
        painter.setFont(font)
        painter.setPen(self.status_color)
        painter.drawText(
            0, center_y + radius + 10,
            self.width(), 30, Qt.AlignCenter, self.status
        )


# 自定义折线图组件
class LineChart(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.data = []  # 存储历史数据
        self.max_points = 10  # 最多显示10个数据点
        self.title = "PM2.5 历史数据"
        self.unit = "μg/m³"
        self.setMinimumSize(400, 200)
        self.setStyleSheet("background-color: #444444; border-radius: 5px;")

    def add_data_point(self, value):
        self.data.append(value)
        if len(self.data) > self.max_points:
            self.data.pop(0)
        self.update()

    def set_title(self, title):
        self.title = title
        self.update()

    def set_unit(self, unit):
        self.unit = unit
        self.update()

    def paintEvent(self, event):
        if not self.data:
            return

        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)

        # 绘制标题
        font = QFont()
        font.setPointSize(12)
        font.setBold(True)
        painter.setFont(font)
        painter.setPen(QColor(255, 255, 255))
        painter.drawText(10, 20, self.title)

        # 绘制区域
        margin = 40
        chart_width = self.width() - margin * 2
        chart_height = self.height() - margin * 2

        # 绘制坐标轴
        painter.setPen(QColor(200, 200, 200))
        painter.drawLine(margin, margin, margin, self.height() - margin)  # Y轴
        painter.drawLine(margin, self.height() - margin, self.width() - margin, self.height() - margin)  # X轴

        # 计算数据范围
        max_val = max(self.data) if self.data else 0
        min_val = min(self.data) if self.data else 0
        padding = (max_val - min_val) * 0.1 if max_val != min_val else 10
        max_val += padding
        min_val = max(0, min_val - padding)

        # 绘制Y轴刻度 - 修复坐标为整数的问题
        y_ticks = 5
        font.setPointSize(8)
        painter.setFont(font)
        for i in range(y_ticks + 1):
            value = min_val + (max_val - min_val) * (i / y_ticks)
            # 将y_pos转换为整数
            y_pos = int(self.height() - margin - (chart_height * (i / y_ticks)))
            painter.drawLine(margin - 5, y_pos, margin, y_pos)
            painter.drawText(margin - 30, y_pos + 4, f"{int(value)}")

        # 绘制X轴刻度和标签
        x_ticks = 10 #min(5, len(self.data) - 1)  # 最多显示5个刻度
        for i in range(x_ticks + 1):
            x_pos = int(margin + (chart_width * (i / x_ticks)))
            painter.drawLine(x_pos, self.height() - margin, x_pos, self.height() - margin + 5)
            # 显示时间标签（模拟）
            time_label = f"{i*3}s前"  # 每3秒一个数据点
            painter.drawText(x_pos - 15, self.height() - margin + 20, time_label)

        # 绘制单位
        painter.drawText(margin - 40, margin - 10, self.unit)

        # 绘制数据线
        if len(self.data) < 2:
            return

        path = QPainterPath()
        for i, value in enumerate(self.data):
            x = margin + (chart_width * (i / (len(self.data) - 1)))
            ratio = (value - min_val) / (max_val - min_val) if max_val != min_val else 0
            y = self.height() - margin - (chart_height * ratio)

            if i == 0:
                path.moveTo(x, y)
            else:
                path.lineTo(x, y)

            # 绘制数据点
            painter.setBrush(QBrush(QColor(0, 255, 255)))
            painter.drawEllipse(QPointF(x, y), 4, 4)

        # 绘制曲线
        pen = QPen(QColor(0, 255, 255), 2)
        painter.setPen(pen)
        painter.drawPath(path)


# 主窗口
class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.pm25_history = []  # 存储PM2.5历史数据
        self.init_ui()
        self.setup_timer()

    def init_ui(self):
        # 中央部件
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QHBoxLayout(central_widget)
        main_layout.setContentsMargins(10, 10, 10, 10)
        main_layout.setSpacing(10)

        # 左侧设备列表
        left_widget = QWidget()
        left_layout = QVBoxLayout(left_widget)
        left_widget.setStyleSheet("background-color: #222222; color: white;")
        left_widget.setFixedWidth(200)  # 固定左侧宽度

        # 顶部标题
        title_label = QLabel("净则室内空气品质管理")
        title_label.setStyleSheet("font-size: 16px; font-weight: bold; padding: 10px;")
        title_label.setWordWrap(True)  # 自动换行
        left_layout.addWidget(title_label)

        # 设备列表标题
        list_title = QLabel("设备列表")
        list_title.setStyleSheet("font-size: 14px; font-weight: bold; padding: 10px;")
        left_layout.addWidget(list_title)

        # 设备列表
        self.device_list = QListWidget()
        self.device_list.setStyleSheet("""
            QListWidget {
                background-color: #333333;
                border: none;
                padding: 5px;
            }
            QListWidget::item {
                padding: 8px;
                border-bottom: 1px solid #444444;
            }
            QListWidget::item:selected {
                background-color: #444444;
                color: white;
            }
        """)
        devices = [
            "会议室 MAC:PHI214453",
            "会议室2 MAC:PHI214453",
            "休息室 MAC:PHI214453",
            "会议室3 MAC:PHI214453",
            "会议室4 MAC:PHI214453",
        ]
        for device in devices:
            self.device_list.addItem(device)
        self.device_list.setCurrentRow(0)
        left_layout.addWidget(self.device_list)

        # 底部logo
        logo_label = QLabel("PUDEX\n小朴智能科技")
        logo_label.setAlignment(Qt.AlignCenter)
        logo_label.setStyleSheet("color: white; font-size: 12px; margin-top: auto; padding: 10px;")
        left_layout.addWidget(logo_label)

        main_layout.addWidget(left_widget)

        # 右侧内容区域
        right_widget = QWidget()
        right_layout = QVBoxLayout(right_widget)
        right_widget.setStyleSheet("background-color: #333333;")

        # 顶部实时监测标签
        realtime_label = QLabel("实时监测数据")
        realtime_label.setStyleSheet("color: white; font-size: 14px; font-weight: bold; padding: 10px;")
        right_layout.addWidget(realtime_label)

        # 创建滚动区域以避免小屏幕下的重叠
        scroll_widget = QWidget()
        scroll_layout = QVBoxLayout(scroll_widget)

        # 中间参数显示区域 - 使用网格布局放置所有圆环
        params_grid = QGridLayout()
        params_grid.setSpacing(20)  # 增加间距避免重叠
        params_grid.setContentsMargins(10, 10, 10, 10)

        # PM2.5 圆环
        self.pm_progress = CircularProgressBar()
        self.pm_progress.set_label_text("PM2.5")
        self.pm_progress.set_unit("μg/m³")
        self.pm_progress.set_max_value(150)  # PM2.5最大150
        self.pm_progress.set_value(35)
        params_grid.addWidget(self.pm_progress, 0, 0)

        # TVOC 圆环
        self.tvoc_progress = CircularProgressBar()
        self.tvoc_progress.set_label_text("TVOC")
        self.tvoc_progress.set_unit("ppb")
        self.tvoc_progress.set_max_value(300)  # TVOC最大300
        self.tvoc_progress.set_ranges({
            "优": {"max": 50, "color": QColor(0, 255, 0)},
            "良好": {"max": 100, "color": QColor(255, 215, 0)},
            "轻度污染": {"max": 200, "color": QColor(255, 165, 0)},
            "中度污染": {"max": 300, "color": QColor(255, 69, 0)},
            "重度污染": {"max": float('inf'), "color": QColor(255, 0, 0)}
        })
        self.tvoc_progress.set_value(110)
        params_grid.addWidget(self.tvoc_progress, 0, 1)

        # 二氧化碳 圆环
        self.co2_progress = CircularProgressBar()
        self.co2_progress.set_label_text("二氧化碳")
        self.co2_progress.set_unit("ppm")
        self.co2_progress.set_max_value(2000)  # CO2最大2000
        self.co2_progress.set_ranges({
            "优": {"max": 600, "color": QColor(0, 255, 0)},
            "良好": {"max": 1000, "color": QColor(255, 215, 0)},
            "轻度污染": {"max": 1500, "color": QColor(255, 165, 0)},
            "中度污染": {"max": 2000, "color": QColor(255, 69, 0)},
            "重度污染": {"max": float('inf'), "color": QColor(255, 0, 0)}
        })
        self.co2_progress.set_value(151)
        params_grid.addWidget(self.co2_progress, 1, 0)

        # 温度 圆环
        self.temp_progress = CircularProgressBar()
        self.temp_progress.set_label_text("温度")
        self.temp_progress.set_unit("°C")
        self.temp_progress.set_max_value(35)  # 温度最大35
        self.temp_progress.set_ranges({
            "适宜": {"max": 24, "color": QColor(0, 255, 0)},
            "较舒适": {"max": 28, "color": QColor(255, 215, 0)},
            "偏热": {"max": 32, "color": QColor(255, 165, 0)},
            "热": {"max": 35, "color": QColor(255, 69, 0)},
            "过热": {"max": float('inf'), "color": QColor(255, 0, 0)}
        })
        self.temp_progress.set_value(20)
        params_grid.addWidget(self.temp_progress, 1, 1)

        # 湿度 圆环
        self.humidity_progress = CircularProgressBar()
        self.humidity_progress.set_label_text("湿度")
        self.humidity_progress.set_unit("%rh")
        self.humidity_progress.set_max_value(100)  # 湿度最大100
        self.humidity_progress.set_ranges({
            "适宜": {"max": 60, "color": QColor(0, 255, 0)},
            "较适宜": {"max": 70, "color": QColor(255, 215, 0)},
            "偏湿": {"max": 80, "color": QColor(255, 165, 0)},
            "潮湿": {"max": 90, "color": QColor(255, 69, 0)},
            "极潮湿": {"max": float('inf'), "color": QColor(255, 0, 0)}
        })
        self.humidity_progress.set_value(50)
        params_grid.addWidget(self.humidity_progress, 0, 2)

        # PM2.5历史数据折线图
        self.pm25_chart = LineChart()
        self.pm25_chart.set_title("PM2.5 历史数据趋势")
        self.pm25_chart.set_unit("μg/m³")
        params_grid.addWidget(self.pm25_chart, 1, 2)

        scroll_layout.addLayout(params_grid)

        # 添加历史数据表格
        table_label = QLabel("历史数据记录")
        table_label.setStyleSheet("color: white; font-size: 14px; font-weight: bold; padding: 10px;")
        scroll_layout.addWidget(table_label)

        self.data_table = QTableWidget(5, 6)
        self.data_table.setHorizontalHeaderLabels([
            "设备号", "PM2.5 (μg/m³)", "TVOC (ppb)", "二氧化碳 (ppm)", "温度 (°C)", "湿度 (%rh)"
        ])
        self.data_table.setStyleSheet("""
            QTableWidget {
                background-color: #444444;
                color: white;
            }
            QHeaderView::section {
                background-color: #555555;
                color: white;
                padding: 5px;
            }
            QTableWidget::item {
                padding: 5px;
            }
        """)
        self.data_table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        scroll_layout.addWidget(self.data_table)

        # 添加滚动区域到主布局
        from PyQt5.QtWidgets import QScrollArea
        scroll_area = QScrollArea()
        scroll_area.setWidgetResizable(True)
        scroll_area.setWidget(scroll_widget)
        right_layout.addWidget(scroll_area)

        main_layout.addWidget(right_widget, stretch=1)

        # 填充表格数据
        self.populate_table()

        self.setWindowTitle("空气质量管理系统")
        self.resize(1300, 800)  # 增大窗口尺寸避免拥挤

    def populate_table(self):
        for i in range(5):
            self.data_table.setItem(i, 0, QTableWidgetItem(f"PHI112321{i+1}"))
            self.data_table.setItem(i, 1, QTableWidgetItem(str(35 + i*5)))
            self.data_table.setItem(i, 2, QTableWidgetItem(str(110 + i*10)))
            self.data_table.setItem(i, 3, QTableWidgetItem(str(151 + i*20)))
            self.data_table.setItem(i, 4, QTableWidgetItem(str(20 + i*1)))
            self.data_table.setItem(i, 5, QTableWidgetItem(str(50 - i*2)))

    def setup_timer(self):
        # 模拟数据更新（每5秒随机变化）
        self.timer = QTimer(self)
        self.timer.timeout.connect(self.update_data)
        self.timer.start(3000)  # 每3秒更新一次数据

    def update_data(self):
        # 随机更新各参数值
        new_pm = max(0, min(150, self.pm_progress.value + random.randint(-5, 5)))
        new_tvoc = max(0, min(300, self.tvoc_progress.value + random.randint(-8, 8)))
        new_co2 = max(0, min(2000, self.co2_progress.value + random.randint(-15, 15)))
        new_temp = round(max(16, min(35, self.temp_progress.value + random.uniform(-0.5, 0.5))), 1)
        new_humidity = max(0, min(100, self.humidity_progress.value + random.randint(-3, 3)))

        # 更新圆环数据
        self.pm_progress.set_value(new_pm)
        self.tvoc_progress.set_value(new_tvoc)
        self.co2_progress.set_value(new_co2)
        self.temp_progress.set_value(new_temp)
        self.humidity_progress.set_value(new_humidity)

        # 添加PM2.5数据到历史图表
        self.pm25_chart.add_data_point(new_pm)


if __name__ == '__main__':
    app = QApplication(sys.argv)
    # 确保中文显示正常
    font = QFont("SimHei")
    app.setFont(font)
    window = MainWindow()
    window.show()
    sys.exit(app.exec_())
```
