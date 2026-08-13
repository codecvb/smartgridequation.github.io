---
title: 经典的优惠券收集问题CouponCollectorProblem
slug: 经典的优惠券收集问题couponcollectorproblem
category: 数学
summary: 题目描述：一共有 n 种不同的优惠券（Coupons），每次抽取时，获得任意一种优惠券的概率均等（均为 1/n），且每次抽取相互独立。求：为了集齐所有 n 种优惠券，需要抽取次数的数学期望，并以带分数的形式输出结果。
tags: 数学
---

**题目描述：**一共有 n 种不同的优惠券（Coupons），每次抽取时，获得任意一种优惠券的概率均等（均为 1/n），且每次抽取相互独立。求：为了集齐所有 n 种优惠券，需要抽取次数的数学期望，并以带分数的形式输出结果。


**数据范围：** 1≤n≤33。


![](/uploads/csdn/经典的优惠券收集问题couponcollectorproblem/img-01.png)


![](/uploads/csdn/经典的优惠券收集问题couponcollectorproblem/img-02.png)


```cpp
#include <iostream>
#include <algorithm>
using namespace std;

typedef long long ll;

ll gcd(ll a, ll b) {
    return b == 0 ? a : gcd(b, a % b);
}

int main() {
    int n;
    cin >> n;

    ll numerator = 0, denominator = 1;
    // 计算调和数 H_n 的分数形式
    for (int i = 1; i <= n; ++i) {
        ll lcm = denominator / gcd(denominator, (ll)i) * i;
        numerator = numerator * (lcm / denominator) + (lcm / i);
        denominator = lcm;
        ll g = gcd(numerator, denominator);
        numerator /= g;
        denominator /= g;
    }

    // 乘以 n，再约分
    numerator *= n;
    ll g = gcd(numerator, denominator);
    numerator /= g;
    denominator /= g;

    // 输出带分数形式
    if (denominator == 1) {
        cout << numerator << endl;
    } else {
        ll integer = numerator / denominator;
        ll remainder = numerator % denominator;
        if (integer > 0) {
            cout << integer << " " << remainder << "/" << denominator << endl;
        } else {
            cout << remainder << "/" << denominator << endl;
        }
    }

    return 0;
}
```


![](/uploads/csdn/经典的优惠券收集问题couponcollectorproblem/img-03.png)


![](/uploads/csdn/经典的优惠券收集问题couponcollectorproblem/img-04.png)


![](/uploads/csdn/经典的优惠券收集问题couponcollectorproblem/img-05.png)


![](/uploads/csdn/经典的优惠券收集问题couponcollectorproblem/img-06.png)


![](/uploads/csdn/经典的优惠券收集问题couponcollectorproblem/img-07.png)
