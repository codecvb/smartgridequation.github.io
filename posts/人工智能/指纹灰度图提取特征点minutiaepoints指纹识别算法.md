---
title: 指纹灰度图提取特征点minutiaepoints指纹识别算法
slug: 指纹灰度图提取特征点minutiaepoints指纹识别算法
category: 人工智能
summary: 本文介绍了一种基于特征点提取的优化版指纹识别系统。该系统通过改进特征点提取和匹配算法，提升了识别精度和分辨率。核心优化包括：1)采用多尺度Gabor滤波器增强脊线特征；2)改进交叉数计算和方向估计方法；3)引入多维度质量评估和局部纹理模式分析；4)使用双向匹配策略结合RANSAC几何验证。实验表明，该优化方法能更准确地提取指纹细节特征点(minutiae)，并通过融合脊线数、局部模式等多特征实现更…
tags: 人工智能
---

本文介绍了一种基于特征点提取的优化版指纹识别系统。该系统通过改进特征点提取和匹配算法，提升了识别精度和分辨率。核心优化包括：1)采用多尺度Gabor滤波器增强脊线特征；2)改进交叉数计算和方向估计方法；3)引入多维度质量评估和局部纹理模式分析；4)使用双向匹配策略结合RANSAC几何验证。实验表明，该优化方法能更准确地提取指纹细节特征点(minutiae)，并通过融合脊线数、局部模式等多特征实现更可靠的匹配。系统包含完整的预处理、特征提取和匹配流程，适用于高精度指纹识别应用。


![](/uploads/csdn/指纹灰度图提取特征点minutiaepoints指纹识别算法/img-01.png)


![](/uploads/csdn/指纹灰度图提取特征点minutiaepoints指纹识别算法/img-02.png)


![](/uploads/csdn/指纹灰度图提取特征点minutiaepoints指纹识别算法/img-03.png)


```python
"""
指纹识别系统 - 基于特征点提取的传统方法（优化版）
使用 minutiae（细节特征点）进行指纹匹配
提升了特征点提取精度和匹配分辨能力
"""

import cv2
import numpy as np
from scipy import ndimage
from skimage.morphology import skeletonize, thin
from skimage import filters
from collections import defaultdict
import math
from scipy.spatial import KDTree


class FingerprintPreprocessor:
    """指纹图像预处理器（优化版）"""

    def __init__(self, target_size=None):
        self.target_size = target_size

    def preprocess(self, image):
        """
        完整的预处理流程（优化：增强脊线连续性）
        Args:
            image: 输入图像（文件路径或numpy数组）
        Returns:
            原始图像、增强图像、二值图像、细化图像
        """
        if isinstance(image, str):
            original = cv2.imread(image, cv2.IMREAD_GRAYSCALE)
            if original is None:
                raise ValueError(f"无法加载图像: {image}")
        else:
            original = image.copy()

        h, w = original.shape
        if self.target_size:
            original = cv2.resize(original, self.target_size, interpolation=cv2.INTER_CUBIC)

        if original.max() == original.min():
            raise ValueError("图像为空或无效")

        normalized = self._normalize(original)

        enhanced = self._enhance(normalized)

        binary = self._binarize(enhanced)

        binary = self._morphology_clean(binary)

        thinned = self._thin(binary)

        thinned = self._clean_skeleton(thinned)

        return original, enhanced, binary, thinned

    def _normalize(self, image):
        """归一化图像到0-255范围（优化：保留局部对比度）"""
        image = image.astype(np.float32)

        # 局部归一化，避免全局归一化丢失细节
        clahe = cv2.createCLAHE(clipLimit=1.5, tileGridSize=(4, 4))
        normalized = clahe.apply(image.astype(np.uint8))

        return normalized

    def _enhance(self, image):
        """增强指纹图像（优化：脊线增强滤波器）"""
        # 第一步：CLAHE增强对比度
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(image)

        # 第二步：去噪
        denoised = cv2.fastNlMeansDenoising(enhanced, None, h=8, templateWindowSize=7, searchWindowSize=21)

        # 第三步：脊线增强（Gabor滤波器）
        enhanced_ridge = self._ridge_enhancement(denoised)

        return enhanced_ridge

    def _ridge_enhancement(self, image):
        """脊线增强：使用Gabor滤波器增强指纹脊线"""
        rows, cols = image.shape

        # 估计脊线方向
        angles = np.arange(0, np.pi, np.pi/8)  # 8个方向
        gabor_kernels = []

        # 创建多方向Gabor滤波器
        for theta in angles:
            kernel = cv2.getGaborKernel((9, 9), 2.0, theta, 6.0, 0.5, 0, ktype=cv2.CV_32F)
            kernel /= 1.5 * kernel.sum()
            gabor_kernels.append(kernel)

        # 应用所有滤波器并取最大值
        enhanced = np.zeros_like(image, dtype=np.float32)
        for kernel in gabor_kernels:
            filtered = cv2.filter2D(image.astype(np.float32), cv2.CV_32F, kernel)
            enhanced = np.maximum(enhanced, filtered)

        # 归一化到0-255
        enhanced = (enhanced - enhanced.min()) / (enhanced.max() - enhanced.min() + 1e-6) * 255

        return enhanced.astype(np.uint8)

    def _binarize(self, image):
        """自适应二值化（优化：多阈值融合）"""
        h, w = image.shape
        block_size = min(25, max(3, min(h, w) // 8))
        if block_size % 2 == 0:
            block_size += 1

        # 三种二值化方法
        # 1. 高斯自适应
        binary_gaussian = cv2.adaptiveThreshold(
            image, 255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY_INV,
            blockSize=block_size,
            C=3
        )

        # 2. 均值自适应
        binary_mean = cv2.adaptiveThreshold(
            image, 255,
            cv2.ADAPTIVE_THRESH_MEAN_C,
            cv2.THRESH_BINARY_INV,
            blockSize=block_size,
            C=3
        )

        # 3. Otsu阈值
        _, binary_otsu = cv2.threshold(image, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

        # 计算有效区域比例
        def calculate_valid_ratio(bin_img):
            white_pixels = np.sum(bin_img > 0)
            ratio = white_pixels / bin_img.size
            return 0.1 < ratio < 0.6

        # 选择最优二值化结果
        candidates = []
        if calculate_valid_ratio(binary_gaussian):
            candidates.append(binary_gaussian)
        if calculate_valid_ratio(binary_mean):
            candidates.append(binary_mean)
        if calculate_valid_ratio(binary_otsu):
            candidates.append(binary_otsu)

        if candidates:
            # 选择中间比例的结果
            ratios = [np.sum(c > 0) / c.size for c in candidates]
            median_idx = np.argsort(ratios)[len(ratios)//2]
            return candidates[median_idx]
        else:
            return binary_gaussian

    def _morphology_clean(self, binary):
        """形态学清理（优化：自适应核大小）"""
        # 根据图像大小调整核大小
        h, w = binary.shape
        kernel_size = min(3, max(1, min(h, w) // 100))
        kernel = np.ones((kernel_size, kernel_size), np.uint8)

        # 开运算去除小噪点
        cleaned = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel, iterations=1)

        # 闭运算填充小孔
        cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_CLOSE, kernel, iterations=1)

        # 去除孤立的小区域
        num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(cleaned, connectivity=8)
        min_area = 20  # 最小连通区域面积
        for i in range(1, num_labels):
            if stats[i, cv2.CC_STAT_AREA] < min_area:
                cleaned[labels == i] = 0

        return cleaned

    def _thin(self, binary):
        """细化（骨架化）（优化：多算法融合）"""
        # 转换为布尔数组
        binary_bool = binary > 0

        # 主骨架化
        skeleton = skeletonize(binary_bool)

        # 二次细化优化
        skeleton = thin(skeleton)

        # 转换回8位图像
        skeleton_8bit = (skeleton * 255).astype(np.uint8)

        return skeleton_8bit

    def _clean_skeleton(self, skeleton):
        """清理骨架，去除毛刺（优化：长度过滤）"""
        # 找到所有连通的脊线
        num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(skeleton, connectivity=8)

        # 过滤短于最小长度的脊线（毛刺）
        min_length = 15  # 最小脊线长度
        cleaned = np.zeros_like(skeleton)

        for i in range(1, num_labels):
            if stats[i, cv2.CC_STAT_AREA] >= min_length:
                cleaned[labels == i] = 255

        # 形态学微调
        kernel = np.ones((2, 2), np.uint8)
        cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_CLOSE, kernel, iterations=1)

        return cleaned


class MinutiaeExtractor:
    """特征点提取器（优化版）"""

    # 特征点类型
    ENDING = 1
    BIFURCATION = 2
    UNKNOWN = 0

    def __init__(self):
        self.min_distance = 8  # 特征点最小间距（减小以保留更多细节）
        self.border_distance = 15  # 边界距离
        self.min_quality = 0.2  # 最小质量阈值

    def extract(self, thinned_image, original_image=None):
        """
        提取特征点（优化：多尺度特征点检测）
        Args:
            thinned_image: 细化后的二值图像
            original_image: 原始图像（用于计算质量）
        Returns:
            特征点列表 [(x, y, type, angle, quality, ridge_count, local_pattern), ...]
        """
        h, w = thinned_image.shape
        minutiae = []

        # 创建掩码，排除边界区域
        mask = np.ones((h, w), dtype=bool)
        mask[:self.border_distance, :] = False
        mask[-self.border_distance:, :] = False
        mask[:, :self.border_distance] = False
        mask[:, -self.border_distance:] = False

        # 多尺度检测
        scales = [1, 0.8, 1.2]
        scale_minutiae = []

        for scale in scales:
            if scale != 1:
                scaled_h, scaled_w = int(h * scale), int(w * scale)
                scaled_img = cv2.resize(thinned_image, (scaled_w, scaled_h), interpolation=cv2.INTER_NEAREST)
            else:
                scaled_img = thinned_image

            scale_m = self._extract_single_scale(scaled_img, original_image, scale)
            scale_minutiae.extend(scale_m)

        # 合并多尺度特征点
        minutiae = self._merge_multiscale_minutiae(scale_minutiae)

        # 过滤低质量特征点
        minutiae = [m for m in minutiae if m['quality'] >= self.min_quality]

        # 过滤距离过近的特征点
        minutiae = self._filter_close_minutiae(minutiae)

        return minutiae

    def _extract_single_scale(self, thinned_image, original_image, scale=1.0):
        """单尺度特征点提取"""
        h, w = thinned_image.shape
        minutiae = []

        # 遍历图像（排除边界）
        for y in range(1, h - 1):
            for x in range(1, w - 1):
                if thinned_image[y, x] == 0:
                    continue

                # 计算交叉数（优化：16邻域）
                cn = self._crossing_number_16(thinned_image, x, y)

                # 判断特征点类型
                if cn == 1:
                    minutiae_type = self.ENDING
                elif cn == 3:
                    minutiae_type = self.BIFURCATION
                else:
                    continue

                # 还原到原始尺度
                orig_x, orig_y = int(x / scale), int(y / scale)

                # 计算方向（优化：更精确的方向计算）
                angle = self._compute_angle_improved(thinned_image, x, y, minutiae_type)

                # 计算质量（优化：多维度质量评估）
                quality = self._compute_quality_improved(thinned_image, x, y, original_image, orig_x, orig_y)

                # 计算局部脊线数
                ridge_count = self._count_local_ridge(original_image, orig_x, orig_y)

                # 提取局部纹理模式
                local_pattern = self._extract_local_pattern(original_image, orig_x, orig_y)

                minutiae.append({
                    'x': orig_x,
                    'y': orig_y,
                    'type': minutiae_type,
                    'angle': angle,
                    'quality': quality,
                    'ridge_count': ridge_count,
                    'local_pattern': local_pattern,
                    'scale': scale
                })

        return minutiae

    def _merge_multiscale_minutiae(self, minutiae):
        """合并多尺度特征点"""
        if len(minutiae) == 0:
            return []

        # 按位置聚类
        merged = []
        positions = [(m['x'], m['y']) for m in minutiae]
        if positions:
            kdtree = KDTree(positions)

            used = set()
            for i, m in enumerate(minutiae):
                if i in used:
                    continue

                # 找到邻近的特征点
                idx = kdtree.query_ball_point((m['x'], m['y']), r=5)
                cluster = [minutiae[j] for j in idx if j not in used]

                if cluster:
                    # 取质量最高的作为代表
                    best = max(cluster, key=lambda x: x['quality'])
                    merged.append(best)

                    # 标记为已使用
                    for j in idx:
                        used.add(j)

        return merged

    def _crossing_number_16(self, image, x, y):
        """
        计算16邻域交叉数（优化：更精确的特征点判断）
        用于判断特征点类型
        """
        # 16邻域像素值（顺时针方向）
        p = []
        angles = np.arange(0, 2*np.pi, np.pi/8)
        for a in angles:
            dx = int(round(np.cos(a)))
            dy = int(round(np.sin(a)))
            px = x + dx
            py = y + dy
            if 0 <= px < image.shape[1] and 0 <= py < image.shape[0]:
                p.append(1 if image[py, px] > 0 else 0)
            else:
                p.append(0)

        # 计算交叉数
        cn = 0
        for i in range(16):
            cn += abs(p[(i + 1) % 16] - p[i])

        cn = cn // 2

        return cn

    def _compute_angle_improved(self, image, x, y, minutiae_type):
        """计算特征点方向（优化：精确的方向估计）"""
        if minutiae_type == self.ENDING:
            # 端点：追踪更长的脊线
            return self._trace_ridge_direction_improved(image, x, y)
        else:
            # 分叉点：计算主方向
            return self._compute_bifurcation_angle_improved(image, x, y)

    def _trace_ridge_direction_improved(self, image, x, y, max_steps=30):
        """追踪脊线方向（优化：更稳健的追踪）"""
        h, w = image.shape

        # 记录路径
        path = [(x, y)]

        # 8邻域方向
        directions = [
            (0, -1), (1, -1), (1, 0), (1, 1),
            (0, 1), (-1, 1), (-1, 0), (-1, -1)
        ]

        # 追踪脊线
        current_x, current_y = x, y
        for _ in range(max_steps):
            next_points = []
            for dx, dy in directions:
                nx, ny = current_x + dx, current_y + dy
                if 0 <= nx < w and 0 <= ny < h:
                    if image[ny, nx] > 0 and (nx, ny) not in path:
                        next_points.append((nx, ny))

            if len(next_points) == 1:
                current_x, current_y = next_points[0]
                path.append((current_x, current_y))
            else:
                break

        # 计算方向（使用路径的整体方向）
        if len(path) >= 3:
            dx = path[-1][0] - path[0][0]
            dy = path[-1][1] - path[0][1]
        elif len(path) > 1:
            dx = path[-1][0] - path[0][0]
            dy = path[-1][1] - path[0][1]
        else:
            return 0

        if dx == 0 and dy == 0:
            return 0

        return math.atan2(dy, dx)

    def _compute_bifurcation_angle_improved(self, image, x, y):
        """计算分叉点的主方向（优化）"""
        # 找到三个分支并追踪
        branches = self._find_branches_improved(image, x, y)

        if len(branches) < 2:
            return 0

        # 计算主方向（分支的平均方向）
        angles = [math.atan2(dy, dx) for dx, dy in branches]
        avg_angle = np.mean(angles)

        return avg_angle

    def _find_branches_improved(self, image, x, y):
        """找到分叉点的所有分支（优化：追踪分支方向）"""
        h, w = image.shape
        branches = []

        # 8邻域方向
        directions = [
            (0, -1), (1, -1), (1, 0), (1, 1),
            (0, 1), (-1, 1), (-1, 0), (-1, -1)
        ]

        for dx, dy in directions:
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and image[ny, nx] > 0:
                # 追踪这个分支
                branch_path = self._trace_branch(image, nx, ny, x, y)
                if len(branch_path) > 5:  # 有效分支
                    end_x, end_y = branch_path[-1]
                    total_dx = end_x - x
                    total_dy = end_y - y
                    branches.append((total_dx, total_dy))

        return branches

    def _trace_branch(self, image, x, y, start_x, start_y, max_steps=20):
        """追踪单个分支"""
        path = [(x, y)]
        current_x, current_y = x, y

        directions = [
            (0, -1), (1, -1), (1, 0), (1, 1),
            (0, 1), (-1, 1), (-1, 0), (-1, -1)
        ]

        for _ in range(max_steps):
            next_points = []
            for dx, dy in directions:
                nx, ny = current_x + dx, current_y + dy
                if 0 <= nx < image.shape[1] and 0 <= ny < image.shape[0]:
                    if image[ny, nx] > 0 and (nx, ny) not in path and (nx, ny) != (start_x, start_y):
                        next_points.append((nx, ny))

            if len(next_points) == 1:
                current_x, current_y = next_points[0]
                path.append((current_x, current_y))
            else:
                break

        return path

    def _compute_quality_improved(self, thinned_image, x, y, original_image, orig_x, orig_y):
        """计算特征点质量（优化：多维度评估）"""
        quality = 1.0

        if original_image is not None:
            # 维度1：局部对比度
            h, w = original_image.shape
            margin = 8
            x1, y1 = max(0, orig_x - margin), max(0, orig_y - margin)
            x2, y2 = min(w, orig_x + margin), min(h, orig_y + margin)

            local = original_image[y1:y2, x1:x2]
            if local.size > 0:
                contrast = local.std()
                contrast_score = min(contrast / 40.0, 1.0)
            else:
                contrast_score = 0.5

            # 维度2：脊线连续性
            continuity_score = self._compute_continuity_score(thinned_image, x, y)

            # 维度3：局部梯度
            grad_x = cv2.Sobel(original_image, cv2.CV_64F, 1, 0, ksize=3)
            grad_y = cv2.Sobel(original_image, cv2.CV_64F, 0, 1, ksize=3)
            grad_mag = np.sqrt(grad_x**2 + grad_y**2)
            grad_score = min(grad_mag[orig_y, orig_x] / 200.0, 1.0)

            # 综合质量分数
            quality = (contrast_score * 0.5 + continuity_score * 0.3 + grad_score * 0.2)

        return quality

    def _compute_continuity_score(self, image, x, y):
        """计算脊线连续性分数"""
        # 检查周围像素的连通性
        neighbors = []
        for dx in [-1, 0, 1]:
            for dy in [-1, 0, 1]:
                if dx == 0 and dy == 0:
                    continue
                nx, ny = x + dx, y + dy
                if 0 <= nx < image.shape[1] and 0 <= ny < image.shape[0]:
                    neighbors.append(image[ny, nx] > 0)

        # 连续的邻居数越多，分数越高
        continuous_count = sum(neighbors)
        return continuous_count / 8.0

    def _count_local_ridge(self, original_image, x, y):
        """计算局部脊线数量"""
        if original_image is None:
            return 0

        # 局部窗口内的脊线数
        margin = 15
        h, w = original_image.shape
        x1, y1 = max(0, x - margin), max(0, y - margin)
        x2, y2 = min(w, x + margin), min(h, y + margin)

        local = original_image[y1:y2, x1:x2]
        if local.size == 0:
            return 0

        # 使用阈值找到脊线
        thresh = filters.threshold_otsu(local)
        binary_local = local < thresh

        # 计算垂直和水平方向的脊线数
        row_proj = np.sum(binary_local, axis=1)
        col_proj = np.sum(binary_local, axis=0)

        # 脊线数 = 投影中的峰值数
        row_peaks = np.sum(np.convolve(row_proj, [1, -1], mode='valid') < 0)
        col_peaks = np.sum(np.convolve(col_proj, [1, -1], mode='valid') < 0)

        return min((row_peaks + col_peaks) // 2, 10)

    def _extract_local_pattern(self, original_image, x, y):
        """提取局部纹理模式（用于增强特征描述）"""
        if original_image is None:
            return np.zeros(8)

        # 8方向的局部梯度模式
        margin = 5
        h, w = original_image.shape
        patterns = []

        directions = [
            (0, -1), (1, -1), (1, 0), (1, 1),
            (0, 1), (-1, 1), (-1, 0), (-1, -1)
        ]

        for dx, dy in directions:
            x1, y1 = max(0, x - dx * margin), max(0, y - dy * margin)
            x2, y2 = min(w, x + dx * margin), min(h, y + dy * margin)

            if x1 < x2 and y1 < y2:
                local_mean = np.mean(original_image[y1:y2, x1:x2])
                patterns.append(local_mean)
            else:
                patterns.append(0)

        # 归一化模式
        patterns = np.array(patterns)
        if np.max(patterns) > 0:
            patterns = (patterns - np.min(patterns)) / (np.max(patterns) - np.min(patterns))

        return patterns

    def _filter_close_minutiae(self, minutiae):
        """过滤距离过近的特征点（优化：保留高质量特征点）"""
        if len(minutiae) == 0:
            return minutiae

        # 按质量排序（质量高的优先保留）
        minutiae = sorted(minutiae, key=lambda m: m['quality'], reverse=True)

        filtered = []
        for m in minutiae:
            is_valid = True

            # 检查与已保留特征点的距离
            for fm in filtered:
                dist = math.sqrt((m['x'] - fm['x'])**2 + (m['y'] - fm['y'])**2)
                if dist < self.min_distance:
                    # 如果新特征点质量远高于已保留的，则替换
                    if m['quality'] > fm['quality'] * 1.5:
                        filtered.remove(fm)
                    else:
                        is_valid = False
                    break

            if is_valid:
                filtered.append(m)

        return filtered


class MinutiaeMatcher:
    """特征点匹配器（优化版）"""

    def __init__(self):
        self.angle_threshold = math.pi / 6  # 角度阈值（30度，更严格）
        self.distance_threshold = 15  # 距离阈值（更小，更精确）
        self.match_threshold = 0.4  # 匹配阈值（更高，减少误匹配）
        self.ridge_count_weight = 0.2  # 脊线数权重
        self.local_pattern_weight = 0.3  # 局部模式权重

    def match(self, minutiae1, minutiae2, image_size=(256, 256)):
        """
        匹配两组特征点（优化：多特征融合匹配）
        Args:
            minutiae1: 参考指纹特征点
            minutiae2: 查询指纹特征点
            image_size: 图像尺寸
        Returns:
            匹配分数 (0-1)，匹配的特征点对
        """
        if len(minutiae1) == 0 or len(minutiae2) == 0:
            return 0.0, []

        # 构建增强的局部特征描述符
        desc1 = self._build_descriptors_enhanced(minutiae1)
        desc2 = self._build_descriptors_enhanced(minutiae2)

        # 使用双向匹配策略
        matches_forward = self._local_structure_match_enhanced(minutiae1, minutiae2, desc1, desc2)
        matches_backward = self._local_structure_match_enhanced(minutiae2, minutiae1, desc2, desc1)

        # 只保留双向匹配的特征点对
        mutual_matches = self._find_mutual_matches(matches_forward, matches_backward)

        # 几何一致性验证
        consistent_matches = self._geometric_consistency_improved(mutual_matches, minutiae1, minutiae2)

        # 计算匹配分数
        if len(consistent_matches) == 0:
            return 0.0, []

        # 匹配分数 = 匹配的特征点数 / min(两组特征点数)
        base_score = len(consistent_matches) / min(len(minutiae1), len(minutiae2))

        # 质量加权分数
        quality_scores = []
        for i, j, score in consistent_matches:
            q1 = minutiae1[i]['quality']
            q2 = minutiae2[j]['quality']
            quality_scores.append((q1 + q2) / 2)

        quality_score = np.mean(quality_scores) if quality_scores else 0

        # 综合分数
        final_score = 0.7 * base_score + 0.3 * quality_score

        return min(final_score, 1.0), consistent_matches

    def _build_descriptors_enhanced(self, minutiae, radius=40):
        """构建增强的局部特征描述符"""
        descriptors = []

        for i, m in enumerate(minutiae):
            # 找到邻近的特征点
            neighbors = []
            for j, other in enumerate(minutiae):
                if i == j:
                    continue

                dist = math.sqrt((m['x'] - other['x'])**2 + (m['y'] - other['y'])**2)
                if dist < radius:
                    # 增强的相对特征
                    rel_x = other['x'] - m['x']
                    rel_y = other['y'] - m['y']
                    rel_angle = math.atan2(rel_y, rel_x)
                    rel_dist = dist

                    # 角度差
                    angle_diff = abs(m['angle'] - other['angle'])
                    angle_diff = min(angle_diff, 2 * math.pi - angle_diff)

                    # 脊线数差
                    ridge_diff = abs(m.get('ridge_count', 0) - other.get('ridge_count', 0))

                    neighbors.append({
                        'rel_x': rel_x,
                        'rel_y': rel_y,
                        'rel_angle': rel_angle,
                        'rel_dist': rel_dist,
                        'angle_diff': angle_diff,
                        'ridge_diff': ridge_diff,
                        'type': other['type'],
                        'angle': other['angle'],
                        'quality': other['quality'],
                        'local_pattern': other.get('local_pattern', np.zeros(8))
                    })

            # 按距离排序邻居
            neighbors = sorted(neighbors, key=lambda n: n['rel_dist'])

            descriptors.append({
                'center': m,
                'neighbors': neighbors[:10],  # 保留前10个最近邻
                'ridge_count': m.get('ridge_count', 0),
                'local_pattern': m.get('local_pattern', np.zeros(8))
            })

        return descriptors

    def _local_structure_match_enhanced(self, minutiae1, minutiae2, desc1, desc2):
        """基于增强局部结构的匹配"""
        matches = []

        for i, d1 in enumerate(desc1):
            best_match = -1
            best_score = 0

            for j, d2 in enumerate(desc2):
                # 类型必须相同
                if d1['center']['type'] != d2['center']['type']:
                    continue

                # 计算增强的局部结构相似度
                score = self._compare_local_structures_enhanced(d1, d2)

                if score > best_score and score > self.match_threshold:
                    best_score = score
                    best_match = j

            if best_match >= 0:
                matches.append((i, best_match, best_score))

        return matches

    def _compare_local_structures_enhanced(self, desc1, desc2):
        """比较两个增强的局部结构"""
        n1 = desc1['neighbors']
        n2 = desc2['neighbors']

        if len(n1) == 0 or len(n2) == 0:
            return 0.0

        # 匹配邻近特征点
        matched_neighbors = 0
        total_score = 0

        # 脊线数相似度
        ridge_sim = 1.0 - min(abs(desc1['ridge_count'] - desc2['ridge_count']) / 10.0, 1.0)

        # 局部模式相似度
        pattern_sim = np.sum(np.minimum(desc1['local_pattern'], desc2['local_pattern'])) / 8.0

        # 邻居匹配
        for neighbor1 in n1:
            best_neighbor_score = 0

            for neighbor2 in n2:
                if neighbor1['type'] != neighbor2['type']:
                    continue

                # 距离相似度
                dist_diff = abs(neighbor1['rel_dist'] - neighbor2['rel_dist'])
                dist_sim = 1.0 - min(dist_diff / self.distance_threshold, 1.0)

                # 角度相似度
                angle_diff = abs(neighbor1['rel_angle'] - neighbor2['rel_angle'])
                angle_diff = min(angle_diff, 2 * math.pi - angle_diff)
                angle_sim = 1.0 - min(angle_diff / self.angle_threshold, 1.0)

                # 角度差相似度
                angle_diff_sim = 1.0 - min(abs(neighbor1['angle_diff'] - neighbor2['angle_diff']) / (math.pi/2), 1.0)

                # 综合邻居相似度
                neighbor_score = (dist_sim * 0.4 + angle_sim * 0.4 + angle_diff_sim * 0.2)

                if neighbor_score > best_neighbor_score:
                    best_neighbor_score = neighbor_score

            if best_neighbor_score > 0.5:
                matched_neighbors += 1
                total_score += best_neighbor_score

        # 计算整体相似度
        neighbor_score = matched_neighbors / max(len(n1), len(n2)) if max(len(n1), len(n2)) > 0 else 0
        if matched_neighbors > 0:
            avg_neighbor_score = total_score / matched_neighbors
        else:
            avg_neighbor_score = 0

        # 综合所有特征
        total_score = (
            neighbor_score * avg_neighbor_score * (1 - self.ridge_count_weight - self.local_pattern_weight) +
            ridge_sim * self.ridge_count_weight +
            pattern_sim * self.local_pattern_weight
        )

        return total_score

    def _find_mutual_matches(self, matches_forward, matches_backward):
        """找到双向匹配的特征点对"""
        # 构建反向匹配映射
        backward_map = {(j, i): score for i, j, score in matches_backward}

        mutual_matches = []
        for i, j, score_forward in matches_forward:
            if (i, j) in backward_map:
                score_backward = backward_map[(i, j)]
                avg_score = (score_forward + score_backward) / 2
                mutual_matches.append((i, j, avg_score))

        return mutual_matches

    def _geometric_consistency_improved(self, matches, minutiae1, minutiae2):
        """检查几何一致性（优化：RANSAC算法）"""
        if len(matches) < 3:
            return matches

        # 使用RANSAC筛选一致的匹配
        src_pts = np.float32([[minutiae1[i]['x'], minutiae1[i]['y']] for i, j, _ in matches])
        dst_pts = np.float32([[minutiae2[j]['x'], minutiae2[j]['y']] for i, j, _ in matches])

        # 计算变换矩阵并找到内点
        try:
            # 使用仿射变换
            M, mask = cv2.estimateAffine2D(src_pts, dst_pts, ransacReprojThreshold=10.0)
            mask = mask.ravel().tolist()

            # 筛选内点
            consistent_matches = [matches[i] for i in range(len(matches)) if mask[i]]

            return consistent_matches
        except:
            # 如果RANSAC失败，使用原始几何一致性
            return self._geometric_consistency_original(matches, minutiae1, minutiae2)

    def _geometric_consistency_original(self, matches, minutiae1, minutiae2):
        """原始几何一致性检查"""
        if len(matches) < 2:
            return matches

        # 计算所有匹配对的几何一致性
        consistent_count = defaultdict(int)
        total_pairs = 0

        for i in range(len(matches)):
            for j in range(i + 1, len(matches)):
                idx1_i, idx2_i, _ = matches[i]
                idx1_j, idx2_j, _ = matches[j]

                m1_i = minutiae1[idx1_i]
                m1_j = minutiae1[idx1_j]
                m2_i = minutiae2[idx2_i]
                m2_j = minutiae2[idx2_j]

                # 计算两组中的距离和角度
                dist1 = math.sqrt((m1_i['x'] - m1_j['x'])**2 + (m1_i['y'] - m1_j['y'])**2)
                dist2 = math.sqrt((m2_i['x'] - m2_j['x'])**2 + (m2_i['y'] - m2_j['y'])**2)

                angle1 = math.atan2(m1_j['y'] - m1_i['y'], m1_j['x'] - m1_i['x'])
                angle2 = math.atan2(m2_j['y'] - m2_i['y'], m2_j['x'] - m2_i['x'])
                angle_diff = abs(angle1 - angle2)
                angle_diff = min(angle_diff, 2 * math.pi - angle_diff)

                # 检查一致性
                if dist1 > 0 and dist2 > 0:
                    ratio = min(dist1, dist2) / max(dist1, dist2)
                    if ratio > 0.8 and angle_diff < math.pi/8:
                        consistent_count[i] += 1
                        consistent_count[j] += 1
                    total_pairs += 1

        # 筛选一致性高的匹配
        threshold = max(1, total_pairs // 10)
        consistent_matches = [match for i, match in enumerate(matches) if consistent_count.get(i, 0) >= threshold]

        return consistent_matches


class FingerprintRecognizer:
    """指纹识别器 - 完整流程（优化版）"""

    def __init__(self, target_size=(256, 256)):
        self.preprocessor = FingerprintPreprocessor(target_size=target_size)
        self.extractor = MinutiaeExtractor()
        self.matcher = MinutiaeMatcher()

        self.reference_minutiae = None
        self.reference_image = None

    def enroll(self, image_path):
        """注册参考指纹"""
        original, enhanced, binary, thinned = self.preprocessor.preprocess(image_path)

        self.reference_minutiae = self.extractor.extract(thinned, original)
        self.reference_image = original

        print(f"已注册参考指纹，提取到 {len(self.reference_minutiae)} 个特征点（优化版）")

        return self.reference_minutiae

    def verify(self, query_image_path, threshold=0.3):
        """验证查询指纹（优化：更高的默认阈值）"""
        if self.reference_minutiae is None:
            raise ValueError("请先注册参考指纹")

        # 预处理查询指纹
        original, enhanced, binary, thinned = self.preprocessor.preprocess(query_image_path)

        # 提取特征点
        query_minutiae = self.extractor.extract(thinned, original)

        print(f"查询指纹提取到 {len(query_minutiae)} 个特征点（优化版）")

        # 匹配
        score, matches = self.matcher.match(self.reference_minutiae, query_minutiae)

        is_match = score > threshold

        details = {
            'reference_minutiae_count': len(self.reference_minutiae),
            'query_minutiae_count': len(query_minutiae),
            'matched_count': len(matches),
            'score': score,
            'matches': matches
        }

        return is_match, score, details

    def visualize(self, image_path, output_path=None, show=True):
        """可视化特征点提取结果（保持不变）"""
        import matplotlib.pyplot as plt

        # 预处理
        original, enhanced, binary, thinned = self.preprocessor.preprocess(image_path)

        # 提取特征点
        minutiae = self.extractor.extract(thinned, original)

        # 创建可视化
        fig, axes = plt.subplots(2, 2, figsize=(12, 12))

        # 原始图像
        axes[0, 0].imshow(original, cmap='gray')
        axes[0, 0].set_title('Original Image')
        axes[0, 0].axis('off')

        # 增强图像
        axes[0, 1].imshow(enhanced, cmap='gray')
        axes[0, 1].set_title('Enhanced Image (Optimized)')
        axes[0, 1].axis('off')

        # 二值图像
        axes[1, 0].imshow(binary, cmap='gray')
        axes[1, 0].set_title('Binary Image')
        axes[1, 0].axis('off')

        # 细化图像 + 特征点
        axes[1, 1].imshow(thinned, cmap='gray')

        # 绘制特征点
        for m in minutiae:
            color = 'red' if m['type'] == MinutiaeExtractor.ENDING else 'blue'
            marker = 'o' if m['type'] == MinutiaeExtractor.ENDING else 's'
            # 根据质量调整大小
            size = 3 + m['quality'] * 4
            axes[1, 1].plot(m['x'], m['y'], marker, color=color, markersize=size)

        axes[1, 1].set_title(f'Thinned Image with Minutiae (Optimized)\n'
                            f'Red: Endings ({sum(1 for m in minutiae if m["type"] == 1)}), '
                            f'Blue: Bifurcations ({sum(1 for m in minutiae if m["type"] == 2)})')
        axes[1, 1].axis('off')

        plt.tight_layout()

        if output_path:
            plt.savefig(output_path, dpi=150, bbox_inches='tight')
            print(f"可视化结果已保存: {output_path}")

        if show:
            plt.show()

        plt.close()

        return minutiae

    def visualize_match(self, query_image_path, output_path=None, show=True):
        """可视化匹配结果（保持不变）"""
        import matplotlib.pyplot as plt

        if self.reference_minutiae is None:
            raise ValueError("请先注册参考指纹")

        # 处理查询指纹
        original, enhanced, binary, thinned = self.preprocessor.preprocess(query_image_path)
        query_minutiae = self.extractor.extract(thinned, original)

        # 匹配
        score, matches = self.matcher.match(self.reference_minutiae, query_minutiae)

        # 可视化
        fig, axes = plt.subplots(1, 2, figsize=(14, 7))

        # 参考指纹
        axes[0].imshow(self.reference_image, cmap='gray')
        for m in self.reference_minutiae:
            color = 'red' if m['type'] == MinutiaeExtractor.ENDING else 'blue'
            axes[0].plot(m['x'], m['y'], 'o', color=color, markersize=4)
        axes[0].set_title(f'Reference Fingerprint (Optimized)\n{len(self.reference_minutiae)} minutiae')
        axes[0].axis('off')

        # 查询指纹
        axes[1].imshow(original, cmap='gray')
        for m in query_minutiae:
            color = 'red' if m['type'] == MinutiaeExtractor.ENDING else 'blue'
            axes[1].plot(m['x'], m['y'], 'o', color=color, markersize=4)
        axes[1].set_title(f'Query Fingerprint (Optimized)\n{len(query_minutiae)} minutiae\nMatch Score: {score:.2%}')
        axes[1].axis('off')

        plt.tight_layout()

        if output_path:
            plt.savefig(output_path, dpi=150, bbox_inches='tight')

        if show:
            plt.show()

        plt.close()

        return score, matches


def main():
    """主函数 - 演示用法（保持不变）"""
    import argparse
    import os

    parser = argparse.ArgumentParser(description='指纹识别系统（特征点方法 - 优化版）')
    parser.add_argument('--reference', type=str, required=True,
                        help='参考指纹图像路径')
    parser.add_argument('--query', type=str,
                        help='查询指纹图像路径')
    parser.add_argument('--query_dir', type=str,
                        help='查询指纹目录（批量识别）')
    parser.add_argument('--threshold', type=float, default=0.3,
                        help='匹配阈值（默认0.3，优化版更高）')
    parser.add_argument('--visualize', action='store_true',
                        help='可视化特征点')
    parser.add_argument('--output', type=str,
                        help='输出图像路径')

    args = parser.parse_args()

    # 创建识别器
    recognizer = FingerprintRecognizer()

    # 注册参考指纹
    print("=" * 60)
    print("指纹识别系统 - 特征点方法（优化版）")
    print("=" * 60)
    print(f"\n注册参考指纹: {args.reference}")

    if args.visualize:
        recognizer.visualize(args.reference, args.output, show=False)

    recognizer.enroll(args.reference)

    # 批量识别
    if args.query_dir:
        print(f"\n批量识别目录: {args.query_dir}")
        print("-" * 60)

        query_files = [f for f in os.listdir(args.query_dir)
                       if f.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tif'))]

        results = []
        for query_file in sorted(query_files):
            query_path = os.path.join(args.query_dir, query_file)
            try:
                is_match, score, details = recognizer.verify(query_path, args.threshold)
                status = "✓ MATCH" if is_match else "✗ NO MATCH"
                print(f"{query_file:30s} | Score: {score:.2%} | {status}")
                results.append((query_file, score, is_match))
            except Exception as e:
                print(f"{query_file:30s} | Error: {e}")

        print("-" * 60)
        matches = sum(1 for r in results if r[2])
        print(f"\n统计: {matches}/{len(results)} 个指纹匹配成功（优化版）")

        return results

    # 单张识别
    if args.query:
        print(f"\n验证查询指纹: {args.query}")
        print("-" * 60)

        is_match, score, details = recognizer.verify(args.query, args.threshold)

        print(f"参考指纹特征点数: {details['reference_minutiae_count']}")
        print(f"查询指纹特征点数: {details['query_minutiae_count']}")
        print(f"匹配特征点数: {details['matched_count']}")
        print(f"匹配分数: {score:.2%}")

        if is_match:
            print(f"\n✓ 判定: 匹配成功 (分数 > {args.threshold})")
        else:
            print(f"\n✗ 判定: 不匹配 (分数 <= {args.threshold})")

        if args.visualize:
            recognizer.visualize_match(args.query, args.output, show=True)

        return is_match, score, details

    print("\n请指定 --query 或 --query_dir 进行识别")


if __name__ == '__main__':
    main()

#python fingerprint_minutiae.py --reference picture/1.png --query picture/2.png --visualize --output match_result.png
```
