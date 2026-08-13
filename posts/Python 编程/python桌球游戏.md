---
title: Python桌球游戏
slug: python桌球游戏
category: Python 编程
summary: 下面是一个使用Pygame库实现的简单2D桌球游戏代码：
tags: Python
---

下面是一个使用Pygame库实现的简单2D桌球游戏代码：


```python
import pygame
import sys
import math
import random

# 初始化pygame
pygame.init()

# 游戏常量
WIDTH, HEIGHT = 800, 600
BALL_RADIUS = 15
POCKET_RADIUS = 25
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
GREEN = (0, 100, 0)
BROWN = (139, 69, 19)
RED = (255, 0, 0)
BLUE = (0, 0, 255)
YELLOW = (255, 255, 0)
ORANGE = (255, 165, 0)
PURPLE = (128, 0, 128)
PINK = (255, 192, 203)
GRAY = (128, 128, 128)

# 创建游戏窗口
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("桌球游戏")

# 球杆类
class Cue:
    def __init__(self):
        self.length = 150
        self.width = 5
        self.color = BROWN
        self.angle = 0
        self.power = 0
        self.max_power = 15
        self.visible = False

    def draw(self, surface, pos):
        if not self.visible:
            return

        end_x = pos[0] + math.cos(self.angle) * self.length
        end_y = pos[1] + math.sin(self.angle) * self.length

        # 绘制球杆
        pygame.draw.line(surface, self.color, pos, (end_x, end_y), self.width)

        # 绘制力量指示器
        power_height = self.power * 2
        pygame.draw.rect(surface, RED, (pos[0] + 30, pos[1] - 50, 20, 50), 2)
        pygame.draw.rect(surface, RED, (pos[0] + 30, pos[1] - power_height, 20, power_height))

# 球类
class Ball:
    def __init__(self, x, y, color, number=0):
        self.x = x
        self.y = y
        self.color = color
        self.radius = BALL_RADIUS
        self.vx = 0
        self.vy = 0
        self.number = number
        self.in_pocket = False

    def draw(self, surface):
        if self.in_pocket:
            return

        pygame.draw.circle(surface, self.color, (int(self.x), int(self.y)), self.radius)

        if self.number > 0:
            text_color = WHITE if self.color == BLACK else BLACK
            font = pygame.font.SysFont(None, 20)
            text = font.render(str(self.number), True, text_color)
            text_rect = text.get_rect(center=(int(self.x), int(self.y)))
            surface.blit(text, text_rect)

    def update(self, table):
        if self.in_pocket:
            return

        # 更新位置
        self.x += self.vx
        self.y += self.vy

        # 摩擦力减速
        self.vx *= 0.98
        self.vy *= 0.98

        # 如果速度很小，停止运动
        if abs(self.vx) < 0.1 and abs(self.vy) < 0.1:
            self.vx = 0
            self.vy = 0

        # 边界碰撞检测
        if self.x - self.radius < table.margin:
            self.x = table.margin + self.radius
            self.vx = -self.vx * 0.8
        elif self.x + self.radius > table.width - table.margin:
            self.x = table.width - table.margin - self.radius
            self.vx = -self.vx * 0.8

        if self.y - self.radius < table.margin:
            self.y = table.margin + self.radius
            self.vy = -self.vy * 0.8
        elif self.y + self.radius > table.height - table.margin:
            self.y = table.height - table.margin - self.radius
            self.vy = -self.vy * 0.8

    def check_pocket(self, pockets):
        for pocket in pockets:
            dx = self.x - pocket[0]
            dy = self.y - pocket[1]
            distance = math.sqrt(dx*dx + dy*dy)

            if distance < POCKET_RADIUS:
                self.in_pocket = True
                return True
        return False

# 球桌类
class Table:
    def __init__(self, width, height):
        self.width = width
        self.height = height
        self.margin = 50
        self.color = GREEN
        self.border_color = BROWN
        self.border_width = 20

        # 定义袋口位置
        self.pockets = [
            (self.margin, self.margin),  # 左上
            (self.width // 2, self.margin - 10),  # 中上
            (self.width - self.margin, self.margin),  # 右上
            (self.margin, self.height - self.margin),  # 左下
            (self.width // 2, self.height - self.margin + 10),  # 中下
            (self.width - self.margin, self.height - self.margin)  # 右下
        ]

    def draw(self, surface):
        # 绘制边框
        pygame.draw.rect(surface, self.border_color, (0, 0, self.width, self.height))

        # 绘制桌面
        pygame.draw.rect(surface, self.color,
                        (self.margin, self.margin,
                         self.width - 2*self.margin,
                         self.height - 2*self.margin))

        # 绘制袋口
        for pocket in self.pockets:
            pygame.draw.circle(surface, BLACK, pocket, POCKET_RADIUS)

# 游戏类
class PoolGame:
    def __init__(self):
        self.table = Table(WIDTH, HEIGHT)
        self.cue = Cue()
        self.balls = []
        self.init_balls()
        self.current_player = 1
        self.game_over = False
        self.winner = None

    def init_balls(self):
        # 白球（母球）
        white_ball = Ball(WIDTH // 4, HEIGHT // 2, WHITE, 0)
        self.balls.append(white_ball)
        self.cue_ball = white_ball

        # 其他球（三角形排列）
        colors = [RED, YELLOW, BLUE, PURPLE, ORANGE, GREEN, PINK, BLACK,
                 YELLOW, BLUE, PURPLE, ORANGE, GREEN, PINK, RED]

        start_x = WIDTH * 3 // 4
        start_y = HEIGHT // 2
        rows = 5
        ball_idx = 0

        for row in range(rows):
            for col in range(row + 1):
                if ball_idx < len(colors):
                    x = start_x + row * BALL_RADIUS * 2
                    y = start_y - (row * BALL_RADIUS) + (col * BALL_RADIUS * 2)
                    self.balls.append(Ball(x, y, colors[ball_idx], ball_idx + 1))
                    ball_idx += 1

    def check_collisions(self):
        for i in range(len(self.balls)):
            if self.balls[i].in_pocket:
                continue

            for j in range(i + 1, len(self.balls)):
                if self.balls[j].in_pocket:
                    continue

                dx = self.balls[i].x - self.balls[j].x
                dy = self.balls[i].y - self.balls[j].y
                distance = math.sqrt(dx*dx + dy*dy)

                if distance < self.balls[i].radius + self.balls[j].radius:
                    # 碰撞响应
                    angle = math.atan2(dy, dx)

                    # 速度分量
                    v1 = math.sqrt(self.balls[i].vx**2 + self.balls[i].vy**2)
                    v2 = math.sqrt(self.balls[j].vx**2 + self.balls[j].vy**2)

                    # 方向角度
                    dir1 = math.atan2(self.balls[i].vy, self.balls[i].vx)
                    dir2 = math.atan2(self.balls[j].vy, self.balls[j].vx)

                    # 新速度分量
                    new_vx1 = v2 * math.cos(dir2 - angle) * math.cos(angle) + v1 * math.sin(dir1 - angle) * math.cos(angle + math.pi/2)
                    new_vy1 = v2 * math.cos(dir2 - angle) * math.sin(angle) + v1 * math.sin(dir1 - angle) * math.sin(angle + math.pi/2)

                    new_vx2 = v1 * math.cos(dir1 - angle) * math.cos(angle) + v2 * math.sin(dir2 - angle) * math.cos(angle + math.pi/2)
                    new_vy2 = v1 * math.cos(dir1 - angle) * math.sin(angle) + v2 * math.sin(dir2 - angle) * math.sin(angle + math.pi/2)

                    # 更新速度
                    self.balls[i].vx = new_vx1 * 0.95
                    self.balls[i].vy = new_vy1 * 0.95
                    self.balls[j].vx = new_vx2 * 0.95
                    self.balls[j].vy = new_vy2 * 0.95

                    # 防止球重叠
                    overlap = (self.balls[i].radius + self.balls[j].radius - distance) / 2
                    self.balls[i].x += overlap * math.cos(angle)
                    self.balls[i].y += overlap * math.sin(angle)
                    self.balls[j].x -= overlap * math.cos(angle)
                    self.balls[j].y -= overlap * math.sin(angle)

    def all_balls_stopped(self):
        for ball in self.balls:
            if not ball.in_pocket and (ball.vx != 0 or ball.vy != 0):
                return False
        return True

    def update(self):
        for ball in self.balls:
            ball.update(self.table)
            ball.check_pocket(self.table.pockets)

        self.check_collisions()

        # 检查游戏是否结束
        if self.cue_ball.in_pocket:
            self.game_over = True
            self.winner = "玩家2" if self.current_player == 1 else "玩家1"

        balls_left = sum(1 for ball in self.balls if not ball.in_pocket and ball != self.cue_ball)
        if balls_left == 0:
            self.game_over = True
            self.winner = f"玩家{self.current_player}"

    def draw(self, surface):
        self.table.draw(surface)

        for ball in self.balls:
            ball.draw(surface)

        if self.all_balls_stopped() and not self.cue_ball.in_pocket:
            self.cue.visible = True
            mouse_x, mouse_y = pygame.mouse.get_pos()
            self.cue.angle = math.atan2(mouse_y - self.cue_ball.y, mouse_x - self.cue_ball.x) + math.pi
            self.cue.draw(surface, (self.cue_ball.x, self.cue_ball.y))
        else:
            self.cue.visible = False

        # 显示当前玩家
        font = pygame.font.SysFont(None, 36)
        text = font.render(f"当前玩家: {self.current_player}", True, WHITE)
        surface.blit(text, (10, 10))

        if self.game_over:
            font = pygame.font.SysFont(None, 72)
            text = font.render(f"{self.winner} 获胜!", True, WHITE)
            text_rect = text.get_rect(center=(WIDTH//2, HEIGHT//2))
            pygame.draw.rect(surface, BLACK, text_rect.inflate(20, 20))
            surface.blit(text, text_rect)

            font = pygame.font.SysFont(None, 36)
            text = font.render("按R键重新开始", True, WHITE)
            text_rect = text.get_rect(center=(WIDTH//2, HEIGHT//2 + 50))
            surface.blit(text, text_rect)

    def shoot(self, power):
        if self.all_balls_stopped() and not self.cue_ball.in_pocket:
            self.cue_ball.vx = math.cos(self.cue.angle) * power
            self.cue_ball.vy = math.sin(self.cue.angle) * power
            self.current_player = 3 - self.current_player  # 切换玩家(1->2, 2->1)

    def reset(self):
        self.__init__()

# 主游戏循环
def main():
    clock = pygame.time.Clock()
    game = PoolGame()

    power_increasing = False

    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()

            if event.type == pygame.MOUSEBUTTONDOWN:
                if game.all_balls_stopped() and not game.cue_ball.in_pocket:
                    power_increasing = True

            if event.type == pygame.MOUSEBUTTONUP:
                if power_increasing:
                    game.shoot(game.cue.power)
                    power_increasing = False
                    game.cue.power = 0

            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_r:
                    game.reset()
                    power_increasing = False

        # 增加力量
        if power_increasing and game.cue.power < game.cue.max_power:
            game.cue.power += 0.2

        game.update()

        screen.fill(BLACK)
        game.draw(screen)

        pygame.display.flip()
        clock.tick(60)

if __name__ == "__main__":
    main()
```


### 运行说明


1.

    你需要安装Pygame库才能运行此代码：`pip install pygame`


2.

    游戏规则：


    -

        玩家轮流击球


    -

        使用鼠标瞄准，点击并按住鼠标按钮来增加击球力量


    -

        释放鼠标按钮来击球


    -

        如果白球（母球）进袋，游戏结束，对方获胜


    -

        将所有彩色球击入袋中即可获胜


### 游戏功能


-

    真实的物理碰撞模拟


-

    球杆瞄准系统


-

    力量指示器


-

    多个袋口


-

    玩家轮流击球


-

    游戏胜负判定


你可以根据需要修改代码，调整游戏难度、球桌大小或添加更多功能！
