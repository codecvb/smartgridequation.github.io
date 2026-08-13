---
title: MATLAB山地地形仿真与最高点到最低点最短路径
slug: matlab山地地形仿真与最高点到最低点最短路径
category: MATLAB 仿真
summary: MATLAB山地地形仿真与最高点到最低点最短路径（考虑地形高程）
tags: MATLAB
---

## MATLAB山地地形仿真与最高点到最低点最短路径（考虑地形高程）


>
>
> 注意：这里不是平面欧氏最短距离，是**三维地形表面的最短路径（测地线）**，山地有高低起伏，路径要沿着山体表面走，不能直接穿山洞。
>
>


![在这里插入图片描述](/uploads/csdn/matlab山地地形仿真与最高点到最低点最短路径/img-01.png)


-

    地形：用随机分形 / 高斯叠加模拟起伏不平山地曲面 $z=f(x,y)z = f(x,y)$


-

    算法选用：**Dijkstra 算法**，把地形离散成网格图，每个网格点为图节点，相邻节点代价为地表实际行走距离，求解从最高海拔点到最低海拔点的最小代价路径。


### 完整 MATLAB 可直接运行代码


```matlab
<span class="token comment">%% 1.生成起伏山地地形</span>
clear<span class="token punctuation">;</span> clc<span class="token punctuation">;</span> close all<span class="token punctuation">;</span>
n <span class="token operator">=</span> <span class="token number">50</span><span class="token punctuation">;</span>   <span class="token comment">% 网格分辨率 n*n地形网格</span>
<span class="token punctuation">[</span>x<span class="token punctuation">,</span>y<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token function">meshgrid</span><span class="token punctuation">(</span><span class="token function">linspace</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">,</span><span class="token number">20</span><span class="token punctuation">,</span>n<span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token function">linspace</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">,</span><span class="token number">20</span><span class="token punctuation">,</span>n<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">% 多个高斯山峰叠加模拟山地，制造高低起伏</span>
z <span class="token operator">=</span> <span class="token function">zeros</span><span class="token punctuation">(</span><span class="token function">size</span><span class="token punctuation">(</span>x<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
peak_num <span class="token operator">=</span> <span class="token number">8</span><span class="token punctuation">;</span>
<span class="token function">rng</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">%固定随机种子，复现地形</span>
<span class="token keyword">for</span> <span class="token number">i</span> <span class="token operator">=</span> <span class="token number">1</span><span class="token operator">:</span>peak_num
    x0 <span class="token operator">=</span> <span class="token number">20</span><span class="token operator">*</span><span class="token function">rand</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    y0 <span class="token operator">=</span> <span class="token number">20</span><span class="token operator">*</span><span class="token function">rand</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    sigma <span class="token operator">=</span> <span class="token number">1.5</span> <span class="token operator">+</span> <span class="token number">3</span><span class="token operator">*</span><span class="token function">rand</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    amp <span class="token operator">=</span> <span class="token number">2</span> <span class="token operator">+</span> <span class="token number">6</span><span class="token operator">*</span><span class="token function">rand</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    z <span class="token operator">=</span> z <span class="token operator">+</span> amp<span class="token operator">*</span><span class="token function">exp</span><span class="token punctuation">(</span> <span class="token operator">-</span><span class="token punctuation">(</span><span class="token punctuation">(</span>x<span class="token operator">-</span>x0<span class="token punctuation">)</span><span class="token operator">.^</span><span class="token number">2</span><span class="token operator">+</span><span class="token punctuation">(</span>y<span class="token operator">-</span>y0<span class="token punctuation">)</span><span class="token operator">.^</span><span class="token number">2</span><span class="token punctuation">)</span><span class="token operator">/</span><span class="token punctuation">(</span><span class="token number">2</span><span class="token operator">*</span>sigma<span class="token operator">^</span><span class="token number">2</span><span class="token punctuation">)</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token keyword">end</span>
<span class="token comment">% 叠加小噪声模拟粗糙山地</span>
z <span class="token operator">=</span> z <span class="token operator">+</span> <span class="token number">0.4</span><span class="token operator">*</span><span class="token function">randn</span><span class="token punctuation">(</span><span class="token function">size</span><span class="token punctuation">(</span>z<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">%% 找最高点、最低点的网格下标</span>
<span class="token punctuation">[</span>z_max<span class="token punctuation">,</span>idx_max<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token function">max</span><span class="token punctuation">(</span><span class="token function">z</span><span class="token punctuation">(</span><span class="token operator">:</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">[</span>ix_start<span class="token punctuation">,</span>iy_start<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token function">ind2sub</span><span class="token punctuation">(</span><span class="token function">size</span><span class="token punctuation">(</span>z<span class="token punctuation">)</span><span class="token punctuation">,</span>idx_max<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token punctuation">[</span>z_min<span class="token punctuation">,</span>idx_min<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token function">min</span><span class="token punctuation">(</span><span class="token function">z</span><span class="token punctuation">(</span><span class="token operator">:</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">[</span>ix_end<span class="token punctuation">,</span>iy_end<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token function">ind2sub</span><span class="token punctuation">(</span><span class="token function">size</span><span class="token punctuation">(</span>z<span class="token punctuation">)</span><span class="token punctuation">,</span>idx_min<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token function">fprintf</span><span class="token punctuation">(</span>"最高点<span class="token punctuation">(</span><span class="token comment">%d,%d),高程=%.2f \n",ix_start,iy_start,z_max);</span>
<span class="token function">fprintf</span><span class="token punctuation">(</span>"最低点<span class="token punctuation">(</span><span class="token comment">%d,%d),高程=%.2f \n",ix_end,iy_end,z_min);</span>

<span class="token comment">%% 2.Dijkstra求解地形表面最短路径</span>
<span class="token comment">% 将二维网格(i,j)映射成一维节点编号 node = (j-1)*n + i</span>
idx2node <span class="token operator">=</span> <span class="token operator">@</span><span class="token punctuation">(</span><span class="token number">i</span><span class="token punctuation">,</span><span class="token number">j</span><span class="token punctuation">)</span> <span class="token punctuation">(</span><span class="token number">j</span><span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token operator">*</span>n <span class="token operator">+</span> <span class="token number">i</span><span class="token punctuation">;</span>
node2idx <span class="token operator">=</span> <span class="token operator">@</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span> <span class="token function">ind2sub</span><span class="token punctuation">(</span><span class="token punctuation">[</span>n<span class="token punctuation">,</span>n<span class="token punctuation">]</span><span class="token punctuation">,</span>node<span class="token punctuation">)</span><span class="token punctuation">;</span>

N <span class="token operator">=</span> n<span class="token operator">*</span>n<span class="token punctuation">;</span>   <span class="token comment">%总节点数目</span>
INF <span class="token operator">=</span> <span class="token number">1e10</span><span class="token punctuation">;</span>
dist <span class="token operator">=</span> <span class="token function">ones</span><span class="token punctuation">(</span>N<span class="token punctuation">,</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token operator">*</span>INF<span class="token punctuation">;</span>
start_node <span class="token operator">=</span> <span class="token function">idx2node</span><span class="token punctuation">(</span>ix_start<span class="token punctuation">,</span> iy_start<span class="token punctuation">)</span><span class="token punctuation">;</span>
end_node   <span class="token operator">=</span> <span class="token function">idx2node</span><span class="token punctuation">(</span>ix_end<span class="token punctuation">,</span> iy_end<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token function">dist</span><span class="token punctuation">(</span>start_node<span class="token punctuation">)</span> <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
visited <span class="token operator">=</span> <span class="token function">false</span><span class="token punctuation">(</span>N<span class="token punctuation">,</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
prev <span class="token operator">=</span> <span class="token function">zeros</span><span class="token punctuation">(</span>N<span class="token punctuation">,</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">%记录路径前驱，用于回溯路径</span>

<span class="token comment">% 四邻域：上下左右；也可以改成8邻域允许斜向行走</span>
neigh_d <span class="token operator">=</span> <span class="token punctuation">[</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">,</span><span class="token number">0</span><span class="token punctuation">;</span> <span class="token number">1</span><span class="token punctuation">,</span><span class="token number">0</span><span class="token punctuation">;</span> <span class="token number">0</span><span class="token punctuation">,</span><span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">;</span><span class="token number">0</span><span class="token punctuation">,</span><span class="token number">1</span> <span class="token punctuation">]</span><span class="token punctuation">;</span>
<span class="token comment">% neigh_d = [ -1,-1;-1,0;-1,1;0,-1;0,1;1,-1;1,0;1,1 ]; %8邻域</span>

<span class="token keyword">for</span> iter <span class="token operator">=</span> <span class="token number">1</span><span class="token operator">:</span>N
    <span class="token comment">% 选取未访问距离最小的节点u(Dijkstra核心)</span>
    minD <span class="token operator">=</span> INF<span class="token punctuation">;</span>
    u <span class="token operator">=</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">;</span>
    <span class="token keyword">for</span> v <span class="token operator">=</span> <span class="token number">1</span><span class="token operator">:</span>N
        <span class="token keyword">if</span><span class="token punctuation">(</span><span class="token operator">~</span><span class="token function">visited</span><span class="token punctuation">(</span>v<span class="token punctuation">)</span> <span class="token operator">&&</span> <span class="token function">dist</span><span class="token punctuation">(</span>v<span class="token punctuation">)</span> <span class="token operator"><</span> minD<span class="token punctuation">)</span>
            minD <span class="token operator">=</span> <span class="token function">dist</span><span class="token punctuation">(</span>v<span class="token punctuation">)</span><span class="token punctuation">;</span>
            u <span class="token operator">=</span> v<span class="token punctuation">;</span>
        <span class="token keyword">end</span>
    <span class="token keyword">end</span>
    <span class="token keyword">if</span><span class="token punctuation">(</span>u <span class="token operator">==</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span> <span class="token keyword">break</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span><span class="token punctuation">(</span>u <span class="token operator">==</span> end_node<span class="token punctuation">)</span> <span class="token keyword">break</span><span class="token punctuation">;</span> <span class="token comment">%到达终点，提前退出</span>
    <span class="token function">visited</span><span class="token punctuation">(</span>u<span class="token punctuation">)</span> <span class="token operator">=</span> true<span class="token punctuation">;</span>

    <span class="token punctuation">[</span>iu<span class="token punctuation">,</span>ju<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token function">node2idx</span><span class="token punctuation">(</span>u<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">for</span> k <span class="token operator">=</span> <span class="token number">1</span><span class="token operator">:</span><span class="token function">size</span><span class="token punctuation">(</span>neigh_d<span class="token punctuation">,</span><span class="token number">1</span><span class="token punctuation">)</span>
        di <span class="token operator">=</span> <span class="token function">neigh_d</span><span class="token punctuation">(</span>k<span class="token punctuation">,</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        dj <span class="token operator">=</span> <span class="token function">neigh_d</span><span class="token punctuation">(</span>k<span class="token punctuation">,</span><span class="token number">2</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        iv <span class="token operator">=</span> iu <span class="token operator">+</span> di<span class="token punctuation">;</span>
        jv <span class="token operator">=</span> ju <span class="token operator">+</span> dj<span class="token punctuation">;</span>
        <span class="token keyword">if</span><span class="token punctuation">(</span>iv<span class="token operator"><</span><span class="token number">1</span><span class="token operator">||</span>iv<span class="token operator">></span>n<span class="token operator">||</span>jv<span class="token operator"><</span><span class="token number">1</span><span class="token operator">||</span>jv<span class="token operator">></span>n<span class="token punctuation">)</span> <span class="token keyword">continue</span><span class="token punctuation">;</span> <span class="token comment">%越界跳过</span>
        v <span class="token operator">=</span> <span class="token function">idx2node</span><span class="token punctuation">(</span>iv<span class="token punctuation">,</span>jv<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">if</span><span class="token punctuation">(</span><span class="token function">visited</span><span class="token punctuation">(</span>v<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token keyword">continue</span><span class="token punctuation">;</span> <span class="token keyword">end</span>

        <span class="token comment">% =========关键：计算山地地表实际行走距离=========</span>
        <span class="token comment">% 两点三维距离：dx,dy平面步长；dz高程差</span>
        dx <span class="token operator">=</span> <span class="token function">x</span><span class="token punctuation">(</span>iu<span class="token punctuation">,</span>ju<span class="token punctuation">)</span><span class="token operator">-</span><span class="token function">x</span><span class="token punctuation">(</span>iv<span class="token punctuation">,</span>jv<span class="token punctuation">)</span><span class="token punctuation">;</span>
        dy <span class="token operator">=</span> <span class="token function">y</span><span class="token punctuation">(</span>iu<span class="token punctuation">,</span>ju<span class="token punctuation">)</span><span class="token operator">-</span><span class="token function">y</span><span class="token punctuation">(</span>iv<span class="token punctuation">,</span>jv<span class="token punctuation">)</span><span class="token punctuation">;</span>
        dz <span class="token operator">=</span> <span class="token function">z</span><span class="token punctuation">(</span>iu<span class="token punctuation">,</span>ju<span class="token punctuation">)</span><span class="token operator">-</span><span class="token function">z</span><span class="token punctuation">(</span>iv<span class="token punctuation">,</span>jv<span class="token punctuation">)</span><span class="token punctuation">;</span>
        cost_uv <span class="token operator">=</span> <span class="token function">sqrt</span><span class="token punctuation">(</span>dx<span class="token operator">^</span><span class="token number">2</span> <span class="token operator">+</span> dy<span class="token operator">^</span><span class="token number">2</span> <span class="token operator">+</span> dz<span class="token operator">^</span><span class="token number">2</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">%地表欧式距离</span>

        <span class="token keyword">if</span><span class="token punctuation">(</span> <span class="token function">dist</span><span class="token punctuation">(</span>v<span class="token punctuation">)</span> <span class="token operator">></span> <span class="token function">dist</span><span class="token punctuation">(</span>u<span class="token punctuation">)</span><span class="token operator">+</span>cost_uv <span class="token punctuation">)</span>
            <span class="token function">dist</span><span class="token punctuation">(</span>v<span class="token punctuation">)</span> <span class="token operator">=</span> <span class="token function">dist</span><span class="token punctuation">(</span>u<span class="token punctuation">)</span><span class="token operator">+</span>cost_uv<span class="token punctuation">;</span>
            <span class="token function">prev</span><span class="token punctuation">(</span>v<span class="token punctuation">)</span> <span class="token operator">=</span> u<span class="token punctuation">;</span>
        <span class="token keyword">end</span>
    <span class="token keyword">end</span>
<span class="token keyword">end</span>

<span class="token comment">%% 回溯得到路径坐标</span>
path_nodes <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">;</span>
cur <span class="token operator">=</span> end_node<span class="token punctuation">;</span>
<span class="token keyword">while</span><span class="token punctuation">(</span>cur <span class="token operator">~=</span> <span class="token number">0</span><span class="token punctuation">)</span>
    path_nodes <span class="token operator">=</span> <span class="token punctuation">[</span>cur<span class="token punctuation">;</span> path_nodes<span class="token punctuation">]</span><span class="token punctuation">;</span>
    cur <span class="token operator">=</span> <span class="token function">prev</span><span class="token punctuation">(</span>cur<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token keyword">end</span>
<span class="token comment">%转成x,y,z坐标</span>
px <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">;</span> py <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">;</span> pz <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">;</span>
<span class="token keyword">for</span> nd <span class="token operator">=</span> path_nodes<span class="token operator">.'</span>
    <span class="token punctuation">[</span>ii<span class="token punctuation">,</span>jj<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token function">node2idx</span><span class="token punctuation">(</span>nd<span class="token punctuation">)</span><span class="token punctuation">;</span>
    px <span class="token operator">=</span> <span class="token punctuation">[</span>px<span class="token punctuation">,</span> <span class="token function">x</span><span class="token punctuation">(</span>ii<span class="token punctuation">,</span>jj<span class="token punctuation">)</span><span class="token punctuation">]</span><span class="token punctuation">;</span>
    py <span class="token operator">=</span> <span class="token punctuation">[</span>py<span class="token punctuation">,</span> <span class="token function">y</span><span class="token punctuation">(</span>ii<span class="token punctuation">,</span>jj<span class="token punctuation">)</span><span class="token punctuation">]</span><span class="token punctuation">;</span>
    pz <span class="token operator">=</span> <span class="token punctuation">[</span>pz<span class="token punctuation">,</span> <span class="token function">z</span><span class="token punctuation">(</span>ii<span class="token punctuation">,</span>jj<span class="token punctuation">)</span><span class="token punctuation">]</span><span class="token punctuation">;</span>
<span class="token keyword">end</span>
<span class="token function">fprintf</span><span class="token punctuation">(</span>"地形表面最短路径总长度：<span class="token comment">%.3f \n", dist(end_node));</span>

<span class="token comment">%% 绘图可视化</span>
<span class="token function">figure</span><span class="token punctuation">(</span><span class="token string">'Color'</span><span class="token punctuation">,</span><span class="token string">'w'</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token function">surf</span><span class="token punctuation">(</span>x<span class="token punctuation">,</span>y<span class="token punctuation">,</span>z<span class="token punctuation">,</span><span class="token string">'EdgeAlpha'</span><span class="token punctuation">,</span><span class="token number">0.1</span><span class="token punctuation">)</span><span class="token punctuation">;</span> hold on<span class="token punctuation">;</span>
shading interp<span class="token punctuation">;</span>
colormap jet<span class="token punctuation">;</span>
<span class="token comment">%绘制路径</span>
<span class="token function">plot3</span><span class="token punctuation">(</span>px<span class="token punctuation">,</span>py<span class="token punctuation">,</span>pz<span class="token operator">+</span><span class="token number">0.15</span><span class="token punctuation">,</span><span class="token string">'r-'</span><span class="token punctuation">,</span><span class="token string">'LineWidth'</span><span class="token punctuation">,</span><span class="token number">2.5</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token comment">%标记起点最高点、终点最低点</span>
<span class="token function">plot3</span><span class="token punctuation">(</span><span class="token function">x</span><span class="token punctuation">(</span>ix_start<span class="token punctuation">,</span>iy_start<span class="token punctuation">)</span><span class="token punctuation">,</span><span class="token function">y</span><span class="token punctuation">(</span>ix_start<span class="token punctuation">,</span>iy_start<span class="token punctuation">)</span><span class="token punctuation">,</span>z_max<span class="token operator">+</span><span class="token number">0.2</span><span class="token punctuation">,</span><span class="token string">'go'</span><span class="token punctuation">,</span><span class="token string">'MarkerSize'</span><span class="token punctuation">,</span><span class="token number">8</span><span class="token punctuation">,</span><span class="token string">'MarkerFaceColor'</span><span class="token punctuation">,</span><span class="token string">'g'</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token function">plot3</span><span class="token punctuation">(</span><span class="token function">x</span><span class="token punctuation">(</span>ix_end<span class="token punctuation">,</span>iy_end<span class="token punctuation">)</span><span class="token punctuation">,</span><span class="token function">y</span><span class="token punctuation">(</span>ix_end<span class="token punctuation">,</span>iy_end<span class="token punctuation">)</span><span class="token punctuation">,</span>z_min<span class="token operator">+</span><span class="token number">0.2</span><span class="token punctuation">,</span><span class="token string">'mo'</span><span class="token punctuation">,</span><span class="token string">'MarkerSize'</span><span class="token punctuation">,</span><span class="token number">8</span><span class="token punctuation">,</span><span class="token string">'MarkerFaceColor'</span><span class="token punctuation">,</span><span class="token string">'m'</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token function">xlabel</span><span class="token punctuation">(</span><span class="token string">'X'</span><span class="token punctuation">)</span><span class="token punctuation">;</span><span class="token function">ylabel</span><span class="token punctuation">(</span><span class="token string">'Y'</span><span class="token punctuation">)</span><span class="token punctuation">;</span><span class="token function">zlabel</span><span class="token punctuation">(</span><span class="token string">'Z 高程'</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token function">title</span><span class="token punctuation">(</span><span class="token string">'山地地形 + 最高点→最低点地表最短路径(Dijkstra)'</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token function">view</span><span class="token punctuation">(</span><span class="token number">3</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
grid on<span class="token punctuation">;</span>
```


### 运行说明


1.

    rng (1) 固定随机种子，每次生成同一片山地；注释掉可以生成不同起伏山地。


2.

    邻域：代码默认**4 邻域（只能上下左右走）**；注释切换为 8 邻域可以斜向穿越。


3.

    cost\_uv = $Δx2+Δy2+Δz2\sqrt{\Delta x^2+\Delta y^2+\Delta z^2}$ ，这是**沿着山地表面行走的实际距离**，不是平面距离，上坡下坡都会增加路径代价。


4.

    绿色圆点 = 地形最高点；品红色圆点 = 地形最低点；红色线条为算法算出来的地表最短路径。


---


## 算法原理详细说明


### 问题建模：山地→加权图


山地是连续曲面 $z=f(x,y)z=f(x,y)$ ，计算机不能直接处理连续曲面，做**离散网格化**：


1.

    将 XY 平面切分成 $n×nn\times n$ 网格，每个网格交点 $(i,j)(i,j)$ 对应三维坐标 $(xi,j,yi,j,zi,j)(x_{i,j},y_{i,j},z_{i,j})$ ，作为图的**节点**。


2.

    每个节点只和周围相邻节点连通（4 邻域 / 8 邻域）。


3.

    **边的权重 cost**：两个相邻节点之间沿着山体表面的三维欧氏距离：


>
>
> 关键点：高程差 $Δz\Delta z$ 会增加行走代价。爬上陡坡，两点平面很近，但地表路径代价会很大；下坡同样也要计入行走距离。
>
>


4.  起点 S：网格上高程最大的点；终点 T：网格高程最小的点。


>
>
> 目标：求从 S 到 T，总边权之和最小的路径，也就是**山地表面最短路径**。
>
>


### Dijkstra 算法原理（求解单源最短路径）


Dijkstra 适用于**所有边权 ≥0** 的图，本问题行走距离全部大于 0，满足条件。


#### 核心变量


-

    `dist[]`：`dist(v)`表示起点 S 到达节点 v 的当前已知最短距离；初始全部无穷大，仅起点 dist (S)=0。


-

    `visited[]`：标记节点是否已经确定最短距离。


-

    `prev[]`：记录路径前驱节点，算法结束后回溯，还原完整路径。


#### 算法迭代步骤


1.

    在所有**未被访问**的节点中，选出`dist`值最小的节点 u。这个节点 u 的最短路径已经确定。


2.

    将 u 标记为已访问。


3.

    遍历 u 全部相邻节点 v：

    尝试松弛：`if dist[v] > dist[u] + w(u→v)`


    -   如果成立：说明经过 u 走到 v，距离更近。更新`dist[v]=dist[u]+w(u→v]`，记录`prev[v]=u`。


4.

    重复 1‑3，直到终点 T 被选为最小节点，提前终止；或者全部节点遍历完毕。


5.

    **路径回溯**：从终点 T 不断向前读取`prev[]`，反向得到完整路径点。


#### Dijkstra 数学保证


>
>
> 因为所有边权重非负，一旦节点 u 被选出（visited 标记），不可能后续再找到一条距离更小的路径到达 u，所以可以直接确定 u 的最短距离。
>
>


#### 本模型局限


1.

    是网格离散近似，网格 n 越大结果越准，但计算速度变慢；n=50 兼顾效果与速度。


2.

    路径只能沿着网格点走，不是理论上连续曲面的精确测地线，属于工程数值近似。


3.

    本版本代价只考虑几何行走距离；如果你想模拟爬山体力消耗，可以修改 cost，上坡额外乘惩罚系数，模拟 “爬山比平路费力”。


### 拓展：A \* 算法（加速版本）


Dijkstra 会盲目搜索整张图；A\*加入启发函数加速，适合网格很大的场景。

A\*估价函数：


-

    $g(n)g(n)$ ：起点到 n 的实际行走距离（等价 Dijkstra 的 dist）


-

    $h(n)h(n)$ ：启发估计，n 到终点的三维直线距离（不能大于真实最短距离，保证结果正确）


### 补充：如果想要真实连续曲面测地线


Dijkstra 网格是离散近似；MATLAB 自带 `geodesic` 可以计算三角网格曲面的严格测地线，需要把山地转成三角面片`triangulation`对象，计算量更大。Dijkstra 网格方法更容易理解，教学演示首选。


### 拓展修改示例：增加爬山体力惩罚


比如上坡增加代价：


```matlab
dz <span class="token operator">=</span> <span class="token function">z</span><span class="token punctuation">(</span>iu<span class="token punctuation">,</span>ju<span class="token punctuation">)</span><span class="token operator">-</span><span class="token function">z</span><span class="token punctuation">(</span>iv<span class="token punctuation">,</span>jv<span class="token punctuation">)</span><span class="token punctuation">;</span>
geo_dist <span class="token operator">=</span> <span class="token function">sqrt</span><span class="token punctuation">(</span>dx<span class="token operator">^</span><span class="token number">2</span><span class="token operator">+</span>dy<span class="token operator">^</span><span class="token number">2</span><span class="token operator">+</span>dz<span class="token operator">^</span><span class="token number">2</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token keyword">if</span><span class="token punctuation">(</span>dz <span class="token operator"><</span> <span class="token number">0</span><span class="token punctuation">)</span>
    <span class="token comment">% dz<0：从u走到v高度上升（上坡）增加惩罚系数</span>
    cost_uv <span class="token operator">=</span> geo_dist <span class="token operator">*</span> <span class="token number">1.8</span><span class="token punctuation">;</span>
<span class="token keyword">else</span>
    cost_uv <span class="token operator">=</span> geo_dist<span class="token punctuation">;</span>
<span class="token keyword">end</span>
```


此时不再求几何最短，而是求**体力消耗最小路径**，路径会主动绕开陡峭山坡。
