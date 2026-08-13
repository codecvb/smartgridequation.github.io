---
title: 使用pandapower计算ieee33模型潮流计算并给出ui界面展示
slug: 使用pandapower计算ieee33模型潮流计算并给出ui界面展示
category: 编程技术
summary: 本文介绍了一个基于Python的IEEE33节点潮流计算系统，使用pandapower进行电力网络分析，并结合Tkinter开发图形用户界面。系统主要功能包括：加载IEEE33标准测试模型、执行潮流计算、显示网络拓扑结构、查看计算结果表格和电压分布曲线。程序采用模块化设计，包含网络信息展示、拓扑可视化、结果表格和电压曲线四个主要功能模块。拓扑图采用圆形布局，通过颜色和线宽直观反映线路负载率和节点电…
tags: 编程
---

本文介绍了一个基于Python的IEEE33节点潮流计算系统，使用pandapower进行电力网络分析，并结合Tkinter开发图形用户界面。系统主要功能包括：加载IEEE33标准测试模型、执行潮流计算、显示网络拓扑结构、查看计算结果表格和电压分布曲线。程序采用模块化设计，包含网络信息展示、拓扑可视化、结果表格和电压曲线四个主要功能模块。拓扑图采用圆形布局，通过颜色和线宽直观反映线路负载率和节点电压状态，同时提供详细的统计信息和图例说明。电压曲线功能可自动识别异常电压节点并标注数值。该系统为配电网分析提供了直观的可视化工具，便于工程师快速评估网络运行状态。


![](/uploads/csdn/使用pandapower计算ieee33模型潮流计算并给出ui界面展示/img-01.png)


![](/uploads/csdn/使用pandapower计算ieee33模型潮流计算并给出ui界面展示/img-02.png)


![](/uploads/csdn/使用pandapower计算ieee33模型潮流计算并给出ui界面展示/img-03.png)


```python
import pandapower as pp
import pandapower.networks as pn
import pandapower.plotting as pplot
import tkinter as tk
from tkinter import ttk, messagebox
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import pandas as pd
import numpy as np
from font_config import setup_chinese_font

setup_chinese_font()


class IEEE33PowerFlowApp:
    def __init__(self, root):
        self.root = root
        self.root.title("IEEE33节点潮流计算系统")
        self.root.geometry("1400x900")

        self.net = None
        self.setup_ui()

    def setup_ui(self):
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))

        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
        main_frame.rowconfigure(1, weight=1)

        control_frame = ttk.LabelFrame(main_frame, text="控制面板", padding="10")
        control_frame.grid(row=0, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=5)

        ttk.Button(control_frame, text="加载IEEE33模型", command=self.load_ieee33).pack(side=tk.LEFT, padx=5)
        ttk.Button(control_frame, text="执行潮流计算", command=self.run_powerflow).pack(side=tk.LEFT, padx=5)
        ttk.Button(control_frame, text="显示网络拓扑", command=self.show_topology).pack(side=tk.LEFT, padx=5)
        ttk.Button(control_frame, text="显示结果表格", command=self.show_results_table).pack(side=tk.LEFT, padx=5)
        ttk.Button(control_frame, text="显示电压曲线", command=self.show_voltage_curve).pack(side=tk.LEFT, padx=5)

        notebook = ttk.Notebook(main_frame)
        notebook.grid(row=1, column=0, columnspan=2, sticky=(tk.W, tk.E, tk.N, tk.S), pady=5)

        self.info_frame = ttk.Frame(notebook)
        notebook.add(self.info_frame, text="网络信息")

        self.topology_frame = ttk.Frame(notebook)
        notebook.add(self.topology_frame, text="网络拓扑")

        self.results_frame = ttk.Frame(notebook)
        notebook.add(self.results_frame, text="计算结果")

        self.voltage_frame = ttk.Frame(notebook)
        notebook.add(self.voltage_frame, text="电压曲线")

        self.setup_info_tab()
        self.setup_topology_tab()
        self.setup_results_tab()
        self.setup_voltage_tab()

    def setup_info_tab(self):
        info_text = tk.Text(self.info_frame, wrap=tk.WORD, width=80, height=30)
        scrollbar = ttk.Scrollbar(self.info_frame, orient=tk.VERTICAL, command=info_text.yview)
        info_text.configure(yscrollcommand=scrollbar.set)

        info_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        self.info_text = info_text

    def setup_topology_tab(self):
        self.topology_fig = plt.Figure(figsize=(12, 8))
        self.topology_canvas = FigureCanvasTkAgg(self.topology_fig, master=self.topology_frame)
        self.topology_canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)

    def setup_results_tab(self):
        results_notebook = ttk.Notebook(self.results_frame)
        results_notebook.pack(fill=tk.BOTH, expand=True)

        self.bus_frame = ttk.Frame(results_notebook)
        results_notebook.add(self.bus_frame, text="节点数据")

        self.line_frame = ttk.Frame(results_notebook)
        results_notebook.add(self.line_frame, text="线路数据")

        self.load_frame = ttk.Frame(results_notebook)
        results_notebook.add(self.load_frame, text="负荷数据")

    def setup_voltage_tab(self):
        self.voltage_fig = plt.Figure(figsize=(10, 6))
        self.voltage_canvas = FigureCanvasTkAgg(self.voltage_fig, master=self.voltage_frame)
        self.voltage_canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)

    def load_ieee33(self):
        try:
            self.net = pn.case33bw()
            self.display_network_info()
            messagebox.showinfo("成功", "IEEE33模型加载成功！")
        except Exception as e:
            messagebox.showerror("错误", f"加载模型失败: {str(e)}")

    def display_network_info(self):
        if self.net is None:
            self.info_text.delete(1.0, tk.END)
            self.info_text.insert(tk.END, "尚未加载IEEE33模型，请先加载模型。")
            return

        info = []
        info.append("=" * 60)
        info.append("IEEE33节点配电网模型信息")
        info.append("=" * 60)
        info.append(f"\n节点数量: {len(self.net.bus)}")
        info.append(f"线路数量: {len(self.net.line)}")
        info.append(f"负荷数量: {len(self.net.load)}")
        info.append(f"发电机数量: {len(self.net.gen)}")
        info.append(f"变压器数量: {len(self.net.trafo)}")
        info.append(f"开关数量: {len(self.net.switch)}")

        info.append("\n" + "=" * 60)
        info.append("系统参数")
        info.append("=" * 60)
        info.append(f"基准电压: {self.net.bus.vn_kv.iloc[0]} kV")
        info.append(f"基准频率: {self.net.f_hz} Hz")

        info.append("\n" + "=" * 60)
        info.append("节点信息 (前10个)")
        info.append("=" * 60)
        info.append(self.net.bus.head(10).to_string())

        info.append("\n" + "=" * 60)
        info.append("线路信息 (前10条)")
        info.append("=" * 60)
        info.append(self.net.line.head(10).to_string())

        info.append("\n" + "=" * 60)
        info.append("负荷信息 (前10个)")
        info.append("=" * 60)
        info.append(self.net.load.head(10).to_string())

        self.info_text.delete(1.0, tk.END)
        self.info_text.insert(tk.END, "\n".join(info))

    def run_powerflow(self):
        if self.net is None:
            messagebox.showerror("错误", "请先加载IEEE33模型！")
            return

        try:
            pp.runpp(self.net)
            self.display_results()
            # 自动更新拓扑图显示潮流结果
            self.show_topology_with_results()
            messagebox.showinfo("成功", "潮流计算完成！")
        except Exception as e:
            messagebox.showerror("错误", f"潮流计算失败: {str(e)}")

    def display_results(self):
        if self.net is None:
            return

        bus_results = self.net.bus.copy()
        bus_results['电压幅值(p.u.)'] = self.net.res_bus.vm_pu
        bus_results['电压相角(°)'] = self.net.res_bus.va_degree
        bus_results['有功功率(kW)'] = self.net.res_bus.p_mw * 1000
        bus_results['无功功率(kvar)'] = self.net.res_bus.q_mvar * 1000

        line_results = self.net.line.copy()
        line_results['有功功率始端(kW)'] = self.net.res_line.p_from_mw * 1000
        line_results['无功功率始端(kvar)'] = self.net.res_line.q_from_mvar * 1000
        line_results['有功功率末端(kW)'] = self.net.res_line.p_to_mw * 1000
        line_results['无功功率末端(kvar)'] = self.net.res_line.q_to_mvar * 1000
        line_results['电流(A)'] = self.net.res_line.i_from_ka * 1000
        line_results['线路损耗(kW)'] = self.net.res_line.pl_mw * 1000

        load_results = self.net.load.copy()
        load_results['有功负荷(kW)'] = self.net.res_load.p_mw * 1000
        load_results['无功负荷(kvar)'] = self.net.res_load.q_mvar * 1000

        self.display_dataframe(self.bus_frame, bus_results, "节点潮流计算结果")
        self.display_dataframe(self.line_frame, line_results, "线路潮流计算结果")
        self.display_dataframe(self.load_frame, load_results, "负荷潮流计算结果")

    def display_dataframe(self, parent, df, title):
        for widget in parent.winfo_children():
            widget.destroy()

        frame = ttk.Frame(parent)
        frame.pack(fill=tk.BOTH, expand=True)

        ttk.Label(frame, text=title, font=('Arial', 12, 'bold')).pack(pady=5)

        # 创建Treeview和滚动条
        tree_frame = ttk.Frame(frame)
        tree_frame.pack(fill=tk.BOTH, expand=True)

        tree = ttk.Treeview(tree_frame)
        tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

        scrollbar = ttk.Scrollbar(tree_frame, orient=tk.VERTICAL, command=tree.yview)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        tree.configure(yscrollcommand=scrollbar.set)

        # 水平滚动条
        h_scrollbar = ttk.Scrollbar(frame, orient=tk.HORIZONTAL, command=tree.xview)
        h_scrollbar.pack(side=tk.BOTTOM, fill=tk.X)
        tree.configure(xscrollcommand=h_scrollbar.set)

        tree["columns"] = list(df.columns)
        tree["show"] = "headings"

        for col in df.columns:
            tree.heading(col, text=col)
            tree.column(col, width=100, anchor=tk.CENTER)

        for idx, row in df.iterrows():
            tree.insert("", tk.END, values=list(row))

    def show_topology(self):
        if self.net is None:
            messagebox.showerror("错误", "请先加载IEEE33模型！")
            return
        self.show_topology_with_results()

    def show_topology_with_results(self):
        """显示带有潮流结果的网络拓扑图"""
        self.topology_fig.clear()

        # 创建两个子图：拓扑图和图例
        gs = self.topology_fig.add_gridspec(1, 2, width_ratios=[4, 1])
        ax = self.topology_fig.add_subplot(gs[0])
        legend_ax = self.topology_fig.add_subplot(gs[1])
        legend_ax.axis('off')

        try:
            # 获取节点位置（使用圆形布局）
            n_buses = len(self.net.bus)
            theta = np.linspace(0, 2*np.pi, n_buses, endpoint=False)
            radius = 5
            bus_positions = {}

            # 创建节点坐标（圆形布局）
            for i in range(n_buses):
                x = radius * np.cos(theta[i])
                y = radius * np.sin(theta[i])
                bus_positions[i] = (x, y)

            # 绘制线路
            for idx, line in self.net.line.iterrows():
                from_bus = line['from_bus']
                to_bus = line['to_bus']

                if from_bus in bus_positions and to_bus in bus_positions:
                    x_coords = [bus_positions[from_bus][0], bus_positions[to_bus][0]]
                    y_coords = [bus_positions[from_bus][1], bus_positions[to_bus][1]]

                    # 根据线路负载率设置颜色
                    if hasattr(self.net, 'res_line') and idx in self.net.res_line.index:
                        loading = abs(self.net.res_line.loc[idx, 'i_from_ka'] * 1000 / 400)  # 假设额定电流400A
                        if loading < 0.5:
                            color = 'green'
                        elif loading < 0.8:
                            color = 'orange'
                        else:
                            color = 'red'
                        line_width = 1 + loading
                    else:
                        color = 'blue'
                        line_width = 1

                    ax.plot(x_coords, y_coords, color=color, linewidth=line_width,
                           alpha=0.7, zorder=1)

            # 绘制节点
            for bus_id, pos in bus_positions.items():
                # 根据电压幅值设置节点颜色
                if hasattr(self.net, 'res_bus') and bus_id in self.net.res_bus.index:
                    v_pu = self.net.res_bus.loc[bus_id, 'vm_pu']
                    if v_pu < 0.95:
                        color = 'red'
                        size = 80
                    elif v_pu > 1.05:
                        color = 'orange'
                        size = 80
                    else:
                        color = 'green'
                        size = 60
                else:
                    color = 'blue'
                    size = 50

                scatter = ax.scatter(pos[0], pos[1], c=color, s=size,
                                    zorder=2, edgecolors='black', linewidth=1)

                # 添加节点编号标签
                ax.annotate(str(bus_id), (pos[0], pos[1]),
                           xytext=(5, 5), textcoords='offset points',
                           fontsize=8, bbox=dict(boxstyle='round,pad=0.2',
                                                facecolor='white', alpha=0.7))

            # 设置标题和标签
            ax.set_title("IEEE33节点配电网潮流分布图", fontsize=14, fontweight='bold', pad=20)
            ax.set_xlabel('X 坐标', fontsize=10)
            ax.set_ylabel('Y 坐标', fontsize=10)
            ax.grid(True, alpha=0.3)
            ax.set_aspect('equal')

            # 绘制图例
            legend_elements = []
            if hasattr(self.net, 'res_bus'):
                legend_elements.extend([
                    plt.Line2D([0], [0], marker='o', color='w', markerfacecolor='green',
                              markersize=10, label='电压正常 (0.95-1.05 p.u.)'),
                    plt.Line2D([0], [0], marker='o', color='w', markerfacecolor='orange',
                              markersize=10, label='电压偏高 (>1.05 p.u.)'),
                    plt.Line2D([0], [0], marker='o', color='w', markerfacecolor='red',
                              markersize=10, label='电压偏低 (<0.95 p.u.)'),
                ])

            if hasattr(self.net, 'res_line'):
                legend_elements.extend([
                    plt.Line2D([0], [0], color='green', linewidth=2, label='线路轻载 (<50%)'),
                    plt.Line2D([0], [0], color='orange', linewidth=2, label='线路中载 (50%-80%)'),
                    plt.Line2D([0], [0], color='red', linewidth=2, label='线路重载 (>80%)'),
                ])

            legend_ax.legend(handles=legend_elements, loc='center',
                           fontsize=9, frameon=True)

            # 添加网络统计信息
            if hasattr(self.net, 'res_bus'):
                v_min = self.net.res_bus.vm_pu.min()
                v_max = self.net.res_bus.vm_pu.max()
                v_mean = self.net.res_bus.vm_pu.mean()

                info_text = f"网络统计信息:\n\n"
                info_text += f"最低电压: {v_min:.3f} p.u.\n"
                info_text += f"最高电压: {v_max:.3f} p.u.\n"
                info_text += f"平均电压: {v_mean:.3f} p.u.\n"

                if hasattr(self.net, 'res_line'):
                    total_loss = self.net.res_line.pl_mw.sum() * 1000
                    info_text += f"总网损: {total_loss:.2f} kW\n"

                # 统计各电压等级节点数量
                n_low = sum(self.net.res_bus.vm_pu < 0.95)
                n_normal = sum((self.net.res_bus.vm_pu >= 0.95) & (self.net.res_bus.vm_pu <= 1.05))
                n_high = sum(self.net.res_bus.vm_pu > 1.05)

                info_text += f"\n电压质量统计:\n"
                info_text += f"正常节点: {n_normal}\n"
                info_text += f"偏低节点: {n_low}\n"
                info_text += f"偏高节点: {n_high}\n"

                ax.text(0.02, 0.98, info_text, transform=ax.transAxes,
                       fontsize=9, verticalalignment='top',
                       bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.8))

        except Exception as e:
            error_msg = f"拓扑图生成失败\n错误信息: {str(e)}"
            ax.text(0.5, 0.5, error_msg, ha='center', va='center',
                   fontsize=12, color='red')
            ax.set_title("IEEE33节点配电网拓扑图", fontsize=14, fontweight='bold')
            print(f"拓扑图绘制错误: {str(e)}")

        self.topology_fig.tight_layout()
        self.topology_canvas.draw()

    def show_results_table(self):
        if self.net is None:
            messagebox.showerror("错误", "请先加载IEEE33模型！")
            return
        self.display_results()

    def show_voltage_curve(self):
        if self.net is None:
            messagebox.showerror("错误", "请先加载IEEE33模型！")
            return

        self.voltage_fig.clear()
        ax = self.voltage_fig.add_subplot(111)

        bus_voltages = self.net.res_bus.vm_pu.values
        bus_indices = range(len(bus_voltages))

        # 绘制电压曲线
        line = ax.plot(bus_indices, bus_voltages, 'b-o', linewidth=2,
                      markersize=6, label='电压幅值', zorder=2)

        # 添加参考线
        ax.axhline(y=1.0, color='r', linestyle='--', linewidth=1,
                  label='额定电压', alpha=0.7)
        ax.axhline(y=0.95, color='orange', linestyle='--', linewidth=1,
                  label='下限(0.95 p.u.)', alpha=0.7)
        ax.axhline(y=1.05, color='orange', linestyle='--', linewidth=1,
                  label='上限(1.05 p.u.)', alpha=0.7)

        # 填充电压正常区域
        ax.fill_between(bus_indices, 0.95, 1.05, alpha=0.2, color='green',
                        label='正常范围')

        # 标注异常电压节点
        for i, v in enumerate(bus_voltages):
            if v < 0.95 or v > 1.05:
                ax.plot(i, v, 'ro', markersize=8, zorder=3)
                ax.annotate(f'{v:.3f}', (i, v), textcoords="offset points",
                           xytext=(0, 10), ha='center', fontsize=8,
                           bbox=dict(boxstyle='round,pad=0.2',
                                    facecolor='yellow', alpha=0.7))

        ax.set_xlabel('节点编号', fontsize=12)
        ax.set_ylabel('电压幅值 (p.u.)', fontsize=12)
        ax.set_title('IEEE33节点电压分布曲线', fontsize=14, fontweight='bold')
        ax.grid(True, alpha=0.3)
        ax.legend(fontsize=9, loc='best')
        ax.set_ylim([0.9, 1.1])
        ax.set_xlim([-0.5, len(bus_indices)-0.5])

        # 设置x轴刻度
        ax.set_xticks(np.arange(0, len(bus_indices), 2))

        # 添加统计信息
        v_min = np.min(bus_voltages)
        v_min_node = np.argmin(bus_voltages)
        v_max = np.max(bus_voltages)
        v_max_node = np.argmax(bus_voltages)

        info_text = f"最低电压: {v_min:.3f} p.u. (节点 {v_min_node})\n"
        info_text += f"最高电压: {v_max:.3f} p.u. (节点 {v_max_node})"

        ax.text(0.02, 0.02, info_text, transform=ax.transAxes,
               fontsize=9, verticalalignment='bottom',
               bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.8))

        self.voltage_fig.tight_layout()
        self.voltage_canvas.draw()


def main():
    root = tk.Tk()
    app = IEEE33PowerFlowApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
```
