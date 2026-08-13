---
title: 同步整流Buck降压变换器
slug: 同步整流buck降压变换器
category: 嵌入式与硬件
summary: 1\. 电路拓扑识别
tags: 随笔
---

![](/uploads/csdn/同步整流buck降压变换器/img-01.jpeg)


#### 1\. 电路拓扑识别


这是一个**同步整流 Buck 降压变换器**的平均模型仿真，核心是通过 PWM 控制开关，实现直流降压输出。


-   **开关管**：`Switch_State` 控制主开关，`Not_Sw2` 控制同步整流管（互补导通，避免直通）。
-   **电感电流**：由 `IL_Integrator` 积分得到，反映电感充放电过程。
-   **输出电压**：由 `VC_Integrator` 积分得到，反映电容充放电过程。


---


#### 2\. 工作原理（状态方程推导）


##### 电感电流方程


![](/uploads/csdn/同步整流buck降压变换器/img-02.png)


![](/uploads/csdn/同步整流buck降压变换器/img-03.png)


##### 输出电压方程


![](/uploads/csdn/同步整流buck降压变换器/img-04.png)


---


#### 3\. 稳态输入输出关系（直流传递函数）


![](/uploads/csdn/同步整流buck降压变换器/img-05.png)


---


#### 4\. 仿真模块对应关系


模块

作用

对应物理量

`Switch_State`

PWM 占空比控制信号

D(t)

`IL_Integrator`

电感电流积分器

∫LDVin​−Vout​​dt

`VC_Integrator`

输出电压积分器

∫CiL​−Vout​/Rload​​dt

`All_Signals`

观测端口

iL​,Vout​,Vin​,D

`Vout_Workspace` / `IL_Workspace`

数据导出

将仿真结果写入工作区


---


#### 5\. 总结


![](/uploads/csdn/同步整流buck降压变换器/img-06.png)
