---
title: Python画绚烂浪漫的烟花效果
slug: python画绚烂浪漫的烟花效果
category: Python 编程
summary: 这篇文章介绍了一个使用Pygame库实现的多种类型烟花模拟程序。程序实现了四种不同形状的烟花效果：圆形爆炸、星形爆炸、螺旋爆炸和心形爆炸。每个烟花由多个粒子组成，通过不同的参数方程控制粒子运动轨迹形成特定图案。程序提供了实时交互功能，用户可以通过空格键添加新烟花组，系统也会随机生成烟花。视觉效果方面，实现了粒子淡出和尾迹效果，增强了真实感。这个模拟展示了如何使用数学函数控制粒子行为来创造多样的视觉…
tags: Python
---

这篇文章介绍了一个使用Pygame库实现的多种类型烟花模拟程序。程序实现了四种不同形状的烟花效果：圆形爆炸、星形爆炸、螺旋爆炸和心形爆炸。每个烟花由多个粒子组成，通过不同的参数方程控制粒子运动轨迹形成特定图案。程序提供了实时交互功能，用户可以通过空格键添加新烟花组，系统也会随机生成烟花。视觉效果方面，实现了粒子淡出和尾迹效果，增强了真实感。这个模拟展示了如何使用数学函数控制粒子行为来创造多样的视觉效果。


![](/uploads/csdn/python画绚烂浪漫的烟花效果/img-01.gif)


```python
import pygame
import random
import math
import sys

# 初始化pygame
pygame.init()

# 设置窗口尺寸
WIDTH, HEIGHT = 1000, 700
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("绚烂烟花模拟 - 多种类型烟花展示")

# 颜色定义
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
COLORS = [
    (255, 0, 0), (0, 255, 0), (0, 0, 255),
    (255, 255, 0), (255, 0, 255), (0, 255, 255),
    (255, 165, 0), (255, 192, 203), (138, 43, 226)
]

# 烟花粒子类
class Particle:
    def __init__(self, x, y, color, velocity_x, velocity_y, size=2, decay=0.97, gravity=0.15):
        self.x = x
        self.y = y
        self.color = color
        self.velocity_x = velocity_x
        self.velocity_y = velocity_y
        self.size = size
        self.decay = decay
        self.gravity = gravity
        self.lifetime = 255

    def update(self):
        self.velocity_x *= self.decay
        self.velocity_y *= self.decay
        self.velocity_y += self.gravity
        self.x += self.velocity_x
        self.y += self.velocity_y
        self.lifetime -= 4

    def draw(self, surface):
        if self.lifetime > 0:
            alpha = min(self.lifetime, 255)
            color_with_alpha = (self.color[0], self.color[1], self.color[2], alpha)
            surf = pygame.Surface((self.size * 2, self.size * 2), pygame.SRCALPHA)
            pygame.draw.circle(surf, color_with_alpha, (self.size, self.size), self.size)
            surface.blit(surf, (int(self.x - self.size), int(self.y - self.size)))

    def is_dead(self):
        return self.lifetime <= 0

# 烟花类
class Firework:
    def __init__(self, x, y, type_index):
        self.x = x
        self.y = y
        self.type_index = type_index
        self.color = random.choice(COLORS)
        self.particles = []
        self.exploded = False
        self.velocity_y = -random.uniform(8, 12)
        self.gravity = 0.2

        # 根据类型索引决定烟花类型
        self.type = type_index % 4  # 0:圆形, 1:星形, 2:螺旋, 3:心形

    def update(self):
        if not self.exploded:
            self.velocity_y += self.gravity
            self.y += self.velocity_y

            # 当速度变为正数（开始下落）时爆炸
            if self.velocity_y >= 0:
                self.explode()
        else:
            # 更新所有粒子
            for particle in self.particles[:]:
                particle.update()
                if particle.is_dead():
                    self.particles.remove(particle)

    def draw(self, surface):
        if not self.exploded:
            # 绘制上升的烟花
            pygame.draw.circle(surface, self.color, (int(self.x), int(self.y)), 3)
            # 绘制尾迹
            for i in range(5):
                pos_y = self.y + i * 3
                alpha = 255 - i * 50
                if alpha > 0:
                    trail_color = (self.color[0], self.color[1], self.color[2], alpha)
                    surf = pygame.Surface((6, 6), pygame.SRCALPHA)
                    pygame.draw.circle(surf, trail_color, (3, 3), 2)
                    surface.blit(surf, (int(self.x - 3), int(pos_y - 3)))
        else:
            # 绘制所有粒子
            for particle in self.particles:
                particle.draw(surface)

    def explode(self):
        self.exploded = True
        num_particles = 0

        # 根据烟花类型生成不同的粒子模式
        if self.type == 0:  # 圆形爆炸
            num_particles = 150
            for _ in range(num_particles):
                angle = random.uniform(0, math.pi * 2)
                speed = random.uniform(2, 6)
                velocity_x = math.cos(angle) * speed
                velocity_y = math.sin(angle) * speed
                self.particles.append(Particle(self.x, self.y, self.color, velocity_x, velocity_y))

        elif self.type == 1:  # 星形爆炸
            num_particles = 200
            points = 5  # 五角星
            for i in range(num_particles):
                angle = (i % points) * (2 * math.pi / points) + random.uniform(-0.2, 0.2)
                speed = random.uniform(3, 7)
                velocity_x = math.cos(angle) * speed
                velocity_y = math.sin(angle) * speed
                self.particles.append(Particle(self.x, self.y, self.color, velocity_x, velocity_y))

        elif self.type == 2:  # 螺旋形爆炸
            num_particles = 250
            for i in range(num_particles):
                angle = i * 0.1
                radius = i * 0.05
                speed = random.uniform(2, 5)
                velocity_x = math.cos(angle) * radius * speed
                velocity_y = math.sin(angle) * radius * speed
                self.particles.append(Particle(self.x, self.y, self.color, velocity_x, velocity_y))

        elif self.type == 3:  # 心形爆炸
            num_particles = 180
            for i in range(num_particles):
                t = i / num_particles * 2 * math.pi
                # 心形参数方程
                x = 16 * (math.sin(t) ** 3)
                y = 13 * math.cos(t) - 5 * math.cos(2*t) - 2 * math.cos(3*t) - math.cos(4*t)
                # 缩放和随机化
                scale = random.uniform(0.2, 0.4)
                velocity_x = x * scale
                velocity_y = -y * scale  # 反转y轴使心形正立
                self.particles.append(Particle(self.x, self.y, self.color, velocity_x, velocity_y))

    def is_dead(self):
        return self.exploded and len(self.particles) == 0

# 主循环
def main():
    clock = pygame.time.Clock()
    fireworks = []
    running = True

    # 创建半透明的surface用于实现淡出效果
    fade_surface = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
    fade_surface.fill((0, 0, 0, 25))  # 黑色带透明度

    # 初始化一些烟花
    for i in range(4):
        fireworks.append(Firework(random.randint(100, WIDTH-100), HEIGHT, i))

    # 显示说明文字
    font = pygame.font.SysFont('simhei', 24)
    text1 = font.render("圆形爆炸    星形爆炸    螺旋爆炸    心形爆炸", True, WHITE)

    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    running = False
                elif event.key == pygame.K_SPACE:
                    # 空格键添加一组新烟花
                    for i in range(4):
                        fireworks.append(Firework(random.randint(100, WIDTH-100), HEIGHT, i))

        # 应用淡出效果
        screen.blit(fade_surface, (0, 0))

        # 随机添加新烟花
        if random.random() < 0.05 and len(fireworks) < 20:
            fireworks.append(Firework(random.randint(100, WIDTH-100), HEIGHT, random.randint(0, 3)))

        # 更新和绘制所有烟花
        for firework in fireworks[:]:
            firework.update()
            firework.draw(screen)
            if firework.is_dead():
                fireworks.remove(firework)

        # 显示说明文字
        screen.blit(text1, (WIDTH//2 - text1.get_width()//2, 20))

        pygame.display.flip()
        clock.tick(60)

    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()
```
