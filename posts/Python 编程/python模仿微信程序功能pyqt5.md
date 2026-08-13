---
title: Python模仿微信程序功能PyQt5
slug: python模仿微信程序功能pyqt5
category: Python 编程
summary: 本文介绍了一个基于PyQt5的微信界面克隆实现。该程序创建了一个包含侧边栏和聊天区域的主窗口，模拟了微信的基本UI元素和交互功能。侧边栏包含用户信息、搜索框、功能按钮和聊天列表，聊天区域则实现了消息显示和输入功能。程序支持发送文本消息、表情符号和文件，并模拟了自动回复功能。界面设计遵循微信风格，包括圆形头像、气泡消息框和绿色主题色。该实现展示了如何使用PyQt5构建复杂的GUI应用程序，涵盖了布局…
tags: Python
---

本文介绍了一个基于PyQt5的微信界面克隆实现。该程序创建了一个包含侧边栏和聊天区域的主窗口，模拟了微信的基本UI元素和交互功能。侧边栏包含用户信息、搜索框、功能按钮和聊天列表，聊天区域则实现了消息显示和输入功能。程序支持发送文本消息、表情符号和文件，并模拟了自动回复功能。界面设计遵循微信风格，包括圆形头像、气泡消息框和绿色主题色。该实现展示了如何使用PyQt5构建复杂的GUI应用程序，涵盖了布局管理、样式定制、事件处理和组件交互等关键技术。


![](/uploads/csdn/python模仿微信程序功能pyqt5/img-01.png)


```python
import sys
import os
from PyQt5.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout,
                            QHBoxLayout, QListWidget, QListWidgetItem, QLineEdit,
                            QTextEdit, QPushButton, QLabel, QSplitter, QFrame,
                            QScrollArea, QComboBox, QMenu, QAction, QSizePolicy,
                            QMessageBox, QFileDialog, QGridLayout)
from PyQt5.QtGui import (QPixmap, QIcon, QFont, QColor, QPainter, QBrush, QPen,
                         QPalette, QCursor)
from PyQt5.QtCore import Qt, QSize, QPoint, pyqtSignal, QRect, QTimer, QEvent

# 移除matplotlib依赖，因为我们不需要它
# 移除以下导入：
# import matplotlib
# matplotlib.use('Agg')
# import matplotlib.pyplot as plt
# plt.rcParams["font.family"] = ["SimHei", "WenQuanYi Micro Hei", "Heiti TC"]

# 直接在PyQt5中设置字体支持中文
QFont.insertSubstitutions("SimHei", ["SimHei", "WenQuanYi Micro Hei", "Heiti TC"])

# 主应用程序类
class WeChatClone(QMainWindow):
    def __init__(self):
        super().__init__()
        self.initUI()

    def initUI(self):
        # 全局样式优化
        # 设置窗口标题和大小
        self.setWindowTitle('微信')
        self.setGeometry(300, 300, 1200, 800)

        # 设置窗口样式 - 微信风格
        self.setStyleSheet("""
            QMainWindow {
                background-color: #f5f5f5;
            }
            QSplitter::handle {
                background-color: #e0e0e0;
            }
        """)

        # 创建中心窗口部件
        central_widget = QWidget()
        self.setCentralWidget(central_widget)

        # 创建主布局
        main_layout = QHBoxLayout(central_widget)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)

        # 创建分割器来分隔侧边栏和聊天区域
        splitter = QSplitter(Qt.Horizontal)
        splitter.setHandleWidth(1)
        splitter.setStyleSheet("QSplitter::handle { background-color: #e0e0e0; }")

        # 创建侧边栏
        self.create_sidebar(splitter)

        # 创建聊天区域
        self.create_chat_area(splitter)

        # 设置分割器的初始大小
        splitter.setSizes([300, 900])

        # 限制最小宽度
        splitter.setChildrenCollapsible(False)

        # 将分割器添加到主布局
        main_layout.addWidget(splitter)

    def create_sidebar(self, parent):
        # 创建侧边栏框架
        sidebar = QWidget()
        sidebar.setStyleSheet("background-color: white;")
        sidebar_layout = QVBoxLayout(sidebar)
        sidebar_layout.setContentsMargins(0, 0, 0, 0)
        sidebar_layout.setSpacing(0)

        # 创建顶部用户信息区域
        user_info_widget = QWidget()
        user_info_widget.setStyleSheet("background-color: white; border-bottom: 1px solid #e0e0e0;")
        user_info_layout = QHBoxLayout(user_info_widget)
        user_info_layout.setContentsMargins(15, 10, 10, 10)

        # 用户头像 - 圆形
        self.avatar_label = QLabel()
        avatar_pixmap = QPixmap(50, 50)
        avatar_pixmap.fill(QColor(100, 181, 246))
        # 创建圆形头像
        painter = QPainter(avatar_pixmap)
        painter.setRenderHint(QPainter.Antialiasing)
        painter.setBrush(QBrush(QColor(100, 181, 246)))
        painter.setPen(Qt.NoPen)
        painter.drawEllipse(0, 0, 50, 50)
        painter.end()

        self.avatar_label.setPixmap(avatar_pixmap)
        self.avatar_label.setFixedSize(50, 50)
        self.avatar_label.setScaledContents(True)

        # 用户名
        self.username_label = QLabel('我')
        self.username_label.setFont(QFont('SimHei', 12, QFont.Bold))

        # 更多按钮
        more_btn = QPushButton()
        more_btn.setText('⋮')
        more_btn.setFont(QFont('SimHei', 14))
        more_btn.setFixedSize(30, 30)
        more_btn.setStyleSheet("""
            QPushButton {
                border: none;
                background-color: transparent;
                color: #666;
            }
            QPushButton:hover {
                background-color: #f0f0f0;
                border-radius: 15px;
            }
        """)

        user_info_layout.addWidget(self.avatar_label)
        user_info_layout.addWidget(self.username_label, 0, Qt.AlignVCenter)
        user_info_layout.addStretch()
        user_info_layout.addWidget(more_btn)

        # 创建搜索框
        search_layout = QHBoxLayout()
        search_layout.setContentsMargins(15, 10, 15, 10)

        # 搜索容器
        search_container = QWidget()
        search_container.setStyleSheet("background-color: #f0f0f0; border-radius: 18px;")
        search_container_layout = QHBoxLayout(search_container)
        search_container_layout.setContentsMargins(10, 6, 10, 6)

        search_icon = QLabel()
        search_icon.setText('🔍')
        search_icon.setFixedSize(20, 20)
        search_icon.setAlignment(Qt.AlignCenter)

        self.search_edit = QLineEdit()
        self.search_edit.setPlaceholderText('搜索')
        self.search_edit.setStyleSheet("""
            QLineEdit {
                border: none;
                background-color: transparent;
                font-family: SimHei, Microsoft YaHei;
                font-size: 14px;
                color: #333;
            }
            QLineEdit::placeholder {
                color: #999;
            }
        """)
        self.search_edit.textChanged.connect(self.on_search_text_changed)

        search_container_layout.addWidget(search_icon)
        search_container_layout.addWidget(self.search_edit)

        search_layout.addWidget(search_container)

        # 创建功能按钮区域
        features_widget = QWidget()
        features_widget.setStyleSheet("background-color: white; border-top: 1px solid #e0e0e0; border-bottom: 1px solid #e0e0e0;")
        features_layout = QHBoxLayout(features_widget)
        features_layout.setContentsMargins(15, 0, 15, 0)
        features_layout.setSpacing(0)

        # 创建功能按钮
        self.chat_btn = QPushButton('聊天')
        self.contact_btn = QPushButton('联系人')
        self.favorite_btn = QPushButton('收藏')

        # 设置按钮样式
        for btn in [self.chat_btn, self.contact_btn, self.favorite_btn]:
            btn.setFixedHeight(40)
            btn.setStyleSheet("""
                QPushButton {
                    border: none;
                    background-color: transparent;
                    font-family: SimHei, Microsoft YaHei;
                    font-size: 14px;
                    color: #666;
                    padding: 0 20px;
                }
                QPushButton:hover {
                    background-color: #f5f5f5;
                }
            """)

        # 设置默认选中聊天按钮 - 微信绿色主题
        self.chat_btn.setStyleSheet("""
            QPushButton {
                border: none;
                background-color: #e8f0fe;
                font-family: SimHei, Microsoft YaHei;
                font-size: 14px;
                color: #07c160;
                font-weight: bold;
                padding: 0 20px;
            }
            QPushButton:hover {
                background-color: #e8f0fe;
            }
        """)

        # 连接按钮点击信号
        self.chat_btn.clicked.connect(lambda: self.on_feature_button_clicked('chat'))
        self.contact_btn.clicked.connect(lambda: self.on_feature_button_clicked('contact'))
        self.favorite_btn.clicked.connect(lambda: self.on_feature_button_clicked('favorite'))

        features_layout.addWidget(self.chat_btn)
        features_layout.addWidget(self.contact_btn)
        features_layout.addWidget(self.favorite_btn)

        # 创建聊天列表
        self.chat_list = QListWidget()
        self.chat_list.setStyleSheet("""
            QListWidget {
                border: none;
                background-color: white;
            }
            QListWidget::item {
                height: 72px;
                border-bottom: 1px solid #f0f0f0;
            }
            QListWidget::item:hover {
                background-color: #f5f5f5;
            }
            QListWidget::item:selected {
                background-color: #e8f0fe;
            }
            QScrollBar:vertical {
                width: 6px;
                background-color: white;
            }
            QScrollBar::handle:vertical {
                background-color: #c0c0c0;
                border-radius: 3px;
            }
            QScrollBar::handle:vertical:hover {
                background-color: #a0a0a0;
            }
        """)

        # 连接聊天列表点击信号
        self.chat_list.itemClicked.connect(self.on_chat_item_clicked)

        # 添加示例聊天项
        self.add_chat_item('仙女帅哥俱乐部', '盟词: [阵营] 公示! ...', '17:48', 'group.png')
        self.add_chat_item('Andy', '没出现锅巴吧', '17:01', 'user1.png')
        self.add_chat_item('0705-极简技术...', '康雨秋: 上课去了', '16:49', 'group.png')
        self.add_chat_item('折腾的群聊', '不坑老师做俯卧撑-12', '16:45', 'group.png')
        self.add_chat_item('学科网 | 20...', '柠檬老师: 文案:', '16:44', 'group.png')
        self.add_chat_item('不坑老师付...', '康雨秋: [链接] 我把...', '16:39', 'group.png')
        self.add_chat_item('师门 🔥 🔥 🔥', '小号: [图片]', '16:22', 'group.png')
        self.add_chat_item('不坑老师私...', 'AI助理-波比 (道义干...', '16:16', 'user2.png')

        # 将所有部件添加到侧边栏布局
        sidebar_layout.addWidget(user_info_widget)
        sidebar_layout.addLayout(search_layout)
        sidebar_layout.addWidget(features_widget)
        sidebar_layout.addWidget(self.chat_list)

        # 将侧边栏添加到父部件
        parent.addWidget(sidebar)

    def add_chat_item(self, name, message, time, avatar_file):
        # 创建聊天项部件
        item_widget = QWidget()
        item_layout = QHBoxLayout(item_widget)
        item_layout.setContentsMargins(15, 10, 15, 10)

        # 头像
        avatar_label = QLabel()
        # 创建圆形头像
        avatar_pixmap = QPixmap(44, 44)
        avatar_pixmap.fill(Qt.transparent)
        painter = QPainter(avatar_pixmap)
        painter.setRenderHint(QPainter.Antialiasing)

        # 根据类型设置不同的背景色
        if 'group' in avatar_file:
            painter.setBrush(QBrush(QColor(255, 193, 7)))  # 群聊使用橙色
        else:
            painter.setBrush(QBrush(QColor(100, 181, 246)))  # 个人聊天使用蓝色

        painter.setPen(Qt.NoPen)
        painter.drawEllipse(0, 0, 44, 44)
        painter.end()

        avatar_label.setPixmap(avatar_pixmap)
        avatar_label.setFixedSize(44, 44)
        avatar_label.setScaledContents(True)

        # 右侧信息区域
        info_widget = QWidget()
        info_layout = QVBoxLayout(info_widget)
        info_layout.setContentsMargins(0, 0, 0, 0)
        info_layout.setSpacing(4)

        # 名称和时间
        name_time_widget = QWidget()
        name_time_layout = QHBoxLayout(name_time_widget)
        name_time_layout.setContentsMargins(0, 0, 0, 0)
        name_time_layout.setSpacing(5)

        name_label = QLabel(name)
        name_label.setFont(QFont('SimHei', 14, QFont.Bold))
        name_label.setStyleSheet('color: #333;')
        name_label.setObjectName('chatNameLabel')  # 设置对象名以便查找

        time_label = QLabel(time)
        time_label.setFont(QFont('SimHei', 12))
        time_label.setStyleSheet('color: #999;')

        name_time_layout.addWidget(name_label)
        name_time_layout.addStretch()
        name_time_layout.addWidget(time_label)

        # 消息内容
        message_label = QLabel(message)
        message_label.setFont(QFont('SimHei', 13))
        message_label.setStyleSheet('color: #666;')
        message_label.setMaximumWidth(200)
        message_label.setWordWrap(True)

        info_layout.addWidget(name_time_widget)
        info_layout.addWidget(message_label)

        # 添加到主布局
        item_layout.addWidget(avatar_label)
        item_layout.addWidget(info_widget, 1, Qt.AlignTop)

        # 创建列表项并设置部件
        item = QListWidgetItem()
        item.setSizeHint(item_widget.sizeHint())
        self.chat_list.addItem(item)
        self.chat_list.setItemWidget(item, item_widget)

        # 保存聊天信息
        item.setData(Qt.UserRole, {'name': name, 'message': message, 'time': time, 'avatar_file': avatar_file})

    def create_chat_area(self, parent):
        # 创建聊天区域框架
        chat_area = QWidget()
        chat_area.setStyleSheet("background-color: #f8f9fa;")
        chat_area_layout = QVBoxLayout(chat_area)
        chat_area_layout.setContentsMargins(0, 0, 0, 0)
        chat_area_layout.setSpacing(0)

        # 创建聊天头部
        chat_header = QWidget()
        chat_header.setStyleSheet("background-color: white; border-bottom: 1px solid #e0e0e0;")
        chat_header_layout = QHBoxLayout(chat_header)
        chat_header_layout.setContentsMargins(15, 10, 10, 10)

        back_btn = QPushButton('←')
        back_btn.setFixedSize(36, 36)
        back_btn.setStyleSheet("""
            QPushButton {
                border: none;
                background-color: transparent;
                color: #333;
                font-size: 16px;
                border-radius: 18px;
            }
            QPushButton:hover {
                background-color: #f0f0f0;
            }
        """)
        back_btn.clicked.connect(self.on_back_button_clicked)

        # 聊天信息区域
        chat_info_widget = QWidget()
        chat_info_layout = QVBoxLayout(chat_info_widget)
        chat_info_layout.setContentsMargins(0, 0, 0, 0)
        chat_info_layout.setSpacing(2)

        # 聊天对象名称
        self.current_chat_name = QLabel('Andy')
        self.current_chat_name.setFont(QFont('SimHei', 14, QFont.Bold))
        self.current_chat_name.setStyleSheet("color: #333;")

        # 在线状态 - 微信风格绿色圆点
        self.online_status = QLabel()
        self.online_status.setText('在线')
        self.online_status.setFont(QFont('SimHei', 11))
        self.online_status.setStyleSheet("color: #07c160;")

        chat_info_layout.addWidget(self.current_chat_name)
        chat_info_layout.addWidget(self.online_status)

        header_btns_widget = QWidget()
        header_btns_layout = QHBoxLayout(header_btns_widget)
        header_btns_layout.setSpacing(5)

        search_btn = QPushButton('🔍')
        voice_btn = QPushButton('📞')
        video_btn = QPushButton('📹')
        more_btn = QPushButton('⋮')
        more_btn.setFont(QFont('SimHei', 14))

        for btn in [search_btn, voice_btn, video_btn, more_btn]:
            btn.setFixedSize(36, 36)
            btn.setStyleSheet("""
                QPushButton {
                    border: none;
                    background-color: transparent;
                    color: #666;
                    font-size: 16px;
                }
                QPushButton:hover {
                    background-color: #f0f0f0;
                    border-radius: 18px;
                }
            """)

        header_btns_layout.addWidget(search_btn)
        header_btns_layout.addWidget(voice_btn)
        header_btns_layout.addWidget(video_btn)
        header_btns_layout.addWidget(more_btn)

        chat_header_layout.addWidget(back_btn)
        chat_header_layout.addWidget(chat_info_widget, 0, Qt.AlignVCenter)
        chat_header_layout.addStretch()
        chat_header_layout.addWidget(header_btns_widget)

        # 创建消息显示区域
        self.message_area = QScrollArea()
        self.message_area.setWidgetResizable(True)
        self.message_area.setHorizontalScrollBarPolicy(Qt.ScrollBarAlwaysOff)
        self.message_area.setStyleSheet("""
            QScrollArea {
                background-color: #f8f9fa;
                border: none;
            }
            QScrollBar:vertical {
                width: 8px;
                background-color: transparent;
            }
            QScrollBar::handle:vertical {
                background-color: #c0c0c0;
                border-radius: 4px;
                margin: 4px 0;
            }
            QScrollBar::handle:vertical:hover {
                background-color: #a0a0a0;
            }
            QScrollBar::add-line:vertical,
            QScrollBar::sub-line:vertical {
                height: 0px;
            }
        """)

        self.message_widget = QWidget()
        self.message_widget.setStyleSheet("background-color: #f8f9fa;")
        self.message_layout = QVBoxLayout(self.message_widget)
        self.message_layout.setAlignment(Qt.AlignTop)
        self.message_layout.setSpacing(12)
        self.message_layout.setContentsMargins(15, 15, 15, 15)

        self.message_area.setWidget(self.message_widget)

        # 添加示例消息
        self.add_message('我一会回来再看看还能少点啥', False)
        self.add_message('可真行啊你', True)
        self.add_message('在干嘛！', False)
        self.add_message('不想理你', True)
        self.add_message('丽丽', False)
        self.add_message('什么意思', True)

        # 创建输入区域
        input_area = QWidget()
        input_area.setStyleSheet("background-color: white; border-top: 1px solid #e0e0e0;")
        input_area_layout = QVBoxLayout(input_area)
        input_area_layout.setContentsMargins(15, 10, 15, 10)
        input_area_layout.setSpacing(8)

        # 工具按钮区域
        tools_widget = QWidget()
        tools_layout = QHBoxLayout(tools_widget)
        tools_layout.setSpacing(8)

        # 工具按钮样式
        tool_btn_style = """
            QPushButton {
                border: none;
                background-color: transparent;
                font-size: 18px;
                border-radius: 18px;
            }
            QPushButton:hover {
                background-color: #f0f0f0;
                border-radius: 18px;
            }
        """

        emoji_btn = QPushButton('😀')
        emoji_btn.setFixedSize(36, 36)
        emoji_btn.setStyleSheet(tool_btn_style)
        emoji_btn.clicked.connect(self.on_emoji_button_clicked)
        emoji_btn.setToolTip('表情')

        file_btn = QPushButton('📎')
        file_btn.setFixedSize(36, 36)
        file_btn.setStyleSheet(tool_btn_style)
        file_btn.clicked.connect(self.on_file_button_clicked)
        file_btn.setToolTip('文件')

        image_btn = QPushButton('🖼️')
        image_btn.setFixedSize(36, 36)
        image_btn.setStyleSheet(tool_btn_style)
        image_btn.clicked.connect(self.on_image_button_clicked)
        image_btn.setToolTip('图片')

        voice_btn = QPushButton('🎤')
        voice_btn.setFixedSize(36, 36)
        voice_btn.setStyleSheet(tool_btn_style)
        voice_btn.clicked.connect(self.on_voice_button_clicked)
        voice_btn.setToolTip('语音')

        tools_layout.addWidget(emoji_btn)
        tools_layout.addWidget(file_btn)
        tools_layout.addWidget(image_btn)
        tools_layout.addWidget(voice_btn)
        tools_layout.addStretch()

        # 消息输入框
        self.message_input = QTextEdit()
        self.message_input.setFixedHeight(80)
        self.message_input.setPlaceholderText('输入消息...')
        self.message_input.setStyleSheet("""
            QTextEdit {
                border: 1px solid #ddd;
                border-radius: 6px;
                padding: 8px 10px;
                font-family: SimHei, Microsoft YaHei;
                font-size: 14px;
                background-color: white;
            }
            QTextEdit:focus {
                border-color: #07c160;
                outline: none;
            }
        """)
        # 监听输入框内容变化，启用/禁用发送按钮
        self.message_input.textChanged.connect(self.on_message_text_changed)

        # 发送按钮区域
        send_widget = QWidget()
        send_layout = QHBoxLayout(send_widget)

        self.send_btn = QPushButton('发送')
        self.send_btn.setFixedSize(86, 36)
        self.send_btn.setStyleSheet("""
            QPushButton {
                background-color: #07c160;
                color: white;
                border: none;
                border-radius: 18px;
                font-family: SimHei, Microsoft YaHei;
                font-size: 14px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #06b156;
            }
            QPushButton:disabled {
                background-color: #b3e8c5;
                color: #f0f0f0;
            }
        """)
        self.send_btn.clicked.connect(self.on_send_button_clicked)
        self.send_btn.setEnabled(False)  # 初始禁用

        send_layout.addStretch()
        send_layout.addWidget(self.send_btn)

        # 添加到输入区域布局
        input_area_layout.addWidget(tools_widget)
        input_area_layout.addWidget(self.message_input)
        input_area_layout.addWidget(send_widget)

        # 将所有部件添加到聊天区域布局
        chat_area_layout.addWidget(chat_header)
        chat_area_layout.addWidget(self.message_area)
        chat_area_layout.addWidget(input_area)

        # 将聊天区域添加到父部件
        parent.addWidget(chat_area)

    def add_message(self, text, is_self=True, show_avatar=True):
        """添加消息到聊天区域 - 微信风格"""
        # 创建消息容器
        message_container = QWidget()
        message_container_layout = QVBoxLayout(message_container)
        message_container_layout.setContentsMargins(0, 0, 0, 0)
        message_container_layout.setSpacing(2)

        # 创建消息项
        message_widget = QWidget()
        message_layout = QHBoxLayout(message_widget)
        message_layout.setContentsMargins(0, 0, 0, 0)
        message_layout.setSpacing(8)

        if is_self:
            # 自己发送的消息 - 微信绿色气泡
            message_layout.setAlignment(Qt.AlignRight)

            # 发送时间
            time_label = QLabel(self.get_current_time())
            time_label.setFont(QFont('SimHei', 11))
            time_label.setStyleSheet("color: #999;")
            message_container_layout.addWidget(time_label, 0, Qt.AlignCenter)

            # 消息气泡 - 微信绿色主题
            message_label = QLabel(text)
            message_label.setStyleSheet("""
                QLabel {
                    background-color: #07c160;
                    color: white;
                    border-radius: 10px;
                    border-bottom-right-radius: 4px;
                    padding: 8px 12px;
                    max-width: 60%;
                    white-space: pre-wrap;
                    font-family: SimHei, Microsoft YaHei;
                    font-size: 14px;
                    line-height: 1.4;
                }
            """)
            message_label.setWordWrap(True)
            message_label.setTextInteractionFlags(Qt.TextSelectableByMouse)

            message_layout.addWidget(message_label)

            # 检查是否包含表情
            if any(emoji in text for emoji in ['😀', '😂', '😊', '😁', '😆', '😅', '😉', '😘', '😍', '🤔', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫', '😴', '😌', '😛', '😜', '😝', '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '☹️', '🙁', '😖', '😞', '😟', '😤', '😭', '😦', '🐱']):
                status_label = QLabel('😊')
                status_label.setStyleSheet("font-size: 16px;")
                message_layout.addWidget(status_label)
        else:
            # 对方发送的消息 - 微信白色气泡
            message_layout.setAlignment(Qt.AlignLeft)

            # 发送时间
            time_label = QLabel(self.get_current_time())
            time_label.setFont(QFont('SimHei', 11))
            time_label.setStyleSheet("color: #999;")
            message_container_layout.addWidget(time_label, 0, Qt.AlignCenter)

            # 头像
            if show_avatar:
                avatar_label = QLabel()
                avatar_pixmap = QPixmap(36, 36)
                # 创建圆形头像 - 微信风格
                painter = QPainter(avatar_pixmap)
                painter.setRenderHint(QPainter.Antialiasing)

                painter.setBrush(QBrush(QColor(100, 181, 246)))  # 个人聊天使用蓝色
                painter.setPen(Qt.NoPen)
                painter.drawEllipse(0, 0, 36, 36)
                painter.end()

                avatar_label.setPixmap(avatar_pixmap)
                avatar_label.setFixedSize(36, 36)
                avatar_label.setScaledContents(True)
                message_layout.addWidget(avatar_label)
            else:
                # 如果不显示头像，添加一个占位符
                placeholder = QWidget()
                placeholder.setFixedWidth(36)
                message_layout.addWidget(placeholder)

            # 消息气泡 - 微信白色主题
            message_label = QLabel(text)
            message_label.setStyleSheet("""
                QLabel {
                    background-color: white;
                    color: #333;
                    border-radius: 10px;
                    border-bottom-left-radius: 4px;
                    padding: 8px 12px;
                    max-width: 60%;
                    white-space: pre-wrap;
                    font-family: SimHei, Microsoft YaHei;
                    font-size: 14px;
                    line-height: 1.4;
                }
            """)
            message_label.setWordWrap(True)
            message_label.setTextInteractionFlags(Qt.TextSelectableByMouse)

            message_layout.addWidget(message_label)

        message_container_layout.addWidget(message_widget)

        # 添加到消息区域
        self.message_layout.addWidget(message_container)

        # 滚动到底部
        self.message_area.verticalScrollBar().setValue(
            self.message_area.verticalScrollBar().maximum())

    def get_current_time(self):
        """获取当前时间，格式为HH:MM"""
        from datetime import datetime
        return datetime.now().strftime("%H:%M")

        # 添加到消息区域
        self.message_layout.addWidget(message_widget)

        # 滚动到底部
        self.message_area.verticalScrollBar().setValue(
            self.message_area.verticalScrollBar().maximum())

    def on_chat_item_clicked(self, item):
        """处理聊天项点击事件"""
        # 获取聊天数据
        chat_data = item.data(Qt.UserRole)
        if chat_data:
            # 更新当前聊天名称
            self.current_chat_name.setText(chat_data['name'])

            # 更新在线状态（模拟）
            if 'group' in chat_data['avatar_file']:
                self.online_status.setText(f'群聊 · {chat_data["name"]}')
            else:
                # 随机设置在线状态
                import random
                statuses = ['在线', '最近在线', '正在输入...', '已读']
                self.online_status.setText(random.choice(statuses))

            # 清空现有消息
            for i in reversed(range(self.message_layout.count())):
                widget = self.message_layout.itemAt(i).widget()
                if widget:
                    widget.deleteLater()

            # 添加示例消息（模拟聊天记录）
            if 'group' in chat_data['avatar_file']:
                self.add_message(f'欢迎来到{chat_data["name"]}', False)
                self.add_message('大家好！', True)
                self.add_message('这是一个群聊示例', False)
            else:
                self.add_message(f'你好，我是{chat_data["name"]}', False)
                self.add_message('你好！', True)
                self.add_message('今天过得怎么样？', False)

        # 更新选中状态的样式
        for i in range(self.chat_list.count()):
            list_item = self.chat_list.item(i)
            widget = self.chat_list.itemWidget(list_item)
            if widget:
                # 重置所有项的样式
                widget.setStyleSheet("")

        # 设置选中项的样式
        selected_widget = self.chat_list.itemWidget(item)
        if selected_widget:
            selected_widget.setStyleSheet("background-color: #e8f0fe;")

            # 更新聊天列表中的消息（模拟）
            import random
            statuses = ['已读', '未读', '正在输入...']
            for child in selected_widget.findChildren(QLabel):
                if child.objectName() == 'chatNameLabel':
                    # 更新名称（保持不变）
                    pass
                elif child.text() and not child.text().isdigit() and ':' not in child.text() and not any(c in child.text() for c in '0123456789'):
                    # 找到消息标签并更新
                    child.setText(random.choice(['收到', '好的', '明白了', '👍', '😊']))

    def on_search_text_changed(self):
        """处理搜索文本变化事件"""
        search_text = self.search_edit.text().lower()

        for i in range(self.chat_list.count()):
            item = self.chat_list.item(i)
            chat_data = item.data(Qt.UserRole)

            if chat_data:
                # 检查名称或消息是否包含搜索文本
                match_name = search_text in chat_data['name'].lower()
                match_message = search_text in chat_data['message'].lower()

                # 显示或隐藏项目
                item.setHidden(not (match_name or match_message))

    def on_feature_button_clicked(self, button_type):
        """处理功能按钮点击事件"""
        # 重置所有按钮样式
        for btn in [self.chat_btn, self.contact_btn, self.favorite_btn]:
            btn.setStyleSheet("""
                QPushButton {
                    border: none;
                    background-color: transparent;
                    font-family: SimHei, Microsoft YaHei;
                    font-size: 14px;
                    color: #666;
                    padding: 0 20px;
                }
                QPushButton:hover {
                    background-color: #f5f5f5;
                }
            """)

        # 设置选中按钮的样式
        if button_type == 'chat':
            self.chat_btn.setStyleSheet("""
                QPushButton {
                    border: none;
                    background-color: #e8f0fe;
                    font-family: SimHei, Microsoft YaHei;
                    font-size: 14px;
                    color: #07c160;
                    font-weight: bold;
                    padding: 0 20px;
                }
                QPushButton:hover {
                    background-color: #e8f0fe;
                }
            """)
            # 显示聊天列表逻辑
            self.chat_list.show()
        elif button_type == 'contact':
            self.contact_btn.setStyleSheet("""
                QPushButton {
                    border: none;
                    background-color: #e8f0fe;
                    font-family: SimHei, Microsoft YaHei;
                    font-size: 14px;
                    color: #07c160;
                    font-weight: bold;
                    padding: 0 20px;
                }
                QPushButton:hover {
                    background-color: #e8f0fe;
                }
            """)
            # 这里可以实现显示联系人列表的逻辑
        elif button_type == 'favorite':
            self.favorite_btn.setStyleSheet("""
                QPushButton {
                    border: none;
                    background-color: #e8f0fe;
                    font-family: SimHei, Microsoft YaHei;
                    font-size: 14px;
                    color: #07c160;
                    font-weight: bold;
                    padding: 0 20px;
                }
                QPushButton:hover {
                    background-color: #e8f0fe;
                }
            """)
            # 这里可以实现显示收藏列表的逻辑

    def on_back_button_clicked(self):
        """处理返回按钮点击事件"""
        # 这里可以实现返回上一级或切换视图的功能
        pass

    def on_message_text_changed(self):
        """处理消息文本变化事件"""
        # 启用或禁用发送按钮
        text = self.message_input.toPlainText().strip()
        self.send_btn.setEnabled(bool(text))

        # 更新在线状态为"正在输入..."
        if "群聊" not in self.online_status.text() and bool(text):
            self.online_status.setText("对方正在输入...")
            # 设置定时器，一段时间后恢复状态
            self.input_timer = QTimer()
            self.input_timer.timeout.connect(self.reset_online_status)
            self.input_timer.setSingleShot(True)
            self.input_timer.start(2000)  # 2秒后恢复

    def reset_online_status(self):
        """重置在线状态"""
        if not self.message_input.toPlainText().strip():
            import random
            statuses = ['在线', '最近在线', '已读']
            self.online_status.setText(random.choice(statuses))

    def add_reply(self, reply_text):
        """添加回复消息"""
        self.add_message(reply_text, is_self=False)

    def update_chat_list_latest_message(self, latest_message):
        """更新聊天列表中的最新消息"""
        for i in range(self.chat_list.count()):
            list_item = self.chat_list.item(i)
            chat_data = list_item.data(Qt.UserRole)

            # 找到当前选中的聊天项
            selected_widget = self.chat_list.itemWidget(list_item)
            if selected_widget and selected_widget.styleSheet() == "background-color: #e8f0fe;":
                # 更新时间
                current_time = self.get_current_time()
                for child in selected_widget.findChildren(QLabel):
                    if ':' in child.text() and any(c in child.text() for c in '0123456789'):
                        child.setText(current_time)

                # 更新消息预览
                for child in selected_widget.findChildren(QLabel):
                    if child.objectName() != 'chatNameLabel' and ':' not in child.text() and not any(c in child.text() for c in '0123456789'):
                        # 截取消息预览
                        preview = latest_message[:20] + '...' if len(latest_message) > 20 else latest_message
                        child.setText(preview)

    def on_send_button_clicked(self):
        """处理发送按钮点击事件"""
        text = self.message_input.toPlainText().strip()
        if text:
            # 添加消息到聊天区域
            self.add_message(text, is_self=True)

            # 更新聊天列表中的最新消息
            self.update_chat_list_latest_message(text)

            # 清空输入框
            self.message_input.clear()

            # 禁用发送按钮
            self.send_btn.setEnabled(False)

            # 重置在线状态
            import random
            statuses = ['在线', '最近在线', '已读']
            self.online_status.setText(random.choice(statuses))

            # 模拟回复（随机延迟后自动回复）
            self.simulate_reply(text)

            # 这里可以添加发送消息到服务器的逻辑

    def simulate_reply(self, message_text):
        """模拟自动回复功能"""
        # 定义一些简单的回复模式
        replies = {
            '你好': '你好！很高兴见到你！',
            '在吗': '我在呢，有什么可以帮你的？',
            '早上好': '早上好！祝你有美好的一天！',
            '晚上好': '晚上好！今天过得怎么样？',
            '谢谢': '不客气！',
            '再见': '再见！下次再聊！'
        }

        # 检查是否有匹配的回复
        reply_text = None
        for keyword, reply in replies.items():
            if keyword in message_text:
                reply_text = reply
                break

        # 如果没有匹配的回复，生成随机回复
        if not reply_text:
            import random
            random_replies = [
                '好的，我知道了。',
                '明白，我会处理的。',
                '这个问题很有趣，能详细说说吗？',
                '我理解你的意思。',
                '让我想想...',
                '收到！'
            ]
            reply_text = random.choice(random_replies)

        # 设置定时器，模拟延迟回复
        self.reply_timer = QTimer()
        self.reply_timer.timeout.connect(lambda: self.add_reply(reply_text))
        self.reply_timer.setSingleShot(True)

        import random
        delay = random.randint(1000, 3000)  # 1-3秒的随机延迟
        self.reply_timer.start(delay)

    def on_file_button_clicked(self):
        """处理文件按钮点击事件"""
        options = QFileDialog.Options()
        file_path, _ = QFileDialog.getOpenFileName(
            self, "选择文件", "", "所有文件 (*);;文档 (*.doc *.docx *.pdf *.txt);;图片 (*.png *.jpg *.jpeg)", options=options)
        if file_path:
            # 显示文件路径作为消息
            file_name = os.path.basename(file_path)
            self.add_message(f'📎 {file_name}', is_self=True)

    def on_emoji_button_clicked(self):
        """处理表情按钮点击事件"""
        # 显示表情面板
        self.show_emoji_panel()

    def on_image_button_clicked(self):
        """图片按钮点击事件"""
        # 简单实现，实际项目中可能需要打开文件选择器
        pass

    def on_voice_button_clicked(self):
        """语音按钮点击事件"""
        # 简单实现，实际项目中可能需要录音功能
        pass

    def on_video_button_clicked(self):
        """视频按钮点击事件"""
        # 简单实现，实际项目中可能需要视频录制功能
        pass

    def on_search_button_clicked(self):
        """处理搜索按钮点击事件"""
        QMessageBox.information(self, "搜索", "聊天记录搜索功能暂未实现")

    def search_emojis(self, search_text):
        """搜索表情功能"""
        # 这里只是简单的实现，实际应用中可以根据表情名称或描述进行搜索
        # 由于我们只有表情符号，这里只是为了演示搜索框的功能
        search_text = search_text.strip().lower()
        if not search_text:
            # 如果搜索框为空，恢复所有表情
            self.reset_emoji_view()
            return

        # 这里可以实现更复杂的搜索逻辑
        # 简单的实现：显示常用表情或提示"未找到"
        if hasattr(self.emoji_search_box, 'last_search') and self.emoji_search_box.last_search == search_text:
            return

        self.emoji_search_box.last_search = search_text

        # 这里可以添加实际的搜索逻辑

    def reset_emoji_view(self):
        """重置表情视图"""
        # 重置搜索框
        if hasattr(self.emoji_search_box, 'last_search'):
            delattr(self.emoji_search_box, 'last_search')

    def eventFilter(self, obj, event):
        """事件过滤器，用于处理表情面板的点击事件"""
        # 处理全局点击事件以关闭表情面板
        if event.type() == QEvent.MouseButtonPress:
            # 如果点击的不是表情面板或表情按钮，关闭表情面板
            if hasattr(self, 'emoji_panel') and self.emoji_panel.isVisible():
                # 检查是否点击了表情面板
                if not self.emoji_panel.rect().contains(self.emoji_panel.mapFromGlobal(event.globalPos())):
                    # 检查是否点击了表情按钮
                    if hasattr(self, 'emoji_btn'):
                        btn_rect = self.emoji_btn.rect()
                        btn_global_pos = self.emoji_btn.mapToGlobal(QPoint(0, 0))
                        btn_global_rect = QRect(btn_global_pos, btn_rect.size())
                        if not btn_global_rect.contains(event.globalPos()):
                            self.emoji_panel.close()
        return super().eventFilter(obj, event)

    def show_emoji_panel(self):
        """显示表情面板"""
        # 如果表情面板不存在，创建它
        if not hasattr(self, 'emoji_panel'):
            self.emoji_panel = QWidget(self)
            self.emoji_panel.setWindowFlags(Qt.Popup | Qt.FramelessWindowHint | Qt.WindowStaysOnTopHint)
            self.emoji_panel.setStyleSheet("""
                QWidget {
                    background-color: white;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                }
            """)

            # 创建表情面板布局
            emoji_layout = QGridLayout(self.emoji_panel)
            emoji_layout.setSpacing(8)
            emoji_layout.setContentsMargins(12, 12, 12, 12)

            # 常用表情列表
            emojis = [
                '😊', '😂', '🤣', '😍', '🤔', '😅', '🙄', '😁',
                '😆', '😉', '😘', '🥰', '😎', '🤩', '😏', '😢',
                '😭', '😡', '🤬', '😱', '😨', '😰', '😥', '😓',
                '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑',
                '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯',
                '😪', '😫', '😴', '😌', '😛', '😜', '😝', '🤤',
                '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '☹️',
                '🙁', '😖', '😞', '😟', '😤', '😢', '😭', '😦'
            ]

            # 添加表情按钮
            row, col = 0, 0
            for emoji in emojis:
                btn = QPushButton(emoji)
                btn.setFixedSize(36, 36)
                btn.setStyleSheet("""
                    QPushButton {
                        border: none;
                        background-color: transparent;
                        font-size: 20px;
                    }
                    QPushButton:hover {
                        background-color: #f0f0f0;
                        border-radius: 4px;
                    }
                """)
                btn.clicked.connect(lambda checked, e=emoji: self.add_emoji_to_input(e))
                emoji_layout.addWidget(btn, row, col)

                col += 1
                if col >= 8:
                    col = 0
                    row += 1

            # 调整面板大小
            self.emoji_panel.adjustSize()

            # 确保事件过滤器被正确安装
            QApplication.instance().installEventFilter(self)

        # 计算面板位置（在输入框上方）
        input_pos = self.message_input.mapToGlobal(QPoint(0, 0))
        panel_x = input_pos.x()
        panel_y = input_pos.y() - self.emoji_panel.height() - 10

        # 确保面板不会超出屏幕边界
        screen_geometry = QApplication.desktop().availableGeometry()
        if panel_y < screen_geometry.top():
            panel_y = input_pos.y() + self.message_input.height() + 10
        if panel_x + self.emoji_panel.width() > screen_geometry.right():
            panel_x = screen_geometry.right() - self.emoji_panel.width() - 10

        # 显示面板
        self.emoji_panel.move(panel_x, panel_y)
        self.emoji_panel.raise_()
        self.emoji_panel.setFocus()
        self.emoji_panel.show()

    def add_emoji_to_input(self, emoji):
        """添加表情到输入框"""
        # 获取当前光标位置
        cursor = self.message_input.textCursor()
        cursor.insertText(emoji)
        self.message_input.setTextCursor(cursor)
        self.message_input.setFocus()

        # 更新发送按钮状态
        self.send_btn.setEnabled(bool(self.message_input.toPlainText().strip()))

        # 关闭表情面板
        if hasattr(self, 'emoji_panel') and self.emoji_panel.isVisible():
            self.emoji_panel.close()

# 主函数
if __name__ == '__main__':
    app = QApplication(sys.argv)
    # 设置应用程序样式
    app.setStyle('Fusion')

    # 设置全局样式
    app.setStyleSheet("""
        QApplication {
            font-family: SimHei, Microsoft YaHei, Arial, sans-serif;
        }
    """)

    # 创建并显示主窗口
    window = WeChatClone()
    window.show()

    # 运行应用程序
    sys.exit(app.exec_())
```
