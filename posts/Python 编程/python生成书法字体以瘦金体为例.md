---
title: Python生成书法字体以瘦金体为例
slug: python生成书法字体以瘦金体为例
category: Python 编程
summary: 本文介绍了一个使用matplotlib生成书法文字图片的Python方法。通过导入matplotlib库，定义create\calligraphy\with\matplotlib函数，可以指定文本内容、字体路径、输出路径等参数，设置字体属性并绘制书法文字。函数会隐藏坐标轴，保存为透明背景的图片。示例代码演示了如何使用该函数生成"水墨丹青"的书法作品，并可自定义字号和颜色。该方案适合需要将书法文字可…
tags: Python
---

本文介绍了一个使用matplotlib生成书法文字图片的Python方法。通过导入matplotlib库，定义create\_calligraphy\_with\_matplotlib函数，可以指定文本内容、字体路径、输出路径等参数，设置字体属性并绘制书法文字。函数会隐藏坐标轴，保存为透明背景的图片。示例代码演示了如何使用该函数生成"水墨丹青"的书法作品，并可自定义字号和颜色。该方案适合需要将书法文字可视化的应用场景。


![](/uploads/csdn/python生成书法字体以瘦金体为例/img-01.png)


![](/uploads/csdn/python生成书法字体以瘦金体为例/img-02.png)


```python
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm

def create_calligraphy_with_matplotlib(text, font_path, output_path, size=50, color='black'):
    """
    使用matplotlib生成书法文字图片
    """
    # 设置字体
    prop = fm.FontProperties(fname=font_path, size=size)

    # 创建图形
    fig, ax = plt.subplots(figsize=(10, 3))
    ax.text(0.5, 0.5, text, fontproperties=prop,
            ha='center', va='center', color=color, size=size)

    # 隐藏坐标轴
    ax.axis('off')

    # 保存图片
    plt.savefig(output_path, bbox_inches='tight', pad_inches=0.1, transparent=True)
    plt.close()
    print(f"书法文字图片已保存至: {output_path}")

# 使用示例
if __name__ == "__main__":
    font_path = "DroidSansFallback.ttf"  # 替换为你的书法字体路径
    text = "水墨丹青"
    output_path = "calligraphy_matplotlib.png"

    create_calligraphy_with_matplotlib(text, font_path, output_path, size=80, color='#8B4513')
```
