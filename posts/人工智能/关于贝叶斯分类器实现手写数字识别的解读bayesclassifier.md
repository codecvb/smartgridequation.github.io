---
title: 关于贝叶斯分类器实现手写数字识别的解读bayesClassifier
slug: 关于贝叶斯分类器实现手写数字识别的解读bayesclassifier
category: 人工智能
summary: 引用源 感谢大神Matlab-HandWriting\Number\Recognition: 在Matlab中使用Bayes分类器对GUI界面手写板输入的手写数字进行识别
tags: 数学
---

引用源 感谢大神[Matlab-HandWriting\_Number\_Recognition: 在Matlab中使用Bayes分类器对GUI界面手写板输入的手写数字进行识别](https://gitee.com/HoganBest/Matlab-HandWriting_Number_Recognition "Matlab-HandWriting_Number_Recognition: 在Matlab中使用Bayes分类器对GUI界面手写板输入的手写数字进行识别")


```Matlab
function label=bayesClassifierBulid(img)
%加载已经计算好的训练样本的特征变量
load featureData.mat;
test_feature=singleNum_feature_extraction(img);%获得测试图片的特征数据

%计算先验概率
prior=[];%存储先验概率的矩阵
sum=0;
for i=1:size(featureDataStruct,2)
    sum=sum+size(featureDataStruct(i).feature,1);
end
for i=1:size(featureDataStruct,2)
    prior(i)=size(featureDataStruct(i).feature,1)/sum;
end
%计算类条件概率
likelihood = [];%类条件概率
pij=[];%i类的样本第j个特征为1的概率
for i=1:size(featureDataStruct,2)%数字类别个数
    for j=1:100%每个数字图片提取出来的特征数
        sum=0;

        for k=1:size(featureDataStruct(i).feature,1)%每个类别下训练样本的个数
            i_feature=featureDataStruct(i).feature(k);
            sum=sum+i_feature{1}(1,j);
        end
        pij(i,j)=(sum+1)/(size(featureDataStruct(i).feature,1)+2);%计算概率估计值即Pj(ωi)，注意拉普拉斯平滑处理
    end
end
for i=1:size(featureDataStruct,2)%数字类别个数
    multi=1;
    for j=1:100%每个数字图片提取出来的特征数
        if(test_feature(j)==1)
            multi=multi*pij(i,j);
        else
            multi=multi*(1-pij(i,j));
        end
    end
    likelihood(i)=multi;
end
%计算后验概率
p_class=[];%后验概率
sum=0;
for i=1:size(featureDataStruct,2)%数字类别个数
    sum=sum+prior(i)*likelihood(i);
end
for i=1:size(featureDataStruct,2)%数字类别个数
    p_class(i)=prior(i)*likelihood(i)/sum;
end
[maxval,maxpos]=max(p_class);
label=maxpos-1;
```


 这段代码定义了一个名为 `bayesClassifierBulid` 的函数，其功能是使用贝叶斯分类器对输入的手写数字图像进行分类。


#### 函数定义与整体功能


```Matlab
function label=bayesClassifierBulid(img)
```


-   这行代码定义了一个名为 `bayesClassifierBulid` 的函数，它接受一个输入参数 `img`，代表待分类的手写数字图像。函数的返回值 `label` 是分类结果，即预测的数字标签。


加载训练样本特征变量


```Matlab
load featureData.mat;
test_feature=singleNum_feature_extraction(img);%获得测试图片的特征数据
```


-   `load featureData.mat;`：从 `featureData.mat` 文件中加载预先计算好的训练样本的特征变量。这个文件里应该包含了不同数字类别的特征数据。
-   `test_feature=singleNum_feature_extraction(img);`：调用 `singleNum_feature_extraction` 函数，从输入的测试图像 `img` 中提取特征数据，存储在 `test_feature` 中。


#### 计算先验概率


```Matlab
prior=[];%存储先验概率的矩阵
sum=0;
for i=1:size(featureDataStruct,2)
    sum=sum+size(featureDataStruct(i).feature,1);
end
for i=1:size(featureDataStruct,2)
    prior(i)=size(featureDataStruct(i).feature,1)/sum;
end
```


-   `prior=[];`：初始化一个空数组 `prior`，用于存储每个数字类别的先验概率。
-   第一个 `for` 循环：计算所有训练样本的总数。`size(featureDataStruct,2)` 表示数字类别的数量，`size(featureDataStruct(i).feature,1)` 表示第 `i` 类数字的训练样本数量。
-   第二个 `for` 循环：计算每个数字类别的先验概率，即第 `i` 类数字的训练样本数量除以所有训练样本的总数。


计算类条件概率


```Matlab
likelihood = [];%类条件概率
pij=[];%i类的样本第j个特征为1的概率
for i=1:size(featureDataStruct,2)%数字类别个数
    for j=1:100%每个数字图片提取出来的特征数
        sum=0;
        for k=1:size(featureDataStruct(i).feature,1)%每个类别下训练样本的个数
            i_feature=featureDataStruct(i).feature(k);
            sum=sum+i_feature{1}(1,j);
        end
        pij(i,j)=(sum+1)/(size(featureDataStruct(i).feature,1)+2);%计算概率估计值即Pj(ωi)，注意拉普拉斯平滑处理
    end
end
for i=1:size(featureDataStruct,2)%数字类别个数
    multi=1;
    for j=1:100%每个数字图片提取出来的特征数
        if(test_feature(j)==1)
            multi=multi*pij(i,j);
        else
            multi=multi*(1-pij(i,j));
        end
    end
    likelihood(i)=multi;
end
```


-   `likelihood = [];` 和 `pij=[];`：分别初始化空数组，用于存储类条件概率和每个类别下每个特征为 1 的概率。
-   第一个嵌套 `for` 循环：计算每个类别下每个特征为 1 的概率 `pij(i,j)`。使用拉普拉斯平滑处理，避免出现概率为 0 的情况，公式为 `(sum + 1) / (样本数量 + 2)`。
-   第二个嵌套 `for` 循环：计算每个类别的类条件概率 `likelihood(i)`。对于测试图像的每个特征，如果该特征值为 1，则乘以 `pij(i,j)`；否则乘以 `1 - pij(i,j)`。


计算后验概率


-   `p_class=[];`：初始化一个空数组，用于存储每个数字类别的后验概率。
-   第一个 `for` 循环：计算所有类别 `prior(i) * likelihood(i)` 的总和。
-   第二个 `for` 循环：根据贝叶斯公式计算每个类别的后验概率 `p_class(i) = prior(i) * likelihood(i) / sum`。


#### 确定分类结果


```Matlab
[maxval,maxpos]=max(p_class);
label=maxpos-1;
```


-   `[maxval,maxpos]=max(p_class);`：找出后验概率数组 `p_class` 中的最大值及其索引。
-   `label=maxpos-1;`：将索引减 1 作为最终的分类结果，因为数字标签通常从 0 开始。


综上所述，这段代码实现了一个基于贝叶斯分类器的手写数字图像分类算法，通过计算先验概率、类条件概率和后验概率，最终确定输入图像的数字标签。


`bayesClassifierBulid` 是一个自定义的函数名，从命名上看，它可能存在拼写小错误，更符合命名逻辑的可能是 `bayesClassifierBuild` ，意思是构建一个贝叶斯分类器（Bayes Classifier）。


#### 命名拆解分析


-   **Bayes**：代表贝叶斯，这源于英国数学家托马斯・贝叶斯（Thomas Bayes）。贝叶斯理论是基于贝叶斯定理发展而来的一套概率统计方法，在机器学习和模式识别领域，贝叶斯分类器是基于贝叶斯定理和特征条件独立假设的分类方法，具有坚实的数学基础，能利用先验知识和样本数据进行分类决策。
-   **Classifier**：意为分类器，在机器学习和数据分析中，分类器是一种算法或模型，它的主要功能是将输入的数据划分到不同的类别中。例如，在手写数字识别场景中，分类器要判断输入的手写数字图像属于 0 - 9 中的哪一个数字类别。
-   **Build**：表示构建、创建。这里表明该函数的核心功能是搭建一个贝叶斯分类器，可能涉及初始化分类器的参数、计算先验概率、类条件概率等操作，最终实现对输入数据的分类功能。


#### 结合代码的功能


在你给出的代码里，`bayesClassifierBulid` 函数借助加载预计算的训练样本特征数据，对输入的手写数字图像提取特征，接着计算先验概率、类条件概率和后验概率，最后依据后验概率最大的原则对图像进行分类，输出预测的数字标签。所以，这个函数实际上是在实现一个简单的贝叶斯分类器并进行分类预测。


![](/uploads/csdn/关于贝叶斯分类器实现手写数字识别的解读bayesclassifier/img-01.png)


![](/uploads/csdn/关于贝叶斯分类器实现手写数字识别的解读bayesclassifier/img-02.png)![](/uploads/csdn/关于贝叶斯分类器实现手写数字识别的解读bayesclassifier/img-03.png)
