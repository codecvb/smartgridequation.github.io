---
title: 任意多面体的最小外接球算法Python实现
slug: 任意多面体的最小外接球算法python实现
category: Python 编程
summary: 以下是使用Python实现任意多面体的最小外接球（最小包围球）算法的代码。该算法基于Welzl算法，能够高效地计算任意多面体的最小外接球。
tags: Python
---

以下是使用Python实现任意多面体的最小外接球（最小包围球）算法的代码。该算法基于Welzl算法，能够高效地计算任意多面体的最小外接球。


![](/uploads/csdn/任意多面体的最小外接球算法python实现/img-01.png)


```python
import numpy as np
import random
import math
from scipy.spatial import ConvexHull
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from mpl_toolkits.mplot3d.art3d import Poly3DCollection

def generate_random_polyhedron(num_vertices=10, radius=5.0):
    """生成随机多面体（凸包）"""
    # 生成随机点集
    points = np.random.uniform(-radius, radius, (num_vertices, 3))

    # 计算凸包
    hull = ConvexHull(points)

    # 返回凸包顶点和面
    return points, hull

def sphere_contains_points(center, radius, points, tolerance=1e-6):
    """检查球体是否包含所有点"""
    for point in points:
        if np.linalg.norm(point - center) > radius + tolerance:
            return False
    return True

def min_sphere_2_points(p1, p2):
    """两点的最小外接球"""
    center = (p1 + p2) / 2.0
    radius = np.linalg.norm(p1 - p2) / 2.0
    return center, radius

def min_sphere_3_points(p1, p2, p3):
    """三点的最小外接球"""
    # 计算三角形的外接圆
    a = p2 - p1
    b = p3 - p1

    # 计算法向量
    n = np.cross(a, b)

    # 如果三点共线，则返回两点最大距离的球
    if np.linalg.norm(n) < 1e-10:
        return min_sphere_2_points(
            p1,
            p2 if np.linalg.norm(p2-p1) > np.linalg.norm(p3-p1) else p3
        )

    # 计算圆心
    a_cross_b = np.cross(a, b)
    numerator = np.cross(np.dot(a, a) * b - np.dot(b, b) * a, a_cross_b)
    denominator = 2.0 * np.dot(a_cross_b, a_cross_b)
    center = p1 + numerator / denominator

    radius = np.linalg.norm(center - p1)
    return center, radius

def min_sphere_4_points(p1, p2, p3, p4):
    """四点的最小外接球"""
    # 尝试所有三点的组合
    spheres = [
        min_sphere_3_points(p1, p2, p3),
        min_sphere_3_points(p1, p2, p4),
        min_sphere_3_points(p1, p3, p4),
        min_sphere_3_points(p2, p3, p4)
    ]

    # 找到包含所有点的最小球
    for center, radius in spheres:
        if sphere_contains_points(center, radius, [p1, p2, p3, p4]):
            return center, radius

    # 如果三点球不包含所有点，则计算四面体的外接球
    A = np.vstack([2*(p2-p1), 2*(p3-p1), 2*(p4-p1)])
    b = np.array([
        np.dot(p2, p2) - np.dot(p1, p1),
        np.dot(p3, p3) - np.dot(p1, p1),
        np.dot(p4, p4) - np.dot(p1, p1)
    ])

    try:
        center = np.linalg.solve(A, b)
        radius = np.linalg.norm(center - p1)
        return center, radius
    except np.linalg.LinAlgError:
        # 如果四点共面，返回最大的三点球
        max_radius = 0
        best_sphere = None
        for sphere in spheres:
            if sphere[1] > max_radius:
                max_radius = sphere[1]
                best_sphere = sphere
        return best_sphere

def welzl(points, support=[]):
    """Welzl算法计算最小外接球"""
    if len(points) == 0 or len(support) == 4:
        if len(support) == 0:
            return np.array([0.0, 0.0, 0.0]), 0.0
        elif len(support) == 1:
            return support[0], 0.0
        elif len(support) == 2:
            return min_sphere_2_points(support[0], support[1])
        elif len(support) == 3:
            return min_sphere_3_points(support[0], support[1], support[2])
        else:
            return min_sphere_4_points(support[0], support[1], support[2], support[3])

    # 随机选择一个点
    p = points[0]
    other_points = points[1:]

    # 递归计算其他点的最小球
    center, radius = welzl(other_points, support)

    # 如果当前点不在球内，则将其加入支撑集
    if not sphere_contains_points(center, radius, [p]):
        support.append(p)
        center, radius = welzl(other_points, support)
        support.pop()

    return center, radius

def min_bounding_sphere(points):
    """计算点集的最小外接球"""
    # 随机打乱点集以提高算法效率
    shuffled_points = points.copy()
    np.random.shuffle(shuffled_points)

    # 使用Welzl算法
    center, radius = welzl(shuffled_points, [])

    return center, radius

def create_sphere_mesh(center, radius, num_points=20):
    """创建球体的网格"""
    u = np.linspace(0, 2 * np.pi, num_points)
    v = np.linspace(0, np.pi, num_points)

    x = center[0] + radius * np.outer(np.cos(u), np.sin(v))
    y = center[1] + radius * np.outer(np.sin(u), np.sin(v))
    z = center[2] + radius * np.outer(np.ones(np.size(u)), np.cos(v))

    return x, y, z

def visualize_polyhedron_and_sphere(points, hull, center, radius):
    """可视化多面体和最小外接球"""
    fig = plt.figure(figsize=(12, 10))
    ax = fig.add_subplot(111, projection='3d')

    # 绘制多面体顶点
    ax.scatter(points[:, 0], points[:, 1], points[:, 2], c='red', s=100, label='top point', depthshade=False)

    # 绘制多面体面
    faces = []
    for simplex in hull.simplices:
        faces.append(points[simplex])

    poly3d = Poly3DCollection(faces, alpha=0.2, edgecolor='k', linewidths=1)
    poly3d.set_facecolor('cyan')
    ax.add_collection3d(poly3d)

    # 绘制最小外接球
    x, y, z = create_sphere_mesh(center, radius)
    ax.plot_wireframe(x, y, z, color='blue', alpha=0.3, label='minimum enclosing sphere')

    # 绘制球心
    ax.scatter([center[0]], [center[1]], [center[2]], c='green', s=100, marker='*', label='center of a sphere')

    # 设置坐标轴标签
    ax.set_xlabel('X轴')
    ax.set_ylabel('Y轴')
    ax.set_zlabel('Z轴')

    # 设置标题
    ax.set_title('Polyhedrons and their smallest circumscribed spheres', fontsize=14)

    # 添加图例
    ax.legend()

    # 设置等比例坐标轴
    max_range = np.array([points[:,0].max()-points[:,0].min(),
                         points[:,1].max()-points[:,1].min(),
                         points[:,2].max()-points[:,2].min()]).max() / 2.0

    mid_x = (points[:,0].max()+points[:,0].min()) * 0.5
    mid_y = (points[:,1].max()+points[:,1].min()) * 0.5
    mid_z = (points[:,2].max()+points[:,2].min()) * 0.5

    ax.set_xlim(mid_x - max_range, mid_x + max_range)
    ax.set_ylim(mid_y - max_range, mid_y + max_range)
    ax.set_zlim(mid_z - max_range, mid_z + max_range)

    # 添加网格
    ax.grid(True)

    plt.tight_layout()
    plt.show()

# 生成随机多面体
num_vertices = 15
points, hull = generate_random_polyhedron(num_vertices)

print("多面体顶点坐标:")
for i, vertex in enumerate(points[hull.vertices]):
    print(f"顶点 {i+1}: {vertex}")

# 计算最小外接球
center, radius = min_bounding_sphere(points[hull.vertices])

print(f"\n最小外接球中心: {center}")
print(f"最小外接球半径: {radius:.4f}")

# 验证所有点是否在球内
all_inside = sphere_contains_points(center, radius, points[hull.vertices])
print(f"所有顶点是否在球内: {all_inside}")

# 可视化
visualize_polyhedron_and_sphere(points, hull, center, radius)
```


### 可视化功能说明


1.

    **多面体绘制**：


    -

        红色点：多面体顶点


    -

        青色半透明面：多面体的各个面


    -

        黑色边线：多面体的边


2.

    **外接球绘制**：


    -

        蓝色线框：最小外接球的表面


    -

        绿色星号：球心位置


3.

    **视角设置**：


    -

        自动调整坐标轴范围，确保所有元素可见


    -

        等比例坐标轴，保持3D图形的正确比例


    -

        添加网格以便更好地观察空间关系


### 运行结果


运行代码后，你将看到：


1.

    控制台输出多面体顶点坐标、最小外接球中心和半径


2.

    一个3D可视化窗口，显示多面体和它的最小外接球


3.

    可以旋转、缩放3D图形来从不同角度观察


这个可视化帮助直观地理解最小外接球如何完美地包围给定的多面体。
