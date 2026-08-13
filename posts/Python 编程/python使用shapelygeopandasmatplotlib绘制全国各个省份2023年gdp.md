---
title: Python使用shapelygeopandasmatplotlib绘制全国各个省份2023年GDP
slug: python使用shapelygeopandasmatplotlib绘制全国各个省份2023年gdp
category: Python 编程
summary: 以下是一个示例代码，用于在使用matplotlib和geopandas绘制地图并设置区域后，当鼠标点击地图上的某个区域时，返回该区域的名称。
tags: Python
---

以下是一个示例代码，用于在使用`matplotlib`和`geopandas`绘制地图并设置区域后，当鼠标点击地图上的某个区域时，返回该区域的名称。


首先，确保你已经安装了`matplotlib`、`geopandas`和`descartes`库（`descartes`库用于在`matplotlib`中绘制地理空间数据）。如果没有安装，可以通过`pip install matplotlib geopandas descartes`进行安装。


另外，你需要一份中国省级行政区划的地理空间数据文件（比如 Shapefile 格式），这里假设已经有了一个名为`china_provinces.shp`的文件，它包含了中国各省份的几何边界信息。你可以从相关地理数据平台获取这样的文件。


[省份数据地图获取——提取码：7clz](https://pan.baidu.com/s/1JuX6nUjbSzsf5DgU13HMtQ "省份数据地图获取——提取码：7clz")


```python
import geopandas as gpd
import pandas as pd
from plotly.subplots import make_subplots
import matplotlib.pyplot as plt
from shapely.geometry import Point

from pypinyin import pinyin, Style

def to_pinyin(text, style=Style.TONE):
    return ''.join([i[0] for i in pinyin(text, style=style)])

# 读取中国省份的GeoJSON数据
china_geojson = gpd.read_file('省.shp')  # 请确保路径正确，且文件是GeoJSON格式
gdp_data_t = {
    "广东": 130518.8,
    "江苏": 92595.4,
    "山东": 92069.0,
    "浙江": 83467.3,
    "河南": 48056.0,
    "四川": 60132.9,
    "湖北": 39367.0,
    "湖南": 36426.0,
    "河北": 36010.0,
    "福建": 35804.0,
    "上海": 32680.0,
    "北京": 30320.0,
    "安徽": 30007.0,
    "辽宁": 25315.0,
    "陕西": 24438.0,
    "江西": 21985.0,
    "重庆": 20363.0,
    "广西": 20353.0,
    "天津": 18810.0,
    "云南": 17881.0,
    "内蒙古": 17289.0,
    "山西": 16818.0,
    "黑龙江": 16362.0,
    "吉林": 15075.0,
    "贵州": 14806.0,
    "新疆": 12199.0,
    "甘肃": 8246.0,
    "海南": 4832.0,
    "宁夏": 3705.0,
    "青海": 2865.0,
    "西藏": 1478.0
}
# 示例数据：假设我们有一些省份的2023年GDP总量数据
gdp_data = {
    'Province': [
    "北京市", "天津市", "河北省", "山西省", "内蒙古自治区",
    "辽宁省", "吉林省", "黑龙江省", "上海市", "江苏省",
    "浙江省", "安徽省", "福建省", "江西省", "山东省",
    "河南省", "湖北省", "湖南省", "广东省", "广西壮族自治区",
    "海南省", "重庆市", "四川省", "贵州省", "云南省",
    "西藏自治区", "陕西省", "甘肃省", "青海省", "宁夏回族自治区",
    "新疆维吾尔自治区", "台湾省", "香港特别行政区", "澳门特别行政区"
    ],
    'value':  [
    30320.0, 18810.0, 36010.0, 16818.0, 17289.0,
    25315.0, 15075.0, 16362.0, 32680.0, 92595.4,
    83467.3, 30007.0, 35804.0, 21985.0, 92069.0,
    48056.0, 39367.0, 36426.0, 130518.8, 20353.0,
    4832.0, 20363.0, 60132.9, 14806.0, 17881.0,
    1478.0, 24438.0, 8246.0, 2865.0, 3705.0,
    12199.0, 11000, 11000, 11000  # 台湾省、香港特别行政区、澳门特别行政区暂无示例数据，实际可补充准确数据
    ]
}

gdp_df = pd.DataFrame(gdp_data)

merged = china_geojson.set_index('省').join(gdp_df.set_index('Province'))

fig, ax = plt.subplots(figsize=(20, 36))

# 定义鼠标点击事件处理函数
def on_click(event):
    if event.inaxes == ax:
        for index, row in china_geojson.iterrows():
            poly = row['geometry']
            point = Point(event.xdata,  event.ydata)
            if poly.contains(point):
                for key, value in gdp_data_t.items():
                    #print(key, value)
                    if key in row['省']:
                        print(key, value)
                        value = gdp_data_t[key]
                        print(value)
                        break
                name = to_pinyin(row['省'])
                print(name)
                plt.annotate(f"{name}: {value}", xy=(event.xdata, event.ydata), xytext=(10, 10),
                            textcoords='offset points', bbox=dict(boxstyle='round,pad=0.5', fc='yellow', alpha=0.5),
                            arrowprops=dict(arrowstyle='->', connectionstyle='arc3,rad=0'))
                fig.canvas.draw_idle()
                break


# 连接鼠标点击事件到处理函数
cid = fig.canvas.mpl_connect('button_press_event', on_click)

plt.title(to_pinyin('全国热力图'))

merged.plot(column='value', cmap='OrRd', linewidth=0.8, ax=ax, edgecolor='0.8', legend=True)

plt.show()
```


#### 数据准备


1.  首先使用`geopandas`的`read_file`方法读取了包含中国各省份几何边界信息的地理空间数据文件（`china_provinces.shp`），得到一个`GeoDataFrame`对象`china_map`。
2.  然后为每个省份生成了一个示例数值，这里假设是虚构的人口数量，并将其添加到`china_map`的新列`population`中。


#### 地图绘制


1.  创建了一个`matplotlib`的图形和坐标轴对象`fig`和`ax`，并设置了合适的图形大小。
2.  通过遍历`china_map`的每一行，对于每个省份的几何边界信息：
    -   使用`descartes`库的`PolygonPatch`将其转换为可以在`matplotlib`中绘制的多边形补丁对象，并设置其填充颜色为`none`，边框颜色为`black`，然后添加到坐标轴`ax`上。
    -   计算省份几何形状的质心坐标，并在质心位置添加省份名称作为标签，设置了合适的字体大小和对齐方式。


#### 鼠标点击事件处理


1.  定义了`on_click`函数作为鼠标点击事件的处理函数：
    -   首先判断点击事件是否发生在当前坐标轴`ax`内。
    -   如果在坐标轴内，通过遍历`china_map`的每一行，检查每个省份的几何边界是否包含点击的坐标点（`event.xdata`和`event.ydata`）。
    -   一旦找到包含点击点的省份，获取该省份的名称和对应的数值，然后使用`plt.annotate`在点击点附近添加一个注释，显示省份名称和数值，并设置了注释框的样式（如圆角、填充颜色、透明度等）以及箭头的样式，最后通过`fig.canvas.draw_idle()`重新绘制图形，使注释显示出来。


#### 事件连接与显示


1.  通过`fig.canvas.mpl_connect`将鼠标点击事件与处理函数`on_click`连接起来。
2.  最后使用`plt.show()`显示绘制好的中国省级行政区划地图，当鼠标点击某个省份区域时，就会弹出一个提示框显示该省份的名称和对应的数值。


请注意，在实际应用中，你可以根据自己的需求替换示例中的数值，比如各省份的 GDP 总量等。同时，确保地理空间数据文件的准确性和完整性，以及数据与地图区域的正确匹配。


运行效果，我已经运行测试通过，如下图


![](/uploads/csdn/python使用shapelygeopandasmatplotlib绘制全国各个省份2023年gdp/img-01.png)
