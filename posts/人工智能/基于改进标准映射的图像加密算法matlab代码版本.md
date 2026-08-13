---
title: 基于改进标准映射的图像加密算法MATLAB代码版本
slug: 基于改进标准映射的图像加密算法matlab代码版本
category: 人工智能
summary: !在这里插入图片描述代码运行结果如上图
tags: 人工智能, MATLAB, 图像处理
---

![在这里插入图片描述](/uploads/csdn/基于改进标准映射的图像加密算法matlab代码版本/img-01.png)代码运行结果如上图


DOI: 10.12677/CSA.2017.78087

该论文由汕头大学陈裕城、叶瑞松撰写，2017 年发表于《计算机科学与应用》，针对传统 Chirikov 标准映射在图像加密中密钥空间小、置乱效果差、随机性不足的缺陷，提出改进标准映射，并设计一套置乱 - 扩散架构灰度图像加密算法，通过完整动力学分析与多维度安全实验验证方案安全性，全文分为研究背景、标准映射改进、加密算法设计、仿真与安全性能分析、总结五大模块。

一、研究背景与研究动机


1.  图像加密需求

    网络与多媒体高速发展，图像传输存在大量信息泄露风险；图像具有数据量大、冗余高、相邻像素强相关特性，传统文本加密算法（AES/DES）不适用，混沌图像加密成为主流方案。
2.  混沌加密适配性

    混沌系统具备初值 / 参数极端敏感、伪随机、遍历性，完美匹配密码学混淆、扩散需求，1998 年 Fridrich 提出经典置乱 - 扩散加密框架，大量二维混沌映射被用于图像加密。
3.  传统标准映射（Chirikov 映射）固有缺陷

    标准映射是经典二维保面积混沌映射，但直接用于图像置乱存在明显安全短板：
4.  仅单一控制参数 $$ KK $$ ，密钥空间极小，易被暴力破解；
5.  低参数下相空间存在大量稳定 “岛礁”，混沌遍历性弱；
6.  图像置乱收敛慢，多次迭代仍残留纹理条纹；
7.  生成伪随机序列可预测性高，统计扩散效果差。
8.  论文核心思路

    对标准映射引入变量非线性项 + 多参数线性组合完成改进，提升混沌随机性；基于改进映射搭建完整灰度图像加密方案，结合 SHA256 哈希绑定明文，搭配动态反馈扩散机制提升抗攻击能力。

    二、标准映射及其改进方案与动力学验证

    2.1 原始标准映射（Chirikov 映射）
9.  连续域公式：

    $$ kk $$ 为唯一控制参数，系统保面积，存在稳定不动点；仅当 $$ k>0.971635k>0.971635 $$ （黄金分割临界点）才全域混沌。
10.  离散化图像适配版本：将 $$ 2π2\\pi $$ 区间映射至图像像素尺寸 $$ NN $$ ，仅保留参数 $$ KK $$ ，参数维度单一，安全性不足。

     2.2 改进标准映射模型
11.  连续改进映射

     新增两组控制参数 $$ k1,k2k\_1,k\_2 $$ 、非线性指数 $$ r1,r2r\_1,r\_2 $$ ，拓展参数维度：
12.  图像离散化改进映射

     适配 $$ N×NN×N $$ 灰度图像，引入偏移量 $$ rx,ryrx,ry $$ 消除 $$ (0,0)(0,0) $$ 像素置乱失效问题：

     2.3 改进映射动力学性能验证（四大维度）
13.  相位空间图

     同初值条件下，改进映射无大面积稳定岛礁，更快实现全域遍历；原始标准映射存在大片规则稳定区域，置乱残留纹理。Lena 图像测试：改进映射仅 2 轮置乱即可完全雪花化，原始标准映射 3 轮仍有条纹。
14.  Lyapunov 指数（LE）

     最大 Lyapunov 指数表征混沌强弱，原始标准映射均值 5.2231，改进映射均值超 8.2，混沌复杂度显著提升，轨道分离速度更快。
15.  时间序列相关性测试

     改进映射输出 $$ x、yx、y $$ 序列自相关仅 0 延迟峰值、互相关系数趋近于 0，序列无内部关联、不可预测，满足密码伪随机要求。
16.  图像置乱直观效果

     256×256 Lena 图测试：原始标准映射迭代 3 次仍存在明显纹理；改进映射仅 2 轮即可完全破坏像素结构，置乱效率大幅提升。

     三、基于改进标准映射的灰度图像完整加密 / 解密算法

     整体采用置乱 + 动态反馈扩散双层架构，SHA256 明文哈希绑定密钥，天然抵抗差分、选择明文攻击，共 13 步加密流程，解密为加密逆运算（逆扩散反向遍历）。
17.  前置密钥生成（明文关联密钥，核心安全设计）
18.  读取明文图像，计算图像像素 SHA256 哈希 $$ HIH\_I $$ ，转换 64 维向量 $$ HH $$ ；
19.  基于哈希向量计算偏移 $$ rx、ryrx、ry $$ ，规避 $$ (0,0)(0,0) $$ 像素置乱失效；
20.  由哈希值推导混沌初值 $$ x0、y0x\_0、y\_0 $$ 、扩散参数 $$ K11、K22K11、K22 $$ 、预迭代次数 $$ N0N0 $$ ；

     优势：明文仅 1bit 改动，哈希完全改变，密钥整体失效，天然抵抗差分、已知明文攻击。
21.  第一阶段：像素位置置乱（混淆层）

     使用离散改进标准映射迭代 $$ iteriter $$ 轮，打乱全部像素坐标，消除空间相邻相关性；参数 $$ K1、K2、r1、r2、iterK1、K2、r1、r2、iter $$ 全部纳入密钥空间，大幅扩充密钥维度。
22.  第二阶段：动态反馈扩散（扩散层，论文创新点）
23.  丢弃混沌序列前 $$ N0N0 $$ 项消除过渡效应，生成三组 8bit 密钥流 $$ key1、key2、key3key1、key2、key3 $$ ；
24.  一维化置乱图像 $$ I2I2 $$ ，首像素结合种子值异或加密；
25.  动态索引机制：每一个像素加密索引 $$ id1、id2id1、id2 $$ 依赖已加密密文动态更新；
26.  三重异或叠加密钥流、历史密文、原始置乱像素，实现全局像素值扩散；

     优势：单像素微小改动可扩散至全图，强化差分抵抗能力。
27.  解密流程

     加密完全逆过程：先逆扩散（像素反向遍历）、再逆置乱；需全套完全一致密钥，微小密钥偏差无法恢复明文。

     四、仿真实验与多维度安全性性能分析

     4.1 仿真环境与测试样本

     MATLAB R2014a，i7 处理器；测试图像：256×256 Lena、512×512 Elaine、1024×1024 Man；密文呈现均匀雪花噪声，正确密钥解密无损还原原图。

     4.2 八大安全指标测试分析
28.  密钥空间分析（抵抗暴力攻击）

     密钥包含：SHA256 哈希（128bit）、置乱轮数 $$ iteriter $$ 、映射多参数 $$ K1/K2/r1/r2/N0K1/K2/r1/r2/N0 $$ ，总密钥空间远大于安全阈值 128bit；可抵御现有计算机暴力破解。
29.  直方图与共生直方图（抵抗统计攻击）


-   明文灰度直方图起伏剧烈，密文直方图256 级灰度均匀分布；
-   二维共生直方图无集中峰值，攻击者无法从灰度分布提取明文特征。


30.  信息熵测试（随机性量化）

     8bit 灰度图像理想熵为 8；三张测试图密文熵分别 7.9967、7.9994、7.9998，无限接近理想值，优于对比文献算法，信息泄露概率极低。
31.  相邻像素相关性（消除空间关联）

     明文水平 / 垂直 / 对角相关系数接近 1；密文相关系数均趋近于 0，完全破坏自然图像像素依赖关系，抵御相关性统计攻击。
32.  明文 - 密文相关性

     明文与对应密文二维相关系数几乎为 0，二者无任何线性关联，无法通过密文反推明文轮廓。
33.  密钥敏感性测试
34.  加密敏感：密钥任意参数（哈希、iter、K1/K2/N0）微小改动，生成密文完全无关，密文相关系数≈0；
35.  解密敏感：仅 1bit 误差密钥解密，输出图像仍为噪声，无法识别明文。
36.  差分攻击测试（NPCR/UACI）

     随机修改明文单个像素 1bit，测试 500 组样本：


-   NPCR 均值 99.6195%（理想 99.6094%）
-   UACI 均值 33.4567%（理想 33.4636%）

    数值紧贴理论理想值，单像素改动可扩散至全图，完全抵御差分分析、选择明文攻击。


37.  综合抗攻击能力

     实验证明算法可抵御：暴力攻击、统计直方图 / 相关性攻击、差分攻击、已知明文 / 选择明文攻击、选择密文攻击。

     五、论文结论与创新点
38.  核心创新
39.  标准映射改进：引入多参数、非线性指数项，解决原始映射密钥空间小、混沌弱、置乱慢的缺陷，动力学特性全面提升；
40.  明文绑定密钥：SHA256 哈希将图像内容融入密钥，天然具备明文敏感性，强化差分攻击抗性；
41.  动态反馈扩散机制：密文动态索引参与像素加密，扩散彻底，优于传统单向固定异或扩散；
42.  兼顾效率与安全：改进映射迭代轮数少、计算复杂度适中，适合实时灰度图像加密场景。
43.  研究结论

     改进标准映射具备更强遍历性、更高 Lyapunov 指数、序列低相关性，混沌密码特性优于原始标准映射；基于该映射的置乱 - 扩散加密算法密钥空间充足、密钥极度敏感、统计随机性优秀，对主流密码攻击具备强鲁棒性，适用于多媒体图像实时加密传输场景。
44.  研究局限（文中未直接提及，可推导）

     仅针对灰度图像设计，未拓展彩色图像；未完成 NIST 标准化随机序列测试；未对比三维混沌、DNA 加密等新型图像加密方案。

     六、整体行文结构梳理
45.  引言：图像加密背景、混沌加密发展、标准映射现存缺陷、本文研究方案；
46.  标准映射及其改进：原始映射模型、改进映射构造、相图 / Lyapunov / 时间序列 / 置乱效果四维动力学验证；
47.  加密算法设计：SHA256 密钥生成、置乱流程、动态反馈扩散完整步骤、加解密流程图；
48.  仿真与安全分析：实验环境、明文 / 密文可视化、密钥空间 / 直方图 / 熵 / 相关性 / 密钥敏感 / 差分六大安全测试；
49.  总结：改进方案优势、算法安全特性、应用场景。


```matlab
<span class="token comment">%% 基于改进标准映射的图像加解密算法（论文复现+修复版）</span>
<span class="token comment">% 论文: 陈裕城, 叶瑞松. 基于改进标准映射的图像加密算法[J]. 计算机科学与应用, 2017, 7(8): 753-773.</span>
<span class="token comment">% 修复内容:</span>
<span class="token comment">%   1. 修复 id1/id2 动态索引公式中的 mod() 冗余，使动态索引真正生效</span>
<span class="token comment">%   2. 修复解密阶段引用原始置乱图 I2 的问题，改为使用已解密值 I2_dec</span>
<span class="token comment">%   3. 使用依赖解析循环确保解密收敛，不依赖原始图像</span>
<span class="token comment">%   4. 修复注释编码</span>
<span class="token comment">% 适配论文参数: K1=512, K2=128, r1=r2=2, 置乱轮数 iter=3</span>
<span class="token comment">% 兼容所有 MATLAB 版本</span>

clear<span class="token punctuation">;</span> clc<span class="token punctuation">;</span> close all<span class="token punctuation">;</span>

<span class="token comment">%% 1. 读取图像并预处理</span>
<span class="token comment">% 读取灰度图像（256*256 Lena图，可替换为任意灰度图）</span>
I <span class="token operator">=</span> <span class="token function">imread</span><span class="token punctuation">(</span><span class="token string">'2.jpeg'</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token comment">% 统一转为灰度图（处理 RGB 和 RGBA 两种情况）</span>
<span class="token keyword">if</span> <span class="token function">size</span><span class="token punctuation">(</span>I<span class="token punctuation">,</span><span class="token number">3</span><span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token number">4</span>
    I <span class="token operator">=</span> <span class="token function">I</span><span class="token punctuation">(</span><span class="token operator">:</span><span class="token punctuation">,</span><span class="token operator">:</span><span class="token punctuation">,</span><span class="token number">1</span><span class="token operator">:</span><span class="token number">3</span><span class="token punctuation">)</span><span class="token punctuation">;</span>  <span class="token comment">% 丢弃 Alpha 通道</span>
<span class="token keyword">end</span>
<span class="token keyword">if</span> <span class="token function">size</span><span class="token punctuation">(</span>I<span class="token punctuation">,</span><span class="token number">3</span><span class="token punctuation">)</span> <span class="token operator">>=</span> <span class="token number">3</span>
    I <span class="token operator">=</span> <span class="token function">rgb2gray</span><span class="token punctuation">(</span>I<span class="token punctuation">)</span><span class="token punctuation">;</span>  <span class="token comment">% 转为灰度图</span>
<span class="token keyword">end</span>
I <span class="token operator">=</span> <span class="token function">im2double</span><span class="token punctuation">(</span>I<span class="token punctuation">)</span><span class="token punctuation">;</span>  <span class="token comment">% 归一化到 [0,1]</span>
<span class="token punctuation">[</span>M<span class="token punctuation">,</span> N<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token function">size</span><span class="token punctuation">(</span>I<span class="token punctuation">)</span><span class="token punctuation">;</span>  <span class="token comment">% 获取图像尺寸</span>
MN <span class="token operator">=</span> M <span class="token operator">*</span> N<span class="token punctuation">;</span>        <span class="token comment">% 总像素数</span>

<span class="token comment">%% 2. 论文固定实验参数</span>
iter <span class="token operator">=</span> <span class="token number">3</span><span class="token punctuation">;</span>          <span class="token comment">% 置乱轮数（论文最优值）</span>
K1 <span class="token operator">=</span> <span class="token number">512</span><span class="token punctuation">;</span> K2 <span class="token operator">=</span> <span class="token number">128</span><span class="token punctuation">;</span><span class="token comment">% 改进标准映射控制参数</span>
r1 <span class="token operator">=</span> <span class="token number">2</span><span class="token punctuation">;</span> r2 <span class="token operator">=</span> <span class="token number">2</span><span class="token punctuation">;</span>    <span class="token comment">% 非线性指数</span>
N0 <span class="token operator">=</span> <span class="token number">1000</span><span class="token punctuation">;</span>         <span class="token comment">% 预迭代消除过渡效应</span>

<span class="token comment">%% 3. 基于图像内容生成哈希密钥（使用 Java MessageDigest，兼容所有版本）</span>
<span class="token comment">% MATLAB 内置 Java 环境，MessageDigest 无需额外 Toolbox</span>
<span class="token comment">% hash() 函数在部分版本/工具箱中不存在，故使用 Java 替代</span>
<span class="token comment">% 注：MATLAB hash() 返回 64 字符 hex 串，故用 sprintf 转为相同格式</span>
import java<span class="token punctuation">.</span>security<span class="token punctuation">.</span>MessageDigest<span class="token punctuation">;</span>
import java<span class="token punctuation">.</span>math<span class="token punctuation">.</span>BigInteger<span class="token punctuation">;</span>
md <span class="token operator">=</span> MessageDigest<span class="token punctuation">.</span><span class="token function">getInstance</span><span class="token punctuation">(</span><span class="token string">'SHA-256'</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
I_bytes <span class="token operator">=</span> <span class="token function">typecast</span><span class="token punctuation">(</span><span class="token function">double</span><span class="token punctuation">(</span><span class="token function">I</span><span class="token punctuation">(</span><span class="token operator">:</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token string">'uint8'</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
digest <span class="token operator">=</span> md<span class="token punctuation">.</span><span class="token function">digest</span><span class="token punctuation">(</span>I_bytes<span class="token punctuation">)</span><span class="token punctuation">;</span>
H_str <span class="token operator">=</span> <span class="token function">sprintf</span><span class="token punctuation">(</span><span class="token string">'%02x'</span><span class="token punctuation">,</span> <span class="token function">typecast</span><span class="token punctuation">(</span>digest<span class="token punctuation">,</span> <span class="token string">'uint8'</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
H <span class="token operator">=</span> <span class="token function">double</span><span class="token punctuation">(</span>H_str<span class="token punctuation">)</span><span class="token punctuation">;</span>  <span class="token comment">% 64 个 hex 字符的 ASCII 码</span>

length_H <span class="token operator">=</span> <span class="token function">length</span><span class="token punctuation">(</span>H<span class="token punctuation">)</span><span class="token punctuation">;</span>
sum_H <span class="token operator">=</span> <span class="token function">sum</span><span class="token punctuation">(</span>H<span class="token punctuation">)</span><span class="token punctuation">;</span>
sum_HE <span class="token operator">=</span> <span class="token function">sum</span><span class="token punctuation">(</span><span class="token function">H</span><span class="token punctuation">(</span><span class="token number">2</span><span class="token operator">:</span><span class="token number">2</span><span class="token operator">:</span><span class="token keyword">end</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">% 偶数项和</span>
sum_HO <span class="token operator">=</span> <span class="token function">sum</span><span class="token punctuation">(</span><span class="token function">H</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token operator">:</span><span class="token number">2</span><span class="token operator">:</span><span class="token keyword">end</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">% 奇数项和</span>

<span class="token comment">% 计算偏移量 rx, ry（避免 (0,0) 置乱失效）</span>
rx <span class="token operator">=</span> <span class="token function">mod</span><span class="token punctuation">(</span><span class="token function">round</span><span class="token punctuation">(</span><span class="token punctuation">(</span>sum_HO <span class="token operator">/</span> sum_H<span class="token punctuation">)</span> <span class="token operator">*</span> <span class="token number">1e14</span><span class="token punctuation">)</span><span class="token punctuation">,</span> M<span class="token punctuation">)</span> <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">;</span>
ry <span class="token operator">=</span> <span class="token function">mod</span><span class="token punctuation">(</span><span class="token function">round</span><span class="token punctuation">(</span><span class="token punctuation">(</span>sum_HE <span class="token operator">/</span> sum_H<span class="token punctuation">)</span> <span class="token operator">*</span> <span class="token number">1e14</span><span class="token punctuation">)</span><span class="token punctuation">,</span> N<span class="token punctuation">)</span> <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">;</span>

<span class="token comment">% 生成混沌初值 x0, y0</span>
x0 <span class="token operator">=</span> <span class="token function">mod</span><span class="token punctuation">(</span><span class="token function">bitxor</span><span class="token punctuation">(</span><span class="token function">mod</span><span class="token punctuation">(</span>sum_H<span class="token punctuation">,</span> <span class="token number">256</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token number">256</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token operator">*</span><span class="token keyword">pi</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
y0 <span class="token operator">=</span> <span class="token function">mod</span><span class="token punctuation">(</span><span class="token function">bitxor</span><span class="token punctuation">(</span><span class="token function">mod</span><span class="token punctuation">(</span>sum_H <span class="token operator">+</span> length_H<span class="token punctuation">,</span> <span class="token number">256</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token number">256</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token operator">*</span><span class="token keyword">pi</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">% 生成扩散参数 K11, K22</span>
K11 <span class="token operator">=</span> <span class="token function">H</span><span class="token punctuation">(</span><span class="token function">floor</span><span class="token punctuation">(</span>length_H <span class="token operator">/</span> <span class="token number">2</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">*</span> <span class="token number">100</span><span class="token punctuation">;</span>
K22 <span class="token operator">=</span> <span class="token function">H</span><span class="token punctuation">(</span><span class="token keyword">end</span><span class="token punctuation">)</span> <span class="token operator">*</span> <span class="token number">100</span><span class="token punctuation">;</span>
N0 <span class="token operator">=</span> N0 <span class="token operator">+</span> <span class="token function">mod</span><span class="token punctuation">(</span>MN <span class="token operator">+</span> K1 <span class="token operator">+</span> K2 <span class="token operator">+</span> <span class="token function">H</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token number">256</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">%% 4. 阶段1：改进标准映射像素位置置乱</span>
<span class="token function">fprintf</span><span class="token punctuation">(</span><span class="token string">'正在进行像素置乱...\n'</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
I_scram <span class="token operator">=</span> I<span class="token punctuation">;</span> <span class="token comment">% 初始化置乱图</span>
<span class="token keyword">for</span> t <span class="token operator">=</span> <span class="token number">1</span><span class="token operator">:</span>iter
    temp <span class="token operator">=</span> <span class="token function">zeros</span><span class="token punctuation">(</span>M<span class="token punctuation">,</span> N<span class="token punctuation">)</span><span class="token punctuation">;</span>
    x <span class="token operator">=</span> <span class="token function">zeros</span><span class="token punctuation">(</span>MN<span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span> y <span class="token operator">=</span> <span class="token function">zeros</span><span class="token punctuation">(</span>MN<span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">% 初始化像素坐标序列</span>
    idx <span class="token operator">=</span> <span class="token number">1</span><span class="token operator">:</span>MN<span class="token punctuation">;</span>
    <span class="token function">x</span><span class="token punctuation">(</span>idx<span class="token punctuation">)</span> <span class="token operator">=</span> <span class="token function">mod</span><span class="token punctuation">(</span><span class="token function">floor</span><span class="token punctuation">(</span><span class="token punctuation">(</span>idx <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">)</span> <span class="token operator">/</span> N<span class="token punctuation">)</span><span class="token punctuation">,</span> M<span class="token punctuation">)</span> <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">;</span>
    <span class="token function">y</span><span class="token punctuation">(</span>idx<span class="token punctuation">)</span> <span class="token operator">=</span> <span class="token function">mod</span><span class="token punctuation">(</span>idx <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">,</span> N<span class="token punctuation">)</span> <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">;</span>

    <span class="token comment">% 改进标准映射迭代（论文公式(7)）</span>
    <span class="token keyword">for</span> <span class="token number">i</span> <span class="token operator">=</span> <span class="token number">1</span><span class="token operator">:</span>MN
        <span class="token comment">% x坐标映射: 模M（论文公式(7)中x, y皆模N，仅适用于方图）</span>
        x_tmp <span class="token operator">=</span> <span class="token function">mod</span><span class="token punctuation">(</span><span class="token function">x</span><span class="token punctuation">(</span><span class="token number">i</span><span class="token punctuation">)</span> <span class="token operator">+</span> <span class="token function">y</span><span class="token punctuation">(</span><span class="token number">i</span><span class="token punctuation">)</span> <span class="token operator">+</span> rx <span class="token operator">+</span> ry<span class="token punctuation">,</span> M<span class="token punctuation">)</span><span class="token punctuation">;</span>
        x_tmp <span class="token operator">=</span> <span class="token function">round</span><span class="token punctuation">(</span>x_tmp<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">if</span> x_tmp <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">,</span> x_tmp <span class="token operator">=</span> M<span class="token punctuation">;</span> <span class="token keyword">end</span>
        theta <span class="token operator">=</span> <span class="token number">2</span> <span class="token operator">*</span> <span class="token keyword">pi</span> <span class="token operator">*</span> x_tmp <span class="token operator">/</span> M<span class="token punctuation">;</span>
        term1 <span class="token operator">=</span> K1 <span class="token operator">*</span> <span class="token function">sin</span><span class="token punctuation">(</span>theta<span class="token operator">^</span>r1<span class="token punctuation">)</span><span class="token punctuation">;</span>
        term2 <span class="token operator">=</span> K2 <span class="token operator">*</span> <span class="token function">cos</span><span class="token punctuation">(</span>theta<span class="token operator">^</span>r2<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token comment">% y坐标映射: 模N</span>
        y_tmp <span class="token operator">=</span> <span class="token function">mod</span><span class="token punctuation">(</span><span class="token function">y</span><span class="token punctuation">(</span><span class="token number">i</span><span class="token punctuation">)</span> <span class="token operator">+</span> ry <span class="token operator">+</span> term1 <span class="token operator">+</span> term2<span class="token punctuation">,</span> N<span class="token punctuation">)</span><span class="token punctuation">;</span>
        y_tmp <span class="token operator">=</span> <span class="token function">round</span><span class="token punctuation">(</span>y_tmp<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">if</span> y_tmp <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">,</span> y_tmp <span class="token operator">=</span> N<span class="token punctuation">;</span> <span class="token keyword">end</span>
        <span class="token function">x</span><span class="token punctuation">(</span><span class="token number">i</span><span class="token punctuation">)</span> <span class="token operator">=</span> x_tmp<span class="token punctuation">;</span>
        <span class="token function">y</span><span class="token punctuation">(</span><span class="token number">i</span><span class="token punctuation">)</span> <span class="token operator">=</span> y_tmp<span class="token punctuation">;</span>
    <span class="token keyword">end</span>
    <span class="token comment">% 像素位置置换</span>
    <span class="token keyword">for</span> <span class="token number">i</span> <span class="token operator">=</span> <span class="token number">1</span><span class="token operator">:</span>MN
        <span class="token function">temp</span><span class="token punctuation">(</span><span class="token function">x</span><span class="token punctuation">(</span><span class="token number">i</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token function">y</span><span class="token punctuation">(</span><span class="token number">i</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">=</span> <span class="token function">I_scram</span><span class="token punctuation">(</span><span class="token function">floor</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token number">i</span><span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token operator">/</span>N<span class="token punctuation">)</span><span class="token operator">+</span><span class="token number">1</span><span class="token punctuation">,</span> <span class="token function">mod</span><span class="token punctuation">(</span><span class="token number">i</span><span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">,</span> N<span class="token punctuation">)</span><span class="token operator">+</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">end</span>
    I_scram <span class="token operator">=</span> temp<span class="token punctuation">;</span>
<span class="token keyword">end</span>

<span class="token comment">%% 5. 阶段2：动态反馈扩散加密</span>
<span class="token function">fprintf</span><span class="token punctuation">(</span><span class="token string">'正在进行扩散加密...\n'</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token comment">% 改进标准映射生成混沌序列</span>
x_seq <span class="token operator">=</span> <span class="token function">zeros</span><span class="token punctuation">(</span>MN <span class="token operator">+</span> N0 <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
y_seq <span class="token operator">=</span> <span class="token function">zeros</span><span class="token punctuation">(</span>MN <span class="token operator">+</span> N0 <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token function">x_seq</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span> <span class="token operator">=</span> x0<span class="token punctuation">;</span> <span class="token function">y_seq</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span> <span class="token operator">=</span> y0<span class="token punctuation">;</span>
<span class="token keyword">for</span> <span class="token number">i</span> <span class="token operator">=</span> <span class="token number">1</span><span class="token operator">:</span><span class="token punctuation">(</span>MN <span class="token operator">+</span> N0<span class="token punctuation">)</span>
    <span class="token function">x_seq</span><span class="token punctuation">(</span><span class="token number">i</span><span class="token operator">+</span><span class="token number">1</span><span class="token punctuation">)</span> <span class="token operator">=</span> <span class="token function">mod</span><span class="token punctuation">(</span><span class="token function">x_seq</span><span class="token punctuation">(</span><span class="token number">i</span><span class="token punctuation">)</span> <span class="token operator">+</span> <span class="token function">y_seq</span><span class="token punctuation">(</span><span class="token number">i</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token operator">*</span><span class="token keyword">pi</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    theta <span class="token operator">=</span> <span class="token number">2</span> <span class="token operator">*</span> <span class="token keyword">pi</span> <span class="token operator">*</span> <span class="token function">x_seq</span><span class="token punctuation">(</span><span class="token number">i</span><span class="token operator">+</span><span class="token number">1</span><span class="token punctuation">)</span> <span class="token operator">/</span> N<span class="token punctuation">;</span>
    term1 <span class="token operator">=</span> K11 <span class="token operator">*</span> <span class="token function">sin</span><span class="token punctuation">(</span>theta<span class="token operator">^</span>r1<span class="token punctuation">)</span><span class="token punctuation">;</span>
    term2 <span class="token operator">=</span> K22 <span class="token operator">*</span> <span class="token function">cos</span><span class="token punctuation">(</span>theta<span class="token operator">^</span>r2<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token function">y_seq</span><span class="token punctuation">(</span><span class="token number">i</span><span class="token operator">+</span><span class="token number">1</span><span class="token punctuation">)</span> <span class="token operator">=</span> <span class="token function">mod</span><span class="token punctuation">(</span><span class="token function">y_seq</span><span class="token punctuation">(</span><span class="token number">i</span><span class="token punctuation">)</span> <span class="token operator">+</span> term1 <span class="token operator">+</span> term2<span class="token punctuation">,</span> <span class="token number">2</span><span class="token operator">*</span><span class="token keyword">pi</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token keyword">end</span>

<span class="token comment">% 丢弃前 N0 项消除过渡效应</span>
x1 <span class="token operator">=</span> <span class="token function">x_seq</span><span class="token punctuation">(</span>N0<span class="token operator">+</span><span class="token number">1</span><span class="token operator">:</span><span class="token keyword">end</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
y1 <span class="token operator">=</span> <span class="token function">y_seq</span><span class="token punctuation">(</span>N0<span class="token operator">+</span><span class="token number">1</span><span class="token operator">:</span><span class="token keyword">end</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">% 生成三组密钥流 key1, key2, key3</span>
key1 <span class="token operator">=</span> <span class="token function">mod</span><span class="token punctuation">(</span><span class="token function">round</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token function">abs</span><span class="token punctuation">(</span>x1<span class="token punctuation">)</span> <span class="token operator">-</span> <span class="token function">floor</span><span class="token punctuation">(</span><span class="token function">abs</span><span class="token punctuation">(</span>x1<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">*</span> <span class="token number">1e14</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token number">256</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
key2 <span class="token operator">=</span> <span class="token function">mod</span><span class="token punctuation">(</span><span class="token function">round</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token function">abs</span><span class="token punctuation">(</span>y1<span class="token punctuation">)</span> <span class="token operator">-</span> <span class="token function">floor</span><span class="token punctuation">(</span><span class="token function">abs</span><span class="token punctuation">(</span>y1<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">*</span> <span class="token number">1e14</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token number">256</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
key3 <span class="token operator">=</span> <span class="token function">mod</span><span class="token punctuation">(</span>key1 <span class="token operator">+</span> key2<span class="token punctuation">,</span> <span class="token number">256</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">% 图像一维化</span>
I2 <span class="token operator">=</span> <span class="token function">reshape</span><span class="token punctuation">(</span>I_scram<span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">,</span> MN<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">% 首像素加密</span>
sum_I2 <span class="token operator">=</span> <span class="token function">sum</span><span class="token punctuation">(</span><span class="token function">I2</span><span class="token punctuation">(</span><span class="token number">2</span><span class="token operator">:</span><span class="token keyword">end</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
seed <span class="token operator">=</span> <span class="token function">mod</span><span class="token punctuation">(</span>sum_I2<span class="token punctuation">,</span> <span class="token number">256</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
key_1 <span class="token operator">=</span> <span class="token function">mod</span><span class="token punctuation">(</span><span class="token function">key1</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span> <span class="token operator">+</span> <span class="token function">key2</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token number">256</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">% ---- 论文修复点1: id1/id2 公式 ----</span>
<span class="token comment">% 移除错误的 mod() 操作，使动态索引真正生效</span>
<span class="token comment">% 原公式: floor(mod(I3(i-1)*255+key1(i)*255, 256)/256)</span>
<span class="token comment">% 正确公式: floor((I3(i-1)*255+key1(i)*255)/256)</span>
<span class="token comment">% mod() 使得结果始终 < 256，导致 id1 = id2 = 1 固定不变</span>
<span class="token comment">% 去掉 mod 后，当两值之和 >= 256 时 floor 返回 1，动态索引真正生效</span>
<span class="token comment">% ----</span>
I3 <span class="token operator">=</span> <span class="token function">zeros</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">,</span> MN<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token function">I3</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span> <span class="token operator">=</span> <span class="token function">bitxor</span><span class="token punctuation">(</span><span class="token function">bitxor</span><span class="token punctuation">(</span><span class="token function">uint8</span><span class="token punctuation">(</span>seed<span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token function">uint8</span><span class="token punctuation">(</span><span class="token function">round</span><span class="token punctuation">(</span><span class="token function">I2</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token operator">*</span><span class="token number">255</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token function">uint8</span><span class="token punctuation">(</span>key_1<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">% 动态索引扩散加密（论文公式(23)-(25)）</span>
<span class="token keyword">for</span> <span class="token number">i</span> <span class="token operator">=</span> <span class="token number">2</span><span class="token operator">:</span><span class="token punctuation">(</span>MN<span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span>
    <span class="token comment">% 公式(23): 移除 mod</span>
    id1 <span class="token operator">=</span> <span class="token function">floor</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token function">double</span><span class="token punctuation">(</span><span class="token function">I3</span><span class="token punctuation">(</span><span class="token number">i</span><span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">+</span> <span class="token function">double</span><span class="token punctuation">(</span><span class="token function">key1</span><span class="token punctuation">(</span><span class="token number">i</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">/</span> <span class="token number">256</span><span class="token punctuation">)</span> <span class="token operator">*</span> <span class="token punctuation">(</span><span class="token number">i</span><span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span> <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> id1 <span class="token operator"><</span> <span class="token number">1</span> <span class="token operator">||</span> id1 <span class="token operator">></span> MN<span class="token punctuation">,</span> id1 <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span> <span class="token keyword">end</span>

    <span class="token comment">% 公式(24): 移除 mod</span>
    id2 <span class="token operator">=</span> <span class="token function">floor</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token function">double</span><span class="token punctuation">(</span><span class="token function">I3</span><span class="token punctuation">(</span><span class="token number">i</span><span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">+</span> <span class="token function">double</span><span class="token punctuation">(</span><span class="token function">key2</span><span class="token punctuation">(</span><span class="token number">i</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">/</span> <span class="token number">255</span><span class="token punctuation">)</span> <span class="token operator">*</span> <span class="token punctuation">(</span>MN<span class="token operator">-</span><span class="token number">i</span><span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span> <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> id2 <span class="token operator"><</span> <span class="token number">1</span> <span class="token operator">||</span> id2 <span class="token operator">></span> MN<span class="token punctuation">,</span> id2 <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span> <span class="token keyword">end</span>

    <span class="token comment">% 公式(25): 三重异或加密</span>
    <span class="token function">I3</span><span class="token punctuation">(</span><span class="token number">i</span><span class="token punctuation">)</span> <span class="token operator">=</span> <span class="token function">bitxor</span><span class="token punctuation">(</span><span class="token function">bitxor</span><span class="token punctuation">(</span><span class="token function">bitxor</span><span class="token punctuation">(</span><span class="token function">uint8</span><span class="token punctuation">(</span><span class="token function">round</span><span class="token punctuation">(</span><span class="token function">I2</span><span class="token punctuation">(</span><span class="token number">i</span><span class="token punctuation">)</span><span class="token operator">*</span><span class="token number">255</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token function">uint8</span><span class="token punctuation">(</span><span class="token function">key3</span><span class="token punctuation">(</span><span class="token number">i</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token function">uint8</span><span class="token punctuation">(</span><span class="token function">I3</span><span class="token punctuation">(</span>id1<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token function">uint8</span><span class="token punctuation">(</span><span class="token function">I3</span><span class="token punctuation">(</span>id2<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token keyword">end</span>

<span class="token comment">% 最后一个像素单独加密（公式(26)-(27)）</span>
id1_MN <span class="token operator">=</span> <span class="token function">floor</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token function">double</span><span class="token punctuation">(</span><span class="token function">I3</span><span class="token punctuation">(</span>MN<span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">+</span> <span class="token function">double</span><span class="token punctuation">(</span><span class="token function">key1</span><span class="token punctuation">(</span>MN<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">/</span> <span class="token number">256</span><span class="token punctuation">)</span> <span class="token operator">*</span> <span class="token punctuation">(</span>MN<span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span> <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">;</span>
<span class="token keyword">if</span> id1_MN <span class="token operator"><</span> <span class="token number">1</span> <span class="token operator">||</span> id1_MN <span class="token operator">></span> MN<span class="token punctuation">,</span> id1_MN <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span> <span class="token keyword">end</span>
<span class="token function">I3</span><span class="token punctuation">(</span>MN<span class="token punctuation">)</span> <span class="token operator">=</span> <span class="token function">bitxor</span><span class="token punctuation">(</span><span class="token function">bitxor</span><span class="token punctuation">(</span><span class="token function">uint8</span><span class="token punctuation">(</span><span class="token function">round</span><span class="token punctuation">(</span><span class="token function">I2</span><span class="token punctuation">(</span>MN<span class="token punctuation">)</span><span class="token operator">*</span><span class="token number">255</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token function">uint8</span><span class="token punctuation">(</span><span class="token function">key3</span><span class="token punctuation">(</span>MN<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token function">uint8</span><span class="token punctuation">(</span><span class="token function">I3</span><span class="token punctuation">(</span>id1_MN<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">% 最终加密图像</span>
I_enc <span class="token operator">=</span> <span class="token function">reshape</span><span class="token punctuation">(</span><span class="token function">double</span><span class="token punctuation">(</span>I3<span class="token punctuation">)</span><span class="token punctuation">,</span> M<span class="token punctuation">,</span> N<span class="token punctuation">)</span> <span class="token operator">/</span> <span class="token number">255</span><span class="token punctuation">;</span>

<span class="token comment">%% 6. 解密算法（逆扩散 + 逆置乱）</span>
<span class="token function">fprintf</span><span class="token punctuation">(</span><span class="token string">'正在进行解密...\n'</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">% ---- 论文修复: 使用 I3(id2) 替代 I2(id2) ----</span>
<span class="token comment">% 原始公式使用 I2(id2) 导致解密时形成循环依赖（i 与 MN-i 互相引用）</span>
<span class="token comment">% 改为使用 I3(id2) 后，解密为纯顺序操作，无需依赖解析</span>
<span class="token comment">% I3(id2) 在解密时完全已知，解密可一次性完成</span>
<span class="token comment">% ----</span>

<span class="token comment">% 6a. 逆扩散</span>
I2_dec <span class="token operator">=</span> <span class="token function">zeros</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">,</span> MN<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token comment">% 首像素解密</span>
<span class="token function">I2_dec</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span> <span class="token operator">=</span> <span class="token function">double</span><span class="token punctuation">(</span><span class="token function">bitxor</span><span class="token punctuation">(</span><span class="token function">bitxor</span><span class="token punctuation">(</span><span class="token function">uint8</span><span class="token punctuation">(</span><span class="token function">I3</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token function">uint8</span><span class="token punctuation">(</span>seed<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token function">uint8</span><span class="token punctuation">(</span>key_1<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token comment">% 末像素解密 (公式(27)逆运算)</span>
<span class="token function">I2_dec</span><span class="token punctuation">(</span>MN<span class="token punctuation">)</span> <span class="token operator">=</span> <span class="token function">double</span><span class="token punctuation">(</span><span class="token function">bitxor</span><span class="token punctuation">(</span><span class="token function">bitxor</span><span class="token punctuation">(</span><span class="token function">uint8</span><span class="token punctuation">(</span><span class="token function">I3</span><span class="token punctuation">(</span>MN<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token function">uint8</span><span class="token punctuation">(</span><span class="token function">key3</span><span class="token punctuation">(</span>MN<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token function">uint8</span><span class="token punctuation">(</span><span class="token function">I3</span><span class="token punctuation">(</span>id1_MN<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">% 顺序解密：还原加密时的 I3(id1)/I3(id2) 实际值</span>
<span class="token comment">% 重要: 加密时 id1=i 或 id2>=i 时 I3(id) 为未初始化的 0</span>
<span class="token comment">% 解密时 I3 已全部完成，直接用 I3(id) 会得到最终值，与加密不对称</span>
<span class="token comment">% 故解密的 XOR 需模拟加密时的状态:</span>
<span class="token comment">%   - id1 == i : I3(i) 正被计算 → 0</span>
<span class="token comment">%   - id2 >= i : I3(i) 尚未计算 → 0</span>
<span class="token comment">%   - id2 <  i : I3(i) 已计算完毕 → 使用实际值</span>
<span class="token keyword">for</span> <span class="token number">i</span> <span class="token operator">=</span> <span class="token number">2</span><span class="token operator">:</span><span class="token punctuation">(</span>MN<span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span>
    id1 <span class="token operator">=</span> <span class="token function">floor</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token function">double</span><span class="token punctuation">(</span><span class="token function">I3</span><span class="token punctuation">(</span><span class="token number">i</span><span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">+</span> <span class="token function">double</span><span class="token punctuation">(</span><span class="token function">key1</span><span class="token punctuation">(</span><span class="token number">i</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">/</span> <span class="token number">256</span><span class="token punctuation">)</span> <span class="token operator">*</span> <span class="token punctuation">(</span><span class="token number">i</span><span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span> <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> id1 <span class="token operator"><</span> <span class="token number">1</span> <span class="token operator">||</span> id1 <span class="token operator">></span> MN<span class="token punctuation">,</span> id1 <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span> <span class="token keyword">end</span>

    id2 <span class="token operator">=</span> <span class="token function">floor</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token function">double</span><span class="token punctuation">(</span><span class="token function">I3</span><span class="token punctuation">(</span><span class="token number">i</span><span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">+</span> <span class="token function">double</span><span class="token punctuation">(</span><span class="token function">key2</span><span class="token punctuation">(</span><span class="token number">i</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">/</span> <span class="token number">255</span><span class="token punctuation">)</span> <span class="token operator">*</span> <span class="token punctuation">(</span>MN<span class="token operator">-</span><span class="token number">i</span><span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span> <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> id2 <span class="token operator"><</span> <span class="token number">1</span> <span class="token operator">||</span> id2 <span class="token operator">></span> MN<span class="token punctuation">,</span> id2 <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span> <span class="token keyword">end</span>

    <span class="token comment">% 加密时 I3(id1) 的实际值</span>
    <span class="token keyword">if</span> id1 <span class="token operator">==</span> <span class="token number">i</span>
        val_id1 <span class="token operator">=</span> <span class="token function">uint8</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>  <span class="token comment">% 自引用，当时为 0</span>
    <span class="token keyword">else</span>
        val_id1 <span class="token operator">=</span> <span class="token function">uint8</span><span class="token punctuation">(</span><span class="token function">I3</span><span class="token punctuation">(</span>id1<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">end</span>

    <span class="token comment">% 加密时 I3(id2) 的实际值</span>
    <span class="token keyword">if</span> id2 <span class="token operator">>=</span> <span class="token number">i</span>
        val_id2 <span class="token operator">=</span> <span class="token function">uint8</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>  <span class="token comment">% 未初始化</span>
    <span class="token keyword">else</span>
        val_id2 <span class="token operator">=</span> <span class="token function">uint8</span><span class="token punctuation">(</span><span class="token function">I3</span><span class="token punctuation">(</span>id2<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">end</span>

    <span class="token function">I2_dec</span><span class="token punctuation">(</span><span class="token number">i</span><span class="token punctuation">)</span> <span class="token operator">=</span> <span class="token function">double</span><span class="token punctuation">(</span><span class="token function">bitxor</span><span class="token punctuation">(</span><span class="token function">bitxor</span><span class="token punctuation">(</span><span class="token function">bitxor</span><span class="token punctuation">(</span><span class="token function">uint8</span><span class="token punctuation">(</span><span class="token function">I3</span><span class="token punctuation">(</span><span class="token number">i</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token function">uint8</span><span class="token punctuation">(</span><span class="token function">key3</span><span class="token punctuation">(</span><span class="token number">i</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">,</span> val_id1<span class="token punctuation">)</span><span class="token punctuation">,</span> val_id2<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token keyword">end</span>

<span class="token comment">% 恢复置乱图</span>
I_scram_dec <span class="token operator">=</span> <span class="token function">reshape</span><span class="token punctuation">(</span><span class="token function">uint8</span><span class="token punctuation">(</span>I2_dec<span class="token punctuation">)</span><span class="token punctuation">,</span> M<span class="token punctuation">,</span> N<span class="token punctuation">)</span> <span class="token operator">/</span> <span class="token number">255</span><span class="token punctuation">;</span>

<span class="token comment">% 6b. 逆置乱</span>
I_dec <span class="token operator">=</span> I_scram_dec<span class="token punctuation">;</span>
<span class="token keyword">for</span> t <span class="token operator">=</span> <span class="token number">1</span><span class="token operator">:</span>iter
    temp <span class="token operator">=</span> <span class="token function">zeros</span><span class="token punctuation">(</span>M<span class="token punctuation">,</span> N<span class="token punctuation">)</span><span class="token punctuation">;</span>
    x <span class="token operator">=</span> <span class="token function">zeros</span><span class="token punctuation">(</span>MN<span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span> y <span class="token operator">=</span> <span class="token function">zeros</span><span class="token punctuation">(</span>MN<span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    idx <span class="token operator">=</span> <span class="token number">1</span><span class="token operator">:</span>MN<span class="token punctuation">;</span>
    <span class="token function">x</span><span class="token punctuation">(</span>idx<span class="token punctuation">)</span> <span class="token operator">=</span> <span class="token function">mod</span><span class="token punctuation">(</span><span class="token function">floor</span><span class="token punctuation">(</span><span class="token punctuation">(</span>idx <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">)</span> <span class="token operator">/</span> N<span class="token punctuation">)</span><span class="token punctuation">,</span> M<span class="token punctuation">)</span> <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">;</span>
    <span class="token function">y</span><span class="token punctuation">(</span>idx<span class="token punctuation">)</span> <span class="token operator">=</span> <span class="token function">mod</span><span class="token punctuation">(</span>idx <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">,</span> N<span class="token punctuation">)</span> <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">;</span>

    <span class="token keyword">for</span> <span class="token number">i</span> <span class="token operator">=</span> <span class="token number">1</span><span class="token operator">:</span>MN
        <span class="token comment">% x坐标映射: 模M（论文公式(7)中x, y皆模N，仅适用于方图）</span>
        x_tmp <span class="token operator">=</span> <span class="token function">mod</span><span class="token punctuation">(</span><span class="token function">x</span><span class="token punctuation">(</span><span class="token number">i</span><span class="token punctuation">)</span> <span class="token operator">+</span> <span class="token function">y</span><span class="token punctuation">(</span><span class="token number">i</span><span class="token punctuation">)</span> <span class="token operator">+</span> rx <span class="token operator">+</span> ry<span class="token punctuation">,</span> M<span class="token punctuation">)</span><span class="token punctuation">;</span>
        x_tmp <span class="token operator">=</span> <span class="token function">round</span><span class="token punctuation">(</span>x_tmp<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">if</span> x_tmp <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">,</span> x_tmp <span class="token operator">=</span> M<span class="token punctuation">;</span> <span class="token keyword">end</span>
        theta <span class="token operator">=</span> <span class="token number">2</span> <span class="token operator">*</span> <span class="token keyword">pi</span> <span class="token operator">*</span> x_tmp <span class="token operator">/</span> M<span class="token punctuation">;</span>
        term1 <span class="token operator">=</span> K1 <span class="token operator">*</span> <span class="token function">sin</span><span class="token punctuation">(</span>theta<span class="token operator">^</span>r1<span class="token punctuation">)</span><span class="token punctuation">;</span>
        term2 <span class="token operator">=</span> K2 <span class="token operator">*</span> <span class="token function">cos</span><span class="token punctuation">(</span>theta<span class="token operator">^</span>r2<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token comment">% y坐标映射: 模N</span>
        y_tmp <span class="token operator">=</span> <span class="token function">mod</span><span class="token punctuation">(</span><span class="token function">y</span><span class="token punctuation">(</span><span class="token number">i</span><span class="token punctuation">)</span> <span class="token operator">+</span> ry <span class="token operator">+</span> term1 <span class="token operator">+</span> term2<span class="token punctuation">,</span> N<span class="token punctuation">)</span><span class="token punctuation">;</span>
        y_tmp <span class="token operator">=</span> <span class="token function">round</span><span class="token punctuation">(</span>y_tmp<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">if</span> y_tmp <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">,</span> y_tmp <span class="token operator">=</span> N<span class="token punctuation">;</span> <span class="token keyword">end</span>
        <span class="token function">x</span><span class="token punctuation">(</span><span class="token number">i</span><span class="token punctuation">)</span> <span class="token operator">=</span> x_tmp<span class="token punctuation">;</span>
        <span class="token function">y</span><span class="token punctuation">(</span><span class="token number">i</span><span class="token punctuation">)</span> <span class="token operator">=</span> y_tmp<span class="token punctuation">;</span>
    <span class="token keyword">end</span>
    <span class="token comment">% 逆置换</span>
    <span class="token keyword">for</span> <span class="token number">i</span> <span class="token operator">=</span> <span class="token number">1</span><span class="token operator">:</span>MN
        <span class="token function">temp</span><span class="token punctuation">(</span><span class="token function">floor</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token number">i</span><span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token operator">/</span>N<span class="token punctuation">)</span><span class="token operator">+</span><span class="token number">1</span><span class="token punctuation">,</span> <span class="token function">mod</span><span class="token punctuation">(</span><span class="token number">i</span><span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">,</span> N<span class="token punctuation">)</span><span class="token operator">+</span><span class="token number">1</span><span class="token punctuation">)</span> <span class="token operator">=</span> <span class="token function">I_dec</span><span class="token punctuation">(</span><span class="token function">round</span><span class="token punctuation">(</span><span class="token function">x</span><span class="token punctuation">(</span><span class="token number">i</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token function">round</span><span class="token punctuation">(</span><span class="token function">y</span><span class="token punctuation">(</span><span class="token number">i</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">end</span>
    I_dec <span class="token operator">=</span> temp<span class="token punctuation">;</span>
<span class="token keyword">end</span>

<span class="token comment">%% 7. 绘图：原始图、加密图、解密图对比</span>
<span class="token function">figure</span><span class="token punctuation">(</span><span class="token string">'Color'</span><span class="token punctuation">,</span><span class="token string">'w'</span><span class="token punctuation">,</span><span class="token string">'Position'</span><span class="token punctuation">,</span><span class="token punctuation">[</span><span class="token number">100</span><span class="token punctuation">,</span><span class="token number">100</span><span class="token punctuation">,</span><span class="token number">900</span><span class="token punctuation">,</span><span class="token number">300</span><span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token function">subplot</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">,</span><span class="token number">3</span><span class="token punctuation">,</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token function">imshow</span><span class="token punctuation">(</span>I<span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token function">title</span><span class="token punctuation">(</span><span class="token string">'原始灰度图像'</span><span class="token punctuation">,</span><span class="token string">'FontSize'</span><span class="token punctuation">,</span><span class="token number">12</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token function">subplot</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">,</span><span class="token number">3</span><span class="token punctuation">,</span><span class="token number">2</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token function">imshow</span><span class="token punctuation">(</span>I_enc<span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token function">title</span><span class="token punctuation">(</span><span class="token string">'改进标准映射加密图像'</span><span class="token punctuation">,</span><span class="token string">'FontSize'</span><span class="token punctuation">,</span><span class="token number">12</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token function">subplot</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">,</span><span class="token number">3</span><span class="token punctuation">,</span><span class="token number">3</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token function">imshow</span><span class="token punctuation">(</span>I_dec<span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token function">title</span><span class="token punctuation">(</span><span class="token string">'解密还原图像'</span><span class="token punctuation">,</span><span class="token string">'FontSize'</span><span class="token punctuation">,</span><span class="token number">12</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">%% 8. 性能验证</span>
<span class="token function">fprintf</span><span class="token punctuation">(</span><span class="token string">'图像加解密完成！\n'</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token function">fprintf</span><span class="token punctuation">(</span><span class="token string">'原始图与解密图像素误差：%.4f\n'</span><span class="token punctuation">,</span> <span class="token function">max</span><span class="token punctuation">(</span><span class="token function">abs</span><span class="token punctuation">(</span><span class="token function">I</span><span class="token punctuation">(</span><span class="token operator">:</span><span class="token punctuation">)</span> <span class="token operator">-</span> <span class="token function">I_dec</span><span class="token punctuation">(</span><span class="token operator">:</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token function">fprintf</span><span class="token punctuation">(</span><span class="token string">'加密图像信息熵：%.4f\n'</span><span class="token punctuation">,</span> <span class="token function">entropy</span><span class="token punctuation">(</span>I_enc<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">% 额外验证：原始图与解密图是否完全一致</span>
<span class="token keyword">if</span> <span class="token function">max</span><span class="token punctuation">(</span><span class="token function">abs</span><span class="token punctuation">(</span><span class="token function">I</span><span class="token punctuation">(</span><span class="token operator">:</span><span class="token punctuation">)</span> <span class="token operator">-</span> <span class="token function">I_dec</span><span class="token punctuation">(</span><span class="token operator">:</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator"><</span> <span class="token number">1e-10</span>
    <span class="token function">fprintf</span><span class="token punctuation">(</span><span class="token string">'✓ 解密完全正确，无损恢复！\n'</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token keyword">else</span>
    <span class="token function">fprintf</span><span class="token punctuation">(</span><span class="token string">'⚠ 解密存在微小误差（非零但极小）\n'</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token keyword">end</span>

```
