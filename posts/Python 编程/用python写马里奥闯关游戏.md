---
title: 用Python写马里奥闯关游戏
slug: 用python写马里奥闯关游戏
category: Python 编程
summary: 创建一个简化版的超级玛丽游戏。这个游戏实现了马里奥的基本移动、跳跃、收集金币、与敌人互动等核心功能。
tags: Python
---

创建一个简化版的超级玛丽游戏。这个游戏实现了马里奥的基本移动、跳跃、收集金币、与敌人互动等核心功能。


```python
import pygame
import sys
import random

# 初始化pygame
pygame.init()

# 游戏窗口设置
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 450
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("超级玛丽")

# 确保中文能正常显示
pygame.font.init()
font_options = ["SimHei", "WenQuanYi Micro Hei", "Heiti TC", pygame.font.get_default_font()]
font = None
for font_name in font_options:
    try:
        font = pygame.font.SysFont(font_name, 36)
        break
    except:
        continue

# 颜色定义
SKY_BLUE = (135, 206, 235)
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
GREEN = (34, 139, 34)    # 地面颜色
BROWN = (139, 69, 19)    # 敌人颜色
RED = (255, 0, 0)        # 马里奥颜色
YELLOW = (255, 215, 0)   # 金币颜色
GRAY = (169, 169, 169)   # 砖块颜色

# 游戏帧率
clock = pygame.time.Clock()
FPS = 60

# 马里奥类
class Mario(pygame.sprite.Sprite):
    def __init__(self, x, y):
        super().__init__()
        self.width = 40
        self.height = 60
        self.image = pygame.Surface((self.width, self.height))
        self.image.fill(RED)
        self.rect = self.image.get_rect()
        self.rect.x = x
        self.rect.y = y

        # 移动属性
        self.vel_x = 0
        self.vel_y = 0
        self.speed = 5
        self.jump_strength = -15
        self.gravity = 0.8
        self.on_ground = False

    def update(self, platforms):
        # 应用重力
        self.vel_y += self.gravity
        if self.vel_y > 10:  # 限制最大下落速度
            self.vel_y = 10

        # 水平移动
        self.rect.x += self.vel_x

        # 水平碰撞检测
        for platform in platforms:
            if pygame.sprite.collide_rect(self, platform):
                if self.vel_x > 0:  # 向右移动
                    self.rect.right = platform.rect.left
                elif self.vel_x < 0:  # 向左移动
                    self.rect.left = platform.rect.right

        # 垂直移动
        self.rect.y += self.vel_y
        self.on_ground = False

        # 垂直碰撞检测
        for platform in platforms:
            if pygame.sprite.collide_rect(self, platform):
                if self.vel_y > 0:  # 下落
                    self.rect.bottom = platform.rect.top
                    self.vel_y = 0
                    self.on_ground = True
                elif self.vel_y < 0:  # 上升
                    self.rect.top = platform.rect.bottom
                    self.vel_y = 0

    def jump(self):
        if self.on_ground:
            self.vel_y = self.jump_strength

    def move_left(self):
        self.vel_x = -self.speed

    def move_right(self):
        self.vel_x = self.speed

    def stop(self):
        self.vel_x = 0

# 平台类
class Platform(pygame.sprite.Sprite):
    def __init__(self, x, y, width, height, color=GREEN):
        super().__init__()
        self.image = pygame.Surface((width, height))
        self.image.fill(color)
        self.rect = self.image.get_rect()
        self.rect.x = x
        self.rect.y = y

# 敌人类
class Enemy(pygame.sprite.Sprite):
    def __init__(self, x, y, width=40, height=40):
        super().__init__()
        self.image = pygame.Surface((width, height))
        self.image.fill(BROWN)
        self.rect = self.image.get_rect()
        self.rect.x = x
        self.rect.y = y
        self.speed = random.choice([-2, 2])

    def update(self, platforms):
        self.rect.x += self.speed

        # 碰撞检测，让敌人在平台边缘转向
        for platform in platforms:
            if pygame.sprite.collide_rect(self, platform):
                if self.speed > 0:  # 向右移动
                    self.rect.right = platform.rect.left
                    self.speed = -self.speed
                elif self.speed < 0:  # 向左移动
                    self.rect.left = platform.rect.right
                    self.speed = -self.speed

# 金币类
class Coin(pygame.sprite.Sprite):
    def __init__(self, x, y, size=30):
        super().__init__()
        self.original_image = pygame.Surface((size, size), pygame.SRCALPHA)
        self.original_image.fill(YELLOW)
        self.image = self.original_image.copy()
        self.rect = self.image.get_rect()
        self.rect.center = (x, y)
        # 添加金币旋转动画
        self.angle = 0
        self.rotate_speed = 5

    def update(self):
        self.angle = (self.angle + self.rotate_speed) % 360
        self.image = pygame.transform.rotate(self.original_image, self.angle)
        # 保持旋转后位置不变
        self.rect = self.image.get_rect(center=self.rect.center)

# 创建游戏关卡
def create_level():
    platforms = pygame.sprite.Group()
    enemies = pygame.sprite.Group()
    coins = pygame.sprite.Group()

    # 地面
    platforms.add(Platform(0, SCREEN_HEIGHT - 40, SCREEN_WIDTH, 40))

    # 平台和砖块
    platforms.add(Platform(200, 350, 150, 20, GRAY))
    platforms.add(Platform(400, 300, 150, 20, GRAY))
    platforms.add(Platform(600, 250, 150, 20, GRAY))
    platforms.add(Platform(300, 200, 150, 20, GRAY))
    platforms.add(Platform(100, 150, 150, 20, GRAY))

    # 敌人
    enemies.add(Enemy(250, 350 - 40 - 40))  # 放在第一个平台上
    enemies.add(Enemy(450, 300 - 40 - 40))  # 放在第二个平台上

    # 金币
    coins.add(Coin(275, 350 - 20 - 15))
    coins.add(Coin(325, 350 - 20 - 15))
    coins.add(Coin(475, 300 - 20 - 15))
    coins.add(Coin(525, 300 - 20 - 15))
    coins.add(Coin(175, 150 - 20 - 15))

    return platforms, enemies, coins

# 主游戏函数
def main():
    # 创建游戏元素
    platforms, enemies, coins = create_level()
    mario = Mario(50, SCREEN_HEIGHT - 40 - 60)  # 初始位置在地面上

    # 创建精灵组 - 分开管理不同类型的精灵
    all_sprites = pygame.sprite.Group()
    all_sprites.add(mario)
    all_sprites.add(platforms)
    all_sprites.add(enemies)
    all_sprites.add(coins)

    # 游戏变量
    score = 0
    game_over = False

    # 游戏主循环
    running = True
    while running:
        # 事件处理
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

            # 跳跃
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_SPACE and not game_over:
                    mario.jump()
                if event.key == pygame.K_r and game_over:
                    # 重新开始游戏
                    platforms, enemies, coins = create_level()
                    mario = Mario(50, SCREEN_HEIGHT - 40 - 60)
                    all_sprites.empty()
                    all_sprites.add(mario)
                    all_sprites.add(platforms)
                    all_sprites.add(enemies)
                    all_sprites.add(coins)
                    score = 0
                    game_over = False

        if not game_over:
            # 持续按键检测
            keys = pygame.key.get_pressed()
            if keys[pygame.K_LEFT]:
                mario.move_left()
            elif keys[pygame.K_RIGHT]:
                mario.move_right()
            else:
                mario.stop()

            # 更新游戏状态
            mario.update(platforms)
            enemies.update(platforms)
            coins.update()

            # 检测金币碰撞
            coin_hits = pygame.sprite.spritecollide(mario, coins, True)
            for coin in coin_hits:
                score += 10
                # 从所有精灵组中移除金币
                if coin in all_sprites:
                    all_sprites.remove(coin)

            # 检测敌人碰撞
            enemy_hits = pygame.sprite.spritecollide(mario, enemies, False)
            if enemy_hits:
                # 如果从上方踩敌人
                if mario.vel_y > 0 and mario.rect.bottom <= enemy_hits[0].rect.top + 10:
                    # 从所有精灵组中移除敌人
                    all_sprites.remove(enemy_hits[0])
                    enemies.remove(enemy_hits[0])
                    mario.vel_y = -10  # 给一个小跳跃
                    score += 50
                else:
                    # 游戏结束
                    game_over = True

        # 绘制
        screen.fill(SKY_BLUE)  # 天空蓝色背景
        all_sprites.draw(screen)

        # 显示分数
        score_text = font.render(f"分数: {score}", True, WHITE)
        screen.blit(score_text, (10, 10))

        # 游戏结束提示
        if game_over:
            game_over_text = font.render("游戏结束! 按R键重新开始", True, WHITE)
            text_rect = game_over_text.get_rect(center=(SCREEN_WIDTH//2, SCREEN_HEIGHT//2))
            screen.blit(game_over_text, text_rect)

        # 刷新屏幕
        pygame.display.flip()

        # 控制帧率
        clock.tick(FPS)

    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()

```


这个超级玛丽游戏实现了以下功能：


1.

    基本操作：


    -   左右方向键控制马里奥移动
    -   空格键控制马里奥跳跃
    -   游戏结束后按 R 键重新开始


2.

    游戏元素：


    -   马里奥角色（红色方块）
    -   地面和平台（灰色方块）
    -   敌人（棕色方块）
    -   可收集的金币（黄色旋转方块）


3.

    游戏机制：


    -   重力效果使马里奥能够下落
    -   碰撞检测（与平台、敌人、金币）
    -   计分系统（收集金币和踩敌人得分）
    -   游戏结束条件（碰到敌人）


要运行这个游戏，您需要先安装 Pygame 库，可以使用以下命令安装：


```
pip install pygame
```


您可以进一步扩展这个游戏，比如添加更多关卡、不同类型的敌人、马里奥的状态变化（变大、获得能力）、背景音乐和音效等。


![](/uploads/csdn/用python写马里奥闯关游戏/img-01.gif)
