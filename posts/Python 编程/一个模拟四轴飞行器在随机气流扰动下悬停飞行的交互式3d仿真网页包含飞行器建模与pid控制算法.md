---
title: 一个模拟四轴飞行器在随机气流扰动下悬停飞行的交互式3D仿真网页包含飞行器建模与PID控制算法
slug: 一个模拟四轴飞行器在随机气流扰动下悬停飞行的交互式3d仿真网页包含飞行器建模与pid控制算法
category: Python 编程
summary: 本文展示了一个基于Three.js的四轴飞行器悬停仿真系统，通过MPU6050传感器模拟实现姿态控制。系统包含完整的3D场景、物理引擎和PID控制器，模拟了飞行器在风力扰动下的动态响应。主要特点包括：
tags: Python
---

本文展示了一个基于Three.js的四轴飞行器悬停仿真系统，通过MPU6050传感器模拟实现姿态控制。系统包含完整的3D场景、物理引擎和PID控制器，模拟了飞行器在风力扰动下的动态响应。主要特点包括：


1.  可视化界面：实时显示飞行器姿态、电机转速和外部扰动数据
2.  物理模拟：包含重力、推力、空气阻力和随机风力扰动
3.  传感器模拟：MPU6050陀螺仪和加速度计数据加入噪声和漂移
4.  控制算法：采用PID控制器实现高度和姿态稳定
5.  交互功能：支持键盘控制目标位置和施加扰动


该系统可用于理解四轴飞行器控制原理和传感器噪声对系统性能的影响。


![](/uploads/csdn/一个模拟四轴飞行器在随机气流扰动下悬停飞行的交互式3d仿真网页包含飞行器建模与pid控制算法/img-01.png)


![](/uploads/csdn/一个模拟四轴飞行器在随机气流扰动下悬停飞行的交互式3d仿真网页包含飞行器建模与pid控制算法/img-02.png)


```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>四轴飞行器 - MPU6050悬停仿真</title>
    <style>
        :root {
            --bg: #1a1a2e;
            --panel-bg: rgba(16, 16, 32, 0.92);
            --text: #e0e0e0;
            --accent: #00e5ff;
            --warn: #ffab40;
            --danger: #ff5252;
            --green: #69f0ae;
            --border: rgba(255, 255, 255, 0.12);
            --shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background: #0a0a14;
            font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
            overflow: hidden;
            height: 100vh;
            width: 100vw;
            user-select: none;
            -webkit-user-select: none;
            -webkit-tap-highlight-color: transparent;
        }

        #canvas-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
        }
        canvas {
            display: block;
        }

        /* 顶部信息栏 */
        #top-bar {
            position: fixed;
            top: 16px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10;
            background: var(--panel-bg);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 10px 20px;
            display: flex;
            align-items: center;
            gap: 20px;
            backdrop-filter: blur(20px);
            box-shadow: var(--shadow);
            pointer-events: auto;
            flex-wrap: wrap;
            justify-content: center;
        }
        #top-bar .status-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: var(--green);
            animation: pulse-dot 1.8s ease-in-out infinite;
            box-shadow: 0 0 10px var(--green);
        }
        @keyframes pulse-dot {
            0%,
            100% {
                box-shadow: 0 0 6px var(--green);
            }
            50% {
                box-shadow: 0 0 18px var(--green), 0 0 30px rgba(105, 240, 174, 0.4);
            }
        }
        #top-bar span {
            color: var(--text);
            font-size: 13px;
            font-weight: 500;
            letter-spacing: 0.5px;
            white-space: nowrap;
        }
        #top-bar .label {
            color: #aaa;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        #top-bar .value {
            color: var(--accent);
            font-weight: 700;
            font-size: 14px;
            font-variant-numeric: tabular-nums;
            font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
        }
        #top-bar .wind-indicator {
            display: flex;
            align-items: center;
            gap: 6px;
        }
        #top-bar .wind-arrow {
            font-size: 18px;
            transition: transform 0.3s;
        }

        /* 底部图例 */
        #legend {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10;
            background: var(--panel-bg);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 8px 16px;
            display: flex;
            gap: 16px;
            font-size: 11px;
            color: #aaa;
            backdrop-filter: blur(20px);
            box-shadow: var(--shadow);
            pointer-events: auto;
            flex-wrap: wrap;
            justify-content: center;
        }
        #legend .dot {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-right: 4px;
            vertical-align: middle;
        }
        .dot-target {
            background: #ffeb3b;
            box-shadow: 0 0 6px #ffeb3b;
        }
        .dot-real {
            background: var(--accent);
            box-shadow: 0 0 6px var(--accent);
        }
        .dot-mpu {
            background: var(--warn);
            box-shadow: 0 0 6px var(--warn);
        }

        /* 侧边面板 */
        #side-panel {
            position: fixed;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            z-index: 10;
            background: var(--panel-bg);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 16px;
            backdrop-filter: blur(20px);
            box-shadow: var(--shadow);
            pointer-events: auto;
            display: flex;
            flex-direction: column;
            gap: 8px;
            min-width: 170px;
        }
        #side-panel .row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            font-size: 12px;
            color: #ccc;
        }
        #side-panel .row .val {
            color: var(--accent);
            font-weight: 600;
            font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
            font-size: 12px;
            min-width: 42px;
            text-align: right;
        }
        #side-panel .row .val.warn {
            color: var(--warn);
        }
        #side-panel .divider {
            border-top: 1px solid var(--border);
            margin: 4px 0;
        }
        #side-panel h4 {
            color: #fff;
            font-size: 13px;
            text-align: center;
            letter-spacing: 1px;
            margin-bottom: 2px;
        }

        /* 响应式 */
        @media (max-width: 768px) {
            #side-panel {
                right: 2px;
                padding: 10px;
                min-width: 140px;
                gap: 4px;
                border-radius: 10px;
            }
            #side-panel .row {
                font-size: 10px;
                gap: 6px;
            }
            #side-panel .row .val {
                font-size: 10px;
                min-width: 32px;
            }
            #top-bar {
                top: 6px;
                padding: 8px 12px;
                gap: 10px;
                border-radius: 10px;
            }
            #top-bar span {
                font-size: 10px;
            }
            #top-bar .value {
                font-size: 11px;
            }
            #legend {
                bottom: 8px;
                padding: 6px 10px;
                gap: 8px;
                font-size: 10px;
                border-radius: 8px;
            }
        }
    </style>
</head>
<body>

    <div id="canvas-container"></div>

    <!-- 顶部状态栏 -->
    <div id="top-bar">
        <div class="status-dot" title="系统运行中"></div>
        <span class="label">目标高度</span><span class="value" id="target-h">3.00m</span>
        <span class="label">当前高度</span><span class="value" id="curr-h">3.00m</span>
        <span class="label">扰动强度</span><span class="value" id="wind-level">中</span>
        <span class="wind-indicator">
            <span class="label">风向</span>
            <span class="wind-arrow" id="wind-arrow">🌬️</span>
            <span class="value" id="wind-force">0.0N</span>
        </span>
    </div>

    <!-- 底部图例 -->
    <div id="legend">
        <span><span class="dot dot-target"></span> 目标位置</span>
        <span><span class="dot dot-real"></span> 实际位置</span>
        <span><span class="dot dot-mpu"></span> MPU6050读数</span>
        <span>| 鼠标拖拽旋转视角 | 滚轮缩放 | 右键平移</span>
    </div>

    <!-- 侧边数据面板 -->
    <div id="side-panel">
        <h4>📡 实时数据</h4>
        <div class="row"><span>Roll 真实</span><span class="val" id="roll-true">0.00°</span></div>
        <div class="row"><span>Roll MPU</span><span class="val warn" id="roll-mpu">0.00°</span></div>
        <div class="row"><span>Pitch 真实</span><span class="val" id="pitch-true">0.00°</span></div>
        <div class="row"><span>Pitch MPU</span><span class="val warn" id="pitch-mpu">0.00°</span></div>
        <div class="row"><span>Yaw 真实</span><span class="val" id="yaw-true">0.00°</span></div>
        <div class="divider"></div>
        <div class="row"><span>电机0</span><span class="val" id="motor0">0</span></div>
        <div class="row"><span>电机1</span><span class="val" id="motor1">0</span></div>
        <div class="row"><span>电机2</span><span class="val" id="motor2">0</span></div>
        <div class="row"><span>电机3</span><span class="val" id="motor3">0</span></div>
        <div class="divider"></div>
        <div class="row"><span>扰动X</span><span class="val" id="dist-x">0.00N</span></div>
        <div class="row"><span>扰动Z</span><span class="val" id="dist-z">0.00N</span></div>
    </div>

    <!-- Three.js Import Map -->
    <script type="importmap">
        {
            "imports": {
                "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
                "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"
            }
        }
    </script>

    <script type="module">
        import * as THREE from 'three';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

        // ==================== 场景初始化 ====================
        const container = document.getElementById('canvas-container');
        const scene = new THREE.Scene();

        // 天空渐变背景
        scene.background = new THREE.Color(0x1a2a3a);
        scene.fog = new THREE.Fog(0x1a2a3a, 30, 80);

        const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.5, 120);
        camera.position.set(7, 5.5, 9);
        camera.lookAt(0, 3, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;
        container.appendChild(renderer.domElement);

        // OrbitControls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 3, 0);
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.minDistance = 3;
        controls.maxDistance = 25;
        controls.maxPolarAngle = Math.PI * 0.8;
        controls.update();

        // ==================== 光照 ====================
        const ambientLight = new THREE.AmbientLight(0x8899bb, 1.6);
        scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffeedd, 8);
        sunLight.position.set(15, 20, 10);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 80;
        sunLight.shadow.camera.left = -20;
        sunLight.shadow.camera.right = 20;
        sunLight.shadow.camera.top = 20;
        sunLight.shadow.camera.bottom = -20;
        sunLight.shadow.bias = -0.0003;
        sunLight.shadow.normalBias = 0.01;
        scene.add(sunLight);

        const fillLight = new THREE.DirectionalLight(0xaaccff, 3);
        fillLight.position.set(-5, 3, -4);
        scene.add(fillLight);

        // ==================== 地面 ====================
        const groundGeo = new THREE.PlaneGeometry(60, 60);
        const groundMat = new THREE.MeshStandardMaterial({
            color: 0x3a4a3a,
            roughness: 0.85,
            metalness: 0.05,
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.05;
        ground.receiveShadow = true;
        ground.name = 'ground';
        scene.add(ground);

        // 网格线
        const gridHelper = new THREE.PolarGridHelper(14, 48, 24, 128, 0x667766, 0x445544);
        gridHelper.position.y = 0.01;
        scene.add(gridHelper);

        // 起飞平台
        const padGeo = new THREE.CylinderGeometry(0.7, 0.85, 0.2, 32);
        const padMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.4, metalness: 0.6 });
        const pad = new THREE.Mesh(padGeo, padMat);
        pad.position.y = 0.1;
        pad.receiveShadow = true;
        pad.castShadow = true;
        scene.add(pad);

        const padRingGeo = new THREE.TorusGeometry(0.75, 0.04, 16, 48);
        const padRingMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, roughness: 0.2, metalness: 0.7,
        emissive: 0x331100, emissiveIntensity: 0.5 });
        const padRing = new THREE.Mesh(padRingGeo, padRingMat);
        padRing.rotation.x = -Math.PI / 2;
        padRing.position.y = 0.21;
        padRing.receiveShadow = true;
        scene.add(padRing);

        // ==================== 目标悬停标记 ====================
        const targetGroup = new THREE.Group();
        targetGroup.position.set(0, 3.0, 0);
        scene.add(targetGroup);

        // 目标光环
        const targetRingGeo = new THREE.TorusGeometry(0.5, 0.03, 16, 64);
        const targetRingMat = new THREE.MeshStandardMaterial({
            color: 0xffeb3b,
            roughness: 0.2,
            metalness: 0.3,
            emissive: 0x554400,
            emissiveIntensity: 0.8,
        });
        const targetRing = new THREE.Mesh(targetRingGeo, targetRingMat);
        targetRing.rotation.x = -Math.PI / 2;
        targetRing.position.y = 0;
        targetGroup.add(targetRing);

        // 目标小球
        const targetDotGeo = new THREE.SphereGeometry(0.12, 16, 16);
        const targetDotMat = new THREE.MeshStandardMaterial({
            color: 0xffeb3b,
            roughness: 0.2,
            emissive: 0xffaa00,
            emissiveIntensity: 1.2,
        });
        const targetDot = new THREE.Mesh(targetDotGeo, targetDotMat);
        targetDot.position.y = 0;
        targetGroup.add(targetDot);

        // 目标垂直虚线柱
        const dashGroup = new THREE.Group();
        for (let i = 0; i < 20; i++) {
            const segGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.1, 8);
            const segMat = new THREE.MeshBasicMaterial({ color: 0xffeb3b, transparent: true, opacity: 0.5 });
            const seg = new THREE.Mesh(segGeo, segMat);
            seg.position.y = -2.8 + i * 0.3;
            dashGroup.add(seg);
        }
        targetGroup.add(dashGroup);

        // ==================== 飞行器模型构建 ====================
        const droneGroup = new THREE.Group();
        scene.add(droneGroup);

        // 材质定义
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2c2c3a, roughness: 0.35, metalness: 0.7 });
        const armMat = new THREE.MeshStandardMaterial({ color: 0x1a1a28, roughness: 0.3, metalness: 0.8 });
        const motorMat = new THREE.MeshStandardMaterial({ color: 0x3a3a4a, roughness: 0.25, metalness: 0.85 });
        const motorTopMat = new THREE.MeshStandardMaterial({ color: 0x555566, roughness: 0.2, metalness: 0.9 });
        const propBladeMat = new THREE.MeshStandardMaterial({
            color: 0x888899,
            roughness: 0.3,
            metalness: 0.5,
            side: THREE.DoubleSide,
        });
        const propDiscMat = new THREE.MeshStandardMaterial({
            color: 0xccccdd,
            roughness: 0.5,
            metalness: 0.2,
            transparent: true,
            opacity: 0.35,
            side: THREE.DoubleSide,
            depthWrite: false,
        });

        // 中心机身
        const bodyGeo = new THREE.BoxGeometry(0.28, 0.16, 0.28);
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.22;
        body.castShadow = true;
        body.receiveShadow = true;
        droneGroup.add(body);

        // 底部传感器模块
        const sensorGeo = new THREE.BoxGeometry(0.18, 0.06, 0.18);
        const sensorMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.5, metalness: 0.3 });
        const sensor = new THREE.Mesh(sensorGeo, sensorMat);
        sensor.position.y = 0.1;
        sensor.castShadow = true;
        droneGroup.add(sensor);

        // LED指示灯
        const ledGeo = new THREE.SphereGeometry(0.03, 8, 8);
        const ledFrontMat = new THREE.MeshStandardMaterial({ color: 0xff2200, roughness: 0.1, emissive: 0xff0000,
            emissiveIntensity: 1.5 });
        const ledFront = new THREE.Mesh(ledGeo, ledFrontMat);
        ledFront.position.set(0, 0.24, 0.16);
        droneGroup.add(ledFront);
        const ledRearMat = new THREE.MeshStandardMaterial({ color: 0x00ff44, roughness: 0.1, emissive: 0x00ff00,
            emissiveIntensity: 1.5 });
        const ledRear = new THREE.Mesh(ledGeo, ledRearMat);
        ledRear.position.set(0, 0.24, -0.16);
        droneGroup.add(ledRear);

        // 机臂和电机
        const armLength = 0.55;
        const armRadius = 0.03;
        const motorHeight = 0.28;
        const motorRadius = 0.07;
        const motorHeightGeo = new THREE.CylinderGeometry(motorRadius, motorRadius, 0.1, 20);
        const motorBaseGeo = new THREE.CylinderGeometry(motorRadius * 0.85, motorRadius, 0.06, 20);

        const armDirections = [
            { x: 1, z: 0, name: '前' }, // 电机0 - 前方
            { x: 0, z: 1, name: '右' }, // 电机1 - 右方
            { x: -1, z: 0, name: '后' }, // 电机2 - 后方
            { x: 0, z: -1, name: '左' }, // 电机3 - 左方
        ];

        const motorGroups = [];
        const propellerGroups = [];
        const propellerDiscs = [];
        const propellerBladesGroups = [];

        armDirections.forEach((dir, index) => {
            // 机臂
            const armGeo = new THREE.CylinderGeometry(armRadius, armRadius * 1.15, armLength, 12);
            const arm = new THREE.Mesh(armGeo, armMat);
            arm.rotation.z = Math.PI / 2;
            arm.rotation.y = Math.atan2(dir.z, dir.x);
            arm.position.set(dir.x * armLength * 0.42, 0.2, dir.z * armLength * 0.42);
            arm.castShadow = true;
            arm.receiveShadow = true;
            droneGroup.add(arm);

            // 电机组
            const motorGroup = new THREE.Group();
            motorGroup.position.set(dir.x * armLength, motorHeight, dir.z * armLength);

            const motorBody = new THREE.Mesh(motorHeightGeo, motorMat);
            motorBody.position.y = 0;
            motorBody.castShadow = true;
            motorGroup.add(motorBody);

            const motorBase = new THREE.Mesh(motorBaseGeo, motorTopMat);
            motorBase.position.y = 0.05;
            motorBase.castShadow = true;
            motorGroup.add(motorBase);

            const motorTop = new THREE.Mesh(
                new THREE.CylinderGeometry(motorRadius * 0.5, motorRadius * 0.7, 0.04, 16),
                motorTopMat
            );
            motorTop.position.y = 0.09;
            motorGroup.add(motorTop);

            droneGroup.add(motorGroup);
            motorGroups.push(motorGroup);

            // 螺旋桨组（绕自身Y轴旋转）
            const propGroup = new THREE.Group();
            propGroup.position.copy(motorGroup.position);
            propGroup.position.y += 0.08;

            // 两片桨叶（交叉）
            const bladesGroup = new THREE.Group();
            const bladeGeo = new THREE.BoxGeometry(0.04, 0.01, 0.24);
            const blade1 = new THREE.Mesh(bladeGeo, propBladeMat);
            blade1.position.z = 0;
            bladesGroup.add(blade1);
            const blade2 = new THREE.Mesh(bladeGeo, propBladeMat);
            blade2.rotation.y = Math.PI / 2;
            bladesGroup.add(blade2);
            propGroup.add(bladesGroup);
            propellerBladesGroups.push(bladesGroup);

            // 旋转模糊盘
            const discGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.005, 32);
            const disc = new THREE.Mesh(discGeo, propDiscMat.clone());
            disc.position.y = 0;
            propGroup.add(disc);
            propellerDiscs.push(disc);

            droneGroup.add(propGroup);
            propellerGroups.push(propGroup);
        });

        // 起落架
        const landingGearMat = new THREE.MeshStandardMaterial({ color: 0x222233, roughness: 0.5, metalness: 0.6 });
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2 + Math.PI / 4;
            const lx = Math.cos(angle) * 0.22;
            const lz = Math.sin(angle) * 0.22;
            const gearGeo = new THREE.CylinderGeometry(0.015, 0.02, 0.18, 8);
            const gear = new THREE.Mesh(gearGeo, landingGearMat);
            gear.position.set(lx, 0.06, lz);
            gear.castShadow = true;
            droneGroup.add(gear);
            const footGeo = new THREE.SphereGeometry(0.025, 8, 6);
            const foot = new THREE.Mesh(footGeo, landingGearMat);
            foot.position.set(lx, -0.03, lz);
            foot.castShadow = true;
            droneGroup.add(foot);
        }

        // 初始位置
        droneGroup.position.set(0, 3.0, 0);
        droneGroup.quaternion.identity();

        // ==================== 物理参数 ====================
        const GRAVITY = 9.81;
        const MASS = 1.05; // kg
        const ARM_LENGTH = 0.55; // 机臂长度 (m)
        const THRUST_COEFF = 0.000012; // 推力系数 k (N/(rad/s)²)
        const TORQUE_COEFF = 0.00000018; // 反扭矩系数 b (Nm/(rad/s)²)
        const HOVER_RPM = 680; // 悬停时大约的角速度 (rad/s)
        const BASE_OMEGA = HOVER_RPM; // 基础角速度

        // 转动惯量 (kg·m²) - 粗略估计
        const Ixx = 0.025;
        const Iyy = 0.025;
        const Izz = 0.042;
        const invI = new THREE.Matrix3();
        invI.set(
            1 / Ixx, 0, 0,
            0, 1 / Iyy, 0,
            0, 0, 1 / Izz
        );

        // ==================== 状态变量 ====================
        // 位置和速度（世界坐标系）
        const position = new THREE.Vector3(0, 3.0, 0);
        const velocity = new THREE.Vector3(0, 0, 0);

        // 姿态四元数（机体->世界）和角速度（机体坐标系）
        const attitude = new THREE.Quaternion().identity();
        const angularVelocity = new THREE.Vector3(0, 0, 0); // 机体坐标系下的角速度

        // 电机角速度
        const motorOmegas = [BASE_OMEGA, BASE_OMEGA, BASE_OMEGA, BASE_OMEGA];
        const motorOmegaTargets = [BASE_OMEGA, BASE_OMEGA, BASE_OMEGA, BASE_OMEGA];

        // ==================== 扰动模拟 (Ornstein-Uhlenbeck过程) ====================
        class OrnsteinUhlenbeck {
            constructor(theta, sigma, dim = 1) {
                this.theta = theta; // 均值回归速率
                this.sigma = sigma; // 波动强度
                this.dim = dim;
                this.state = new Array(dim).fill(0);
            }
            step(dt) {
                for (let i = 0; i < this.dim; i++) {
                    const dW = (Math.random() * 2 - 1) * Math.sqrt(3); // 近似标准正态
                    this.state[i] += -this.theta * this.state[i] * dt + this.sigma * Math.sqrt(dt) * dW;
                }
                return [...this.state];
            }
            getState() {
                return [...this.state];
            }
        }

        // 风力扰动（世界坐标系下的力，单位N）
        const windForceOU = new OrnsteinUhlenbeck(0.8, 2.5, 2); // X和Z方向
        // 湍流（快速小扰动）
        const turbulenceOU = new OrnsteinUhlenbeck(5.0, 1.2, 2);
        // 扭矩扰动（机体坐标系，单位Nm）
        const torqueDistOU = new OrnsteinUhlenbeck(1.5, 0.25, 3);

        // ==================== MPU6050 模拟 ====================
        class MPU6050Simulator {
            constructor() {
                this.gyroBias = new THREE.Vector3(
                    (Math.random() - 0.5) * 0.015, // rad/s 偏置
                    (Math.random() - 0.5) * 0.015,
                    (Math.random() - 0.5) * 0.02
                );
                this.gyroNoiseDensity = 0.008; // rad/s/√Hz 噪声密度
                this.accelNoiseDensity = 0.06; // m/s²/√Hz
                this.sampleRate = 100; // Hz
                this.lastGyroReading = new THREE.Vector3();
                this.lastAccelReading = new THREE.Vector3();
                this.filteredAngle = new THREE.Vector3(); // 互补滤波后的角度
                this.trueAngle = new THREE.Vector3();
            }

            // 从真实物理状态读取，返回带噪声的陀螺仪读数
            readGyro(trueAngularVelocityBody, dt) {
                const noiseScale = this.gyroNoiseDensity * Math.sqrt(this.sampleRate);
                const noise = new THREE.Vector3(
                    (Math.random() * 2 - 1) * noiseScale * Math.sqrt(3),
                    (Math.random() * 2 - 1) * noiseScale * Math.sqrt(3),
                    (Math.random() * 2 - 1) * noiseScale * Math.sqrt(3)
                );
                const reading = trueAngularVelocityBody.clone()
                    .add(this.gyroBias)
                    .add(noise);
                // 缓慢漂移偏置
                this.gyroBias.x += (Math.random() - 0.5) * 0.00004;
                this.gyroBias.y += (Math.random() - 0.5) * 0.00004;
                this.gyroBias.z += (Math.random() - 0.5) * 0.00006;
                // 限制偏置
                this.gyroBias.clampLength(0.03);
                this.lastGyroReading.copy(reading);
                return reading;
            }

            // 读取加速度计（用于互补滤波校正）
            readAccel(worldAcceleration) {
                const noiseScale = this.accelNoiseDensity * Math.sqrt(this.sampleRate);
                const noise = new THREE.Vector3(
                    (Math.random() * 2 - 1) * noiseScale * Math.sqrt(3),
                    (Math.random() * 2 - 1) * noiseScale * Math.sqrt(3),
                    (Math.random() * 2 - 1) * noiseScale * Math.sqrt(3)
                );
                this.lastAccelReading.copy(worldAcceleration).add(noise);
                return this.lastAccelReading.clone();
            }

            // 获取MPU6050估计的姿态角（带噪声）
            getEstimatedEuler(trueEuler) {
                // 添加缓慢变化的误差和随机噪声
                const noiseAmp = 0.6; // 度
                const driftAmp = 0.4; // 度
                const t = performance.now() * 0.001;
                return new THREE.Vector3(
                    trueEuler.x + Math.sin(t * 0.7 + 1.2) * driftAmp + (Math.random() - 0.5) * noiseAmp,
                    trueEuler.y + Math.cos(t * 0.5 + 0.8) * driftAmp + (Math.random() - 0.5) * noiseAmp,
                    trueEuler.z + Math.sin(t * 0.3 + 2.1) * driftAmp * 1.5 + (Math.random() - 0.5) * noiseAmp * 1.2
                );
            }
        }

        const mpu6050 = new MPU6050Simulator();

        // ==================== PID控制器 ====================
        class PIDController {
            constructor(kp, ki, kd, maxOutput, maxIntegral) {
                this.kp = kp;
                this.ki = ki;
                this.kd = kd;
                this.maxOutput = maxOutput;
                this.maxIntegral = maxIntegral;
                this.integral = 0;
                this.prevError = 0;
                this.output = 0;
            }
            update(error, dt) {
                this.integral += error * dt;
                // 积分限幅
                if (Math.abs(this.integral) > this.maxIntegral) {
                    this.integral = Math.sign(this.integral) * this.maxIntegral;
                }
                const derivative = (error - this.prevError) / Math.max(dt, 0.0001);
                this.prevError = error;
                this.output = this.kp * error + this.ki * this.integral + this.kd * derivative;
                // 输出限幅
                if (Math.abs(this.output) > this.maxOutput) {
                    this.output = Math.sign(this.output) * this.maxOutput;
                }
                return this.output;
            }
            reset() {
                this.integral = 0;
                this.prevError = 0;
                this.output = 0;
            }
        }

        // PID参数
        const heightPID = new PIDController(3.5, 0.6, 1.8, 80, 30); // 高度控制
        const rollPID = new PIDController(4.5, 0.3, 1.2, 60, 20); // 横滚控制
        const pitchPID = new PIDController(4.5, 0.3, 1.2, 60, 20); // 俯仰控制
        const yawPID = new PIDController(2.5, 0.15, 0.8, 30, 12); // 偏航控制

        // 目标
        const targetPosition = new THREE.Vector3(0, 3.0, 0);
        const targetYaw = 0; // 目标偏航角

        // ==================== 辅助函数 ====================
        function getEulerFromQuaternion(q) {
            const euler = new THREE.Euler();
            euler.setFromQuaternion(q, 'YXZ'); // 使用YXZ顺序（偏航-俯仰-横滚）
            // 返回 (roll, pitch, yaw) 对应 (x, y, z)
            return new THREE.Vector3(euler.x, euler.y, euler.z);
        }

        function clamp(value, min, max) {
            return Math.max(min, Math.min(max, value));
        }

        // ==================== 物理更新 ====================
        function physicsUpdate(dt) {
            // 限制dt避免大跳跃
            const effectiveDt = Math.min(dt, 0.05);

            // --- 更新电机转速（一阶响应逼近目标） ---
            const motorTau = 0.04; // 电机时间常数
            for (let i = 0; i < 4; i++) {
                const alpha = 1 - Math.exp(-effectiveDt / motorTau);
                motorOmegas[i] += (motorOmegaTargets[i] - motorOmegas[i]) * alpha;
                // 限制转速范围
                motorOmegas[i] = clamp(motorOmegas[i], 50, 1600);
            }

            // --- 计算推力和力矩（机体坐标系） ---
            const thrustBody = new THREE.Vector3(0, 0, 0);
            const torqueBody = new THREE.Vector3(0, 0, 0);

            for (let i = 0; i < 4; i++) {
                const omega = motorOmegas[i];
                const omegaSq = omega * omega;
                const thrust = THRUST_COEFF * omegaSq;
                thrustBody.y += thrust;

                // 力矩：roll和pitch来自推力差，yaw来自反扭矩
                const sign = (i === 0 || i === 3) ? 1 : -1; // 电机0和3为正旋转方向
                const armSignX = (i === 0 ? 1 : i === 2 ? -1 : 0); // 前后
                const armSignZ = (i === 1 ? 1 : i === 3 ? -1 : 0); // 左右

                // Roll力矩（绕机体X轴）：左右电机差
                torqueBody.x += armSignZ * thrust * ARM_LENGTH;
                // Pitch力矩（绕机体Z轴）：前后电机差
                torqueBody.z += armSignX * thrust * ARM_LENGTH;
                // Yaw力矩（绕机体Y轴）：反扭矩
                torqueBody.y += sign * TORQUE_COEFF * omegaSq;
            }

            // --- 扰动 ---
            const windForceWorld = new THREE.Vector3();
            const windRaw = windForceOU.step(effectiveDt);
            const turbRaw = turbulenceOU.step(effectiveDt);
            windForceWorld.x = windRaw[0] + turbRaw[0] * 0.4;
            windForceWorld.z = windRaw[1] + turbRaw[1] * 0.4;
            windForceWorld.y = (Math.random() - 0.5) * 0.3; // 微小垂直扰动

            const distTorqueBody = new THREE.Vector3();
            const tqRaw = torqueDistOU.step(effectiveDt);
            distTorqueBody.x = tqRaw[0];
            distTorqueBody.y = tqRaw[2];
            distTorqueBody.z = tqRaw[1];

            // --- 世界坐标系下的合力 ---
            // 重力
            const gravityForce = new THREE.Vector3(0, -MASS * GRAVITY, 0);
            // 推力（从机体转换到世界）
            const thrustWorld = thrustBody.clone().applyQuaternion(attitude);
            // 空气阻力
            const dragCoeff = 0.35;
            const dragForce = velocity.clone().multiplyScalar(-dragCoeff * velocity.length());
            // 总力
            const totalForce = gravityForce.clone()
                .add(thrustWorld)
                .add(windForceWorld)
                .add(dragForce);

            // --- 更新位置和速度 ---
            const acceleration = totalForce.clone().divideScalar(MASS);
            velocity.add(acceleration.clone().multiplyScalar(effectiveDt));
            position.add(velocity.clone().multiplyScalar(effectiveDt));

            // 地面碰撞
            if (position.y < 0.15) {
                position.y = 0.15;
                if (velocity.y < 0) velocity.y *= -0.3;
                velocity.x *= 0.85;
                velocity.z *= 0.85;
            }
            // 天花板
            if (position.y > 12) {
                position.y = 12;
                if (velocity.y > 0) velocity.y *= -0.3;
            }

            // --- 更新姿态 ---
            const totalTorqueBody = torqueBody.clone().add(distTorqueBody);
            // 角加速度（机体坐标系）：I * dω/dt = τ - ω × (I·ω)
            const Iomega = new THREE.Vector3(
                Ixx * angularVelocity.x,
                Iyy * angularVelocity.y,
                Izz * angularVelocity.z
            );
            const gyroscopic = new THREE.Vector3().crossVectors(angularVelocity, Iomega);
            const angularAccelBody = new THREE.Vector3(
                (totalTorqueBody.x - gyroscopic.x) / Ixx,
                (totalTorqueBody.y - gyroscopic.y) / Iyy,
                (totalTorqueBody.z - gyroscopic.z) / Izz
            );

            angularVelocity.add(angularAccelBody.clone().multiplyScalar(effectiveDt));
            // 角速度阻尼
            angularVelocity.multiplyScalar(1 - 0.6 * effectiveDt);
            // 限制角速度
            angularVelocity.clampLength(15);

            // 更新四元数
            const angVelNorm = angularVelocity.length();
            if (angVelNorm > 0.0001) {
                const axis = angularVelocity.clone().normalize();
                const angle = angVelNorm * effectiveDt;
                const deltaQ = new THREE.Quaternion().setFromAxisAngle(axis, angle);
                attitude.multiply(deltaQ);
                attitude.normalize();
            }

            // --- 存储用于显示的扰动数据 ---
            return {
                windForceWorld: windForceWorld.clone(),
                distTorqueBody: distTorqueBody.clone(),
                thrustWorld: thrustWorld.clone(),
            };
        }

        // ==================== 控制更新 ====================
        function controlUpdate(dt) {
            const effectiveDt = Math.min(dt, 0.05);

            // 获取真实姿态
            const trueEuler = getEulerFromQuaternion(attitude);
            const trueRoll = THREE.MathUtils.radToDeg(trueEuler.x);
            const truePitch = THREE.MathUtils.radToDeg(trueEuler.y);
            const trueYaw = THREE.MathUtils.radToDeg(trueEuler.z);

            // MPU6050模拟读数（带噪声的姿态估计）
            const mpuEuler = mpu6050.getEstimatedEuler(
                new THREE.Vector3(trueRoll, truePitch, trueYaw)
            );

            // PID使用MPU6050的读数（模拟真实飞控使用传感器数据）
            const mpuRoll = mpuEuler.x;
            const mpuPitch = mpuEuler.y;
            const mpuYaw = mpuEuler.z;

            // 高度误差
            const heightError = targetPosition.y - position.y;
            // 偏航误差（处理角度环绕）
            let yawError = targetYaw - mpuYaw;
            while (yawError > 180) yawError -= 360;
            while (yawError < -180) yawError += 360;

            // PID计算
            const heightOutput = heightPID.update(heightError, effectiveDt);
            const rollOutput = rollPID.update(-mpuRoll, effectiveDt); // 负号：roll正=右倾，需要左侧更多推力
            const pitchOutput = pitchPID.update(-mpuPitch, effectiveDt); // 负号：pitch正=前倾，需要后方更多推力
            const yawOutput = yawPID.update(yawError, effectiveDt);

            // 基础推力分配
            const baseThrust = (MASS * GRAVITY) / (4 * THRUST_COEFF);
            const baseOmegaSq = Math.max(0, baseThrust + heightOutput * 120);

            // 各电机目标转速平方
            // 电机0(前): +pitch, +yaw
            // 电机1(右): +roll, -yaw
            // 电机2(后): -pitch, +yaw
            // 电机3(左): -roll, -yaw
            const omegaSqTargets = [
                baseOmegaSq + pitchOutput * 100 + yawOutput * 60,
                baseOmegaSq + rollOutput * 100 - yawOutput * 60,
                baseOmegaSq - pitchOutput * 100 + yawOutput * 60,
                baseOmegaSq - rollOutput * 100 - yawOutput * 60,
            ];

            for (let i = 0; i < 4; i++) {
                motorOmegaTargets[i] = Math.sqrt(Math.max(100, omegaSqTargets[i]));
                motorOmegaTargets[i] = clamp(motorOmegaTargets[i], 80, 1550);
            }

            return {
                mpuEuler,
                trueEuler: new THREE.Vector3(trueRoll, truePitch, trueYaw),
                heightError,
                yawError,
                heightOutput,
                rollOutput,
                pitchOutput,
                yawOutput,
            };
        }

        // ==================== 粒子效果（风可视化） ====================
        const windParticles = [];
        const maxWindParticles = 60;
        const windParticlesGroup = new THREE.Group();
        scene.add(windParticlesGroup);

        function spawnWindParticle(windDir, strength) {
            if (windParticles.length >= maxWindParticles) return;
            const geo = new THREE.SphereGeometry(0.02 + Math.random() * 0.04, 4, 4);
            const mat = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(0.55 + Math.random() * 0.15, 0.3, 0.7 + Math.random() * 0.3),
                transparent: true,
                opacity: 0.7,
                depthWrite: false,
            });
            const particle = new THREE.Mesh(geo, mat);
            const startPos = new THREE.Vector3(
                position.x + (Math.random() - 0.5) * 3,
                position.y + (Math.random() - 0.5) * 2,
                position.z + (Math.random() - 0.5) * 3
            );
            particle.position.copy(startPos);
            particle.userData = {
                velocity: new THREE.Vector3(
                    windDir.x * (0.8 + Math.random() * 1.5) * strength,
                    (Math.random() - 0.5) * 0.5 * strength,
                    windDir.z * (0.8 + Math.random() * 1.5) * strength
                ),
                life: 1.0,
                decay: 0.4 + Math.random() * 1.2,
            };
            windParticlesGroup.add(particle);
            windParticles.push(particle);
        }

        function updateWindParticles(dt, windForceWorld) {
            const strength = windForceWorld.length() / 5;
            const windDir = windForceWorld.length() > 0.01 ?
                windForceWorld.clone().normalize() :
                new THREE.Vector3(0.3, 0, 0.2);

            // 生成新粒子
            if (strength > 0.15 && Math.random() < strength * 8 * dt) {
                spawnWindParticle(windDir, strength);
            }
            if (Math.random() < 0.3 * dt) {
                spawnWindParticle(
                    new THREE.Vector3((Math.random() - 0.5) * 2, 0, (Math.random() - 0.5) * 2),
                    0.3
                );
            }

            // 更新粒子
            for (let i = windParticles.length - 1; i >= 0; i--) {
                const p = windParticles[i];
                p.userData.life -= p.userData.decay * dt;
                p.position.add(p.userData.velocity.clone().multiplyScalar(dt));
                p.material.opacity = Math.max(0, p.userData.life * 0.6);
                p.scale.setScalar(p.userData.life);
                if (p.userData.life <= 0) {
                    windParticlesGroup.remove(p);
                    p.geometry.dispose();
                    p.material.dispose();
                    windParticles.splice(i, 1);
                }
            }
        }

        // ==================== 轨迹点 ====================
        const trailPoints = [];
        const maxTrailPoints = 200;
        const trailGroup = new THREE.Group();
        scene.add(trailGroup);
        const trailLineMat = new THREE.LineBasicMaterial({
            color: 0x00e5ff,
            transparent: true,
            opacity: 0.5,
            depthTest: true,
            depthWrite: false,
        });

        function updateTrail() {
            trailPoints.push(position.clone());
            if (trailPoints.length > maxTrailPoints) trailPoints.shift();
            // 重建轨迹线
            while (trailGroup.children.length > 0) {
                const child = trailGroup.children[0];
                if (child.geometry) child.geometry.dispose();
                trailGroup.remove(child);
            }
            if (trailPoints.length >= 2) {
                const pointsForLine = trailPoints.map(p => p.clone());
                const geo = new THREE.BufferGeometry().setFromPoints(pointsForLine);
                const line = new THREE.Line(geo, trailLineMat);
                trailGroup.add(line);
            }
        }

        let trailUpdateCounter = 0;
        const TRAIL_UPDATE_INTERVAL = 6; // 每6帧更新一次轨迹

        // ==================== 场景中的标记球 ====================
        // 实际位置标记
        const realMarkerGeo = new THREE.SphereGeometry(0.08, 12, 12);
        const realMarkerMat = new THREE.MeshStandardMaterial({
            color: 0x00e5ff,
            roughness: 0.2,
            emissive: 0x004466,
            emissiveIntensity: 0.9,
        });
        const realMarker = new THREE.Mesh(realMarkerGeo, realMarkerMat);
        realMarker.position.copy(position);
        realMarker.renderOrder = 1;
        realMarker.material.depthTest = true;
        realMarker.material.depthWrite = true;
        scene.add(realMarker);

        // MPU6050估计位置的可视化（偏差标记）
        const mpuMarkerGeo = new THREE.SphereGeometry(0.06, 10, 10);
        const mpuMarkerMat = new THREE.MeshStandardMaterial({
            color: 0xffab40,
            roughness: 0.2,
            emissive: 0x331100,
            emissiveIntensity: 0.7,
        });
        const mpuMarker = new THREE.Mesh(mpuMarkerGeo, mpuMarkerMat);
        mpuMarker.position.copy(position);
        mpuMarker.renderOrder = 2;
        mpuMarker.material.depthTest = true;
        mpuMarker.material.depthWrite = true;
        scene.add(mpuMarker);

        // ==================== 主循环 ====================
        let lastTime = performance.now();
        let displayData = {
            windForceWorld: new THREE.Vector3(),
            distTorqueBody: new THREE.Vector3(),
            mpuEuler: new THREE.Vector3(),
            trueEuler: new THREE.Vector3(),
            heightError: 0,
            yawError: 0,
            heightOutput: 0,
            rollOutput: 0,
            pitchOutput: 0,
            yawOutput: 0,
        };

        function animate(timestamp) {
            requestAnimationFrame(animate);

            let dt = (timestamp - lastTime) / 1000;
            if (dt <= 0) dt = 0.016;
            if (dt > 0.1) dt = 0.1; // 防止大帧跳跃
            lastTime = timestamp;

            // 物理更新
            const physData = physicsUpdate(dt);

            // 控制更新
            const ctrlData = controlUpdate(dt);
            displayData = { ...physData, ...ctrlData };

            // 更新飞行器3D位置和姿态
            droneGroup.position.copy(position);
            droneGroup.quaternion.copy(attitude);

            // 更新螺旋桨旋转
            for (let i = 0; i < 4; i++) {
                const rotSpeed = motorOmegas[i]; // rad/s
                propellerGroups[i].rotation.y += rotSpeed * dt;
                // 更新模糊盘的透明度（高速时更明显）
                const speedRatio = motorOmegas[i] / HOVER_RPM;
                propellerDiscs[i].material.opacity = 0.15 + speedRatio * 0.35;
                propellerDiscs[i].material.opacity = clamp(propellerDiscs[i].material.opacity, 0.1, 0.55);
                // 桨叶在高速时稍微透明
                const bladeOpacity = 1 - speedRatio * 0.4;
                propellerBladesGroups[i].children.forEach(b => {
                    b.material.opacity = clamp(bladeOpacity, 0.4, 1);
                    b.material.transparent = true;
                });
            }

            // 更新实际位置标记
            realMarker.position.copy(position);
            // MPU标记显示带噪声的估计位置（略微偏移）
            const mpuOffset = new THREE.Vector3(
                (displayData.mpuEuler.x - displayData.trueEuler.x) * 0.008,
                displayData.heightError * 0.15,
                (displayData.mpuEuler.y - displayData.trueEuler.y) * 0.008
            );
            mpuMarker.position.copy(position).add(mpuOffset);
            mpuMarker.position.y += 0.2;

            // 更新目标标记
            targetGroup.position.copy(targetPosition);
            // 目标光环脉冲
            const pulse = 1 + Math.sin(timestamp * 0.004) * 0.08;
            targetRing.scale.setScalar(pulse);
            targetDot.scale.setScalar(1 + Math.sin(timestamp * 0.005 + 1) * 0.2);

            // 更新轨迹
            trailUpdateCounter++;
            if (trailUpdateCounter >= TRAIL_UPDATE_INTERVAL) {
                trailUpdateCounter = 0;
                updateTrail();
            }

            // 更新风粒子
            updateWindParticles(dt, displayData.windForceWorld);

            // 更新UI数据
            updateUI(displayData);

            // 更新控制器
            controls.target.lerp(position.clone().add(new THREE.Vector3(0, 0.3, 0)), 0.05);
            controls.update();

            // 渲染
            renderer.render(scene, camera);

            // 更新阴影（动态）
            sunLight.position.x = position.x + 15;
            sunLight.position.z = position.z + 10;
            sunLight.position.y = 20;
            sunLight.target.position.copy(position);
            sunLight.target.updateMatrixWorld();
        }

        // ==================== UI更新 ====================
        function updateUI(data) {
            // 高度
            document.getElementById('target-h').textContent = targetPosition.y.toFixed(2) + 'm';
            document.getElementById('curr-h').textContent = position.y.toFixed(2) + 'm';

            // 扰动
            const windStrength = data.windForceWorld.length();
            document.getElementById('wind-force').textContent = windStrength.toFixed(1) + 'N';
            let windLevel = '低';
            if (windStrength > 3) windLevel = '高';
            else if (windStrength > 1.2) windLevel = '中';
            document.getElementById('wind-level').textContent = windLevel;
            document.getElementById('wind-level').style.color =
                windLevel === '高' ? '#ff5252' : windLevel === '中' ? '#ffab40' : '#69f0ae';

            // 风向箭头
            const arrow = document.getElementById('wind-arrow');
            if (windStrength > 0.3) {
                const angle = Math.atan2(data.windForceWorld.z, data.windForceWorld.x) * (180 / Math.PI);
                arrow.style.transform = `rotate(${angle}deg)`;
                arrow.textContent = '💨';
            } else {
                arrow.style.transform = 'rotate(0deg)';
                arrow.textContent = '🌬️';
            }

            // 姿态
            document.getElementById('roll-true').textContent = data.trueEuler.x.toFixed(2) + '°';
            document.getElementById('roll-mpu').textContent = data.mpuEuler.x.toFixed(2) + '°';
            document.getElementById('pitch-true').textContent = data.trueEuler.y.toFixed(2) + '°';
            document.getElementById('pitch-mpu').textContent = data.mpuEuler.y.toFixed(2) + '°';
            document.getElementById('yaw-true').textContent = data.trueEuler.z.toFixed(2) + '°';

            // 高亮MPU读数与真实值的差异
            const rollDiff = Math.abs(data.mpuEuler.x - data.trueEuler.x);
            const pitchDiff = Math.abs(data.mpuEuler.y - data.trueEuler.y);
            document.getElementById('roll-mpu').classList.toggle('warn', rollDiff > 1.5);
            document.getElementById('pitch-mpu').classList.toggle('warn', pitchDiff > 1.5);

            // 电机转速
            document.getElementById('motor0').textContent = Math.round(motorOmegas[0]) + ' rad/s';
            document.getElementById('motor1').textContent = Math.round(motorOmegas[1]) + ' rad/s';
            document.getElementById('motor2').textContent = Math.round(motorOmegas[2]) + ' rad/s';
            document.getElementById('motor3').textContent = Math.round(motorOmegas[3]) + ' rad/s';

            // 扰动分量
            document.getElementById('dist-x').textContent = data.windForceWorld.x.toFixed(2) + 'N';
            document.getElementById('dist-z').textContent = data.windForceWorld.z.toFixed(2) + 'N';
        }

        // ==================== 键盘交互 ====================
        window.addEventListener('keydown', (event) => {
            const step = 0.5;
            switch (event.key.toLowerCase()) {
                case 'w':
                    targetPosition.y = Math.min(10, targetPosition.y + step);
                    break;
                case 's':
                    targetPosition.y = Math.max(0.5, targetPosition.y - step);
                    break;
                case 'a':
                    targetPosition.x -= step;
                    break;
                case 'd':
                    targetPosition.x += step;
                    break;
                case 'q':
                    targetPosition.z -= step;
                    break;
                case 'e':
                    targetPosition.z += step;
                    break;
                case 'r':
                    // 重置
                    targetPosition.set(0, 3.0, 0);
                    position.set(0, 3.0, 0);
                    velocity.set(0, 0, 0);
                    attitude.identity();
                    angularVelocity.set(0, 0, 0);
                    for (let i = 0; i < 4; i++) {
                        motorOmegas[i] = BASE_OMEGA;
                        motorOmegaTargets[i] = BASE_OMEGA;
                    }
                    heightPID.reset();
                    rollPID.reset();
                    pitchPID.reset();
                    yawPID.reset();
                    trailPoints.length = 0;
                    while (trailGroup.children.length > 0) {
                        const child = trailGroup.children[0];
                        if (child.geometry) child.geometry.dispose();
                        trailGroup.remove(child);
                    }
                    console.log('🔄 仿真已重置');
                    break;
                case 'f':
                    // 施加一个随机强扰动
                    const strongForce = new THREE.Vector3(
                        (Math.random() - 0.5) * 8,
                        (Math.random() - 0.5) * 3,
                        (Math.random() - 0.5) * 8
                    );
                    velocity.add(strongForce.clone().divideScalar(MASS));
                    angularVelocity.add(
                        new THREE.Vector3(
                            (Math.random() - 0.5) * 8,
                            (Math.random() - 0.5) * 5,
                            (Math.random() - 0.5) * 8
                        )
                    );
                    console.log('💥 施加随机强扰动:', strongForce.length().toFixed(1), 'N');
                    break;
            }
        });

        // ==================== 窗口大小调整 ====================
        window.addEventListener('resize', () => {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        });

        // ==================== 启动 ====================
        console.log('🚁 四轴飞行器仿真已就绪');
        console.log('   🎯 目标悬停高度: 3.0m');
        console.log('   📡 MPU6050模拟: 带噪声和漂移');
        console.log('   🌬️ 随机空气扰动: Ornstein-Uhlenbeck过程');
        console.log('   🎮 操作: W/S=升降目标 A/D/Q/E=移动目标');
        console.log('   💥 按F键施加随机强扰动');
        console.log('   🔄 按R键重置仿真');
        console.log('   🖱️ 鼠标拖拽旋转视角 | 滚轮缩放 | 右键平移');
        requestAnimationFrame(animate);
    </script>
</body>
</html>
```
