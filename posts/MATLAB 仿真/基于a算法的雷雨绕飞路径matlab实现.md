---
title: 基于A算法的雷雨绕飞路径MATLAB实现
slug: 基于a算法的雷雨绕飞路径matlab实现
category: MATLAB 仿真
summary: 本文提出了一种基于A算法的雷雨绕飞路径规划方法。该方法首先生成模拟雷雨天气图并进行二值化处理，识别危险区域；然后检测计划航路中需要绕飞的航段，通过A算法为每个航段生成左右绕飞候选路径；接着进行视距优化和平行路径拓展以提高安全性；最后整合各航段最优路径构建完整绕飞航路。实验结果表明，该方法能有效避开危险区域，生成安全且长度优化的绕飞路径。关键创新点包括：1) 结合雷达天气数据的精细化处理；2) 多候…
tags: MATLAB
---

本文提出了一种基于A*算法的雷雨绕飞路径规划方法。该方法首先生成模拟雷雨天气图并进行二值化处理，识别危险区域；然后检测计划航路中需要绕飞的航段，通过A*算法为每个航段生成左右绕飞候选路径；接着进行视距优化和平行路径拓展以提高安全性；最后整合各航段最优路径构建完整绕飞航路。实验结果表明，该方法能有效避开危险区域，生成安全且长度优化的绕飞路径。关键创新点包括：1) 结合雷达天气数据的精细化处理；2) 多候选路径生成与优化机制；3) 完整航路构建策略。可视化界面直观展示了各阶段路径规划效果。


![](/uploads/csdn/基于a算法的雷雨绕飞路径matlab实现/img-01.png)


```Matlab
function thunderstorm_reroute_complete()
    % 设置参数
    map_size = [200, 150];
    num_storms = 12;
    max_storm_size = 20;
    intensity_threshold = 100;

    fprintf('开始雷雨绕飞路径规划...\n');

    % 1. 生成随机雷雨天气图
    fprintf('生成模拟雷雨天气图...\n');
    [radar_image, binary_map] = generate_random_weather_map(map_size, num_storms, max_storm_size);

    % 2. 定义计划航路
    fprintf('定义计划航路...\n');
    planned_route = [
        10, 20;
        150, 100;
        180, 130
    ];

    % 3. 处理天气雷达图
    fprintf('处理天气雷达图...\n');
    processed_binary_map = process_weather_radar(radar_image, intensity_threshold);

    % 4. 确定绕飞航段
    fprintf('确定绕飞航段...\n');
    [segments_to_reroute, middle_points, reroute_indices] = find_reroute_segments(planned_route, processed_binary_map);
    fprintf('找到 %d 个需要绕飞的航段\n', length(segments_to_reroute));

    % 5. A*路径规划
    fprintf('进行A*路径规划...\n');
    all_paths = a_star_path_planning_for_segments(segments_to_reroute, middle_points, processed_binary_map);

    % 6. 视距优化
    fprintf('进行视距优化...\n');
    optimized_paths = optimize_with_line_of_sight(all_paths, processed_binary_map);

    % 7. 平行拓展
    fprintf('进行平行拓展...\n');
    parallel_paths = parallel_expansion(optimized_paths, processed_binary_map, 5);

    % 8. 为每个航段选择最佳绕飞路径，并构建完整航路
    fprintf('构建完整最短绕飞航路...\n');
    [final_path, final_path_length, all_valid_paths] = find_and_construct_best_path(planned_route, reroute_indices, optimized_paths, parallel_paths, processed_binary_map);

    % 9. 可视化结果
    fprintf('生成可视化结果...\n');
    path_info.final_path = final_path;
    path_info.final_path_length = final_path_length;
    path_info.all_valid_paths = all_valid_paths;
    path_info.is_rerouted = ~isempty(reroute_indices); % 标记是否进行了绕飞
    visualize_results(radar_image, binary_map, planned_route, optimized_paths, parallel_paths, path_info);

    fprintf('雷雨绕飞路径规划完成！\n');
end

% --- 新增的核心逻辑：构建完整路径 ---
function [final_path, final_path_length, all_valid_paths] = find_and_construct_best_path(planned_route, reroute_indices, optimized_paths, parallel_paths, binary_map)
    % 如果没有需要绕飞的航段，直接返回原始路径
    if isempty(reroute_indices)
        final_path = planned_route;
        final_path_length = calculate_path_length(planned_route);
        all_valid_paths = {};
        return;
    end

    % 1. 为每个需要绕飞的航段选出最佳路径
    best_reroutes_per_segment = {};
    all_valid_paths = {};

    for i = 1:length(optimized_paths) % 对应每个需要绕飞的航段
        segment_candidates = {};

        % 收集该航段的所有候选路径 (主路径 + 平行路径)
        for j = 1:length(optimized_paths{i}) % 左/右绕飞
            path = optimized_paths{i}{j};
            if ~isempty(path) && check_entire_path_safety(path, binary_map)
                segment_candidates{end+1} = path;
                all_valid_paths{end+1} = path;
            end
        end
        for j = 1:length(parallel_paths{i}) % 平行拓展的路径
             for k = 1:length(parallel_paths{i}{j})
                path = parallel_paths{i}{j}{k};
                 if ~isempty(path) && check_entire_path_safety(path, binary_map)
                    segment_candidates{end+1} = path;
                    all_valid_paths{end+1} = path;
                 end
             end
        end

        % 从当前航段的候选中找到最短的
        best_segment_path = [];
        min_len = inf;
        for k = 1:length(segment_candidates)
            len = calculate_path_length(segment_candidates{k});
            if len < min_len
                min_len = len;
                best_segment_path = segment_candidates{k};
            end
        end
        best_reroutes_per_segment{i} = best_segment_path;
    end

    % 2. 构建完整路径
    final_path = [];
    last_planned_idx = 0;

    for i = 1:length(reroute_indices)
        reroute_idx = reroute_indices(i); % 这是计划航路中的航段索引

        % 添加上一个安全航段到当前绕飞航段起点之间的部分
        safe_segments = planned_route(last_planned_idx+1:reroute_idx, :);
        if ~isempty(final_path) && ~isempty(safe_segments)
            final_path = [final_path(1:end-1,:); safe_segments]; % 拼接，去除重复点
        elseif isempty(final_path)
            final_path = safe_segments;
        end

        % 添加当前航段的最佳绕飞路径
        rerouted_segment = best_reroutes_per_segment{i};
        if ~isempty(rerouted_segment)
            if ~isempty(final_path)
                final_path = [final_path(1:end-1,:); rerouted_segment];
            else
                final_path = rerouted_segment;
            end
        else
            % 如果绕飞失败，则添加原始航段（作为备用方案）
            original_segment = planned_route(reroute_idx:reroute_idx+1, :);
            if ~isempty(final_path)
                 final_path = [final_path(1:end-1,:); original_segment];
            else
                 final_path = original_segment;
            end
        end

        last_planned_idx = reroute_idx + 1;
    end

    % 添加最后一个绕飞航段到终点的剩余安全部分
    if last_planned_idx <= size(planned_route, 1)
        remaining_segments = planned_route(last_planned_idx:end, :);
         if ~isempty(final_path) && ~isempty(remaining_segments)
            final_path = [final_path(1:end-1,:); remaining_segments];
         elseif isempty(final_path) % 如果全程都无需绕飞，但逻辑走到这里说明有误，作为保险
            final_path = planned_route;
         end
    end

    final_path_length = calculate_path_length(final_path);
end


% --- 其他函数（保持不变或微小修正） ---

function [radar_image, binary_map] = generate_random_weather_map(map_size, num_storms, max_storm_size)
    width = map_size(1);
    height = map_size(2);
    radar_image = ones(height, width, 3);
    weather_intensity = zeros(height, width);
    for i = 1:num_storms
        center_x = randi([max_storm_size+1, width - max_storm_size - 1]);
        center_y = randi([max_storm_size+1, height - max_storm_size - 1]);
        min_size = max(5, floor(max_storm_size/3));
        storm_width = randi([min_size, max_storm_size]);
        storm_height = randi([min_size, max_storm_size]);
        max_intensity = randi([150, 255]);
        for x = max(1, center_x-storm_width):min(width, center_x+storm_width)
            for y = max(1, center_y-storm_height):min(height, center_y+storm_height)
                dx = (x - center_x) / storm_width;
                dy = (y - center_y) / storm_height;
                distance = sqrt(dx^2 + dy^2);
                if distance <= 1
                    intensity = max_intensity * (1 - distance);
                    weather_intensity(y,x) = max(weather_intensity(y,x), intensity);
                end
            end
        end
    end
    noise_density = 0.005;
    num_noise_points = round(noise_density * width * height);
    for i = 1:num_noise_points
        x = randi(width);
        y = randi(height);
        weather_intensity(y,x) = max(weather_intensity(y,x), randi([100, 200]));
    end
    for i = 1:height
        for j = 1:width
            intensity = weather_intensity(i,j);
            if intensity == 0, radar_image(i,j,:) = [0.2, 0.5, 1.0];
            elseif intensity < 50, radar_image(i,j,:) = [0.6, 0.9, 0.6];
            elseif intensity < 100, radar_image(i,j,:) = [1.0, 1.0, 0.4];
            elseif intensity < 150, radar_image(i,j,:) = [1.0, 0.6, 0.2];
            else, radar_image(i,j,:) = [1.0, 0.2, 0.2];
            end
        end
    end
    binary_map = weather_intensity < 50;
    figure('Position', [100, 100, 1200, 500]);
    subplot(1,2,1); imshow(radar_image); title('模拟雷达天气图');
    subplot(1,2,2); imagesc(binary_map); colormap([1,1,1; 0,0,0]);
    title('二值化天气地图 (白色=安全, 黑色=危险)'); colorbar; axis equal;
end

function processed_binary_map = process_weather_radar(radar_image, intensity_threshold)
    weather_intensity = double(radar_image(:,:,1)) * 255;
    binary_map = weather_intensity < intensity_threshold;
    se = strel('disk', 2);
    binary_map = imclose(binary_map, se);
    se_dilate = strel('disk', 3);
    danger_zones = imdilate(~binary_map, se_dilate);
    processed_binary_map = binary_map & ~danger_zones;
    processed_binary_map = bwareaopen(processed_binary_map, 10);
end

function [segments, middle_points, reroute_indices] = find_reroute_segments(planned_route, binary_map)
    segments = {};
    middle_points = [];
    reroute_indices = []; % 新增：记录需要绕飞的航段索引
    for i = 1:size(planned_route,1)-1
        start_point = planned_route(i,:);
        end_point = planned_route(i+1,:);
        if check_weather_crossing_enhanced(start_point, end_point, binary_map)
            segments{end+1} = [start_point; end_point];
            reroute_indices(end+1) = i; % 记录索引
            [left_mid, right_mid] = find_safe_middle_points(start_point, end_point, binary_map);
            middle_points = [middle_points; left_mid; right_mid];
        end
    end
end

function crossing = check_weather_crossing_enhanced(start_point, end_point, binary_map)
    num_points = max(ceil(norm(end_point - start_point)) * 3, 20);
    x_points = linspace(start_point(1), end_point(1), num_points);
    y_points = linspace(start_point(2), end_point(2), num_points);
    for i = 1:num_points
        if ~is_safe_point([x_points(i), y_points(i)], binary_map)
            crossing = true; return;
        end
    end
    perpendicular = [- (end_point(2)-start_point(2)), (end_point(1)-start_point(1))];
    if norm(perpendicular) > 0
        perpendicular = perpendicular / norm(perpendicular);
        for i = 1:num_points
            left_point = [x_points(i), y_points(i)] + 5 * perpendicular;
            if ~is_safe_point(left_point, binary_map)
                crossing = true; return;
            end
            right_point = [x_points(i), y_points(i)] - 5 * perpendicular;
            if ~is_safe_point(right_point, binary_map)
                crossing = true; return;
            end
        end
    end
    crossing = false;
end

function [left_mid, right_mid] = find_safe_middle_points(start_point, end_point, binary_map)
    segment_vector = end_point - start_point;
    segment_length = norm(segment_vector);
    if segment_length > 0
        segment_dir = segment_vector / segment_length;
        perpendicular = [-segment_dir(2), segment_dir(1)];
    else, perpendicular = [1, 0]; end
    test_positions = [0.3, 0.5, 0.7];
    left_mid = []; right_mid = [];
    for pos = test_positions
        base_point = start_point + pos * segment_vector;
        if isempty(left_mid)
            for offset = [10, 15, 20, 25, 30]
                candidate = base_point + offset * perpendicular;
                if is_safe_point(candidate, binary_map) && check_path_safety(start_point, candidate, binary_map) && check_path_safety(candidate, end_point, binary_map)
                    left_mid = candidate; break;
                end
            end
        end
        if isempty(right_mid)
            for offset = [10, 15, 20, 25, 30]
                candidate = base_point - offset * perpendicular;
                if is_safe_point(candidate, binary_map) && check_path_safety(start_point, candidate, binary_map) && check_path_safety(candidate, end_point, binary_map)
                    right_mid = candidate; break;
                end
            end
        end
        if ~isempty(left_mid) && ~isempty(right_mid), break; end
    end
    if isempty(left_mid), left_mid = start_point + 0.25 * segment_vector + 15 * perpendicular; end
    if isempty(right_mid), right_mid = start_point + 0.75 * segment_vector - 15 * perpendicular; end
end

function safe = check_path_safety(point1, point2, binary_map)
    num_points = max(ceil(norm(point2 - point1)) * 2, 10);
    x_points = linspace(point1(1), point2(1), num_points);
    y_points = linspace(point1(2), point2(2), num_points);
    for i = 1:num_points
        if ~is_safe_point([x_points(i), y_points(i)], binary_map)
            safe = false; return;
        end
    end
    safe = true;
end

function all_paths = a_star_path_planning_for_segments(segments, middle_points, binary_map)
    all_paths = {};
    for i = 1:length(segments)
        segment = segments{i}; start_point = segment(1,:); end_point = segment(2,:);
        fprintf('规划航段 %d: 从[%.1f,%.1f]到[%.1f,%.1f]\n', i, start_point(1), start_point(2), end_point(1), end_point(2));
        left_mid = middle_points((i-1)*2+1,:);
        path_left1 = a_star_path_planning(start_point, left_mid, binary_map);
        path_left2 = a_star_path_planning(left_mid, end_point, binary_map);
        if ~isempty(path_left1) && ~isempty(path_left2), path_left = [path_left1; path_left2(2:end,:)];
        else, path_left = a_star_path_planning(start_point, end_point, binary_map);
            if isempty(path_left), path_left = [start_point; end_point]; fprintf('  左侧路径规划失败，使用直线路径\n'); end
        end
        right_mid = middle_points((i-1)*2+2,:);
        path_right1 = a_star_path_planning(start_point, right_mid, binary_map);
        path_right2 = a_star_path_planning(right_mid, end_point, binary_map);
        if ~isempty(path_right1) && ~isempty(path_right2), path_right = [path_right1; path_right2(2:end,:)];
        else, path_right = a_star_path_planning(start_point, end_point, binary_map);
            if isempty(path_right), path_right = [start_point; end_point]; fprintf('  右侧路径规划失败，使用直线路径\n'); end
        end
        all_paths{end+1} = {path_left, path_right};
    end
end

function path = a_star_path_planning(start_point, end_point, binary_map)
    start = round(start_point); goal = round(end_point);
    if ~is_safe_point(start, binary_map), start = find_nearest_safe_point(start, binary_map, 20); if isempty(start), path = []; return; end; end
    if ~is_safe_point(goal, binary_map), goal = find_nearest_safe_point(goal, binary_map, 20); if isempty(goal), path = []; return; end; end
    [height, width] = size(binary_map);
    g_score = inf(height, width); f_score = inf(height, width); closed_map = false(height, width);
    parent_x = zeros(height, width); parent_y = zeros(height, width);
    g_score(start(2), start(1)) = 0; f_score(start(2), start(1)) = heuristic(start, goal);
    directions = [0,1,1.0; 1,0,1.0; 0,-1,1.0; -1,0,1.0; 1,1,1.414; 1,-1,1.414; -1,1,1.414; -1,-1,1.414];
    open_list = [struct('x', start(1), 'y', start(2), 'f', f_score(start(2), start(1)))];
    max_iter = height * width * 2; iter = 0;
    while ~isempty(open_list) && iter < max_iter
        iter = iter + 1;
        [~, min_idx] = min([open_list.f]); current = open_list(min_idx); open_list(min_idx) = [];
        x_curr = current.x; y_curr = current.y;
        if x_curr == goal(1) && y_curr == goal(2), path = reconstruct_path_improved(parent_x, parent_y, start, goal); return; end
        if closed_map(y_curr, x_curr), continue; end
        closed_map(y_curr, x_curr) = true;
        for d = 1:size(directions, 1)
            dx = directions(d, 1); dy = directions(d, 2); move_cost = directions(d, 3);
            x_neighbor = x_curr + dx; y_neighbor = y_curr + dy;
            if x_neighbor < 1 || x_neighbor > width || y_neighbor < 1 || y_neighbor > height, continue; end
            if ~binary_map(y_neighbor, x_neighbor), continue; end
            tentative_g = g_score(y_curr, x_curr) + move_cost;
            if tentative_g < g_score(y_neighbor, x_neighbor)
                parent_x(y_neighbor, x_neighbor) = x_curr; parent_y(y_neighbor, x_neighbor) = y_curr;
                g_score(y_neighbor, x_neighbor) = tentative_g;
                f_score(y_neighbor, x_neighbor) = tentative_g + heuristic([x_neighbor, y_neighbor], goal);
                if ~closed_map(y_neighbor, x_neighbor), open_list = [open_list; struct('x', x_neighbor, 'y', y_neighbor, 'f', f_score(y_neighbor, x_neighbor))]; end
            end
        end
    end
    path = [];
end

function point = find_nearest_safe_point(point, binary_map, max_radius)
    for radius = 1:max_radius
        for dx = -radius:radius, for dy = -radius:radius
            test_point = round(point + [dx, dy]);
            if is_safe_point(test_point, binary_map), point = test_point; return; end
        end, end
    end
    point = [];
end

function h = heuristic(point1, point2), h = norm(point1 - point2); end

function path = reconstruct_path_improved(parent_x, parent_y, start, goal)
    path = []; x_curr = goal(1); y_curr = goal(2);
    while x_curr ~= start(1) || y_curr ~= start(2)
        path = [x_curr, y_curr; path];
        x_prev = parent_x(y_curr, x_curr); y_prev = parent_y(y_curr, x_curr);
        if x_prev == 0 && y_prev == 0, break; end
        x_curr = x_prev; y_curr = y_prev;
    end
    path = [start; path];
end

function optimized_paths = optimize_with_line_of_sight(paths, binary_map)
    optimized_paths = {};
    for i = 1:length(paths)
        optimized_paths{i} = {};
        for j = 1:length(paths{i})
            path = paths{i}{j};
            if isempty(path), optimized_paths{i}{j} = path;
            else, optimized_paths{i}{j} = line_of_sight_optimization(path, binary_map); end
        end
    end
end

function optimized_path = line_of_sight_optimization(path, binary_map)
    if isempty(path) || size(path, 1) < 3, optimized_path = path; return; end
    optimized_path = path(1,:); current_idx = 1;
    while current_idx < size(path, 1)
        found = false;
        for i = size(path, 1):-1:current_idx+1
            if check_line_safety_enhanced(path(current_idx,:), path(i,:), binary_map)
                if validate_optimized_segment(optimized_path(end,:), path(i,:), binary_map)
                    optimized_path = [optimized_path; path(i,:)]; current_idx = i; found = true; break;
                end
            end
        end
        if ~found, current_idx = current_idx + 1; optimized_path = [optimized_path; path(current_idx,:)]; end
    end
end

function safe = check_line_safety_enhanced(point1, point2, binary_map)
    num_points = max(ceil(norm(point2 - point1)) * 3, 15);
    x_points = linspace(point1(1), point2(1), num_points);
    y_points = linspace(point1(2), point2(2), num_points);
    for i = 1:num_points
        if ~is_safe_point([x_points(i), y_points(i)], binary_map), safe = false; return; end
        if i > 1 && i < num_points
            dx = x_points(i) - x_points(i-1); dy = y_points(i) - y_points(i-1);
            if abs(dx) + abs(dy) > 0
                perpendicular = [-dy, dx] / norm([-dy, dx]);
                for offset = [2, 4]
                    left_point = [x_points(i), y_points(i)] + offset * perpendicular;
                    right_point = [x_points(i), y_points(i)] - offset * perpendicular;
                    if ~is_safe_point(left_point, binary_map) || ~is_safe_point(right_point, binary_map), safe = false; return; end
                end
            end
        end
    end
    safe = true;
end

function valid = validate_optimized_segment(start_point, end_point, binary_map)
    num_points = max(ceil(norm(end_point - start_point)) * 2, 10);
    x_points = linspace(start_point(1), end_point(1), num_points);
    y_points = linspace(start_point(2), end_point(2), num_points);
    for i = 1:num_points
        if ~is_safe_point([x_points(i), y_points(i)], binary_map), valid = false; return; end
    end
    valid = true;
end

function parallel_paths = parallel_expansion(paths, binary_map, offset_distance)
    parallel_paths = {};
    for i = 1:length(paths)
        parallel_paths{i} = {};
        for j = 1:length(paths{i})
            original_path = paths{i}{j};
            if isempty(original_path), parallel_paths{i}{j} ={};
            else, parallel_paths{i}{j} = parallel_expansion_for_path(original_path, binary_map, offset_distance); end
        end
    end
end

function parallel_path_list = parallel_expansion_for_path(original_path, binary_map, offset_distance)
    parallel_path_list = {};
    if size(original_path, 1) < 2, return; end
    for direction = [-1, 1]
        offset = offset_distance * direction; new_path = []; valid_path = true;
        for i = 1:size(original_path, 1)
            if i == 1, segment_vector = original_path(2,:) - original_path(1,:);
            elseif i == size(original_path, 1), segment_vector = original_path(end,:) - original_path(end-1,:);
            else, prev_vector = original_path(i,:) - original_path(i-1,:); next_vector = original_path(i+1,:) - original_path(i,:); segment_vector = (prev_vector + next_vector) / 2;
            end
            if norm(segment_vector) > 0.1, normal_vector = [-segment_vector(2), segment_vector(1)] / norm([-segment_vector(2), segment_vector(1)]);
            else, normal_vector = [1, 0]; end
            new_point = original_path(i,:) + offset * normal_vector; new_point_round = round(new_point);
            if is_safe_point(new_point_round, binary_map), new_path = [new_path; new_point_round];
            else, safe_point = find_nearest_safe_point(new_point_round, binary_map, 5);
                if ~isempty(safe_point), new_path = [new_path; safe_point];
                else, valid_path = false; break; end
            end
        end
        if valid_path && size(new_path, 1) == size(original_path, 1), parallel_path_list{end+1} = new_path; end
    end
end

function safe = check_entire_path_safety(path, binary_map)
    for i = 1:size(path, 1)-1
        if ~check_line_safety_enhanced(path(i,:), path(i+1,:), binary_map)
            safe = false; return;
        end
    end
    safe = true;
end

function length = calculate_path_length(path)
    length = 0;
    for i = 1:size(path,1)-1
        length = length + norm(path(i+1,:) - path(i,:));
    end
end

function safe = is_safe_point(point, binary_map)
    x = round(point(1)); y = round(point(2)); [height, width] = size(binary_map);
    safe = x >= 1 && x <= width && y >= 1 && y <= height && binary_map(y, x) == 1;
end


% --- 关键的可视化函数（已大幅优化） ---
function visualize_results(radar_image, binary_map, planned_route, optimized_paths, parallel_paths, path_info)
    figure('Position', [100, 100, 1500, 1000]);

    % 子图1-4: 保持不变，用于展示中间过程
    subplot(2,3,1); imshow(radar_image); hold on;
    plot(planned_route(:,1), planned_route(:,2), 'g-', 'LineWidth', 3, 'DisplayName', '计划航路');
    plot(planned_route(:,1), planned_route(:,2), 'go', 'MarkerSize', 8, 'MarkerFaceColor', 'g');
    title('模拟雷达天气图和计划航路'); legend('Location', 'best');

    subplot(2,3,2); imagesc(binary_map); colormap(gca, [0.3,0.3,0.3; 1,1,1]); hold on;
    plot(planned_route(:,1), planned_route(:,2), 'g-', 'LineWidth', 3);
    colors = ['r', 'b', 'm', 'c', 'y']; path_count = 0;
    for i = 1:length(optimized_paths)
        for j = 1:length(optimized_paths{i})
            path = optimized_paths{i}{j};
            if ~isempty(path) && size(path, 2) == 2, color_idx = mod(path_count, length(colors)) + 1;
                plot(path(:,1), path(:,2), [colors(color_idx) '-'], 'LineWidth', 2); path_count = path_count + 1;
            end
        end
    end
    title('A* 初始绕飞路径'); axis equal;

    subplot(2,3,3); imagesc(binary_map); colormap(gca, [0.3,0.3,0.3; 1,1,1]); hold on;
    plot(planned_route(:,1), planned_route(:,2), 'g-', 'LineWidth', 3); path_count = 0;
    for i = 1:length(optimized_paths)
        for j = 1:length(optimized_paths{i})
            path = optimized_paths{i}{j};
            if ~isempty(path) && size(path, 2) == 2, color_idx = mod(path_count, length(colors)) + 1;
                optimized_path = line_of_sight_optimization(path, binary_map);
                plot(optimized_path(:,1), optimized_path(:,2), [colors(color_idx) '-'], 'LineWidth', 2);
                plot(optimized_path(:,1), optimized_path(:,2), [colors(color_idx) 'o'], 'MarkerSize', 4); path_count = path_count + 1;
            end
        end
    end
    title('视距优化后路径'); axis equal;

    subplot(2,3,4); imagesc(binary_map); colormap(gca, [0.3,0.3,0.3; 1,1,1]); hold on;
    plot(planned_route(:,1), planned_route(:,2), 'g-', 'LineWidth', 3);
    colors = {'r', 'b', 'm', 'c', 'y', 'k'}; path_count = 0;
    for i = 1:length(parallel_paths)
        for j = 1:length(parallel_paths{i})
            path_group = parallel_paths{i}{j};
            for k = 1:length(path_group)
                path = path_group{k};
                if ~isempty(path) && size(path, 2) == 2 && size(path, 1) >= 2, path_count = path_count + 1;
                    color_idx = mod(path_count - 1, length(colors)) + 1;
                    plot(path(:,1), path(:,2), 'Color', colors{color_idx}, 'LineStyle', '--', 'LineWidth', 2);
                end
            end
        end
    end
    title('平行拓展路径'); axis equal;

    % 子图5: 最终结果 - 完整最短绕飞航路
    subplot(2,3,[5,6]); % 合并两个子图以获得更大的显示空间
    imagesc(binary_map);
    colormap(gca, [0.3,0.3,0.3; 1,1,1]);
    hold on;

    % 绘制危险区域边界
    boundaries = bwboundaries(~binary_map);
    for k = 1:length(boundaries)
        boundary = boundaries{k};
        plot(boundary(:,2), boundary(:,1), 'Color', [1, 0.4, 0.4, 0.7], 'LineWidth', 1);
    end

    % 绘制原始计划航路（半透明虚线，作为对比）
    plot(planned_route(:,1), planned_route(:,2), 'g--', 'LineWidth', 2, 'DisplayName', '原始计划航路');

    % 绘制最终的完整航路
    final_path = path_info.final_path;
    if isfield(path_info, 'final_path') && ~isempty(final_path) && ismatrix(final_path) && size(final_path, 2) == 2 && size(final_path, 1) >= 2
        % 使用醒目的颜色绘制最终路径
        plot(final_path(:,1), final_path(:,2), 'm-', 'LineWidth', 3, 'DisplayName', '最终完整航路');
        plot(final_path(1,1), final_path(1,2), 'o', 'MarkerSize', 10, 'MarkerEdgeColor', 'k', 'MarkerFaceColor', 'g', 'LineWidth', 1.5); % 起点
        plot(final_path(end,1), final_path(end,2), 's', 'MarkerSize', 10, 'MarkerEdgeColor', 'k', 'MarkerFaceColor', 'r', 'LineWidth', 1.5); % 终点

        % 添加路径信息文本
        info_text = {};
        if path_info.is_rerouted
            title_str = '最终完整绕飞航路';
            info_text{1} = sprintf('完整航路长度: %.2f', path_info.final_path_length);
            info_text{2} = sprintf('原始航路长度: %.2f', calculate_path_length(planned_route));
            info_text{3} = sprintf('共找到 %d 条有效绕飞路径', length(path_info.all_valid_paths));
        else
            title_str = '全程安全，无需绕飞';
            info_text{1} = sprintf('航路长度: %.2f (原始计划航路)', path_info.final_path_length);
        end
        title(title_str, 'FontSize', 14);
        text(10, 20, info_text, 'FontSize', 12, 'FontWeight', 'bold', 'BackgroundColor', [1,1,1,0.7], 'VerticalAlignment', 'top');

    else
        title('未能生成有效的最终航路', 'Color', 'r');
    end

    legend('Location', 'best');
    axis equal;
    hold off;
end
```


![](/uploads/csdn/基于a算法的雷雨绕飞路径matlab实现/img-02.jpeg)


![](/uploads/csdn/基于a算法的雷雨绕飞路径matlab实现/img-03.jpeg)![](/uploads/csdn/基于a算法的雷雨绕飞路径matlab实现/img-04.jpeg)


![](/uploads/csdn/基于a算法的雷雨绕飞路径matlab实现/img-05.jpeg)![](/uploads/csdn/基于a算法的雷雨绕飞路径matlab实现/img-06.jpeg)


![](/uploads/csdn/基于a算法的雷雨绕飞路径matlab实现/img-07.jpeg)


![](/uploads/csdn/基于a算法的雷雨绕飞路径matlab实现/img-08.jpeg)


![](/uploads/csdn/基于a算法的雷雨绕飞路径matlab实现/img-09.jpeg)


![](/uploads/csdn/基于a算法的雷雨绕飞路径matlab实现/img-10.jpeg)![](/uploads/csdn/基于a算法的雷雨绕飞路径matlab实现/img-11.jpeg)![](/uploads/csdn/基于a算法的雷雨绕飞路径matlab实现/img-12.jpeg)![](/uploads/csdn/基于a算法的雷雨绕飞路径matlab实现/img-13.jpeg)


![](/uploads/csdn/基于a算法的雷雨绕飞路径matlab实现/img-14.jpeg)
