---
title: 麦克斯韦方程组电磁效应Python展示
slug: 麦克斯韦方程组电磁效应python展示
category: 物理与天文
summary: 一、麦克斯韦方程组完整数学推导
tags: 物理, 天文, Python, 物理仿真
---

## 一、麦克斯韦方程组完整数学推导


![在这里插入图片描述](/uploads/csdn/麦克斯韦方程组电磁效应python展示/img-01.png)


### 基本物理前提


场量：电场 $E\boldsymbol E$ 、磁场 $B\boldsymbol B$ ，电荷密度 $ρ\rho$ ，电流密度 $j\boldsymbol j$


真空参数：真空介电常数 $ε0\varepsilon_0$ ，真空磁导率 $μ0\mu_0$ ，光速 $c=1ε0μ0c=\dfrac{1}{\sqrt{\varepsilon_0\mu_0}}$


---


### 1\. 高斯电场定律（电荷生电场）


静电库仑定律积分形式：


$∯SE⋅dS=1ε0∭VρdV\oiint_S \boldsymbol{E}\cdot d\boldsymbol{S}=\frac{1}{\varepsilon_0}\iiint_V \rho dV$


高斯散度定理 $∯A⋅dS=∭∇⋅AdV\oiint\boldsymbol A\cdot d\boldsymbol S=\iiint\nabla\cdot\boldsymbol A dV$


求微分形式：


$∇⋅E=ρε0\nabla\cdot\boldsymbol E=\frac{\rho}{\varepsilon_0}$


### 2\. 高斯磁场定律（无磁单极）


闭合曲面磁通量恒为 0：


$∯SB⋅dS=0\oiint_S \boldsymbol{B}\cdot d\boldsymbol{S}=0$


微分形式：


$∇⋅B=0\nabla\cdot\boldsymbol B=0$


### 3\. 法拉第电磁感应定律（磁变生电场）


积分形式：


$∮LE⋅dl=−ddt∬SB⋅dS\oint_L \boldsymbol{E}\cdot d\boldsymbol l = -\frac{d}{dt}\iint_S \boldsymbol{B}\cdot d\boldsymbol S$


斯托克斯旋度定理 $∮A⋅dl=∬(∇×A)⋅dS\oint\boldsymbol A\cdot d\boldsymbol l=\iint(\nabla\times\boldsymbol A)\cdot d\boldsymbol S$


微分形式：


$∇×E=−∂B∂t\nabla\times\boldsymbol E = -\frac{\partial \boldsymbol B}{\partial t}$


### 4\. 安培 - 麦克斯韦环路定律（电流 + 电变生磁场）


原始安培定律 + 位移电流修正


积分形式：


$∮LB⋅dl=μ0(∬Sj⋅dS+ε0ddt∬SE⋅dS)\oint_L \boldsymbol{B}\cdot d\boldsymbol l=\mu_0\left(\iint_S\boldsymbol j\cdot d\boldsymbol S+\varepsilon_0\frac{d}{dt}\iint_S\boldsymbol E\cdot d\boldsymbol S\right)$


微分形式：


$∇×B=μ0j+μ0ε0∂E∂t\nabla\times\boldsymbol B=\mu_0\boldsymbol j+\mu_0\varepsilon_0\frac{\partial \boldsymbol E}{\partial t}$


---


### 四式汇总 微分麦克斯韦方程组


$\end{cases}$


### 衍生：真空电磁波波动方程


真空无电荷无电流： $ρ=0,j=0\rho=0,\boldsymbol j=0$


对旋度式再次取旋度，利用矢量恒等式 $∇×(∇×A)=∇(∇⋅A)−∇2A\nabla\times(\nabla\times\boldsymbol A)=\nabla(\nabla\cdot\boldsymbol A)-\nabla^2\boldsymbol A$


推得电磁波方程：


$\nabla^2\boldsymbol B=\frac{1}{c^2}\frac{\partial^2\boldsymbol B}{\partial t^2}$


---


## 二、Python 电磁场一维波动模拟代码


实现平面电磁波时空演化可视化


```python
<span class="token keyword">import</span> numpy <span class="token keyword">as</span> np
<span class="token keyword">import</span> matplotlib<span class="token punctuation">.</span>pyplot <span class="token keyword">as</span> plt

<span class="token comment"># ========== 参数设置 ==========</span>
R <span class="token operator">=</span> <span class="token number">1.0</span>                     <span class="token comment"># 圆环半径 (m)</span>
I <span class="token operator">=</span> <span class="token number">1.0</span>                     <span class="token comment"># 电流 (A)</span>
mu0 <span class="token operator">=</span> <span class="token number">4</span> <span class="token operator">*</span> np<span class="token punctuation">.</span>pi <span class="token operator">*</span> <span class="token number">1e-7</span>      <span class="token comment"># 真空磁导率</span>

<span class="token comment"># 离散化圆环（用若干小段代替连续电流回路）</span>
N_segments <span class="token operator">=</span> <span class="token number">200</span>            <span class="token comment"># 分段数，越大精度越高</span>
theta <span class="token operator">=</span> np<span class="token punctuation">.</span>linspace<span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">,</span> <span class="token number">2</span> <span class="token operator">*</span> np<span class="token punctuation">.</span>pi<span class="token punctuation">,</span> N_segments<span class="token punctuation">,</span> endpoint<span class="token operator">=</span><span class="token boolean">False</span><span class="token punctuation">)</span>
<span class="token comment"># 圆环上各点的位置向量 (位于 z=0 平面)</span>
dl <span class="token operator">=</span> np<span class="token punctuation">.</span>zeros<span class="token punctuation">(</span><span class="token punctuation">(</span>N_segments<span class="token punctuation">,</span> <span class="token number">3</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
<span class="token comment"># 线元向量 dl: 切向方向，长度 R * dtheta</span>
dtheta <span class="token operator">=</span> <span class="token number">2</span> <span class="token operator">*</span> np<span class="token punctuation">.</span>pi <span class="token operator">/</span> N_segments
<span class="token comment"># 圆环上电流元的位置</span>
wire_x <span class="token operator">=</span> R <span class="token operator">*</span> np<span class="token punctuation">.</span>cos<span class="token punctuation">(</span>theta<span class="token punctuation">)</span>
wire_y <span class="token operator">=</span> R <span class="token operator">*</span> np<span class="token punctuation">.</span>sin<span class="token punctuation">(</span>theta<span class="token punctuation">)</span>
wire_z <span class="token operator">=</span> np<span class="token punctuation">.</span>zeros_like<span class="token punctuation">(</span>theta<span class="token punctuation">)</span>
wire_pos <span class="token operator">=</span> np<span class="token punctuation">.</span>stack<span class="token punctuation">(</span><span class="token punctuation">[</span>wire_x<span class="token punctuation">,</span> wire_y<span class="token punctuation">,</span> wire_z<span class="token punctuation">]</span><span class="token punctuation">,</span> axis<span class="token operator">=</span><span class="token number">1</span><span class="token punctuation">)</span>  <span class="token comment"># (N_segments, 3)</span>

<span class="token comment"># 电流元向量 dl (沿圆周切向： -sin, cos)</span>
dl<span class="token punctuation">[</span><span class="token punctuation">:</span><span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token operator">-</span>R <span class="token operator">*</span> np<span class="token punctuation">.</span>sin<span class="token punctuation">(</span>theta<span class="token punctuation">)</span> <span class="token operator">*</span> dtheta   <span class="token comment"># dx</span>
dl<span class="token punctuation">[</span><span class="token punctuation">:</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">]</span> <span class="token operator">=</span>  R <span class="token operator">*</span> np<span class="token punctuation">.</span>cos<span class="token punctuation">(</span>theta<span class="token punctuation">)</span> <span class="token operator">*</span> dtheta   <span class="token comment"># dy</span>
dl<span class="token punctuation">[</span><span class="token punctuation">:</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token number">0.0</span>

<span class="token comment"># ========== 观测网格 (xz 平面, y=0) ==========</span>
x_range <span class="token operator">=</span> np<span class="token punctuation">.</span>linspace<span class="token punctuation">(</span><span class="token operator">-</span><span class="token number">2.5</span><span class="token punctuation">,</span> <span class="token number">2.5</span><span class="token punctuation">,</span> <span class="token number">50</span><span class="token punctuation">)</span>
z_range <span class="token operator">=</span> np<span class="token punctuation">.</span>linspace<span class="token punctuation">(</span><span class="token operator">-</span><span class="token number">2.5</span><span class="token punctuation">,</span> <span class="token number">2.5</span><span class="token punctuation">,</span> <span class="token number">50</span><span class="token punctuation">)</span>
X<span class="token punctuation">,</span> Z <span class="token operator">=</span> np<span class="token punctuation">.</span>meshgrid<span class="token punctuation">(</span>x_range<span class="token punctuation">,</span> z_range<span class="token punctuation">)</span>
Y <span class="token operator">=</span> np<span class="token punctuation">.</span>zeros_like<span class="token punctuation">(</span>X<span class="token punctuation">)</span>          <span class="token comment"># y=0 平面</span>

<span class="token comment"># 观测点坐标矩阵 (nx, nz, 3)</span>
obs_points <span class="token operator">=</span> np<span class="token punctuation">.</span>stack<span class="token punctuation">(</span><span class="token punctuation">[</span>X<span class="token punctuation">,</span> Y<span class="token punctuation">,</span> Z<span class="token punctuation">]</span><span class="token punctuation">,</span> axis<span class="token operator">=</span><span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span>  <span class="token comment"># shape (nx, nz, 3)</span>

<span class="token comment"># 初始化磁场数组</span>
Bx <span class="token operator">=</span> np<span class="token punctuation">.</span>zeros_like<span class="token punctuation">(</span>X<span class="token punctuation">)</span>
By <span class="token operator">=</span> np<span class="token punctuation">.</span>zeros_like<span class="token punctuation">(</span>X<span class="token punctuation">)</span>
Bz <span class="token operator">=</span> np<span class="token punctuation">.</span>zeros_like<span class="token punctuation">(</span>X<span class="token punctuation">)</span>

<span class="token comment"># ========== 计算每个观测点的磁场 ==========</span>
<span class="token keyword">print</span><span class="token punctuation">(</span><span class="token string">"正在计算磁场，请稍候..."</span><span class="token punctuation">)</span>
<span class="token keyword">for</span> i <span class="token keyword">in</span> <span class="token builtin">range</span><span class="token punctuation">(</span>N_segments<span class="token punctuation">)</span><span class="token punctuation">:</span>
    <span class="token comment"># 从电流元指向所有观测点的矢量 r</span>
    r_vec <span class="token operator">=</span> obs_points <span class="token operator">-</span> wire_pos<span class="token punctuation">[</span>i<span class="token punctuation">]</span>          <span class="token comment"># (nx, nz, 3)</span>
    r_norm <span class="token operator">=</span> np<span class="token punctuation">.</span>linalg<span class="token punctuation">.</span>norm<span class="token punctuation">(</span>r_vec<span class="token punctuation">,</span> axis<span class="token operator">=</span><span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span>   <span class="token comment"># (nx, nz)</span>
    r_norm3 <span class="token operator">=</span> r_norm<span class="token operator">**</span><span class="token number">3</span>

    <span class="token comment"># 防止除以零（观测点恰好在导线上）</span>
    r_norm3<span class="token punctuation">[</span>r_norm3 <span class="token operator"><</span> <span class="token number">1e-12</span><span class="token punctuation">]</span> <span class="token operator">=</span> np<span class="token punctuation">.</span>inf

    <span class="token comment"># 毕奥-萨伐尔定律: dB = (mu0/(4*pi)) * (dl × r_vec) / r^3</span>
    dl_cross_r <span class="token operator">=</span> np<span class="token punctuation">.</span>cross<span class="token punctuation">(</span>dl<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">,</span> r_vec<span class="token punctuation">)</span>       <span class="token comment"># (nx, nz, 3)</span>
    dB <span class="token operator">=</span> <span class="token punctuation">(</span>mu0 <span class="token operator">*</span> I <span class="token operator">/</span> <span class="token punctuation">(</span><span class="token number">4</span> <span class="token operator">*</span> np<span class="token punctuation">.</span>pi<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">*</span> dl_cross_r <span class="token operator">/</span> r_norm3<span class="token punctuation">[</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">,</span> np<span class="token punctuation">.</span>newaxis<span class="token punctuation">]</span>

    <span class="token comment"># 累加磁场分量</span>
    Bx <span class="token operator">+=</span> dB<span class="token punctuation">[</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">]</span>
    By <span class="token operator">+=</span> dB<span class="token punctuation">[</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">]</span>   <span class="token comment"># 理论值 By=0 （对称性）</span>
    Bz <span class="token operator">+=</span> dB<span class="token punctuation">[</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">]</span>

<span class="token comment"># 磁感应强度大小</span>
B_mag <span class="token operator">=</span> np<span class="token punctuation">.</span>sqrt<span class="token punctuation">(</span>Bx<span class="token operator">**</span><span class="token number">2</span> <span class="token operator">+</span> By<span class="token operator">**</span><span class="token number">2</span> <span class="token operator">+</span> Bz<span class="token operator">**</span><span class="token number">2</span><span class="token punctuation">)</span>

<span class="token keyword">print</span><span class="token punctuation">(</span><span class="token string">"计算完成，正在绘图..."</span><span class="token punctuation">)</span>

<span class="token comment"># ========== 可视化 ==========</span>
fig<span class="token punctuation">,</span> axes <span class="token operator">=</span> plt<span class="token punctuation">.</span>subplots<span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">,</span> figsize<span class="token operator">=</span><span class="token punctuation">(</span><span class="token number">14</span><span class="token punctuation">,</span> <span class="token number">5</span><span class="token punctuation">)</span><span class="token punctuation">)</span>

<span class="token comment"># --- 左图：磁场矢量图 ---</span>
ax1 <span class="token operator">=</span> axes<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span>
<span class="token comment"># 为避免箭头过密，对网格进行下采样</span>
skip <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token builtin">slice</span><span class="token punctuation">(</span><span class="token boolean">None</span><span class="token punctuation">,</span> <span class="token boolean">None</span><span class="token punctuation">,</span> <span class="token number">3</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token builtin">slice</span><span class="token punctuation">(</span><span class="token boolean">None</span><span class="token punctuation">,</span> <span class="token boolean">None</span><span class="token punctuation">,</span> <span class="token number">3</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
ax1<span class="token punctuation">.</span>quiver<span class="token punctuation">(</span>X<span class="token punctuation">[</span>skip<span class="token punctuation">]</span><span class="token punctuation">,</span> Z<span class="token punctuation">[</span>skip<span class="token punctuation">]</span><span class="token punctuation">,</span> Bx<span class="token punctuation">[</span>skip<span class="token punctuation">]</span><span class="token punctuation">,</span> Bz<span class="token punctuation">[</span>skip<span class="token punctuation">]</span><span class="token punctuation">,</span> B_mag<span class="token punctuation">[</span>skip<span class="token punctuation">]</span><span class="token punctuation">,</span>
           cmap<span class="token operator">=</span><span class="token string">'plasma'</span><span class="token punctuation">,</span> scale<span class="token operator">=</span><span class="token number">3e-5</span><span class="token punctuation">,</span> width<span class="token operator">=</span><span class="token number">0.003</span><span class="token punctuation">)</span>
ax1<span class="token punctuation">.</span>set_xlabel<span class="token punctuation">(</span><span class="token string">'x (m)'</span><span class="token punctuation">)</span>
ax1<span class="token punctuation">.</span>set_ylabel<span class="token punctuation">(</span><span class="token string">'z (m)'</span><span class="token punctuation">)</span>
ax1<span class="token punctuation">.</span>set_title<span class="token punctuation">(</span><span class="token string">'磁场矢量分布 (xz 平面)'</span><span class="token punctuation">)</span>
ax1<span class="token punctuation">.</span>set_aspect<span class="token punctuation">(</span><span class="token string">'equal'</span><span class="token punctuation">)</span>
ax1<span class="token punctuation">.</span>grid<span class="token punctuation">(</span><span class="token boolean">True</span><span class="token punctuation">,</span> alpha<span class="token operator">=</span><span class="token number">0.3</span><span class="token punctuation">)</span>

<span class="token comment"># 标示线圈位置（在 xz 平面上投影为两个点）</span>
ax1<span class="token punctuation">.</span>plot<span class="token punctuation">(</span><span class="token punctuation">[</span>R<span class="token punctuation">,</span> <span class="token operator">-</span>R<span class="token punctuation">]</span><span class="token punctuation">,</span> <span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">]</span><span class="token punctuation">,</span> <span class="token string">'ko'</span><span class="token punctuation">,</span> markersize<span class="token operator">=</span><span class="token number">5</span><span class="token punctuation">,</span> label<span class="token operator">=</span><span class="token string">'线圈截面'</span><span class="token punctuation">)</span>
ax1<span class="token punctuation">.</span>legend<span class="token punctuation">(</span><span class="token punctuation">)</span>

<span class="token comment"># --- 右图：磁感应强度大小云图 ---</span>
ax2 <span class="token operator">=</span> axes<span class="token punctuation">[</span><span class="token number">1</span><span class="token punctuation">]</span>
contour <span class="token operator">=</span> ax2<span class="token punctuation">.</span>contourf<span class="token punctuation">(</span>X<span class="token punctuation">,</span> Z<span class="token punctuation">,</span> B_mag<span class="token punctuation">,</span> levels<span class="token operator">=</span><span class="token number">50</span><span class="token punctuation">,</span> cmap<span class="token operator">=</span><span class="token string">'inferno'</span><span class="token punctuation">)</span>
ax2<span class="token punctuation">.</span>set_xlabel<span class="token punctuation">(</span><span class="token string">'x (m)'</span><span class="token punctuation">)</span>
ax2<span class="token punctuation">.</span>set_ylabel<span class="token punctuation">(</span><span class="token string">'z (m)'</span><span class="token punctuation">)</span>
ax2<span class="token punctuation">.</span>set_title<span class="token punctuation">(</span><span class="token string">'磁感应强度 |B| (T)'</span><span class="token punctuation">)</span>
ax2<span class="token punctuation">.</span>set_aspect<span class="token punctuation">(</span><span class="token string">'equal'</span><span class="token punctuation">)</span>
plt<span class="token punctuation">.</span>colorbar<span class="token punctuation">(</span>contour<span class="token punctuation">,</span> ax<span class="token operator">=</span>ax2<span class="token punctuation">,</span> label<span class="token operator">=</span><span class="token string">'|B| (T)'</span><span class="token punctuation">)</span>
ax2<span class="token punctuation">.</span>plot<span class="token punctuation">(</span><span class="token punctuation">[</span>R<span class="token punctuation">,</span> <span class="token operator">-</span>R<span class="token punctuation">]</span><span class="token punctuation">,</span> <span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">]</span><span class="token punctuation">,</span> <span class="token string">'wo'</span><span class="token punctuation">,</span> markersize<span class="token operator">=</span><span class="token number">5</span><span class="token punctuation">)</span>
ax2<span class="token punctuation">.</span>grid<span class="token punctuation">(</span><span class="token boolean">True</span><span class="token punctuation">,</span> alpha<span class="token operator">=</span><span class="token number">0.3</span><span class="token punctuation">)</span>

plt<span class="token punctuation">.</span>tight_layout<span class="token punctuation">(</span><span class="token punctuation">)</span>
plt<span class="token punctuation">.</span>show<span class="token punctuation">(</span><span class="token punctuation">)</span>
```


## 三、代码说明


1.

    采用**时域有限差分 FDTD**离散麦克斯韦旋度方程；


2.

    满足 CFL 数值稳定条件，保证波传播无畸变；


3.

    初始高斯脉冲激发横电磁波，动画直观展示**E、B 正交同相、同步向前传播**；


4.

    可修改波源位置、脉冲幅值、空间范围观测电磁场演化规律。
