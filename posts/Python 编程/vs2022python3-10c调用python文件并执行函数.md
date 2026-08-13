---
title: VS2022PYTHON3.10C调用Python文件并执行函数
slug: vs2022python3-10c调用python文件并执行函数
category: Python 编程
summary: 日常工作和学习中，有一些现成的Python代码已经写好，自己想在C++程序中调用，如果Python代码量很大，改写困难，就可以直接使用调用的方式。但是这里面会存在C++库环境和Python第三方库不匹配的情况，这里解决起来比较麻烦，后续有解决方案我在写一篇。
tags: Python
---

日常工作和学习中，有一些现成的Python代码已经写好，自己想在C++程序中调用，如果Python代码量很大，改写困难，就可以直接使用调用的方式。但是这里面会存在C++库环境和Python第三方库不匹配的情况，这里解决起来比较麻烦，后续有解决方案我在写一篇。


首先写一个Python文件，命名为add.py，写上代码如下


```python
import sys

def add():
    print("add running!\r\n")
    print(sys.path)
```


   VS2022 新建一个工程，添加一个CPP文件，代码如下


```python
#include <iostream>
#include <Python.h>
#include <windows.h>

using namespace std;

int main()
{

    Py_Initialize();

    PyObject* pModule = PyImport_ImportModule("add");
    //这里是要调用的文件名face_detect.py;

    if (pModule == NULL)//如果函数执行失败，则返回NULL
    {
        cout << "没找到该Python文件" << endl;
        return 0;
    }
    else {
        // 检查模块导入是否成功
        if (pModule != NULL) {
            // 获取模块中的函数
            PyObject* pFunction = PyObject_GetAttrString(pModule, "add");
            // 检查函数获取是否成功;
            if (pFunction != NULL) {
                // 准备函数参数
                PyObject* pArgs = NULL;//PyTuple_Pack(2, PyLong_FromLong(2), PyLong_FromLong(3));

                    // 调用Python函数
                    PyObject* pResult = PyObject_CallObject(pFunction, pArgs);

                    /*
                    // 打印结果
                    if (pResult != NULL) {
                        printf("Result of Python function: %ld\n", PyLong_AsLong(pResult));
                        Py_DECREF(pResult);
                    }
                    else {
                        PyErr_Print();
                    }
                    // 释放函数参数
                    Py_DECREF(pArgs);
                    */

                // 释放函数对象
                Py_DECREF(pFunction);
            }
            else {
                PyErr_Print();
            }
                // 释放模块对象
                Py_DECREF(pModule);
        }
        else {
            PyErr_Print();
        }
    }

    Py_Finalize();

}
```


VS2022添加Python.h的库头文件,在Python环境路径下的include文件夹，Python环境下的Lib和Libs，不会添加请自行百度，教程很多


Python环境路径就是你的安装路径


长这样，**最重要的一步是把add.py放到这个文件下**


![](/uploads/csdn/vs2022python3-10c调用python文件并执行函数/img-01.png)


没有什么问题就可以直接运行程序，运行结果如下


![](/uploads/csdn/vs2022python3-10c调用python文件并执行函数/img-02.png)
