---
title: 基于Levy飞行粒子群优化算法的微电网优化调度
slug: 基于levy飞行粒子群优化算法的微电网优化调度
category: 算法与数据结构
summary: 本文提出了一种基于Levy飞行粒子群优化（LFPSO）的微电网优化调度模型。该模型综合考虑经济成本和环境成本，通过优化光伏、风电、燃料电池、微型燃气轮机、柴油发电机和蓄电池等设备的出力，实现微电网24小时最优运行。研究对比了削峰填谷和模糊逻辑两种蓄电池控制策略，结果表明模糊逻辑策略能进一步降低总成本。系统包含负荷预测、可再生能源发电预测、设备参数设置和约束条件处理等功能模块，采用加权目标函数平衡经…
tags: 算法
---

本文提出了一种基于Levy飞行粒子群优化（LFPSO）的微电网优化调度模型。该模型综合考虑经济成本和环境成本，通过优化光伏、风电、燃料电池、微型燃气轮机、柴油发电机和蓄电池等设备的出力，实现微电网24小时最优运行。研究对比了削峰填谷和模糊逻辑两种蓄电池控制策略，结果表明模糊逻辑策略能进一步降低总成本。系统包含负荷预测、可再生能源发电预测、设备参数设置和约束条件处理等功能模块，采用加权目标函数平衡经济性和环保性。仿真结果显示，该优化模型能有效协调各类发电设备，在满足功率平衡和设备运行约束的同时实现成本最小化。


![](/uploads/csdn/基于levy飞行粒子群优化算法的微电网优化调度/img-01.png)


![](/uploads/csdn/基于levy飞行粒子群优化算法的微电网优化调度/img-02.jpeg)![](/uploads/csdn/基于levy飞行粒子群优化算法的微电网优化调度/img-03.jpeg)![](/uploads/csdn/基于levy飞行粒子群优化算法的微电网优化调度/img-04.jpeg)![](/uploads/csdn/基于levy飞行粒子群优化算法的微电网优化调度/img-05.jpeg)![](/uploads/csdn/基于levy飞行粒子群优化算法的微电网优化调度/img-06.jpeg)![](/uploads/csdn/基于levy飞行粒子群优化算法的微电网优化调度/img-07.jpeg)![](/uploads/csdn/基于levy飞行粒子群优化算法的微电网优化调度/img-08.jpeg)![](/uploads/csdn/基于levy飞行粒子群优化算法的微电网优化调度/img-09.jpeg)![](/uploads/csdn/基于levy飞行粒子群优化算法的微电网优化调度/img-10.jpeg)


```python
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
from scipy.special import gamma

class MicrogridOptimization:
    """
    Microgrid Optimization Scheduling Model
    Based on paper "Microgrid Optimal Dispatch Based on Levy Flight Particle Swarm Optimization"
    """

    def __init__(self):
        """Initialize microgrid parameters"""
        # Device parameters (Table 6 in paper)
        self.devices = {
            'PV': {'min': 0, 'max': 50, 'operation_cost': 0.0103, 'fuel_cost': 0},
            'WT': {'min': 0, 'max': 70, 'operation_cost': 0.0450, 'fuel_cost': 0},
            'FC': {'min': 0, 'max': 65, 'operation_cost': 0.0293, 'fuel_cost': 0.2435},
            'MT': {'min': 0, 'max': 65, 'operation_cost': 0.0419, 'fuel_cost': 0.4090},
            'DE': {'min': 0, 'max': 50, 'operation_cost': 0.1258, 'fuel_cost': 0.6031},
            'BT': {'min': -30, 'max': 30, 'operation_cost': 0.005}  # 蓄电池充放电
        }

        # Pollutant treatment costs (Table 5 in paper)
        self.pollution_costs = {
            'CO2': 0.088,
            'NOX': 26.46,
            'SO2': 6.237
        }

        # Emission factors (unit: kg/kWh)
        self.emission_factors = {
            'FC': {'CO2': 1.596, 'NOX': 0.440, 'SO2': 0.008},
            'MT': {'CO2': 1.432, 'NOX': 0.030, 'SO2': 0.006},
            'DE': {'CO2': 1.078, 'NOX': 21.8, 'SO2': 0.454},
            'Grid': {'CO2': 23.0, 'NOX': 3.6, 'SO2': 4.54},
            'PV': {'CO2': 0, 'NOX': 0, 'SO2': 0},
            'WT': {'CO2': 0, 'NOX': 0, 'SO2': 0}
        }

        # Time settings (24 hours)
        self.time_steps = 24
        self.time_labels = [f'{h:02d}:00' for h in range(24)]

        # Electricity prices (Table 7 in paper)
        self.grid_price = {
            'peak': {'buy': 1.56, 'sell': 1.28},     # Peak: 10:00-15:00, 19:00-22:00
            'normal': {'buy': 0.70, 'sell': 0.54},   # Normal: 7:00-9:00, 16:00-18:00
            'valley': {'buy': 0.43, 'sell': 0.32}    # Valley: 23:00-6:00
        }

        # Generate forecast data (refer to Figure 2 in paper)
        self.load_profile = self.generate_load_profile()
        self.pv_profile = self.generate_pv_profile()
        self.wt_profile = self.generate_wind_profile()

    def generate_load_profile(self):
        """Generate load forecast curve"""
        base_load = [0.8, 0.75, 0.7, 0.65, 0.6, 0.7, 0.9, 1.1,  # 0-7h
                     1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.6, 1.5,    # 8-15h
                     1.6, 1.7, 1.8, 1.9, 1.7, 1.5, 1.2, 1.0]     # 16-23h
        return np.array(base_load) * 100  # kW

    def generate_pv_profile(self):
        """Generate PV forecast curve"""
        pv = np.zeros(24)
        # Daytime with sunlight
        for hour in range(6, 19):
            if hour < 9 or hour > 16:
                pv[hour] = 20 + 5 * np.random.randn()
            else:
                pv[hour] = 40 + 10 * np.random.randn()
        return pv

    def generate_wind_profile(self):
        """Generate wind forecast curve"""
        wt = 30 + 10 * np.sin(np.linspace(0, 4*np.pi, 24)) + 5 * np.random.randn(24)
        return np.clip(wt, 0, 70)

    def get_grid_price(self, hour):
        """Get electricity price for specified time"""
        if (10 <= hour < 15) or (19 <= hour < 22):
            return self.grid_price['peak']
        elif (7 <= hour < 9) or (16 <= hour < 18):
            return self.grid_price['normal']
        else:
            return self.grid_price['valley']

    def calculate_economic_cost(self, power_outputs):
        """
        计算经济成本（论文公式7）
        power_outputs: 各设备的出力矩阵 (设备数 × 时间步)
        """
        total_cost = 0

        for t in range(self.time_steps):
            # 各设备的燃料成本和运维成本
            for device, params in self.devices.items():
                if device == 'BT':
                    # 蓄电池只有运维成本
                    total_cost += (params['operation_cost'] *
                                 abs(power_outputs[device][t]))
                elif device in ['PV', 'WT']:
                    # 可再生能源只有运维成本
                    total_cost += (params['operation_cost'] *
                                 power_outputs[device][t])
                else:
                    # 传统发电机有燃料和运维成本
                    total_cost += ((params['operation_cost'] +
                                  params['fuel_cost']) *
                                 power_outputs[device][t])

            # 与电网的交互成本
            grid_power = power_outputs['Grid'][t]
            if grid_power > 0:
                # 从电网购电
                price_info = self.get_grid_price(t)
                total_cost += price_info['buy'] * grid_power
            elif grid_power < 0:
                # 向电网售电
                price_info = self.get_grid_price(t)
                total_cost += price_info['sell'] * grid_power
                # 售电为收入，所以成本为负

        return total_cost

    def calculate_environmental_cost(self, power_outputs):
        """
        计算环境成本（论文公式8）
        """
        total_cost = 0

        for t in range(self.time_steps):
            # 各设备的污染物处理成本
            for device in self.devices.keys():
                if device not in ['Grid', 'BT']:  # BT没有排放
                    power = power_outputs[device][t]
                    for pollutant, cost in self.pollution_costs.items():
                        emission_factor = self.emission_factors[device].get(pollutant, 0)
                        total_cost += cost * emission_factor * power

            # 电网的污染物处理成本
            grid_power = power_outputs['Grid'][t]
            if grid_power > 0:
                for pollutant, cost in self.pollution_costs.items():
                    emission_factor = self.emission_factors['Grid'][pollutant]
                    total_cost += cost * emission_factor * grid_power

        return total_cost

    def check_constraints(self, power_outputs):
        """
        检查约束条件是否满足
        返回：是否满足约束，违反程度
        """
        violations = 0

        # 1. 功率平衡约束（论文公式9）
        for t in range(self.time_steps):
            total_generation = sum(power_outputs[device][t]
                                 for device in self.devices.keys())
            total_generation += power_outputs['Grid'][t]

            # 忽略输电损耗（简化）
            balance_violation = abs(total_generation - self.load_profile[t])
            violations += balance_violation

            if balance_violation > 1:  # 允许1kW的误差
                # print(f"功率不平衡在时刻{t}: {balance_violation:.2f} kW")
                pass

        # 2. 设备出力约束（论文公式10-12）
        for device, params in self.devices.items():
            for t in range(self.time_steps):
                power = power_outputs[device][t]

                if power < params['min']:
                    violations += (params['min'] - power) * 10  # 惩罚系数
                elif power > params['max']:
                    violations += (power - params['max']) * 10

        # 3. 电网功率约束（假设最大为150kW）
        for t in range(self.time_steps):
            grid_power = power_outputs['Grid'][t]
            if abs(grid_power) > 150:
                violations += (abs(grid_power) - 150) * 10

        return violations

    def objective_function(self, x):
        """
        目标函数（论文公式6）
        x: 决策变量向量，包含所有设备在所有时刻的出力
        """
        # 重塑决策变量为矩阵形式
        n_devices = len(self.devices) + 1  # 加上电网
        power_outputs = {}

        idx = 0
        for device in list(self.devices.keys()) + ['Grid']:
            power_outputs[device] = x[idx:idx+self.time_steps]
            idx += self.time_steps

        # 计算总成本
        economic_cost = self.calculate_economic_cost(power_outputs)
        environmental_cost = self.calculate_environmental_cost(power_outputs)

        # 加权总成本（论文中φ=μ=0.5）
        total_cost = 0.5 * economic_cost + 0.5 * environmental_cost

        # 约束违反惩罚
        constraint_violation = self.check_constraints(power_outputs)

        # 目标值 = 总成本 + 惩罚项
        objective_value = total_cost + 1000 * constraint_violation

        return objective_value

    def decode_solution(self, best_x):
        """解码最优解"""
        power_outputs = {}
        idx = 0

        for device in list(self.devices.keys()) + ['Grid']:
            power_outputs[device] = best_x[idx:idx+self.time_steps]
            idx += self.time_steps

        return power_outputs

# ===========================================================
# 蓄电池控制策略
# ===========================================================
class BatteryControlStrategy:
    """蓄电池控制策略基类"""

    def __init__(self, capacity=100, max_power=30):
        self.capacity = capacity  # kWh
        self.max_power = max_power  # kW
        self.soc = 0.5  # 初始SOC为50%

    def update_soc(self, power, time_interval=1):
        """更新蓄电池的SOC"""
        # power > 0: 放电, power < 0: 充电
        energy_change = power * time_interval  # kWh
        soc_change = energy_change / self.capacity

        self.soc -= soc_change  # 放电时SOC减少
        self.soc = max(0, min(1, self.soc))  # 限制在[0, 1]

        return self.soc

class PeakShavingControl(BatteryControlStrategy):
    """削峰填谷控制策略"""

    def decide_action(self, load, hour, price_info):
        """
        决定蓄电池的充放电功率
        返回：充电功率（负值），放电功率（正值）
        """
        if 10 <= hour < 15 or 19 <= hour < 22:
            # 峰时段：放电
            if self.soc > 0.3:
                discharge_power = min(self.max_power, load * 0.3)
                return discharge_power
        elif 23 <= hour or hour < 6:
            # 谷时段：充电
            if self.soc < 0.8:
                charge_power = -min(self.max_power, 20)  # 充电
                return charge_power

        return 0  # 不动作

class FuzzyLogicControl(BatteryControlStrategy):
    """模糊逻辑控制策略（简化的模糊规则实现）"""

    def decide_action(self, load, hour, price_info):
        """
        基于简化的模糊规则决定蓄电池动作
        输入：实时电价(RP)、SOC
        输出：充放电功率
        """
        # 获取电价水平
        buy_price = price_info['buy']

        # 电价模糊化
        if buy_price < 0.5:
            rp_level = 'low'
        elif buy_price < 1.0:
            rp_level = 'medium'
        else:
            rp_level = 'high'

        # SOC模糊化
        if self.soc < 0.3:
            soc_level = 'low'
        elif self.soc < 0.7:
            soc_level = 'medium'
        else:
            soc_level = 'high'

        # 简化的模糊规则（基于论文表4）
        if rp_level == 'high' and soc_level == 'high':
            # 高电价高SOC：大功率放电
            return min(self.max_power, 0.5 * self.capacity * self.soc)
        elif rp_level == 'low' and soc_level == 'low':
            # 低电价低SOC：大功率充电
            return -min(self.max_power, 0.5 * self.capacity * (1 - self.soc))
        elif rp_level == 'high' and soc_level == 'medium':
            # 高电价中SOC：中等功率放电
            return min(0.5 * self.max_power, 0.3 * self.capacity * self.soc)
        elif rp_level == 'low' and soc_level == 'medium':
            # 低电价中SOC：中等功率充电
            return -min(0.5 * self.max_power, 0.3 * self.capacity * (1 - self.soc))
        else:
            return 0

# ===========================================================
# Levy Flight Particle Swarm Optimization (LFPSO)
# ===========================================================
class LFPSO:
    """
    Levy Flight Particle Swarm Optimization Algorithm
    基于Levy飞行的粒子群优化算法
    """

    def __init__(self, n_particles=30, n_dim=10, max_iter=100,
                 w=0.7, c1=1.5, c2=1.5, alpha=0.1):
        """
        初始化LFPSO算法

        Args:
            n_particles: 粒子数量
            n_dim: 决策变量维度
            max_iter: 最大迭代次数
            w: 惯性权重
            c1: 个体学习因子
            c2: 社会学习因子
            alpha: Levy飞行步长参数
        """
        self.n_particles = n_particles
        self.n_dim = n_dim
        self.max_iter = max_iter
        self.w = w
        self.c1 = c1
        self.c2 = c2
        self.alpha = alpha

        # 粒子位置和速度
        self.positions = None
        self.velocities = None

        # 个体最优和全局最优
        self.pbest_positions = None
        self.pbest_values = np.full(n_particles, np.inf)
        self.gbest_position = None
        self.gbest_value = np.inf

        # 收敛历史
        self.gbest_history = []

    def initialize(self, bounds):
        """初始化粒子位置和速度"""
        # 初始化位置（在边界内随机）
        self.positions = np.zeros((self.n_particles, self.n_dim))
        for i in range(self.n_dim):
            min_val, max_val = bounds[i]
            self.positions[:, i] = np.random.uniform(min_val, max_val, self.n_particles)

        # 初始化速度
        self.velocities = np.random.uniform(-1, 1, (self.n_particles, self.n_dim))

        # 初始化个体最优
        self.pbest_positions = self.positions.copy()

    def levy_flight(self, beta=1.5):
        """
        生成Levy飞行步长
        使用Mantegna算法

        Args:
            beta: Levy指数，通常在[1, 3]之间

        Returns:
            Levy飞行步长向量
        """
        # 生成服从正态分布的随机数
        u = np.random.normal(0, 1, self.n_dim)
        v = np.random.normal(0, 1, self.n_dim)

        # 计算sigma
        sigma_u = np.power(np.abs(gamma(1 + beta) * np.sin(np.pi * beta / 2) /
                               (gamma((1 + beta) / 2) * beta * np.power(2, (beta - 1) / 2))),
                          1 / beta)
        sigma_v = 1

        # Levy步长
        step = u * sigma_u / (np.power(np.abs(v), 1 / beta))

        return step

    def update_particles(self, bounds):
        """更新粒子位置和速度"""
        # 生成Levy飞行步长
        levy_step = self.levy_flight()

        for i in range(self.n_particles):
            # 标准PSO速度更新
            r1 = np.random.rand(self.n_dim)
            r2 = np.random.rand(self.n_dim)

            cognitive = self.c1 * r1 * (self.pbest_positions[i] - self.positions[i])
            social = self.c2 * r2 * (self.gbest_position - self.positions[i])

            # 加入Levy飞行项
            levy_term = self.alpha * levy_step

            # 更新速度
            self.velocities[i] = (self.w * self.velocities[i] +
                                cognitive + social + levy_term)

            # 更新位置
            self.positions[i] += self.velocities[i]

            # 边界处理
            for j in range(self.n_dim):
                min_val, max_val = bounds[j]
                self.positions[i, j] = np.clip(self.positions[i, j], min_val, max_val)

    def optimize(self, objective_func, bounds, verbose=False):
        """
        运行优化算法

        Args:
            objective_func: 目标函数
            bounds: 变量边界列表 [(min1, max1), (min2, max2), ...]
            verbose: 是否打印进度信息

        Returns:
            best_position: 最优位置
            best_value: 最优值
        """
        # 初始化
        self.initialize(bounds)

        # 评估初始粒子
        for i in range(self.n_particles):
            value = objective_func(self.positions[i])
            self.pbest_values[i] = value

            if value < self.gbest_value:
                self.gbest_value = value
                self.gbest_position = self.positions[i].copy()

        self.gbest_history.append(self.gbest_value)

        # 主循环
        for iteration in range(self.max_iter):
            # 更新粒子
            self.update_particles(bounds)

            # 评估新位置
            for i in range(self.n_particles):
                value = objective_func(self.positions[i])

                # 更新个体最优
                if value < self.pbest_values[i]:
                    self.pbest_values[i] = value
                    self.pbest_positions[i] = self.positions[i].copy()

                    # 更新全局最优
                    if value < self.gbest_value:
                        self.gbest_value = value
                        self.gbest_position = self.positions[i].copy()

            # 记录收敛历史
            self.gbest_history.append(self.gbest_value)

            # Print progress
            if verbose and (iteration + 1) % 100 == 0:
                print(f"  Iteration {iteration + 1}/{self.max_iter}, Best Value: {self.gbest_value:.4f}")

        return self.gbest_position, self.gbest_value

# ===========================================================
# 微电网优化调度主程序
# ===========================================================
def optimize_microgrid(battery_strategy='peak_shaving'):
    """
    运行微电网优化调度

    Args:
        battery_strategy: 蓄电池控制策略
            'peak_shaving' - 削峰填谷
            'fuzzy_logic' - 模糊逻辑控制
    """
    strategy_name = "Peak Shaving" if battery_strategy == 'peak_shaving' else "Fuzzy Logic"
    print(f"\nRunning Microgrid Optimization (Battery Strategy: {strategy_name})")
    print("=" * 60)

    # 1. 创建微电网模型
    microgrid = MicrogridOptimization()

    # 2. 选择蓄电池控制策略
    if battery_strategy == 'peak_shaving':
        battery_control = PeakShavingControl(capacity=100, max_power=30)
    else:
        battery_control = FuzzyLogicControl(capacity=100, max_power=30)

    # 3. 设置LFPSO参数
    n_devices = len(microgrid.devices) + 1  # 所有设备 + 电网
    n_dim = n_devices * microgrid.time_steps  # 决策变量维度

    # 定义变量边界
    bounds = []
    for device in list(microgrid.devices.keys()) + ['Grid']:
        if device == 'Grid':
            # 电网交互功率限制
            min_power, max_power = -150, 150
        else:
            min_power = microgrid.devices[device]['min']
            max_power = microgrid.devices[device]['max']

        bounds.extend([(min_power, max_power)] * microgrid.time_steps)

    # 4. 运行LFPSO优化
    lfpso = LFPSO(n_particles=60, n_dim=n_dim, max_iter=2000)

    print("Starting optimization...")
    start_time = datetime.now()

    best_position, best_value = lfpso.optimize(
        microgrid.objective_function,
        bounds,
        verbose=True
    )

    elapsed_time = (datetime.now() - start_time).total_seconds()
    print(f"\nOptimization completed!")
    print(f"Total runtime: {elapsed_time:.2f} seconds")
    print(f"Optimal total cost: {best_value:.2f} Yuan")

    # 5. 解码最优解
    optimal_schedule = microgrid.decode_solution(best_position)

    # 6. 计算详细成本
    economic_cost = microgrid.calculate_economic_cost(optimal_schedule)
    environmental_cost = microgrid.calculate_environmental_cost(optimal_schedule)
    total_cost = 0.5 * economic_cost + 0.5 * environmental_cost

    print(f"\nDetailed Cost Analysis:")
    print(f"  Economic cost: {economic_cost:.2f} Yuan")
    print(f"  Environmental cost: {environmental_cost:.2f} Yuan")
    print(f"  Weighted total cost: {total_cost:.2f} Yuan")

    return optimal_schedule, lfpso.gbest_history

# ===========================================================
# 结果可视化
# ===========================================================
def plot_results(schedule1, schedule2, history1, history2):
    """绘制两种策略的对比结果"""
    fig, axes = plt.subplots(3, 2, figsize=(15, 12))

    # 策略1：削峰填谷
    ax = axes[0, 0]
    hours = range(24)
    devices = ['PV', 'WT', 'FC', 'MT', 'DE', 'BT', 'Grid']

    bottom = np.zeros(24)
    for device in devices:
        if device in schedule1:
            ax.bar(hours, schedule1[device], bottom=bottom, label=device, alpha=0.7)
            bottom += schedule1[device]

    ax.plot(hours, microgrid.load_profile, 'k--', linewidth=2, label='Load')
    ax.set_xlabel('Time (hour)')
    ax.set_ylabel('Power (kW)')
    ax.set_title('Strategy 1: Peak Shaving - Device Output')
    ax.legend(ncol=3, fontsize=8)
    ax.grid(True, alpha=0.3)

    # 策略2：模糊逻辑控制
    ax = axes[0, 1]
    bottom = np.zeros(24)
    for device in devices:
        if device in schedule2:
            ax.bar(hours, schedule2[device], bottom=bottom, label=device, alpha=0.7)
            bottom += schedule2[device]

    ax.plot(hours, microgrid.load_profile, 'k--', linewidth=2, label='Load')
    ax.set_xlabel('Time (hour)')
    ax.set_ylabel('Power (kW)')
    ax.set_title('Strategy 2: Fuzzy Logic Control - Device Output')
    ax.legend(ncol=3, fontsize=8)
    ax.grid(True, alpha=0.3)

    # Convergence curves
    ax = axes[1, 0]
    ax.plot(history1, 'b-', linewidth=2, label='Strategy 1')
    ax.set_xlabel('Iteration')
    ax.set_ylabel('Total Cost (Yuan)')
    ax.set_title('Strategy 1: Convergence Curve')
    ax.grid(True, alpha=0.3)
    ax.legend()

    ax = axes[1, 1]
    ax.plot(history2, 'r-', linewidth=2, label='Strategy 2')
    ax.set_xlabel('Iteration')
    ax.set_ylabel('Total Cost (Yuan)')
    ax.set_title('Strategy 2: Convergence Curve')
    ax.grid(True, alpha=0.3)
    ax.legend()

    # Cost comparison
    ax = axes[2, 0]
    costs = [history1[-1], history2[-1]]
    strategies = ['Peak Shaving', 'Fuzzy Logic']
    bars = ax.bar(strategies, costs, color=['blue', 'red'], alpha=0.7)
    ax.set_ylabel('Total Cost (Yuan)')
    ax.set_title('Total Cost Comparison of Two Strategies')
    ax.grid(True, alpha=0.3, axis='y')

    # Display values on bar chart
    for bar, cost in zip(bars, costs):
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height,
                f'{cost:.1f} Yuan', ha='center', va='bottom')

    # Forecast power curves
    ax = axes[2, 1]
    hours = range(24)
    ax.plot(hours, microgrid.load_profile, 'k-', linewidth=2, label='Load')
    ax.plot(hours, microgrid.pv_profile, 'y-', linewidth=2, label='PV')
    ax.plot(hours, microgrid.wt_profile, 'g-', linewidth=2, label='Wind')
    ax.fill_between(hours, 0, microgrid.load_profile, alpha=0.2, color='gray')
    ax.set_xlabel('Time (hour)')
    ax.set_ylabel('Power (kW)')
    ax.set_title('Load and Renewable Energy Forecast')
    ax.legend()
    ax.grid(True, alpha=0.3)

    plt.tight_layout()
    plt.savefig('microgrid_optimization_results.png', dpi=300, bbox_inches='tight')
    plt.show()

# ===========================================================
# 主程序
# ===========================================================
if __name__ == "__main__":
    print("Microgrid Optimization Scheduling Simulation System")
    print("=" * 60)

    # Display forecast data
    microgrid = MicrogridOptimization()
    print("\nForecast Data:")
    print("-" * 40)
    data = pd.DataFrame({
        'Time': microgrid.time_labels,
        'Load(kW)': microgrid.load_profile,
        'PV(kW)': microgrid.pv_profile,
        'Wind(kW)': microgrid.wt_profile
    })
    print(data.round(1).to_string(index=False))

    # Run two strategies
    print("\nRunning Strategy 1: Peak Shaving Control...")
    schedule1, history1 = optimize_microgrid('peak_shaving')

    print("\nRunning Strategy 2: Fuzzy Logic Control...")
    schedule2, history2 = optimize_microgrid('fuzzy_logic')

    # Calculate cost improvement
    cost1 = history1[-1]
    cost2 = history2[-1]
    improvement = (cost1 - cost2) / cost1 * 100

    print("\n" + "="*60)
    print(f"Results Comparison:")
    print(f"  Strategy 1 (Peak Shaving) Total Cost: {cost1:.2f} Yuan")
    print(f"  Strategy 2 (Fuzzy Logic) Total Cost: {cost2:.2f} Yuan")
    print(f"  Cost Reduction: {improvement:.2f}%")
    print("="*60)

    # Plot results
    plot_results(schedule1, schedule2, history1, history2)

    # Display detailed scheduling plan
    print("\nDetailed 24-hour Scheduling Plan (Strategy 2 - Fuzzy Logic):")
    print("-" * 80)

    # Create scheduling table
    schedule_df = pd.DataFrame({
        'Time': microgrid.time_labels,
        'Load(kW)': microgrid.load_profile.round(1),
        'PV(kW)': schedule2['PV'].round(1),
        'Wind(kW)': schedule2['WT'].round(1),
        'FC(kW)': schedule2['FC'].round(1),
        'MT(kW)': schedule2['MT'].round(1),
        'DE(kW)': schedule2['DE'].round(1),
        'BT(kW)': schedule2['BT'].round(1),
        'Grid(kW)': schedule2['Grid'].round(1),
    })

    print(schedule_df.to_string(index=False))
```
