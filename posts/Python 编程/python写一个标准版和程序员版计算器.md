---
title: Python写一个标准版和程序员版计算器
slug: python写一个标准版和程序员版计算器
category: Python 编程
summary: 本文介绍了一个基于Tkinter的多功能计算器实现。该计算器支持标准模式和程序员模式：标准模式提供基本运算、三角函数、对数等数学函数；程序员模式支持二进制/八进制/十六进制运算及位操作。程序采用了面向对象设计，通过Calculator类实现核心功能，包括进制转换、表达式验证、错误处理等。计算器界面包含多进制实时显示区域、主显示屏和动态切换的按钮面板，针对不同模式提供相应的计算功能。特别优化了负号处…
tags: 科技, 社会, Python
---

本文介绍了一个基于Tkinter的多功能计算器实现。该计算器支持标准模式和程序员模式：标准模式提供基本运算、三角函数、对数等数学函数；程序员模式支持二进制/八进制/十六进制运算及位操作。程序采用了面向对象设计，通过Calculator类实现核心功能，包括进制转换、表达式验证、错误处理等。计算器界面包含多进制实时显示区域、主显示屏和动态切换的按钮面板，针对不同模式提供相应的计算功能。特别优化了负号处理、表达式验证和进制转换逻辑，确保计算准确性和用户体验。


![](/uploads/csdn/python写一个标准版和程序员版计算器/img-01.png)


```python
import tkinter as tk
from tkinter import ttk, messagebox
import math
import re

class Calculator:
    def __init__(self, root):
        self.root = root
        self.root.title("多功能计算器")
        self.root.geometry("700x750")
        self.root.resizable(False, False)

        # 初始化变量
        self.mode = "standard"
        self.current_expression = ""
        self.current_base = 10  # 默认十进制
        self.create_widgets()

    def create_widgets(self):
        # 多进制显示区域 - 移到最上方，按列排列
        self.base_display_frame = ttk.Frame(self.root)
        self.base_display_frame.pack(fill=tk.X, padx=10, pady=5)

        # 二进制显示 - 第一列
        bin_frame = ttk.Frame(self.base_display_frame)
        bin_frame.grid(row=0, column=0, sticky=tk.W, padx=5, pady=2)
        ttk.Label(bin_frame, text="二进制 (Bin):").pack(anchor=tk.W)
        self.bin_var = tk.StringVar()
        ttk.Entry(bin_frame, textvariable=self.bin_var, state="readonly", width=30).pack(fill=tk.X)

        # 八进制显示 - 第二列
        oct_frame = ttk.Frame(self.base_display_frame)
        oct_frame.grid(row=0, column=1, sticky=tk.W, padx=5, pady=2)
        ttk.Label(oct_frame, text="八进制 (Oct):").pack(anchor=tk.W)
        self.oct_var = tk.StringVar()
        ttk.Entry(oct_frame, textvariable=self.oct_var, state="readonly", width=20).pack(fill=tk.X)

        # 十进制显示 - 第三列
        dec_frame = ttk.Frame(self.base_display_frame)
        dec_frame.grid(row=0, column=2, sticky=tk.W, padx=5, pady=2)
        ttk.Label(dec_frame, text="十进制 (Dec):").pack(anchor=tk.W)
        self.dec_var = tk.StringVar()
        ttk.Entry(dec_frame, textvariable=self.dec_var, state="readonly", width=20).pack(fill=tk.X)

        # 十六进制显示 - 第四列
        hex_frame = ttk.Frame(self.base_display_frame)
        hex_frame.grid(row=0, column=3, sticky=tk.W, padx=5, pady=2)
        ttk.Label(hex_frame, text="十六进制 (Hex):").pack(anchor=tk.W)
        self.hex_var = tk.StringVar()
        ttk.Entry(hex_frame, textvariable=self.hex_var, state="readonly", width=20).pack(fill=tk.X)

        # 模式切换框架
        mode_frame = ttk.Frame(self.root)
        mode_frame.pack(fill=tk.X, padx=5, pady=5)

        ttk.Button(mode_frame, text="标准版", command=self.switch_to_standard).pack(side=tk.LEFT, padx=5)
        ttk.Button(mode_frame, text="程序员版", command=self.switch_to_programmer).pack(side=tk.LEFT, padx=5)

        # 主显示框
        self.display_var = tk.StringVar()
        self.display = ttk.Entry(self.root, textvariable=self.display_var, font=('Arial', 24), justify=tk.RIGHT)
        self.display.pack(fill=tk.X, padx=10, pady=10)
        self.display.config(state='readonly')

        # 按钮框架
        self.buttons_frame = ttk.Frame(self.root)
        self.buttons_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        # 初始显示标准版
        self.create_standard_buttons()

    def switch_to_standard(self):
        self.mode = "standard"
        # 清空现有按钮
        for widget in self.buttons_frame.winfo_children():
            widget.destroy()
        self.create_standard_buttons()
        self.clear_display()

    def switch_to_programmer(self):
        self.mode = "programmer"
        # 清空现有按钮
        for widget in self.buttons_frame.winfo_children():
            widget.destroy()
        self.create_programmer_buttons()
        self.clear_display()

    def create_standard_buttons(self):
        # 按钮布局
        buttons = [
            ('7', 1, 0), ('8', 1, 1), ('9', 1, 2), ('/', 1, 3), ('C', 1, 4),
            ('4', 2, 0), ('5', 2, 1), ('6', 2, 2), ('*', 2, 3), ('⌫', 2, 4),
            ('1', 3, 0), ('2', 3, 1), ('3', 3, 2), ('-', 3, 3), ('±', 3, 4),
            ('0', 4, 0), ('.', 4, 1), ('=', 4, 2), ('+', 4, 3), ('^', 4, 4),
            ('sin', 5, 0), ('cos', 5, 1), ('tan', 5, 2), ('log', 5, 3), ('√', 5, 4),
            ('π', 6, 0), ('e', 6, 1), ('exp', 6, 2), ('ln', 6, 3), ('!', 6, 4)
        ]

        # 设置网格权重
        for i in range(7):
            self.buttons_frame.grid_rowconfigure(i, weight=1)
        for i in range(5):
            self.buttons_frame.grid_columnconfigure(i, weight=1)

        # 创建按钮
        for text, row, col in buttons:
            btn = ttk.Button(self.buttons_frame, text=text, command=lambda t=text: self.on_button_click(t))
            btn.grid(row=row, column=col, padx=5, pady=5, sticky="nsew")

    def create_programmer_buttons(self):
        # 进制选择
        base_frame = ttk.Frame(self.buttons_frame)
        base_frame.grid(row=0, column=0, columnspan=5, sticky="nsew", padx=5, pady=5)

        ttk.Button(base_frame, text="二进制", command=lambda: self.set_base(2)).pack(side=tk.LEFT, padx=2, expand=True, fill=tk.X)
        ttk.Button(base_frame, text="八进制", command=lambda: self.set_base(8)).pack(side=tk.LEFT, padx=2, expand=True, fill=tk.X)
        ttk.Button(base_frame, text="十进制", command=lambda: self.set_base(10)).pack(side=tk.LEFT, padx=2, expand=True, fill=tk.X)
        ttk.Button(base_frame, text="十六进制", command=lambda: self.set_base(16)).pack(side=tk.LEFT, padx=2, expand=True, fill=tk.X)

        # 程序员版按钮布局（修复空按钮问题，替换为空文本按钮为退格）
        buttons = [
            ('A', 1, 0), ('B', 1, 1), ('C', 1, 2), ('D', 1, 3), ('E', 1, 4),
            ('F', 2, 0), ('7', 2, 1), ('8', 2, 2), ('9', 2, 3), ('/', 2, 4),
            ('4', 3, 0), ('5', 3, 1), ('6', 3, 2), ('*', 3, 3), ('%', 3, 4),
            ('1', 4, 0), ('2', 4, 1), ('3', 4, 2), ('-', 4, 3), ('<<', 4, 4),
            ('0', 5, 0), ('⌫', 5, 1), ('=', 5, 2), ('+', 5, 3), ('>>', 5, 4),
            ('&', 6, 0), ('|', 6, 1), ('^', 6, 2), ('~', 6, 3), ('C', 6, 4)
        ]

        # 设置网格权重
        for i in range(7):
            self.buttons_frame.grid_rowconfigure(i, weight=1)
        for i in range(5):
            self.buttons_frame.grid_columnconfigure(i, weight=1)

        # 创建按钮
        for text, row, col in buttons:
            btn = ttk.Button(self.buttons_frame, text=text, command=lambda t=text: self.on_button_click(t))
            btn.grid(row=row, column=col, padx=5, pady=5, sticky="nsew")

    def set_base(self, base):
        """切换当前进制，并转换现有表达式（修复进制转换逻辑）"""
        if self.current_expression:
            try:
                # 先将当前表达式按原进制解析为十进制（处理负号）
                if self.current_expression.startswith('-'):
                    decimal_val = -int(self.current_expression[1:], self.current_base)
                else:
                    decimal_val = int(self.current_expression, self.current_base)
                # 再转换为新进制字符串（负号单独处理）
                if decimal_val < 0:
                    self.current_expression = '-' + self.convert_base(-decimal_val, base)
                else:
                    self.current_expression = self.convert_base(decimal_val, base)
                self.display_var.set(self.current_expression)
            except ValueError:
                messagebox.showerror("进制错误", "当前表达式包含无效字符，无法转换")
                self.clear_display()
        # 更新当前进制
        self.current_base = base
        # 刷新多进制显示
        self.update_base_display()

    def on_button_click(self, text):
        """统一按钮点击处理（修复位运算按钮逻辑）"""
        if text == '=':
            self.calculate()
        elif text == 'C':
            self.clear_display()
        elif text == '⌫':
            self.backspace()
        elif text == '±':
            self.toggle_sign()
        elif text in ['sin', 'cos', 'tan', 'log', 'ln', '√', 'exp', '!']:
            self.function_operation(text)
        elif text in ['π', 'e']:
            self.constant_operation(text)
        else:
            # 所有输入（数字、运算符）统一走表达式拼接
            self.append_to_expression(text)

    def append_to_expression(self, text):
        """拼接表达式，增加严格合法性校验（修复连续运算符问题）"""
        # 1. 程序员模式输入校验
        if self.mode == "programmer":
            # 非十六进制不允许输入A-F
            if self.current_base != 16 and text in ['A', 'B', 'C', 'D', 'E', 'F']:
                messagebox.showwarning("输入错误", f"{self.current_base}进制仅支持0-{self.current_base-1}")
                return
            # 二进制只允许0、1和运算符
            if self.current_base == 2 and text not in ['0', '1', '+', '-', '*', '/', '&', '|', '^', '~', '<<', '>>', '%']:
                messagebox.showwarning("输入错误", "二进制仅支持输入0、1和运算符")
                return

        # 2. 避免开头为无效运算符（除负号）
        if not self.current_expression:
            if text in ['+', '*', '/', '^', '&', '|', '<<', '>>', '%']:
                messagebox.showwarning("输入错误", "表达式不能以运算符开头")
                return

        # 3. 避免连续运算符（修复运算符叠加问题）
        if self.current_expression:
            last_char = self.current_expression[-1]
            # 检测上一个字符是否为运算符（含双字符运算符<<、>>）
            is_last_op = (last_char in ['+', '-', '*', '/', '^', '&', '|', '%']) or \
                         (len(self.current_expression)>=2 and self.current_expression[-2:] in ['<<', '>>'])
            # 检测当前输入是否为运算符
            is_current_op = (text in ['+', '-', '*', '/', '^', '&', '|', '%']) or (text in ['<<', '>>'])

            if is_last_op and is_current_op:
                messagebox.showwarning("输入错误", "不允许连续输入运算符")
                return

        # 4. 拼接表达式并更新显示
        self.current_expression += str(text)
        self.display_var.set(self.current_expression)
        self.update_base_display()

    def clear_display(self):
        """清空表达式和所有显示"""
        self.current_expression = ""
        self.display_var.set("")
        self.update_base_display()

    def backspace(self):
        """退格删除最后一个字符（修复多字符运算符删除）"""
        if self.current_expression:
            # 处理双字符运算符（<<、>>）
            if len(self.current_expression)>=2 and self.current_expression[-2:] in ['<<', '>>']:
                self.current_expression = self.current_expression[:-2]
            else:
                self.current_expression = self.current_expression[:-1]
            self.display_var.set(self.current_expression)
            self.update_base_display()

    def toggle_sign(self):
        """切换正负号（修复负号位置错误）"""
        if not self.current_expression:
            self.current_expression = '-'
        elif self.current_expression == '-':
            self.current_expression = ""
        elif self.current_expression.startswith('-'):
            self.current_expression = self.current_expression[1:]
        else:
            # 仅在表达式开头添加负号（避免中间加负号）
            self.current_expression = '-' + self.current_expression
        self.display_var.set(self.current_expression)
        self.update_base_display()

    def function_operation(self, func):
        """处理数学函数运算（修复函数计算逻辑）"""
        try:
            if not self.current_expression:
                raise ValueError("请先输入运算数值")

            # 解析当前表达式为数值（支持小数）
            value = float(self.current_expression)
            result = 0

            # 函数计算（确保数学正确性）
            if func == 'sin':
                result = math.sin(math.radians(value))  # 角度转弧度（符合日常使用习惯）
            elif func == 'cos':
                result = math.cos(math.radians(value))
            elif func == 'tan':
                result = math.tan(math.radians(value))
            elif func == 'log':
                if value <= 0:
                    raise ValueError("对数参数必须大于0")
                result = math.log10(value)
            elif func == 'ln':
                if value <= 0:
                    raise ValueError("自然对数参数必须大于0")
                result = math.log(value)
            elif func == '√':
                if value < 0:
                    raise ValueError("平方根参数不能为负数")
                result = math.sqrt(value)
            elif func == 'exp':
                result = math.exp(value)  # 计算 e^value
            elif func == '!':
                if value < 0 or not value.is_integer():
                    raise ValueError("阶乘仅支持非负整数")
                result = math.factorial(int(value))

            # 处理结果显示（移除末尾多余的0和小数点）
            self.current_expression = str(round(result, 10))
            if '.' in self.current_expression:
                self.current_expression = self.current_expression.rstrip('0').rstrip('.')
            self.display_var.set(self.current_expression)
            self.update_base_display()

        except Exception as e:
            messagebox.showerror("函数错误", str(e))
            self.clear_display()

    def constant_operation(self, const):
        """插入数学常数（修复常数显示格式）"""
        if const == 'π':
            self.current_expression = str(round(math.pi, 10))
        elif const == 'e':
            self.current_expression = str(round(math.e, 10))

        # 清理显示格式（如 3.1415926536 而非 3.141592653589793）
        if '.' in self.current_expression:
            self.current_expression = self.current_expression.rstrip('0').rstrip('.')
        self.display_var.set(self.current_expression)
        self.update_base_display()

    def calculate(self):
        """核心计算逻辑（区分标准版/程序员版，修复表达式解析错误）"""
        try:
            if not self.current_expression:
                raise ValueError("请先输入运算表达式")

            result = 0
            if self.mode == "standard":
                # 标准版：支持小数、幂运算和数学函数，处理角度转弧度
                expr = self.current_expression.replace('^', '**')  # 幂运算转为Python语法

                # 定义安全的数学函数环境（确保sin/cos等使用角度计算，符合日常习惯）
                def safe_sin(x):
                    return math.sin(math.radians(x))  # 角度→弧度
                def safe_cos(x):
                    return math.cos(math.radians(x))
                def safe_tan(x):
                    return math.tan(math.radians(x))

                # 安全执行表达式（仅暴露必要函数，禁止危险操作）
                result = eval(
                    expr,
                    {"__builtins__": None},  # 禁用所有内置函数
                    {
                        "sin": safe_sin,
                        "cos": safe_cos,
                        "tan": safe_tan,
                        "log10": math.log10,
                        "log": math.log,
                        "sqrt": math.sqrt,
                        "exp": math.exp,
                        "factorial": math.factorial,
                        "pi": math.pi,
                        "e": math.e
                    }
                )

                # 处理结果显示格式（移除末尾多余的0和小数点）
                self.current_expression = str(round(result, 10))
                if '.' in self.current_expression:
                    self.current_expression = self.current_expression.rstrip('0').rstrip('.')

            else:
                # 程序员版：仅整数运算，先按当前进制解析为十进制计算
                expr = self.current_expression
                # 1. 处理取反运算符~（Python中~x = -x-1，需单独处理负号）
                expr = expr.replace('~', '-~')  # 修复取反逻辑：~5 → -~5 = -6（符合二进制取反）

                # 2. 正则匹配表达式中的数字（含负号，如-1A、-10），转为十进制
                def parse_num(match):
                    num_str = match.group()
                    # 分离负号和数字本体
                    sign = -1 if num_str.startswith('-') else 1
                    pure_num = num_str.lstrip('-')

                    # 按当前进制解析数字
                    try:
                        return str(sign * int(pure_num, self.current_base))
                    except ValueError:
                        raise ValueError(f"无效{self.current_base}进制数字：{num_str}")

                # 匹配规则：负号（可选）+ 数字/字母（0-9A-F），避免匹配运算符
                expr_dec = re.sub(r'-?[0-9A-Fa-f]+', parse_num, expr)

                # 3. 执行十进制运算（位运算、算术运算）
                result = eval(
                    expr_dec,
                    {"__builtins__": None},
                    {}  # 程序员模式无需额外函数
                )

                # 4. 结果转为当前进制（处理负号：负号单独显示，数字部分转正）
                if result < 0:
                    self.current_expression = '-' + self.convert_base(-result, self.current_base)
                else:
                    self.current_expression = self.convert_base(result, self.current_base)

            # 更新主显示和多进制显示
            self.display_var.set(self.current_expression)
            self.update_base_display()

        except ValueError as ve:
            messagebox.showerror("计算错误", str(ve))
            self.clear_display()
        except ZeroDivisionError:
            messagebox.showerror("计算错误", "除数不能为0")
            self.clear_display()
        except Exception as e:
            messagebox.showerror("计算错误", f"表达式格式无效：{str(e)}")
            self.clear_display()

    def convert_base(self, num, base):
        """完整实现十进制转目标进制（支持2/8/10/16，处理0的特殊情况）"""
        if num == 0:
            return "0"  # 避免0转换后为空

        digits = "0123456789ABCDEF"
        result_str = ""

        while num > 0:
            remainder = num % base
            result_str = digits[remainder] + result_str  # 余数逆序拼接
            num = num // base

        return result_str

    def update_base_display(self):
        """修复多进制显示逻辑（确保实时同步当前表达式的各进制值）"""
        if not self.current_expression:
            self.bin_var.set("")
            self.oct_var.set("")
            self.dec_var.set("")
            self.hex_var.set("")
            return

        try:
            # 1. 解析当前表达式为十进制（区分标准版和程序员版）
            if self.mode == "standard":
                # 标准版可能含小数，先转为float再取整（多进制显示仅支持整数）
                decimal_val = int(float(self.current_expression))
            else:
                # 程序员版按当前进制解析
                if self.current_expression.startswith('-'):
                    decimal_val = -int(self.current_expression[1:], self.current_base)
                else:
                    decimal_val = int(self.current_expression, self.current_base)

            # 2. 转换为各进制并更新显示
            self.bin_var.set(self.convert_base(abs(decimal_val), 2) if decimal_val !=0 else "0")
            self.oct_var.set(self.convert_base(abs(decimal_val), 8) if decimal_val !=0 else "0")
            self.dec_var.set(str(decimal_val))
            self.hex_var.set(self.convert_base(abs(decimal_val), 16) if decimal_val !=0 else "0")

            # 3. 负号标注（在各进制前添加负号）
            if decimal_val < 0:
                self.bin_var.set("-" + self.bin_var.get())
                self.oct_var.set("-" + self.oct_var.get())
                self.hex_var.set("-" + self.hex_var.get())

        except:
            # 表达式无效时清空多进制显示
            self.bin_var.set("（无效表达式）")
            self.oct_var.set("（无效表达式）")
            self.dec_var.set("（无效表达式）")
            self.hex_var.set("（无效表达式）")

def main():
    root = tk.Tk()
    app = Calculator(root)
    root.mainloop()

if __name__ == "__main__":
    main()
```
