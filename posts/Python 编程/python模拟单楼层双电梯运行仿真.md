---
title: Python模拟单楼层双电梯运行仿真
slug: python模拟单楼层双电梯运行仿真
category: Python 编程
summary: 《双电梯楼层模拟系统》摘要
tags: Python
---

《双电梯楼层模拟系统》摘要


本文介绍了一个基于Pygame的双电梯楼层模拟系统，包含以下核心功能：


1.  系统采用面向对象设计，包含电梯类、按钮类等组件；
2.  支持10层楼的双电梯运行模拟，具有真实的电梯移动、开关门动画效果；
3.  实现智能调度算法，根据电梯当前状态、方向和距离自动分配最优电梯；
4.  提供完整的用户交互界面，包括楼层呼叫按钮和电梯内部选层按钮；
5.  可视化显示电梯运行状态、当前楼层、负载人数等信息。


该系统通过Pygame实现图形界面，模拟真实电梯的运行逻辑和调度策略，可作为电梯控制算法的教学演示工具。


```python
import pygame
import sys
from pygame.locals import *

# 初始化pygame
pygame.init()

# 确保中文显示正常
pygame.font.init()
font_options = ["SimHei", "WenQuanYi Micro Hei", "Heiti TC", pygame.font.get_default_font()]
system_fonts = pygame.font.get_fonts()
selected_font = None

for font in font_options:
    if font.lower() in system_fonts:
        selected_font = font
        break

# 颜色定义
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
GRAY = (200, 200, 200)
RED = (255, 0, 0)
GREEN = (0, 200, 0)
BLUE = (0, 0, 200)
YELLOW = (255, 255, 0)
LIGHT_BLUE = (173, 216, 230)
LIGHT_GREEN = (144, 238, 144)

# 屏幕设置
WIDTH, HEIGHT = 900, 700
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("双电梯楼层模拟系统")

# 楼层设置
FLOORS = 10  # 总楼层数
FLOOR_HEIGHT = (HEIGHT - 100) // FLOORS  # 每层高度，预留底部空间
ELEVATOR_WIDTH = 120  # 电梯宽度
ELEVATOR_HEIGHT = FLOOR_HEIGHT - 10  # 电梯高度

# 字体设置
def get_font(size):
    return pygame.font.SysFont(selected_font, size)

# 电梯类
class Elevator:
    def __init__(self, x_pos, name, color):
        self.x = x_pos
        self.y = HEIGHT - 100 - FLOOR_HEIGHT  # 初始在1楼
        self.current_floor = 1
        self.target_floors = set()  # 目标楼层集合
        self.direction = 0  # 0: 静止, 1: 上, -1: 下
        self.moving = False  # 是否正在移动
        self.name = name  # 电梯名称（如"A"、"B"）
        self.load = 0  # 负载人数
        self.max_load = 8  # 最大负载
        self.color = color  # 电梯颜色
        self.door_open = False  # 门是否打开
        self.door_timer = 0  # 门打开计时器

    def update(self):
        # 处理门的状态
        if self.door_open:
            self.door_timer += 1
            if self.door_timer > 60:  # 门打开1秒后关闭
                self.door_open = False
                self.door_timer = 0
            return

        # 更新电梯位置
        target_y = HEIGHT - 100 - (self.current_floor * FLOOR_HEIGHT)

        if self.y < target_y:
            # 向上移动
            self.y += 2
            self.direction = 1
            self.moving = True
            if self.y >= target_y:
                self.y = target_y
                self.moving = False
                self.arrived()
        elif self.y > target_y:
            # 向下移动
            self.y -= 2
            self.direction = -1
            self.moving = True
            if self.y <= target_y:
                self.y = target_y
                self.moving = False
                self.arrived()
        else:
            # 静止状态，检查是否有目标楼层
            self.direction = 0
            self.moving = False
            self.check_next_target()

    def arrived(self):
        # 到达目标楼层，开门
        self.door_open = True
        # 移除当前楼层的目标
        if self.current_floor in self.target_floors:
            self.target_floors.remove(self.current_floor)

    def check_next_target(self):
        # 检查下一个目标楼层
        if not self.target_floors:
            return

        # 调度算法：先处理当前方向的目标，再处理反方向的
        if self.direction == 1 or self.direction == 0:  # 向上或静止
            # 查找当前楼层以上的目标
            higher_floors = [f for f in self.target_floors if f > self.current_floor]
            if higher_floors:
                self.current_floor = min(higher_floors)
                return

        if self.direction == -1 or self.direction == 0:  # 向下或静止
            # 查找当前楼层以下的目标
            lower_floors = [f for f in self.target_floors if f < self.current_floor]
            if lower_floors:
                self.current_floor = max(lower_floors)
                return

    def add_target(self, floor):
        # 添加目标楼层
        if 1 <= floor <= FLOORS:
            self.target_floors.add(floor)

    def draw(self):
        # 绘制电梯
        color = self.color
        # 绘制电梯主体
        pygame.draw.rect(screen, color, (self.x, self.y, ELEVATOR_WIDTH, ELEVATOR_HEIGHT))

        # 绘制门
        if self.door_open:
            # 双开门效果
            door_width = ELEVATOR_WIDTH // 2 - 5
            pygame.draw.rect(screen, WHITE, (self.x, self.y, door_width, ELEVATOR_HEIGHT))
            pygame.draw.rect(screen, WHITE, (self.x + ELEVATOR_WIDTH - door_width, self.y, door_width, ELEVATOR_HEIGHT))
        else:
            # 门把手
            pygame.draw.circle(screen, BLACK, (self.x + ELEVATOR_WIDTH // 2, self.y + ELEVATOR_HEIGHT // 2), 5)

        # 绘制电梯名称
        font = get_font(24)
        text = font.render(self.name, True, WHITE)
        screen.blit(text, (self.x + 10, self.y + 10))

        # 显示当前楼层
        floor_text = font.render(f"{self.current_floor}", True, WHITE)
        screen.blit(floor_text, (self.x + ELEVATOR_WIDTH - 30, self.y + 10))

        # 显示方向
        dir_text = ""
        if self.direction == 1:
            dir_text = "↑"
        elif self.direction == -1:
            dir_text = "↓"

        dir_display = font.render(dir_text, True, WHITE)
        screen.blit(dir_display, (self.x + ELEVATOR_WIDTH // 2 - 10, self.y + 10))

        # 显示负载
        load_text = f"{self.load}/{self.max_load}"
        load_display = get_font(16).render(load_text, True, WHITE)
        screen.blit(load_display, (self.x + 10, self.y + ELEVATOR_HEIGHT - 30))

# 楼层按钮类
class FloorButton:
    def __init__(self, x, y, floor, direction):
        self.rect = pygame.Rect(x, y, 40, 40)
        self.floor = floor
        self.direction = direction  # 1: 上, -1: 下
        self.pressed = False
        self.color = GRAY
        self.pressed_color = RED

    def draw(self):
        color = self.pressed_color if self.pressed else self.color
        pygame.draw.rect(screen, color, self.rect, border_radius=5)
        pygame.draw.rect(screen, BLACK, self.rect, 2, border_radius=5)  # 边框

        font = get_font(20)
        text = "↑" if self.direction == 1 else "↓"
        text_surface = font.render(text, True, BLACK)
        screen.blit(text_surface, (self.rect.centerx - 8, self.rect.centery - 10))

    def is_clicked(self, pos):
        return self.rect.collidepoint(pos)

    def toggle(self):
        self.pressed = not self.pressed

# 电梯内部按钮类
class ElevatorButton:
    def __init__(self, x, y, floor):
        self.rect = pygame.Rect(x, y, 40, 40)
        self.floor = floor
        self.pressed = False
        self.color = GRAY
        self.pressed_color = YELLOW

    def draw(self):
        color = self.pressed_color if self.pressed else self.color
        pygame.draw.rect(screen, color, self.rect, border_radius=5)
        pygame.draw.rect(screen, BLACK, self.rect, 2, border_radius=5)  # 边框

        font = get_font(20)
        text_surface = font.render(str(self.floor), True, BLACK)
        screen.blit(text_surface, (self.rect.centerx - 8, self.rect.centery - 10))

    def is_clicked(self, pos):
        return self.rect.collidepoint(pos)

    def toggle(self):
        self.pressed = not self.pressed

# 模拟系统类
class ElevatorSimulation:
    def __init__(self):
        self.elevator_a = Elevator(WIDTH // 3 - ELEVATOR_WIDTH // 2, "A", BLUE)
        self.elevator_b = Elevator(2 * WIDTH // 3 - ELEVATOR_WIDTH // 2, "B", GREEN)
        self.elevators = [self.elevator_a, self.elevator_b]

        # 创建楼层按钮
        self.floor_buttons = []
        button_x = WIDTH - 100

        for floor in range(1, FLOORS + 1):
            y_pos = HEIGHT - 100 - (floor * FLOOR_HEIGHT) + (FLOOR_HEIGHT - 40) // 2

            # 除了最高层外，都有向上按钮
            if floor < FLOORS:
                up_button = FloorButton(button_x, y_pos, floor, 1)
                self.floor_buttons.append(up_button)

            # 除了最底层外，都有向下按钮
            if floor > 1:
                down_button = FloorButton(button_x + 50, y_pos, floor, -1)
                self.floor_buttons.append(down_button)

        # 创建电梯内部按钮
        self.elevator_buttons_a = []
        self.elevator_buttons_b = []

        btn_a_x = self.elevator_a.x + 10
        btn_b_x = self.elevator_b.x + 10
        start_y = HEIGHT - 100 - 60  # 底部按钮区域

        # 为每个电梯创建楼层按钮（分两列）
        for i in range(FLOORS):
            floor = i + 1
            col = i % 5  # 5个按钮一列
            row = i // 5

            # 电梯A的按钮
            btn_a = ElevatorButton(btn_a_x + col * 50, start_y - row * 50, floor)
            self.elevator_buttons_a.append(btn_a)

            # 电梯B的按钮
            btn_b = ElevatorButton(btn_b_x + col * 50, start_y - row * 50, floor)
            self.elevator_buttons_b.append(btn_b)

    def handle_events(self):
        for event in pygame.event.get():
            if event.type == QUIT:
                return False
            elif event.type == MOUSEBUTTONDOWN:
                self.handle_click(event.pos)
            elif event.type == KEYDOWN:
                if event.key == K_ESCAPE:
                    return False

        return True

    def handle_click(self, pos):
        # 处理楼层按钮点击
        for button in self.floor_buttons:
            if button.is_clicked(pos):
                button.toggle()
                self.assign_elevator(button.floor, button.direction)

        # 处理电梯A内部按钮点击
        for button in self.elevator_buttons_a:
            if button.is_clicked(pos):
                button.toggle()
                self.elevator_a.add_target(button.floor)

        # 处理电梯B内部按钮点击
        for button in self.elevator_buttons_b:
            if button.is_clicked(pos):
                button.toggle()
                self.elevator_b.add_target(button.floor)

    def assign_elevator(self, floor, direction):
        # 电梯分配算法
        # 计算每个电梯到目标楼层的距离和方向因素
        score_a = self.calculate_score(self.elevator_a, floor, direction)
        score_b = self.calculate_score(self.elevator_b, floor, direction)

        # 选择分数较低（更适合）的电梯
        if score_a <= score_b:
            self.elevator_a.add_target(floor)
        else:
            self.elevator_b.add_target(floor)

    def calculate_score(self, elevator, floor, direction):
        # 计算电梯适合度分数（越低越好）
        distance = abs(elevator.current_floor - floor)

        # 方向因素：同方向加分，反方向减分
        if elevator.direction == direction:
            # 同方向且能顺道接应
            if (direction == 1 and elevator.current_floor < floor) or \
               (direction == -1 and elevator.current_floor > floor):
                distance *= 0.5  # 同方向优势
        elif elevator.direction != 0:
            # 反方向，需要额外成本
            distance *= 1.5

        # 静止的电梯有优势
        if elevator.direction == 0 and not elevator.moving:
            distance *= 0.8

        return distance

    def update(self):
        # 更新电梯状态
        for elevator in self.elevators:
            elevator.update()

        # 检查楼层按钮状态（如果电梯到达，重置按钮）
        for button in self.floor_buttons:
            if button.pressed:
                for elevator in self.elevators:
                    if elevator.current_floor == button.floor and not elevator.moving:
                        # 检查电梯是否朝着按钮的方向移动或静止
                        if (button.direction == 1 and elevator.direction in [0, 1]) or \
                           (button.direction == -1 and elevator.direction in [0, -1]):
                            button.pressed = False
                            break

        # 检查电梯内部按钮状态
        for btn in self.elevator_buttons_a:
            if btn.pressed and btn.floor == self.elevator_a.current_floor and not self.elevator_a.moving:
                btn.pressed = False

        for btn in self.elevator_buttons_b:
            if btn.pressed and btn.floor == self.elevator_b.current_floor and not self.elevator_b.moving:
                btn.pressed = False

    def draw(self):
        screen.fill(WHITE)

        # 绘制背景
        pygame.draw.rect(screen, LIGHT_BLUE, (0, 0, WIDTH, HEIGHT - 100))
        pygame.draw.rect(screen, LIGHT_GREEN, (0, HEIGHT - 100, WIDTH, 100))

        # 绘制楼层
        font = get_font(24)
        for floor in range(1, FLOORS + 1):
            y_pos = HEIGHT - 100 - (floor * FLOOR_HEIGHT)
            # 绘制楼层线
            pygame.draw.line(screen, BLACK, (0, y_pos), (WIDTH, y_pos), 2)
            # 绘制楼层号
            floor_text = font.render(f"{floor}楼", True, BLACK)
            screen.blit(floor_text, (20, y_pos - FLOOR_HEIGHT // 2 - 12))

        # 绘制电梯
        for elevator in self.elevators:
            elevator.draw()

        # 绘制楼层按钮
        for button in self.floor_buttons:
            button.draw()

        # 绘制电梯内部按钮
        for btn in self.elevator_buttons_a + self.elevator_buttons_b:
            btn.draw()

        # 绘制电梯区域标题
        font = get_font(20)
        a_text = font.render("电梯 A", True, BLACK)
        b_text = font.render("电梯 B", True, BLACK)
        screen.blit(a_text, (self.elevator_a.x + ELEVATOR_WIDTH // 2 - 30, HEIGHT - 90))
        screen.blit(b_text, (self.elevator_b.x + ELEVATOR_WIDTH // 2 - 30, HEIGHT - 90))

        # 绘制说明文字
        info_font = get_font(16)
        info_text = info_font.render("操作: 点击右侧楼层按钮呼叫电梯，点击电梯内按钮选择目标楼层", True, BLACK)
        screen.blit(info_text, (20, HEIGHT - 40))

        pygame.display.flip()

# 主函数
def main():
    clock = pygame.time.Clock()
    simulation = ElevatorSimulation()

    running = True
    while running:
        running = simulation.handle_events()
        simulation.update()
        simulation.draw()
        clock.tick(60)

    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()
```


效果如下


![](/uploads/csdn/python模拟单楼层双电梯运行仿真/img-01.gif)
