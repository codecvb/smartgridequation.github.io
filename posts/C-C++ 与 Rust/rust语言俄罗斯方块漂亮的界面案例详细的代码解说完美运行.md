---
title: Rust语言俄罗斯方块漂亮的界面案例详细的代码解说完美运行
slug: rust语言俄罗斯方块漂亮的界面案例详细的代码解说完美运行
category: C/C++ 与 Rust
summary: tetris-demo A Tetris example written in Rust using Piston in under 500 lines of code
tags: C/C++, Rust
---

tetris-demo A Tetris example written in Rust using Piston in under 500 lines of code


项目地址: https://gitcode.com/gh\_mirrors/te/tetris-demo


#### 项目介绍


"Tetris Example in Rust, v2" 是一个用Rust语言编写的俄罗斯方块游戏示例。这个项目不仅是一个简单的游戏实现，更是一个展示Rust编程基础的绝佳范例。通过414行代码，开发者可以深入了解Rust的基本语法和编程思想。此外，项目还提供了一个清晰的Git历史记录，展示了功能的逐步迭代过程，非常适合初学者和有经验的开发者学习参考。


![](/uploads/csdn/rust语言俄罗斯方块漂亮的界面案例详细的代码解说完美运行/img-01.gif)


完整代码


```rust
use piston_window::{WindowSettings, PistonWindow, Event, RenderEvent, PressEvent};
use piston_window::{Rectangle, DrawState, Context, Graphics};
use piston_window::{Button, Key};

use rand::Rng;

use std::time::{Duration, Instant};
use std::collections::HashMap;

enum DrawEffect<'a> {
    None,
    Darker,
    Flash(&'a Vec<i8>),
}

#[derive(Copy, Clone)]
enum Color {
    Red, Green, Blue, Magenta, Cyan, Yellow, Orange,
}

#[derive(Default, Clone)]
struct Board(HashMap<(i8, i8), Color>);

impl Board {
    fn new(v: &[(i8, i8)], color: Color) -> Self {
        Board(v.iter().cloned().map(|(x, y)| ((x, y), color)).collect())
    }

    fn modified<F>(&self, f: F) -> Self
        where F: Fn((i8, i8)) -> (i8, i8)
    {
        Board(self.0.iter().map(|((x, y), color)| (f((*x, *y)), *color)).collect())
    }

    fn modified_filter<F>(&self, f: F) -> Self
        where F: Fn((i8, i8)) -> Option<(i8, i8)>
    {
        Board(self.0.iter()
            .filter_map(|((x, y), color)| f((*x, *y)).map(|p| (p, *color)))
            .collect())
    }

    fn transposed(&self) -> Self {
        self.modified(|(ox, oy)| (oy, ox))
    }

    fn mirrored_y(&self) -> Self {
        self.modified(|(ox, oy)| (ox, -oy))
    }

    fn rotated(&self) -> Self {
        self.mirrored_y().transposed()
    }

    fn rotated_counter(&self) -> Self {
        self.rotated().rotated().rotated()
    }

    fn negative_shift(&self) -> (i8, i8) {
        use std::cmp::min;

        self.0.keys().into_iter().cloned()
            .fold((0, 0), |(mx, my), (ox, oy)| (min(mx, ox), min(my, oy)))
    }

    fn shifted(&self, (x, y): (i8, i8)) -> Self {
        self.modified(|(ox, oy)| (ox + x, oy + y))
    }

    fn merged(&self, other: &Board) -> Option<Self> {
        let mut hashmap = HashMap::new();
        hashmap.extend(other.0.iter());
        hashmap.extend(self.0.iter());

        if hashmap.len() != self.0.len() + other.0.len() {
            return None;
        }

        Some(Self(hashmap))
    }

    fn contained(&self, x: i8, y: i8) -> bool {
        self.0.keys().into_iter().cloned()
            .fold(true, |b, (ox, oy)| b && ox < x && oy < y && ox >= 0 && oy >= 0)
    }

    fn whole_lines(&self, x: i8, y: i8) -> Vec<i8> {
        let mut idxs = vec![];
        for oy in 0 .. y {
            if (0 .. x).filter_map(|ox| self.0.get(&(ox, oy))).count() == x as usize {
                idxs.push(oy)
            }
        }

        idxs
    }

    fn kill_line(&self, y: i8) -> Self {
        self.modified_filter(|(ox, oy)|
            if oy > y {
                Some((ox, oy))
            } else if oy == y {
                None
            } else {
                Some((ox, oy + 1))
            }
        )
    }

    fn render<'a, G>(
        &self,
        metrics: &Metrics,
        c: &Context,
        g: &mut G,
        draw_effect: DrawEffect<'a>,
    )
        where G: Graphics
    {
        let mut draw = |color, rect: [f64; 4]| {
            Rectangle::new(color).draw(rect, &DrawState::default(), c.transform, g);
        };

        for x in 0 .. metrics.board_x {
            for y in 0 .. metrics.board_y {
                let block_pixels = metrics.block_pixels as f64;
                let border_size = block_pixels / 20.0;
                let outer = [block_pixels * (x as f64), block_pixels * (y as f64), block_pixels, block_pixels];
                let inner = [outer[0] + border_size, outer[1] + border_size,
                outer[2] - border_size * 2.0, outer[3] - border_size * 2.0];

                draw([0.2, 0.2, 0.2, 1.0], outer);
                draw([0.1, 0.1, 0.1, 1.0], inner);

                if let Some(color) = self.0.get(&(x as i8, y as i8)) {
                    let code = match color {
                        Color::Red     => [1.0, 0.0, 0.0, 1.0],
                        Color::Green   => [0.0, 1.0, 0.0, 1.0],
                        Color::Blue    => [0.5, 0.5, 1.0, 1.0],
                        Color::Magenta => [1.0, 0.0, 1.0, 1.0],
                        Color::Cyan    => [0.0, 1.0, 1.0, 1.0],
                        Color::Yellow  => [1.0, 1.0, 0.0, 1.0],
                        Color::Orange  => [1.0, 0.5, 0.0, 1.0],
                    };
                    draw(code, outer);
                    let code = [code[0]*0.8, code[1]*0.8, code[2]*0.8, code[3]];
                    draw(code, inner);
                }

                match draw_effect {
                    DrawEffect::None => {},
                    DrawEffect::Flash(lines) => {
                        if lines.contains(&(y as i8)) {
                            draw([1.0, 1.0, 1.0, 0.5], outer);
                        }
                    }
                    DrawEffect::Darker => {
                        draw([0.0, 0.0, 0.0, 0.9], outer);
                    }
                }
            }
        }
    }
}

#[derive(Default)]
struct Metrics {
    block_pixels: usize,
    board_x: usize,
    board_y: usize,
}

impl Metrics {
    fn resolution(&self) -> [u32; 2] {
        [(self.board_x * self.block_pixels) as u32,
         (self.board_y * self.block_pixels) as u32]
    }
}

enum State {
    Flashing(isize, Instant, Vec<i8>),
    Falling(Board),
    GameOver,
}

struct Game {
    board: Board,
    metrics: Metrics,
    state: State,
    shift: (i8, i8),
    possible_pieces: Vec<Board>,
    time_since_fall: Instant,
}

impl Game {
    fn new(metrics: Metrics) -> Self {
        Self {
            metrics,
            board: Default::default(),
            state: State::Falling(Default::default()),
            time_since_fall: Instant::now(),
            shift: (0, 0),
            possible_pieces: vec![
                Board::new(&[(0, 0), (0, 1), (1, 0), (1, 1), ][..], Color::Red),
                Board::new(&[(0, 0), (1, 0), (1, 1), (2, 0), ][..], Color::Green),
                Board::new(&[(0, 0), (1, 0), (2, 0), (3, 0), ][..], Color::Blue),
                Board::new(&[(0, 0), (1, 0), (2, 0), (0, 1), ][..], Color::Orange),
                Board::new(&[(0, 0), (1, 0), (2, 0), (2, 1), ][..], Color::Yellow),
                Board::new(&[(0, 0), (1, 0), (1, 1), (2, 1), ][..], Color::Cyan),
                Board::new(&[(1, 0), (2, 0), (0, 1), (1, 1), ][..], Color::Magenta),
            ]
        }
    }

    fn new_falling(&mut self) {
        let mut rng = rand::thread_rng();
        let idx = rng.gen_range(0, self.possible_pieces.len());

        self.state = State::Falling(self.possible_pieces[idx].clone());
        self.shift = (0, 0);

        if self.board.merged(&self.falling_shifted()).is_none() {
            self.state = State::GameOver;
        } else {
            for _ in 0 .. rng.gen_range(0, 4usize) {
                self.rotate(false)
            }
        }
    }

    fn render(&self, window: &mut PistonWindow, event: &Event) {
        window.draw_2d(event, |c, g, _| {
           let (board, draw_effect) = match &self.state {
                State::Flashing(stage, _, lines) => {
                    let draw_effect = if *stage % 2 == 0 {
                        DrawEffect::None
                    } else {
                        DrawEffect::Flash(lines)
                    };
                    (self.board.clone(), draw_effect)
                }
                State::GameOver => (self.board.clone(), DrawEffect::Darker),
                State::Falling(_) => (
                    self.board.merged(&self.falling_shifted()).unwrap(), DrawEffect::None),
            };

            board.render(&self.metrics, &c, g, draw_effect);
        });
    }

    fn falling_shifted(&self) -> Board {
        match &self.state {
            State::Falling(state_falling) => {
                state_falling.shifted(self.shift)
            }
            State::GameOver { ..  } => panic!(),
            State::Flashing { ..  } => panic!(),
        }
    }

    fn progress(&mut self) {
        match &mut self.state {
            State::Falling(_) => {
                if self.time_since_fall.elapsed() <= Duration::from_millis(700) {
                    return;
                }

                self.move_falling(0, 1);
                self.time_since_fall = Instant::now();
            }
            State::Flashing(stage, last_stage_switch, lines) => {
                if last_stage_switch.elapsed() <= Duration::from_millis(50) {
                    return;
                }

                if *stage < 18 {
                    *stage += 1;
                    *last_stage_switch = Instant::now();
                    return;
                } else {
                    for idx in lines {
                        self.board = self.board.kill_line(*idx);
                    }
                    self.new_falling()
                }
            }
            State::GameOver { } => {},
        }
    }

    fn move_falling(&mut self, x: i8, y: i8) {
        let falling = self.falling_shifted().shifted((x, y));
        let merged = self.board.merged(&falling);
        let contained = falling.contained(self.metrics.board_x as i8,
                                          self.metrics.board_y as i8);

        if merged.is_some() && contained {
            // Allow the movement
            self.shift.0 += x;
            self.shift.1 += y;
            return
        }

        if let (0, 1) = (x, y) {
            self.board = self.board.merged(&self.falling_shifted()).unwrap();
            let completed = self.board.whole_lines(self.metrics.board_x as i8,
                self.metrics.board_y as i8);
            if completed.is_empty() {
                self.new_falling();
            } else {
                self.state = State::Flashing(0, Instant::now(), completed);
            }
        }
    }

    fn on_press(&mut self, args: &Button) {
        match args {
            Button::Keyboard(key) => { self.on_key(key); }
            _ => {},
        }
    }

    fn on_key(&mut self, key: &Key) {
        match &mut self.state {
            State::Flashing {..} => {},
            State::Falling {..} => {
                let movement = match key {
                    Key::Right => Some((1, 0)),
                    Key::Left => Some((-1, 0)),
                    Key::Down => Some((0, 1)),
                    _ => None,
                };

                if let Some(movement) = movement {
                    self.move_falling(movement.0, movement.1);
                    return;
                }

                match key {
                    Key::Up => self.rotate(false),
                    Key::NumPad5 => self.rotate(true),
                    _ => return,
                }
            }
            State::GameOver { } => {
                match key {
                    Key::Return => {
                        self.board.0.clear();
                        self.new_falling();
                    },
                    _ => return,
                }
            },
        }
    }

    fn rotate(&mut self, counter: bool) {
        match &mut self.state {
            State::Falling(state_falling) => {
                let rotated = if counter {
                    state_falling.rotated()
                } else {
                    state_falling.rotated_counter()
                };
                let (x, y) = rotated.negative_shift();
                let falling = rotated.shifted((-x, -y));

                for d in &[(0, 0), (-1, 0)] {
                    let mut shift = self.shift;
                    shift.0 += d.0;
                    shift.1 += d.1;

                    if let Some(merged) = self.board.merged(&falling.shifted(shift)) {
                        if merged.contained(self.metrics.board_x as i8,
                            self.metrics.board_y as i8)
                        {
                            // Allow the rotation
                            *state_falling = falling;
                            self.shift = shift;
                            return
                        }
                    }
                }
            }
            State::GameOver {..} => panic!(),
            State::Flashing {..} => panic!(),
        }
    }
}

fn main() {
    let metrics = Metrics {
        block_pixels: 20,
        board_x: 8,
        board_y: 20,
    };

    let mut window: PistonWindow = WindowSettings::new(
        "Tetris", metrics.resolution()).exit_on_esc(true).build().unwrap();
    let mut game = Game::new(metrics);

    game.new_falling();

    while let Some(e) = window.next() {
        game.progress();

        if let Some(_) = e.render_args() {
            game.render(&mut window, &e);
        }

        if let Some(args) = e.press_args() {
            game.on_press(&args);
        }
    }
}
```


以下是将上述代码拆分为几段并分别给出注释的内容：


#### 1\. 导入相关库和模块


rust


```rust
// 导入 `piston_window` 库中的相关模块，用于创建游戏窗口、处理事件、图形绘制等功能
use piston_window::{WindowSettings, PistonWindow, Event, RenderEvent, PressEvent};
use piston_window::{Rectangle, DrawState, Context, Graphics};
use piston_window::{Button, Key};

// 导入 `rand` 库，用于生成随机数
use rand::Rng;

// 导入标准库中用于处理时间的模块
use std::time::{Duration, Instant};
// 导入标准库中用于处理哈希表数据结构的模块
use std::collections::HashMap;
```


这段代码主要是导入了实现俄罗斯方块游戏所需的各种库和模块。`piston_window`相关模块用于创建游戏窗口、处理窗口事件以及进行图形绘制等操作。`rand`库用于生成随机数，以便在游戏中随机生成方块形状等。`std::time`中的`Duration`和`Instant`用于处理时间相关的操作，比如控制方块下落的时间间隔等。`HashMap`则用于存储游戏板上方块的位置和颜色等信息。


#### 2\. 定义绘制效果和颜色枚举


rust


```rust
// `DrawEffect` 枚举定义了绘制方块时可能的效果
// `'a` 是生命周期参数，用于确保引用的有效性
enum DrawEffect<'a> {
    // 无特殊绘制效果
    None,
    // 使方块颜色变深的绘制效果
    Darker,
    // 使指定行的方块闪烁的绘制效果，接受一个 `i8` 类型向量的引用
    Flash(&'a Vec<i8>),
}

// `Color` 枚举定义了方块可能的颜色
#[derive(Copy, Clone)]
enum Color {
    Red, Green, Blue, Magenta, Cyan, Yellow, Orange,
}
```


这里定义了两个枚举类型。`DrawEffect`枚举用于指定在绘制游戏板上的方块时可能采用的不同效果，比如无效果、颜色变深或者使某些行的方块闪烁等。`Color`枚举则明确了方块可能出现的各种颜色，以便在游戏中区分不同的方块形状或状态。


#### 3\. 定义游戏板结构体及相关方法


rust


```rust
// `Board` 结构体用于表示游戏板的状态
// 它包含一个 `HashMap`，用于存储游戏板上每个方块的位置（以 `(i8, i8)` 坐标表示）和对应的颜色
#[derive(Default, Clone)]
struct Board(HashMap<(i8, i8), Color>);

// `Board` 结构体的实现块，包含了一系列处理游戏板相关操作的方法
impl Board {
    // `new` 方法用于创建一个新的 `Board` 实例
    // 接受一个坐标切片 `v` 和一个颜色 `color`，将每个坐标位置设置为指定的颜色
    fn new(v: &[(i8, i8)], color: Color) -> Self {
        Board(v.iter().cloned().map(|(x, y)| ((x, y), color)).collect())
    }

    // `modified` 方法根据传入的函数 `f` 对游戏板上的每个方块位置进行变换
    // `f` 函数接受一个坐标并返回一个新的坐标，用于修改方块在游戏板上的位置
    fn modified<F>(&self, f: F) -> Self
        where F: Fn((i8, i8)) -> (i8, i8)
    {
        Board(self.0.iter().map(|((x, y), color)| (f((*x, *y)), *color)).collect())
    }

    // `modified_filter` 方法根据传入的函数 `f` 对游戏板上的方块位置进行过滤和变换
    // `f` 函数接受一个坐标并返回一个可选的新坐标，如果返回 `Some`，则保留该方块并应用变换；如果返回 `None`，则移除该方块
    fn modified_filter<F>(&self, f: F) -> Self
        where F: Fn((i8, i8)) -> Option<(i8, i8)>
    {
        Board(self.0.iter()
          .filter_map(|((x, y), color)| f((*x, y)).map(|p| (p, *color)))
          .collect())
    }

    // `transposed` 方法用于对游戏板进行转置操作，即将 `x` 与 `y` 坐标互换
    fn transposed(&self) -> Self {
        self.modified(|(ox, oy)| (oy, ox))
    }

    // `mirrored_y` 方法用于对游戏板在 `y` 轴上进行镜像翻转操作，即将 `y` 坐标取反
    fn mirrored_y(&self) -> Self {
        self.modified(|(ox, oy)| (ox, -oy))
    }

    // `rotated` 方法用于对游戏板进行顺时针旋转操作
    // 先在 `y` 轴上镜像翻转，然后再进行转置操作来实现旋转效果
    fn rotated(&self) -> Self {
        self.mirrored_y().transposed()
    }

    // `rotated_counter` 方法用于对游戏板进行逆时针旋转操作
    // 通过连续三次调用 `rotated` 方法来实现逆时针旋转效果
    fn rotated_counter(&self) -> Self {
        self.rotated().rotated().rotated()
    }

    // `negative_shift` 方法用于获取游戏板上所有方块位置的最小 `x` 和 `y` 坐标值
    // 返回一个 `(i8, i8)` 类型的元组，表示最小的偏移量
    fn negative_shift(&self) -> (i8, i8) {
        use std::cmp::min;

        self.0.keys().into_iter().cloned()
          .fold((0, 0), |(mx, my), (ox, oy)| (min(mx, ox), min(my, oy)))
    }

    // `shifted` 方法用于根据传入的偏移量 `(x, y)` 对游戏板上的所有方块位置进行平移操作
    fn shifted(&self, (x, y): (i8, y)) -> Self {
        self.modified(|(ox, oy)| (ox + x, oy + y))
    }

    // `merged` 方法用于将当前游戏板与另一个游戏板 `other` 进行合并操作
    // 如果合并后的哈希表长度不等于两个游戏板原来哈希表长度之和，说明有位置冲突，返回 `None`；否则返回合并后的新游戏板 `Some(Self)`
    fn merged(&self, other: &Board) -> Option<Self> {
        let mut hashmap = HashMap::new();
        hashmap.extend(other.0.iter());
        hashmap.extend(self.0.iter());

        if hashmap.len()!= self.0.len() + other.0.len() {
            return None;
        }

        Some(Self(hashmap))
    }

    // `contained` 方法用于检查给定的坐标 `(x, y)` 是否在游戏板的有效范围内
    // 如果所有方块的坐标都满足小于 `x` 且小于 `y`，且大于等于 `0`，则返回 `true`，否则返回 `false`
    fn contained(&self, x: i8, y: i8) -> bool {
        self.0.keys().into_iter().cloned()
          .fold(true, |b, (ox, oy)| b && ox < x && oy < y && ox >= 0 && oy >= 0)
    }

    // `whole_lines` 方法用于查找游戏板上给定范围内完整的行
    // 遍历 `y` 坐标从 `0` 到 `y - 1` 的行，对于每一行，如果该行在 `x` 坐标从 `0` 到 `x - 1` 的范围内所有方块都存在（通过 `filter_map` 和 `count` 来判断），则将该行的 `y` 坐标添加到结果向量中
    fn whole_lines(&self, x: i8, y: i8) -> Vec<i8> {
        let mut idxs = vec![];
        for oy in 0.. y {
            if (0.. x).filter_map(|ox| self.0.get(&(ox, oy))).count() == x as usize {
                idxs.push(oy)
            }
        }

        idxs
    }

    // `kill_line` 方法用于清除游戏板上指定的行 `y`
    // 通过 `modified_filter` 方法根据条件对游戏板上的方块位置进行过滤，保留不在指定行 `y` 的方块，并将在指定行上方的方块 `y` 坐标加 `1`，从而实现清除行的效果
    fn kill_line(&self, y: i8) -> Self {
        self.modified_filter(|(ox, oy)|
            if oy > y {
                Some((ox, oy))
            } else if oy == y {
                None
            } else {
                Some((ox, oy + 1))
            }
        )
    }

    // `render` 方法用于在给定的图形上下文 `c` 和图形绘制对象 `g` 下，根据指定的绘制效果 `draw_effect` 绘制游戏板
    // 遍历游戏板的每个方块位置，根据是否有方块以及方块的颜色，按照不同的绘制效果进行绘制操作
    fn render<'a, G>(
        &self,
        metrics: &Metrics,
        c: &Context,
        g: &mut G,
        draw_effect: DrawEffect<'a>,
    )
        where G: Graphics
    {
        let mut draw = |color, rect: [f64; 4]| {
            Rectangle::new(color).draw(rect, &DrawState::default(), c.transform, g);
        };

        for x in 0.. metrics.board_x {
            for y in 0.. metrics.board_y {
                let block_pixels = metrics.block_pixels as f64;
                let border_size = block_pixels / 20.0;
                let outer = [block_pixels * (x as f64), block_pixels * (y as f64), block_pixels, block_pixels];
                let inner = [outer[0] + border_size, outer[1] + border_size,
                outer[2] - border_size * 2.0, outer[3] - border_size * 2.0];

                draw([0.2, 0.2, 0.2, 1.0], outer);
                draw([0.1, 0.1, 0.1, 1.0], inner);

                if let Some(color) = self.0.get(&(x as i8, y as i8)) {
                    let code = match color {
                        Color::Red     => [1.0, 0.0, 0.0, 1.0],
                        Color::Green   => [0.0, 1.0, 0.0, 1.0],
                        Color::Blue    => [0.5, 0.5, 1.0, 1.0],
                        Color::Magenta => [1.0, 0.0, 1.0, 1.0],
                        Color::Cyan    => [0.0, 1.0, 1.0, 1.0],
                        Color::Yellow  => [1.0, 1.0, 0.0, 1.0],
                        Color::Orange  => [1.0, 0.5, 0.0, 1.0],
                    };
                    draw(code, outer);
                    let code = [code[0]*0.8, code[1]*0.8, code[2]*0.8, code[3]];
                    draw(code, inner);
                }

                match draw_effect {
                    DrawEffect::None => {},
                    DrawEffect::Flash(lines) => {
                        if lines.contains(&(y as i8)) {
                            draw([1.0, 1.0, 1.0, 0.5], outer);
                        }
                    }
                    DrawEffect::Darker => {
                        draw([0.0, 0.0, 0.0, 0.9], outer);
                    }
                }
            }
        }
    }
}
```


这部分代码定义了`Board`结构体来表示游戏板的状态，其中使用`HashMap`存储每个方块在游戏板上的位置和对应的颜色。同时，为`Board`结构体实现了一系列方法，用于对游戏板进行各种操作，比如创建新的游戏板实例、对游戏板上的方块位置进行变换（平移、旋转、翻转等）、合并两个游戏板、检查坐标是否在游戏板范围内、查找完整的行以及清除指定行等，并且还实现了绘制游戏板的方法，根据不同的绘制效果和方块颜色进行绘制。


#### 4\. 定义游戏度量结构体及相关方法


rust


```rust
// `Metrics` 结构体用于存储游戏的一些度量信息，如每个方块的像素大小、游戏板的行数和列数等
#[derive(Default)]
struct Metrics {
    block_pixels: usize,
    board_x: usize,
    board_y: usize,
}

// `Metrics` 结构体的实现块，包含了一个用于计算游戏窗口分辨率的方法
impl Metrics {
    // `resolution` 方法根据游戏板的行数、列数和每个方块的像素大小计算并返回游戏窗口的分辨率，以 `[u32; 2]` 类型的数组表示（分别为宽度和高度）
    fn resolution(&self) -> [u32; 2] {
        [(self.board_x * self.block_pixels) as u32,
         (self.board_y * self.block_pixels) as u32]
    }
}
```


这里定义了`Metrics`结构体，用于存储游戏相关的度量信息，比如每个方块在屏幕上显示的像素大小、游戏板的行数和列数等。并且为该结构体实现了`resolution`方法，用于根据存储的度量信息计算并返回游戏窗口的分辨率，以便后续创建合适大小的游戏窗口。


#### 5\. 定义游戏状态枚举和游戏结构体及相关方法


rust


```rust
// `State` 枚举用于表示游戏的不同状态
enum State {
    // 闪烁状态，用于处理满行消除时的闪烁效果
    // 包含当前闪烁阶段（`isize` 类型）、上次阶段切换的时间点（`Instant` 类型）以及需要闪烁的行索引向量（`Vec<i8>` 类型）
    Flashing(isize, Instant, Vec<i8>),
    // 方块下落状态，包含当前正在下落的方块信息（`Board` 类型）
    Falling(Board),
    // 游戏结束状态
    GameOver,
}

// `Game` 结构体用于表示整个游戏的状态和逻辑
struct Game {
    // 游戏板对象，用于存储游戏板的当前状态
    board: Board,
    // 游戏度量信息对象，用于存储游戏的相关度量参数
    metrics: Metrics,
    // 当前游戏状态，使用 `State` 枚举表示
    state: State,
    // 方块在游戏板上的偏移量，以 `(i8, i8)` 坐标表示
    shift: (i8, i8),
    // 可能出现的方块形状列表，每个元素都是一个 `Board` 类型，表示不同形状的方块
    possible_pieces: Vec<Board>,
    // 记录上次方块下落的时间点，用于控制方块下落的速度
    time_since_fall: Instant,
}

// `Game` 结构体的实现块，包含了一系列处理游戏逻辑的方法
impl Game {
    // `new` 方法用于创建一个新的 `Game` 实例
    // 接受一个 `Metrics` 类型的参数，用于初始化游戏的度量信息，并设置游戏板、状态、偏移量等初始值
    fn new(metrics: Metrics) -> Self {
        Self {
            metrics,
            board: Default::default(),
            state: State::Falling(Default::default()),
            time_since_fall: Instant::now(),
            shift: (0, 0),
            possible_pieces: vec![
                Board::new(&[(0, 0), (0, 1), (1, 0), (1, 1), ][..], Color::Red),
                Board::new(&[(0, 0), (1, 0), (1, 1), (2, 0), ][..], Color::Green),
                Board::new(&[(0, 0), (1, 0), (2, 0), (3, 0), ][..], Color::Blue),
                Board::new(&[(0, 0), (1, 0), (2, 0), (0, 1), ][..], Color::Orange),
                Board::new(&[(0, 0), (1, 0), (2, 0), (2, 1), ][..], Color::Yellow),
                Board::new(&[(0, 0), (1, 0), (1, 1), (2, 1), ][..], Color::Cyan),
                Board::new(&[(1, 0), (2, 0), (0, 1), (1, 1), ][..], Color::Magenta),
            ]
        }
    }

    // `new_falling` 方法用于生成一个新的下落方块
    // 通过随机数生成器选择一个可能的方块形状，并设置为当前下落状态
    // 如果当前游戏
```


#### 6. `Game`结构体相关方法


rust


```rust
// `falling_shifted` 方法用于获取当前下落状态下经过偏移后的方块信息
// 根据当前游戏状态中的下落方块和偏移量，返回偏移后的方块
// 如果当前状态不是下落状态，则触发 `panic!`，表示程序出现错误情况
fn falling_shifted(&self) -> Board {
    match &self.state {
        State::Falling(state_falling) => {
            state_falling.shifted(self.shift)
        }
        State::GameOver {..  } => panic!(),
        State::Flashing {..  } => panic!(),
    }
}
```


**作用**：


-   此方法的目的是根据游戏当前状态获取经过偏移后的正在下落的方块信息。它通过匹配当前游戏状态，如果处于`Falling`状态，就利用`Board`结构体的`shifted`方法对下落方块按照当前的偏移量`self.shift`进行偏移操作，从而得到准确位置的下落方块。
-   若当前状态不是`Falling`状态（如`GameOver`或`Flashing`状态），则触发`panic!`，这是因为该方法假设只有在方块处于下落状态时才会被调用以获取正确偏移后的方块，其他状态下调用此方法是不符合预期逻辑的，所以通过`panic!`来提示程序出现了错误情况。


rust


```rust
// `progress` 方法用于推进游戏的进程，根据当前游戏状态执行不同的操作
fn progress(&mut self) {
    match &mut self.state {
        State::Falling(_) => {
            if self.time_since_fall.elapsed() <= Duration::from_millis(700) {
                return;
            }

            self.move_falling(0, 1);
            self.time_since_fall = Instant::now();
        }
        State::Flashing(stage, last_stage_switch, lines) => {
            if last_stage_switch.elapsed() <= Duration::from_millis(50) {
                return;
            }

            if *stage < 18 {
                *stage += 1;
                *last_stage_switch = Instant::now();
                return;
            } else {
                for idx in lines {
                    self.board = self.board.kill_line(*idx);
                }
                self.new_falling();
            }
        }
        State::GameOver { } => {},
    }
}
```


**作用**：


-   该方法是游戏逻辑的核心部分之一，用于根据游戏当前所处的不同状态来推进游戏进程。
-   当游戏处于`Falling`状态时，它首先检查从上一次方块下落至今所经过的时间是否小于等于 700 毫秒，如果是，则直接返回，不进行任何操作，这是为了控制方块下落的速度，避免下落过快。若时间超过了限制，就调用`move_falling`方法让方块向下移动一格（传入参数`(0, 1)`表示在`x`方向移动 0 格，在`y`方向移动 1 格），然后更新`time_since_fall`为当前时间，以便下一次准确计算方块下落间隔时间。
-   当游戏处于`Flashing`状态时，它先检查从上一次阶段切换至今所经过的时间是否小于等于 50 毫秒，如果是则返回。若超过了限制，并且当前闪烁阶段`*stage`小于 18，就将闪烁阶段加 1，并更新`last_stage_switch`为当前时间，继续进行闪烁效果的展示。而当闪烁阶段达到 18 时，意味着闪烁效果结束，此时会遍历需要闪烁的行索引`lines`，通过调用`board`的`kill_line`方法清除这些行，然后调用`new_falling`方法生成一个新的下落方块，继续游戏流程。
-   当游戏处于`GameOver`状态时，此方法不执行任何操作，因为游戏已经结束，无需再进行其他逻辑处理。


rust


```rust
// `move_falling` 方法用于移动正在下落的方块
fn move_falling(&mut self, x: i8, y: i8) {
    let falling = self.falling_shifted().shifted((x, y));
    let merged = self.board.merged(&falling);
    let contained = falling.contained(self.metrics.board_x as i8,
                                      self.metrics.board_y as i8);

    if merged.is_some() && contained {
        // Allow the movement
        self.shift.0 += x;
        self.shift.1 += y;
        return
    }

    if let (0, 1) = (x, y) {
        self.board = self.board.merged(&self.falling_shifted()).unwrap();
        let completed = self.board.whole_lines(self.metrics.board_x as i8,
            self.metrics.board_y as i8);
        if completed.is_empty() {
            self.new_falling();
        } else {
            self.state = State::Flashing(0, Instant::now(), completed);
        }
    }
}
```


**作用**：


-   此方法用于处理正在下落的方块的移动操作。首先，它通过`falling_shifted`方法获取当前经过偏移的下落方块，然后再根据传入的参数`(x, y)`对该方块进行进一步的偏移操作，得到新的下落方块位置`falling`。
-   接着，它检查新位置的方块能否与游戏板`self.board`进行合并（通过`merged`方法）以及是否在游戏板的有效范围内（通过`contained`方法）。如果这两个条件都满足，说明方块可以移动到新位置，那么就更新方块在游戏板上的偏移量`self.shift`，完成方块的移动操作并返回。
-   如果传入的参数`(x, y)`是`(0, 1)`，表示方块是向下移动一格，此时会先将当前下落方块与游戏板进行合并（通过`merged`方法获取合并后的游戏板），然后检查游戏板上是否有完整的行（通过`whole_lines`方法）。如果没有完整的行，就调用`new_falling`方法生成一个新的下落方块继续游戏；如果有完整的行，就将游戏状态设置为`Flashing`状态，并传入当前时间和需要闪烁的行索引，开始处理满行消除的闪烁效果。


rust


```rust
// `on_press` 方法用于处理按键按下事件，根据按下的按钮类型进行不同的处理
fn on_press(&mut self, args: &Button) {
    match args {
        Button::Keyboard(key) => { self.on_key(key); }
        _ => {},
    }
}
```


**作用**：


-   该方法是游戏处理输入事件的入口点之一，用于接收一个`Button`类型的参数，表示按下的按钮信息。它通过匹配按钮类型，如果是键盘按钮（`Button::Keyboard`），就调用`on_key`方法进一步处理具体的键盘按键操作；如果不是键盘按钮，则不进行任何操作，直接返回。


rust


```rust
// `on_key` 方法用于处理具体的键盘按键操作，根据当前游戏状态和按下的键盘按键执行不同的操作
fn on_key(&mut self, key: &Key) {
    match &mut self.state {
        State::Flashing {..} => {},
        State::Falling {..} => {
            let movement = match key {
                Key::Right => Some((1, 0)),
                Key::Left => Some((-1, 0)),
                Key::Down => Some((0, 1)),
                _ => None,
            };

            if let Some(movement) = movement {
                self.move_falling(movement.0, movement.1);
                return;
            }

            match key {
                Key::Up => self.rotate(false),
                Key::NumPad5 => self.rotate(true),
                _ => return,
            }
        }
        State::GameOver { } => {
            match key {
                Key::Return => {
                    self.board.0.clear();
                    self.new_falling();
                },
                _ => return,
            }
        },
    }
}
```


**作用**：


-   此方法根据当前游戏状态和按下的具体键盘按键来执行相应的游戏操作。
-   当游戏处于`Flashing`状态时，不执行任何操作，因为在满行消除闪烁期间，通常不希望玩家进行其他操作干扰闪烁效果的处理。
-   当游戏处于`Falling`状态时，首先通过匹配按下的键盘按键来确定方块的移动方向或旋转操作。如果按下的是`Key::Right`、`Key::Left`或`Key::Down`，就分别对应方块向右、向左或向下移动一格的操作，通过调用`move_falling`方法并传入相应的移动参数来实现方块的移动。如果按下的是`Key::Up`或`Key::NumPad5`，则分别对应方块的逆时针或顺时针旋转操作，通过调用`rotate`方法并传入相应的旋转方向参数来实现方块的旋转。
-   当游戏处于`GameOver`状态时，只有当按下`Key::Return`键时，会清除游戏板上的所有方块（通过`board.0.clear()`），然后调用`new_falling`方法生成一个新的下落方块，重新开始游戏；按下其他键则不执行任何操作，直接返回。


rust


```rust
// `rotate` 方法用于旋转正在下落的方块
fn rotate(&mut self, counter: bool) {
    match &mut self.state {
        State::Falling(state_falling) => {
            let rotated = if counter {
                state_falling.rotated()
            } else {
                state_falling.rotated_counter()
            }
            let (x, y) = rotated.negative_shift();
            let falling = rotated.shifted((-x, -y));

            for d in &[(0, 0), (-1, 0)] {
                let mut shift = self.shift;
                shift.0 += d.0;
                shift.1 += d.1;

                if let Some(merged) = self.board.merged(&falling.shifted(shift)) {
                    if merged.contained(self.metrics.board_x as i8,
                        self.metrics.board_y as i8)
                    {
                        // Allow the rotation
                        *state_falling = falling;
                        self.shift = shift;
                        return
                    }
                }
            }
        }
        State::GameOver {..} => panic!(),
        State::Flashing {..} => panic!(),
    }
}
```


**作用**：


-   该方法用于处理正在下落的方块的旋转操作。当游戏处于`Falling`状态时，首先根据传入的参数`counter`确定是顺时针还是逆时针旋转方块。如果`counter`为`true`，就通过`state_falling.rotated()`方法对下落方块进行顺时针旋转；如果`counter`为`false`，则通过`state_failing.rotated_counter()`方法对下落方块进行逆时针旋转。
-   然后获取旋转后方块的最小偏移量`(x, y)`（通过`negative_shift`方法），并将旋转后的方块按照这个偏移量的相反数进行反向偏移，得到`falling`，以便将方块放置在合适的位置进行后续的合并操作。
-   接着，通过遍历`[(0, 0), (-1, 0)]`这两个偏移量，对旋转后的方块在不同的偏移位置尝试与游戏板进行合并操作（通过`merged`方法），并检查合并后的方块是否在游戏板的有效范围内（通过`contained`方法）。如果在某个偏移位置满足这两个条件，说明方块可以旋转到该位置，就更新下落方块的状态`*state_falling`为`falling`，并更新方块在游戏板上的偏移量`self.shift`，完成方块的旋转操作并返回。
-   如果当前游戏状态不是`Falling`状态（如`GameOver`或`Flashing`状态），则触发`panic!`，因为该方法假设只有在方块处于下落状态时才会被调用以进行正确的旋转操作，其他状态下调用此方法是不符合预期逻辑的，所以通过`panic!`来提示程序出现了错误情况。


#### 7. `main`函数


rust


```rust
fn main() {
    let metrics = Metrics {
        block_pixels: 20,
        board_x: 8,
        board_y: 20,
    };

    let mut window: PistonWindow = WindowSettings::new(
        "Tetris", metrics.resolution()).exit_on_esc(true).build().unwrap();
    let mut game = Game::new(metrics);

    game.new_falling();

    while let Some(e) = window.next() {
        game.progress();

        if let Some(_) = e.render_args() {
            game.render(&mut window, &e);
        }

        if let Some(args) = e.press_args() {
            game.on_press(&args);
        }
    }
}
```


**作用**：


-   在`main`函数中，首先创建了一个`Metrics`结构体实例，设置了每个方块的像素大小为 20，游戏板的行数为 20，列数为 8，这些参数定义了游戏的基本布局和显示效果。
-   然后使用`PistonWindow`库创建了一个游戏窗口，通过`WindowSettings`设置窗口的标题为 "Tetris"，并根据`metrics.resolution()`计算出的窗口分辨率来设置窗口大小，同时设置了按下`Esc`键时退出游戏。
-   接着创建了一个`Game`结构体实例，并调用`new_falling`方法生成第一个下落方块，开始游戏。
-   之后进入一个循环，不断从游戏窗口获取事件（通过`window.next()`）。对于每个获取到的事件：
    -   如果事件有渲染相关的参数（通过`e.render_args()`），就调用`game.render`方法在窗口中绘制游戏的当前状态。
    -   如果事件有按键按下相关的参数（通过`e.press_args()`），就调用`game.on_press`方法处理按键按下事件。
-   这样，游戏就能够不断地根据玩家的操作和游戏自身的逻辑进行更新和绘制，实现俄罗斯方块游戏的基本功能。


综上所述，这段代码通过定义一系列结构体、枚举和相关方法，完整地实现了一个俄罗斯方块游戏的核心逻辑，包括游戏板的操作、方块的生成、移动、旋转、满行消除以及游戏状态的管理和窗口事件的处理等功能。


#### 效果如下


![](/uploads/csdn/rust语言俄罗斯方块漂亮的界面案例详细的代码解说完美运行/img-01.gif)
