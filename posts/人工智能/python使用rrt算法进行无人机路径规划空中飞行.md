---
title: Python使用RRT算法进行无人机路径规划空中飞行
slug: python使用rrt算法进行无人机路径规划空中飞行
category: 人工智能
summary: RRT（快速探索随机树，Rapidly-exploring Random Tree）是一种用于高维空间路径规划的概率型算法，由 Steven M. LaValle 于 1998 年提出。它通过随机采样空间点并逐步构建 "树" 状结构来探索未知环境，特别适合解决复杂障碍物环境中的路径规划问题。
tags: 人工智能, Python
---

RRT（快速探索随机树，Rapidly-exploring Random Tree）是一种用于高维空间路径规划的概率型算法，由 Steven M. LaValle 于 1998 年提出。它通过随机采样空间点并逐步构建 "树" 状结构来探索未知环境，特别适合解决复杂障碍物环境中的路径规划问题。


效果如下


![](/uploads/csdn/python使用rrt算法进行无人机路径规划空中飞行/img-01.png)


#### **一、RRT 算法核心原理**


RRT 的核心思想是**通过随机采样逐步构建一棵覆盖自由空间的树**，最终连接起点和终点。算法流程可概括为：


1.  **初始化**：以起点为根节点创建一棵树。
2.  **随机采样**：在搜索空间中随机生成一个点（目标点有小概率被直接采样，加速收敛）。
3.  \*\* nearest 搜索 \*\*：在已有树中找到距离随机点最近的节点。
4.  **扩展树**：从最近节点向随机点方向延伸固定步长，生成新节点。
5.  **碰撞检测**：检查新节点与最近节点之间的路径是否碰撞障碍物。
6.  **添加节点**：若路径无碰撞，则将新节点加入树中，并记录其父节点。
7.  **终止条件**：当新节点足够接近目标点且路径无碰撞时，算法终止，通过回溯父节点提取路径。


#### **二、关键数学知识**


##### 1. **欧氏距离（Euclidean Distance）**


用于计算空间中两点的直线距离，是 RRT 中 "找最近节点" 和 "扩展步长" 的基础。


-

    **3D 空间距离公式**：


-

    ![](/uploads/csdn/python使用rrt算法进行无人机路径规划空中飞行/img-02.png)


-

    **作用**：


    -   判断节点是否接近目标（终止条件）。
    -   确定从最近节点向随机点延伸的方向和步长。


##### 2. **向量运算与线性插值**


用于从 "最近节点" 向 "随机点" 扩展新节点（steer 操作）。


-

    **单位向量**：


-

    ![](/uploads/csdn/python使用rrt算法进行无人机路径规划空中飞行/img-03.png)


-

    **线性插值（生成新节点）**：


-

    ![](/uploads/csdn/python使用rrt算法进行无人机路径规划空中飞行/img-04.png)


##### 3. **碰撞检测（几何相交判断）**


判断两点之间的线段是否与障碍物碰撞，是确保路径可行性的核心。


-

    **原理**


-

    ![](/uploads/csdn/python使用rrt算法进行无人机路径规划空中飞行/img-05.png)


-

    **线段到点的最短距离计算**：![](/uploads/csdn/python使用rrt算法进行无人机路径规划空中飞行/img-06.png)


##### 4. **概率与随机性**


RRT 的探索能力依赖于随机采样，体现为：


-

    **随机采样策略**：在搜索空间边界内均匀随机生成点，数学上可表示为：


-

    ![](/uploads/csdn/python使用rrt算法进行无人机路径规划空中飞行/img-07.png)


-

    **偏向目标的采样**：以小概率（如 10%）直接采样目标点，加速向目标方向探索，数学上表示为：


-

    ![](/uploads/csdn/python使用rrt算法进行无人机路径规划空中飞行/img-08.png)


#### **三、RRT 的扩展：RRT**\*


RRT \* 是 RRT 的优化版本，通过**重布线（Rewire）** 过程优化路径质量，核心数学思想是：


1.  **邻居搜索**：在新节点周围一定半径内寻找所有邻居节点。
2.  **最优父节点选择**：对每个邻居节点，计算经过该邻居到新节点的总成本（路径长度），选择成本最小的邻居作为父节点。
3.  **重布线**：对于每个邻居节点，若经过新节点的路径成本更低，则更新邻居的父节点为新节点，实现路径优化。


成本计算公式为：


![](/uploads/csdn/python使用rrt算法进行无人机路径规划空中飞行/img-09.png)


#### **四、总结**


RRT 算法通过**随机采样、最近邻搜索、向量扩展、碰撞检测**四大步骤实现路径规划，核心数学基础包括：


-   欧氏距离计算（用于距离度量）
-   向量运算与线性插值（用于节点扩展）
-   几何相交判断（用于碰撞检测）
-   概率分布（用于空间探索）


相比 A*等基于网格的算法，RRT 在高维空间（如 3D 无人机路径规划）中效率更高，且无需预先生成环境地图，适合动态未知环境。而 RRT*通过优化父节点选择，进一步提升了路径的最优性。


代码如下


```python
import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from matplotlib.animation import FuncAnimation
import math
import random
import time

# 设置随机种子，保证结果可复现
np.random.seed(42)
random.seed(42)

class Node:
    """RRT*算法中的节点类"""
    def __init__(self, x, y, z):
        self.x = x
        self.y = y
        self.z = z
        self.parent = None
        self.cost = 0.0  # 从起点到当前节点的成本

    def distance(self, other):
        """计算与另一个节点的欧氏距离"""
        return math.sqrt((self.x - other.x)**2 +
                         (self.y - other.y)** 2 +
                         (self.z - other.z)** 2)

    def get_coordinates(self):
        """返回节点的坐标 tuple"""
        return (self.x, self.y, self.z)

class RRTStar:
    """3D RRT*算法实现"""
    def __init__(self,
                 start,
                 goal,
                 obstacles,
                 obstacle_radius,
                 space_bounds,
                 max_iter=1000,
                 step_size=0.5,
                 goal_radius=1.0,
                 neighbor_radius=2.0):
        """
        参数初始化
        start: 起点坐标 (x, y, z)
        goal: 终点坐标 (x, y, z)
        obstacles: 障碍物列表，每个元素为(x, y, z)
        obstacle_radius: 障碍物半径
        space_bounds: 空间边界 [(x_min, x_max), (y_min, y_max), (z_min, z_max)]
        max_iter: 最大迭代次数
        step_size: 步长
        goal_radius: 到达目标的判定半径
        neighbor_radius: 邻居节点搜索半径
        """
        self.start = Node(start[0], start[1], start[2])
        self.goal = Node(goal[0], goal[1], goal[2])
        self.obstacles = [Node(obs[0], obs[1], obs[2]) for obs in obstacles]
        self.obstacle_radius = obstacle_radius
        self.space_bounds = space_bounds
        self.max_iter = max_iter
        self.step_size = step_size
        self.goal_radius = goal_radius
        self.neighbor_radius = neighbor_radius

        # 初始化节点列表
        self.nodes = [self.start]
        self.found_goal = False
        self.best_goal_node = None

    def get_random_node(self):
        """在搜索空间中随机生成一个节点"""
        if random.random() < 0.1:  # 10%的概率直接生成目标节点，加速收敛
            return self.goal

        x = random.uniform(self.space_bounds[0][0], self.space_bounds[0][1])
        y = random.uniform(self.space_bounds[1][0], self.space_bounds[1][1])
        z = random.uniform(self.space_bounds[2][0], self.space_bounds[2][1])
        return Node(x, y, z)

    def nearest_node(self, random_node):
        """找到与随机节点最近的节点"""
        min_dist = float('inf')
        nearest_node = None

        for node in self.nodes:
            dist = node.distance(random_node)
            if dist < min_dist:
                min_dist = dist
                nearest_node = node

        return nearest_node

    def steer(self, from_node, to_node):
        """从from_node向to_node移动step_size距离，生成新节点"""
        dist = from_node.distance(to_node)

        # 如果距离小于步长，直接返回目标节点
        if dist <= self.step_size:
            return Node(to_node.x, to_node.y, to_node.z)

        # 否则按比例移动
        ratio = self.step_size / dist
        x = from_node.x + (to_node.x - from_node.x) * ratio
        y = from_node.y + (to_node.y - from_node.y) * ratio
        z = from_node.z + (to_node.z - from_node.z) * ratio
        return Node(x, y, z)

    def is_collision_free(self, node1, node2):
        """检查两个节点之间的路径是否无碰撞"""
        # 采样路径上的点进行碰撞检测
        num_samples = 10
        for i in range(num_samples + 1):
            ratio = i / num_samples
            x = node1.x + (node2.x - node1.x) * ratio
            y = node1.y + (node2.y - node1.y) * ratio
            z = node1.z + (node2.z - node1.z) * ratio
            sample_node = Node(x, y, z)

            # 检查与每个障碍物的距离
            for obs in self.obstacles:
                if sample_node.distance(obs) < self.obstacle_radius:
                    return False
        return True

    def find_neighbors(self, new_node):
        """找到新节点附近的所有邻居节点"""
        neighbors = []
        for node in self.nodes:
            if new_node.distance(node) < self.neighbor_radius:
                neighbors.append(node)
        return neighbors

    def choose_parent(self, new_node, neighbors):
        """从邻居节点中选择最优父节点"""
        if not neighbors:
            return

        # 初始成本设为从起点到新节点的成本
        min_cost = float('inf')
        best_parent = None

        for neighbor in neighbors:
            # 检查邻居到新节点的路径是否无碰撞
            if self.is_collision_free(neighbor, new_node):
                # 计算经过该邻居到新节点的总成本
                total_cost = neighbor.cost + neighbor.distance(new_node)

                # 更新最小成本和最优父节点
                if total_cost < min_cost:
                    min_cost = total_cost
                    best_parent = neighbor

        # 设置最优父节点和成本
        if best_parent is not None:
            new_node.parent = best_parent
            new_node.cost = min_cost

    def rewire(self, new_node, neighbors):
        """重新布线，优化已有路径"""
        for neighbor in neighbors:
            # 检查新节点到邻居的路径是否无碰撞
            if self.is_collision_free(new_node, neighbor):
                # 计算经过新节点到邻居的总成本
                new_cost = new_node.cost + new_node.distance(neighbor)

                # 如果新路径成本更低，则更新邻居的父节点
                if new_cost < neighbor.cost:
                    neighbor.parent = new_node
                    neighbor.cost = new_cost

    def extract_path(self, node):
        """从目标节点回溯到起点，提取路径"""
        path = []
        current_node = node

        while current_node is not None:
            path.append(current_node.get_coordinates())
            current_node = current_node.parent

        # 反转路径，从起点到目标
        return path[::-1]

    def planning(self, verbose=True):
        """执行RRT*路径规划"""
        start_time = time.time()

        for i in range(self.max_iter):
            # 生成随机节点
            random_node = self.get_random_node()

            # 找到最近的节点
            nearest = self.nearest_node(random_node)

            # 生成新节点
            new_node = self.steer(nearest, random_node)

            # 检查新节点是否在自由空间（无碰撞）
            if self.is_collision_free(nearest, new_node):
                # 找到新节点的邻居
                neighbors = self.find_neighbors(new_node)

                # 选择最优父节点
                self.choose_parent(new_node, neighbors)

                # 添加新节点到节点列表
                self.nodes.append(new_node)

                # 重新布线
                self.rewire(new_node, neighbors)

                # 检查是否到达目标附近
                if new_node.distance(self.goal) < self.goal_radius:
                    # 尝试直接连接到目标
                    if self.is_collision_free(new_node, self.goal):
                        self.goal.parent = new_node
                        self.goal.cost = new_node.cost + new_node.distance(self.goal)
                        self.nodes.append(self.goal)
                        self.found_goal = True
                        self.best_goal_node = self.goal

                        if verbose:
                            print(f"在第 {i+1} 次迭代找到目标！")
                        break

                # 更新最佳目标节点（即使尚未到达目标半径内）
                if not self.found_goal:
                    dist_to_goal = new_node.distance(self.goal)
                    if (self.best_goal_node is None or
                        dist_to_goal < self.best_goal_node.distance(self.goal)):
                        self.best_goal_node = new_node

        # 计算规划时间
        planning_time = time.time() - start_time

        if self.found_goal:
            path = self.extract_path(self.goal)
            if verbose:
                print(f"路径规划完成，总长度: {self.goal.cost:.2f}，耗时: {planning_time:.4f}秒")
            return path, planning_time
        else:
            if verbose:
                print(f"未找到完整路径，返回当前最优路径，耗时: {planning_time:.4f}秒")
            # 返回当前最接近目标的路径
            path = self.extract_path(self.best_goal_node)
            return path, planning_time

# 无人机环境
class DroneEnvironment:
    def __init__(self,
                 start_pos=[0.0, 0.0, 0.0],
                 goal_pos=[10.0, 10.0, 5.0],
                 obstacle_radius=0.8,
                 num_obstacles=8):
        # 确保起点和终点为float64类型
        self.start_pos = np.array(start_pos, dtype=np.float64)
        self.goal_pos = np.array(goal_pos, dtype=np.float64)
        self.obstacle_radius = obstacle_radius

        # 生成随机障碍物
        self.obstacles = self._generate_obstacles(num_obstacles)

        # 定义空间边界（比起点和终点稍大）
        self.space_bounds = [
            (min(start_pos[0], goal_pos[0]) - 2, max(start_pos[0], goal_pos[0]) + 2),
            (min(start_pos[1], goal_pos[1]) - 2, max(start_pos[1], goal_pos[1]) + 2),
            (min(start_pos[2], goal_pos[2]) - 2, max(start_pos[2], goal_pos[2]) + 2)
        ]

        # 路径
        self.path = []

    def _generate_obstacles(self, num_obstacles):
        """生成随机障碍物，确保不会出现在起点或终点附近"""
        obstacles = []

        for _ in range(num_obstacles):
            while True:
                x = np.random.uniform(min(self.start_pos[0], self.goal_pos[0]),
                                     max(self.start_pos[0], self.goal_pos[0]))
                y = np.random.uniform(min(self.start_pos[1], self.goal_pos[1]),
                                     max(self.start_pos[1], self.goal_pos[1]))
                z = np.random.uniform(min(self.start_pos[2], self.goal_pos[2]),
                                     max(self.start_pos[2], self.goal_pos[2]) + 2)

                pos = np.array([x, y, z], dtype=np.float64)
                dist_to_start = np.linalg.norm(pos - self.start_pos)
                dist_to_goal = np.linalg.norm(pos - self.goal_pos)

                # 确保障碍物不会太靠近起点或终点
                if (dist_to_start > 2 * self.obstacle_radius and
                    dist_to_goal > 2 * self.obstacle_radius):
                    obstacles.append(pos)
                    break

        return np.array(obstacles, dtype=np.float64)

    def plan_path(self, max_iter=1000, step_size=0.5):
        """使用RRT*算法规划路径"""
        # 创建RRT*规划器
        rrt_star = RRTStar(
            start=self.start_pos,
            goal=self.goal_pos,
            obstacles=self.obstacles,
            obstacle_radius=self.obstacle_radius,
            space_bounds=self.space_bounds,
            max_iter=max_iter,
            step_size=step_size
        )

        # 执行路径规划
        self.path, planning_time = rrt_star.planning()
        return self.path, planning_time

    def render(self, ax=None, show_tree=False, rrt_star=None):
        """绘制环境和路径"""
        if ax is None:
            fig = plt.figure(figsize=(10, 8))
            ax = fig.add_subplot(111, projection='3d')

        # 绘制起点和终点
        ax.scatter(self.start_pos[0], self.start_pos[1], self.start_pos[2],
                  color='green', s=150, marker='o', label='Start')
        ax.scatter(self.goal_pos[0], self.goal_pos[1], self.goal_pos[2],
                  color='red', s=150, marker='*', label='Goal')

        # 绘制障碍物
        for obstacle in self.obstacles:
            u, v = np.mgrid[0:2*np.pi:20j, 0:np.pi:10j]
            x = obstacle[0] + self.obstacle_radius * np.cos(u) * np.sin(v)
            y = obstacle[1] + self.obstacle_radius * np.sin(u) * np.sin(v)
            z = obstacle[2] + self.obstacle_radius * np.cos(v)
            ax.plot_surface(x, y, z, color='gray', alpha=0.5)

        # 绘制路径
        if len(self.path) > 1:
            path = np.array(self.path)
            ax.plot(path[:, 0], path[:, 1], path[:, 2],
                   color='blue', linewidth=3, label='Path')

        # 如果需要，绘制RRT*树
        if show_tree and rrt_star is not None:
            for node in rrt_star.nodes:
                if node.parent is not None:
                    ax.plot([node.x, node.parent.x],
                           [node.y, node.parent.y],
                           [node.z, node.parent.z],
                           color='lightgray', linewidth=1, alpha=0.5)

        ax.set_xlabel('X')
        ax.set_ylabel('Y')
        ax.set_zlabel('Z')
        ax.set_title('3D Drone Path Planning with RRT*')
        ax.legend()

        if ax is None:
            plt.show()

        return ax

# 动画展示无人机路径
def animate_drone_path(env):
    if not env.path:
        print("没有路径可展示，请先规划路径")
        return

    path = np.array(env.path)

    fig = plt.figure(figsize=(10, 8))
    ax = fig.add_subplot(111, projection='3d')

    # 设置坐标轴范围
    ax.set_xlim([min(path[:,0].min(), env.start_pos[0], env.goal_pos[0])-1,
                 max(path[:,0].max(), env.start_pos[0], env.goal_pos[0])+1])
    ax.set_ylim([min(path[:,1].min(), env.start_pos[1], env.goal_pos[1])-1,
                 max(path[:,1].max(), env.start_pos[1], env.goal_pos[1])+1])
    ax.set_zlim([min(path[:,2].min(), env.start_pos[2], env.goal_pos[2])-1,
                 max(path[:,2].max(), env.start_pos[2], env.goal_pos[2])+1])

    ax.set_xlabel('X')
    ax.set_ylabel('Y')
    ax.set_zlabel('Z')
    ax.set_title('Drone Path Animation')

    # 绘制起点、终点和障碍物
    ax.scatter(env.start_pos[0], env.start_pos[1], env.start_pos[2],
              color='green', s=150, marker='o', label='Start')
    ax.scatter(env.goal_pos[0], env.goal_pos[1], env.goal_pos[2],
              color='red', s=150, marker='*', label='Goal')

    for obstacle in env.obstacles:
        u, v = np.mgrid[0:2*np.pi:20j, 0:np.pi:10j]
        x = obstacle[0] + env.obstacle_radius * np.cos(u) * np.sin(v)
        y = obstacle[1] + env.obstacle_radius * np.sin(u) * np.sin(v)
        z = obstacle[2] + env.obstacle_radius * np.cos(v)
        ax.plot_surface(x, y, z, color='gray', alpha=0.5)

    # 初始化路径和无人机位置
    path_line, = ax.plot([], [], [], color='blue', linewidth=3, label='Path')
    drone_marker, = ax.plot([], [], [], 'bo', markersize=10)

    ax.legend()

    # 动画更新函数
    def update(frame):
        if frame < len(path):
            path_line.set_data(path[:frame+1, 0], path[:frame+1, 1])
            path_line.set_3d_properties(path[:frame+1, 2])
            drone_marker.set_data(path[frame, 0], path[frame, 1])
            drone_marker.set_3d_properties(path[frame, 2])
        return path_line, drone_marker

    # 创建动画
    anim = FuncAnimation(fig, update, frames=len(path), interval=50, blit=True)
    plt.show()

    return anim

if __name__ == "__main__":
    # 创建环境
    env = DroneEnvironment(
        start_pos=[0.0, 0.0, 0.0],
        goal_pos=[15.0, 15.0, 5.0],
        obstacle_radius=0.8,
        num_obstacles=30
    )

    # 规划路径（可以调整max_iter和step_size来平衡速度和路径质量）
    path, planning_time = env.plan_path(max_iter=800, step_size=0.8)

    # 可视化结果
    fig = plt.figure(figsize=(12, 10))
    ax = fig.add_subplot(111, projection='3d')

    # 创建RRT*对象用于可视化树（如果需要）
    rrt_star = RRTStar(
        start=env.start_pos,
        goal=env.goal_pos,
        obstacles=env.obstacles,
        obstacle_radius=env.obstacle_radius,
        space_bounds=env.space_bounds
    )
    # 重新规划一次以获取树结构（实际应用中不需要）
    _, _ = rrt_star.planning(verbose=False)

    # 渲染环境，设置show_tree=True可以显示完整的RRT*树
    env.render(ax, show_tree=False, rrt_star=rrt_star)
    plt.show()

    # 创建动画展示
    animate_drone_path(env)
```
