---
title: Rust编程语言代码详细运行编译方法
slug: rust编程语言代码详细运行编译方法
category: C/C++ 与 Rust
summary: 以下是针对不同类型的 Rust 代码（以常见的命令行程序为例）详细的运行方法：
tags: C/C++, Rust
---

以下是针对不同类型的 Rust 代码（以常见的命令行程序为例）详细的运行方法：


#### 前提条件


在运行 Rust 代码之前，确保你已经在系统上安装了 Rust 编程语言环境。如果尚未安装，可以通过以下步骤进行安装：


1.  访问 Rust 官方网站：[Install Rust - Rust Programming Language](https://www.rust-lang.org/tools/install "Install Rust - Rust Programming Language")。
2.  根据你所使用的操作系统（如 Windows、Linux、macOS），按照官方提供的安装指南进行操作。通常，在大多数系统上，安装过程会自动配置好 Rust 编译器（`rustc`）以及包管理器（`cargo`）等必要工具。


#### 运行简单的 Rust 代码文件（不使用 Cargo 项目）


假设你有一个简单的 Rust 代码文件，例如名为 `hello.rs` 的文件，内容如下：


rust


```rust
fn main() {
    println!("Hello, World!");
}
```


以下是运行它的步骤：


1.  打开终端（在 Windows 上可以是命令提示符或 PowerShell，在 Linux 和 macOS 上就是终端应用程序）。
2.  使用 `cd` 命令导航到包含 `hello.rs` 文件的目录。例如，如果文件在你的桌面上，在终端中输入相应的 `cd` 命令切换到桌面目录（如在 Linux/macOS 上可能是 `cd ~/Desktop`，在 Windows 上可能是 `cd %USERPROFILE%\Desktop`）。
3.  编译代码：在终端中输入 `rustc hello.rs`。这会调用 Rust 编译器将 `hello.rs` 文件编译成可执行文件。如果代码没有语法错误等问题，编译器会在当前目录下生成一个名为 `hello`（在 Windows 上可能是 `hello.exe`）的可执行文件。
4.  运行可执行文件：在终端中输入 `./hello`（在 Windows 上直接输入 `hello.exe`），即可看到输出结果 `Hello, World!`。


#### 运行使用 Cargo 管理的 Rust 项目


大多数实际的 Rust 项目会使用 Cargo 进行管理，Cargo 是 Rust 的包管理器和构建工具，它可以更方便地处理项目的依赖关系、构建过程等。


假设你已经从 GitHub 等地方克隆了一个使用 Cargo 管理的 Rust 项目到本地，例如一个名为 `my_tetris_project` 的俄罗斯方块游戏项目，以下是运行它的一般步骤：


1.  打开终端并导航到克隆下来的项目目录（例如 `cd my_tetris_project`）。
2.  首次运行项目时，通常需要先下载并安装项目所依赖的外部库（也称为 “crate”）。在终端中输入 `cargo build`。这会根据项目的 `Cargo.toml` 文件（Cargo 项目的配置文件，其中列出了项目所依赖的库等信息）下载并安装所需的依赖项，然后编译项目代码。这个过程可能需要一些时间，尤其是在第一次运行或者项目依赖较多库的时候。
3.  运行项目：在终端中输入 `cargo run`。这会首先检查是否需要重新编译项目（如果代码有修改等情况），然后运行生成的可执行文件，展示项目的实际运行效果。


如果项目在运行过程中出现错误，终端会显示相应的错误信息，你可以根据这些错误信息来排查问题，可能涉及到代码逻辑错误、依赖项安装失败等情况。


#### 运行特定环境下的 Rust 代码（如 WebAssembly 等）


如果 Rust 代码是用于特定环境，比如要在浏览器中通过 WebAssembly 运行，还需要进行额外的步骤：


1.  对于 WebAssembly 项目，通常需要先将 Rust 代码编译成 WebAssembly 模块。这可能涉及到使用特定的工具链或配置，例如 `wasm-pack`。你需要按照相关项目的文档要求进行操作，一般步骤可能包括安装 `wasm-pack`（如通过 `cargo install wasm-pack`），然后在项目目录下运行类似 `wasm-pack build` 的命令将 Rust 代码编译成 WebAssembly 格式。
2.  将生成的 WebAssembly 模块与相应的 JavaScript 等前端代码进行集成，以便在浏览器等环境中加载和运行。这一步骤也需要根据具体项目的集成方式进行操作，通常会涉及到在 HTML 文件中引入 JavaScript 文件以及正确配置加载 WebAssembly 模块的方式等。


不同的 Rust 项目可能因为其用途、依赖关系等因素而有不同的运行方式，但上述步骤涵盖了常见的情况，可以作为你运行 Rust 代码的基本参考。
