---
title: 一个月的阴晴圆缺变化回弹HTML仿真
slug: 一个月的阴晴圆缺变化回弹html仿真
category: 编程技术
summary: 这篇文章介绍了一个交互式的3D月球光照演变演示工具，通过可视化方式展示月相变化的完整周期（约29.5天）。该网页应用采用Three.js构建三维场景，包含以下核心功能：
tags: 随笔
---

这篇文章介绍了一个交互式的3D月球光照演变演示工具，通过可视化方式展示月相变化的完整周期（约29.5天）。该网页应用采用Three.js构建三维场景，包含以下核心功能：


1.  实时3D渲染地月系统，展示不同月相下月球受太阳光照的变化
2.  右上角显示当前月相名称（如新月、上弦月等）及光照百分比
3.  底部控制面板支持播放/暂停、调速（1×-20×）、跳转关键节点（如满月）
4.  左侧显示模拟天数，滑块可精确调节月相进度
5.  交互功能包括：鼠标拖拽旋转视角、滚轮缩放、键盘快捷键控制


这个教育工具将复杂的天文现象转化为直观的动态可视化，适用于天文爱好者和教学场景。


![](/uploads/csdn/一个月的阴晴圆缺变化回弹html仿真/img-01.png)


```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>月球光照3D演变 — 月相变化</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;overflow:hidden;background:#000;color:#fff;font-family:'Segoe UI','PingFang SC','Microsoft YaHei',system-ui,sans-serif}
#container{position:absolute;inset:0}

/* Phase viewer — top right */
#phase-viewer{
  position:absolute;top:20px;right:20px;
  width:160px;height:190px;
  background:rgba(0,0,0,.65);
  border:1px solid rgba(255,255,255,.12);
  border-radius:12px;
  backdrop-filter:blur(12px);
  display:flex;flex-direction:column;align-items:center;
  padding:12px 10px 8px;z-index:10;user-select:none;
}
#phase-viewer canvas{
  width:110px;height:110px;
  border-radius:50%;
  box-shadow:0 0 20px rgba(255,255,200,.08);
}
#phase-name{
  margin-top:6px;font-size:14px;font-weight:600;
  letter-spacing:1px;white-space:nowrap;
}
#phase-illum{
  font-size:11px;opacity:.7;margin-top:2px;
}

/* Day badge — top left */
#day-badge{
  position:absolute;top:20px;left:20px;
  background:rgba(0,0,0,.65);border:1px solid rgba(255,255,255,.12);
  border-radius:12px;backdrop-filter:blur(12px);
  padding:10px 18px;z-index:10;user-select:none;
  font-size:13px;line-height:1.5;
}
#day-badge .num{font-size:26px;font-weight:700;letter-spacing:.5px}
#day-badge .label{opacity:.6;font-size:11px;margin-left:4px}
#day-badge .sub{opacity:.5;font-size:11px;margin-top:2px}

/* Controls — bottom center */
#controls{
  position:absolute;bottom:30px;left:50%;transform:translateX(-50%);
  background:rgba(0,0,0,.7);border:1px solid rgba(255,255,255,.1);
  border-radius:16px;backdrop-filter:blur(16px);
  padding:14px 24px 16px;z-index:10;user-select:none;
  min-width:420px;max-width:90vw;
  display:flex;flex-direction:column;gap:10px;
}
#controls .row{display:flex;align-items:center;gap:12px}
#controls .row.top{justify-content:space-between}
#controls .row.bottom{justify-content:center;gap:16px}
#day-slider{
  -webkit-appearance:none;appearance:none;
  width:100%;height:4px;border-radius:2px;
  background:linear-gradient(90deg,#444,#888 50%,#444);
  outline:none;cursor:pointer;flex:1;
}
#day-slider::-webkit-slider-thumb{
  -webkit-appearance:none;appearance:none;
  width:16px;height:16px;border-radius:50%;
  background:#f0c040;border:2px solid rgba(255,255,255,.3);
  cursor:pointer;box-shadow:0 0 12px rgba(240,192,64,.35);
  transition:transform .15s;
}
#day-slider::-webkit-slider-thumb:hover{transform:scale(1.2)}
#day-slider::-moz-range-thumb{
  width:16px;height:16px;border-radius:50%;
  background:#f0c040;border:2px solid rgba(255,255,255,.3);
  cursor:pointer;
}

#controls button{
  background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);
  color:#fff;border-radius:8px;padding:6px 14px;font-size:14px;
  cursor:pointer;transition:all .2s;
  display:flex;align-items:center;gap:4px;line-height:1;
}
#controls button:hover{background:rgba(255,255,255,.15)}
#controls button.active{background:rgba(240,192,64,.2);border-color:#f0c040}
#speed-select{
  background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);
  color:#fff;border-radius:8px;padding:6px 10px;font-size:12px;
  cursor:pointer;outline:none;
}
#speed-select option{background:#222}
#controls .day-info{font-size:13px;opacity:.8;white-space:nowrap}
#controls .illum-info{font-size:12px;opacity:.6}

/* Phase progress bar */
#phase-bar{
  width:100%;height:2px;border-radius:1px;
  background:rgba(255,255,255,.08);margin-top:2px;overflow:hidden;
}
#phase-bar .fill{
  height:100%;border-radius:1px;
  background:linear-gradient(90deg,#f0c040,#ffd700);
  transition:width .1s;
}

/* Hint */
#hint{
  position:absolute;bottom:100px;left:50%;transform:translateX(-50%);
  color:rgba(255,255,255,.25);font-size:11px;z-index:5;
  pointer-events:none;text-align:center;letter-spacing:.3px;
}

/* Responsive */
@media(max-width:600px){
  #controls{min-width:auto;width:calc(100vw - 24px);padding:12px 16px 14px;border-radius:12px}
  #phase-viewer{width:130px;height:160px;padding:8px;top:12px;right:12px}
  #phase-viewer canvas{width:90px;height:90px}
  #day-badge{padding:6px 12px;top:12px;left:12px}
  #day-badge .num{font-size:20px}
  #hint{display:none}
}
</style>
</head>
<body>

<div id="container"></div>

<div id="day-badge">
  <div><span class="num" id="day-num">1</span><span class="label">天</span></div>
  <div class="sub" id="date-label">新月期</div>
</div>

<div id="phase-viewer">
  <canvas id="phase-canvas" width="220" height="220"></canvas>
  <div id="phase-name">🌑 新月</div>
  <div id="phase-illum">光照 0%</div>
</div>

<div id="hint">🖱 拖拽旋转 · 滚轮缩放</div>

<div id="controls">
  <div class="row top">
    <span class="day-info" id="day-info">第 0.0 天 / 29.5 天</span>
    <span class="illum-info" id="illum-info">光照 0.0%</span>
  </div>
  <div class="row">
    <input type="range" id="day-slider" min="0" max="295" value="0" step="1">
  </div>
  <div id="phase-bar"><div class="fill" id="phase-fill" style="width:0%"></div></div>
  <div class="row bottom">
    <button id="play-btn" class="active" title="播放/暂停">⏸</button>
    <button id="reset-btn" title="重置到新月">⟲</button>
    <select id="speed-select">
      <option value="1">1×</option>
      <option value="2">2×</option>
      <option value="5">5×</option>
      <option value="10">10×</option>
      <option value="20">20×</option>
    </select>
    <button id="today-btn" title="满月">🌕</button>
  </div>
</div>

<script type="importmap">
{
  "imports":{
    "three":"https://unpkg.com/three@0.160.0/build/three.module.js",
    "three/addons/":"https://unpkg.com/three@0.160.0/examples/jsm/"
  }
}
</script>

<script type="module">
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ──────────────────────────────────────────
// Constants
// ──────────────────────────────────────────
const LUNAR_CYCLE = 29.5;
const ORBIT_RADIUS = 3.2;
const EARTH_RADIUS = 1.0;
const MOON_RADIUS = 0.3;
const SUN_DIST = 80;

const PHASE_NAMES = [
  { min:0.00, max:0.03, name:'🌑 新月',     en:'New Moon' },
  { min:0.03, max:0.22, name:'🌒 蛾眉月',   en:'Waxing Crescent' },
  { min:0.22, max:0.28, name:'🌓 上弦月',   en:'First Quarter' },
  { min:0.28, max:0.47, name:'🌔 盈凸月',   en:'Waxing Gibbous' },
  { min:0.47, max:0.53, name:'🌕 满月',     en:'Full Moon' },
  { min:0.53, max:0.72, name:'🌖 亏凸月',   en:'Waning Gibbous' },
  { min:0.72, max:0.78, name:'🌗 下弦月',   en:'Third Quarter' },
  { min:0.78, max:1.00, name:'🌘 残月',     en:'Waning Crescent' },
];

// ──────────────────────────────────────────
// State
// ──────────────────────────────────────────
let day = 0;
let isPlaying = true;
let speed = 1;

// ──────────────────────────────────────────
// Three.js Scene
// ──────────────────────────────────────────
const container = document.getElementById('container');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 500);
camera.position.set(5, 3.5, 5);

const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 2.5;
controls.maxDistance = 20;
controls.target.set(0, 0, 0);
controls.update();

// ── Stars ──
const starCount = 4000;
const starGeo = new THREE.BufferGeometry();
const starPos = new Float32Array(starCount * 3);
const starSizes = new Float32Array(starCount);
for(let i=0; i<starCount; i++){
  const r = 80 + Math.random() * 120;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  starPos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
  starPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
  starPos[i*3+2] = r * Math.cos(phi);
  starSizes[i] = 0.5 + Math.random() * 1.5;
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
starGeo.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
const starMat = new THREE.PointsMaterial({
  color: 0xffffff, size: 0.25, transparent: true, opacity: 0.8,
  sizeAttenuation: true,
});
scene.add(new THREE.Points(starGeo, starMat));

// ── Lights ──
const ambient = new THREE.AmbientLight(0x111833, 0.03);
scene.add(ambient);

const hemiLight = new THREE.HemisphereLight(0x4488ff, 0x442200, 0.1);
scene.add(hemiLight);

const sunLight = new THREE.DirectionalLight(0xffeedd, 3.5);
sunLight.position.set(SUN_DIST, 0, 0);
scene.add(sunLight);

const fillLight = new THREE.DirectionalLight(0x4488ff, 0.08);
fillLight.position.set(-4, 2, -4);
scene.add(fillLight);

// ── Sun visual (distant glow) ──
const sunGeo = new THREE.SphereGeometry(3, 16, 16);
const sunMat = new THREE.MeshBasicMaterial({ color:0xffdd44 });
const sunMesh = new THREE.Mesh(sunGeo, sunMat);
sunMesh.position.set(SUN_DIST, 0, 0);
scene.add(sunMesh);

// Glow
const glowGeo = new THREE.SphereGeometry(4.5, 16, 16);
const glowMat = new THREE.MeshBasicMaterial({
  color:0xffdd44, transparent:true, opacity:0.15,
});
const glowMesh = new THREE.Mesh(glowGeo, glowMat);
glowMesh.position.copy(sunMesh.position);
scene.add(glowMesh);

// Sun rays (lens flare-like sprites)
for(let i=0; i<6; i++){
  const a = (i / 6) * Math.PI * 2;
  const rayGeo = new THREE.PlaneGeometry(0.8, 12 + Math.random()*8);
  const rayMat = new THREE.MeshBasicMaterial({
    color:0xffdd44, transparent:true, opacity:0.06,
    side: THREE.DoubleSide, depthWrite:false,
  });
  const ray = new THREE.Mesh(rayGeo, rayMat);
  ray.position.set(SUN_DIST, 0, 0);
  ray.rotation.x = Math.cos(a) * 0.2;
  ray.rotation.y = Math.sin(a) * 0.2;
  ray.rotation.z = a;
  scene.add(ray);
}

// ── Earth ──
// Procedural earth texture
function createEarthTexture(){
  const c = document.createElement('canvas');
  c.width = 512; c.height = 256;
  const ctx = c.getContext('2d');

  // Ocean gradient
  const grad = ctx.createLinearGradient(0,0,0,256);
  grad.addColorStop(0,'#1a2a6c');
  grad.addColorStop(0.3,'#1e3a8a');
  grad.addColorStop(0.5,'#1e5799');
  grad.addColorStop(0.7,'#1e3a8a');
  grad.addColorStop(1,'#1a2a6c');
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,512,256);

  // Land masses (procedural blobs)
  const landColors = ['#3a7a3a','#4a8a3a','#5a7a3a','#6a8a4a','#3a6a2a','#5a6a3a'];
  const continents = [
    { x:300,y:90,w:100,h:60, n:12 },
    { x:350,y:70,w:60,h:30, n:8 },
    { x:280,y:100,w:40,h:50, n:6 },
    { x:290,y:155,w:35,h:60, n:8 },
    { x:140,y:80,w:60,h:45, n:10 },
    { x:160,y:155,w:25,h:55, n:7 },
    { x:420,y:185,w:25,h:20, n:5 },
    { x:120,y:240,w:300,h:20, n:4 },
    { x:240,y:55,w:25,h:20, n:4 },
  ];
  for(const cont of continents){
    const color = landColors[Math.floor(Math.random()*landColors.length)];
    ctx.fillStyle = color;
    for(let i=0; i<cont.n; i++){
      const ox = (Math.random()-0.5)*cont.w;
      const oy = (Math.random()-0.5)*cont.h;
      const rw = cont.w * (0.3 + Math.random()*0.4);
      const rh = cont.h * (0.3 + Math.random()*0.4);
      ctx.beginPath();
      ctx.ellipse(cont.x+ox, cont.y+oy, rw/2, rh/2, Math.random()*0.5, 0, Math.PI*2);
      ctx.fill();
    }
  }

  // Ice caps
  ctx.fillStyle = 'rgba(220,230,255,0.5)';
  ctx.fillRect(0,0,512,20);
  ctx.fillRect(0,236,512,20);

  return new THREE.CanvasTexture(c);
}

const earthMat = new THREE.MeshStandardMaterial({
  map: createEarthTexture(),
  roughness: 0.6,
  metalness: 0.05,
});
const earthGroup = new THREE.Group();
earthGroup.rotation.x = 0.408;
scene.add(earthGroup);

const earth = new THREE.Mesh(new THREE.SphereGeometry(EARTH_RADIUS, 64, 64), earthMat);
earthGroup.add(earth);

// Atmosphere glow
const atmoMat = new THREE.MeshPhongMaterial({
  color: 0x4488ff, transparent:true, opacity:0.08,
  side: THREE.BackSide,
});
const atmo = new THREE.Mesh(new THREE.SphereGeometry(EARTH_RADIUS * 1.02, 48, 48), atmoMat);
earthGroup.add(atmo);

// Moon
function createMoonTexture(){
  const c = document.createElement("canvas");
  c.width = 256; c.height = 128;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#c8c0b8";
  ctx.fillRect(0,0,256,128);
  // Craters
  for(let i=0; i<60; i++){
    const x = Math.random()*256;
    const y = Math.random()*128;
    const r = 1.5 + Math.random()*6;
    const b = 100 + Math.random()*80;
    ctx.fillStyle = "rgb("+b+","+(b-10)+","+(b-20)+")";
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = "rgb("+(b+30)+","+(b+20)+","+(b+10)+")";
    ctx.beginPath(); ctx.arc(x-r*0.2,y-r*0.2,r*0.4,0,Math.PI*2); ctx.fill();
  }
  const maria = [{x:130,y:60,r:15},{x:80,y:55,r:10},{x:150,y:50,r:8},{x:110,y:70,r:12},{x:170,y:65,r:6},{x:60,y:75,r:7}];
  for(const m of maria){
    ctx.fillStyle = "rgba(60,55,50,0.35)";
    ctx.beginPath(); ctx.ellipse(m.x,m.y,m.r*1.4,m.r,Math.random()*0.3,0,Math.PI*2); ctx.fill();
  }
  return new THREE.CanvasTexture(c);
}

const moonMat = new THREE.MeshStandardMaterial({
  map: createMoonTexture(),
  roughness: 0.25,
  metalness: 0.0,
});
const moon = new THREE.Mesh(new THREE.SphereGeometry(MOON_RADIUS, 48, 48), moonMat);
scene.add(moon);

// Orbit pathOrbit pathOrbit path ──
const orbitPoints = [];
const segs = 80;
for(let i=0; i<=segs; i++){
  const a = (i/segs)*Math.PI*2;
  orbitPoints.push(new THREE.Vector3(ORBIT_RADIUS*Math.cos(a), 0, ORBIT_RADIUS*Math.sin(a)));
}
const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints);
const orbitMat = new THREE.LineBasicMaterial({ color:0x446688, transparent:true, opacity:0.2 });
const orbitLine = new THREE.Line(orbitGeo, orbitMat);
scene.add(orbitLine);

// ── Earth orbit ring (reference) ──
const ringGeo = new THREE.RingGeometry(ORBIT_RADIUS-0.02, ORBIT_RADIUS+0.02, 64);
const ringMat = new THREE.MeshBasicMaterial({
  color:0x446688, side:THREE.DoubleSide, transparent:true, opacity:0.05,
});
const ring = new THREE.Mesh(ringGeo, ringMat);
ring.rotation.x = -Math.PI/2;
scene.add(ring);

// ── Phase labels in 3D ──
const phaseLabelPositions = [
  { a:0, label:'🌕 满月' },
  { a:Math.PI*0.25, label:'🌔 盈凸月' },
  { a:Math.PI*0.5, label:'🌓 上弦月' },
  { a:Math.PI*0.75, label:'🌒 蛾眉月' },
  { a:Math.PI, label:'🌑 新月' },
  { a:Math.PI*1.25, label:'🌘 残月' },
  { a:Math.PI*1.5, label:'🌗 下弦月' },
  { a:Math.PI*1.75, label:'🌖 亏凸月' },
];

// Use sprites for labels
function makeLabelSprite(text, isActive=false){
  const c = document.createElement('canvas');
  c.width = 200; c.height = 48;
  const ctx = c.getContext('2d');
  ctx.font = '16px "Segoe UI","PingFang SC",sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)';
  ctx.fillText(text, 100, 24);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  const mat = new THREE.SpriteMaterial({
    map: tex, transparent:true, depthTest:false,
    opacity: isActive ? 0.9 : 0.3,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(1.6, 0.4, 1);
  return sprite;
}

const labelSprites = [];
for(const pl of phaseLabelPositions){
  const spr = makeLabelSprite(pl.label, false);
  const r = ORBIT_RADIUS + 0.8;
  spr.position.set(r*Math.cos(pl.a), -0.3, r*Math.sin(pl.a));
  scene.add(spr);
  labelSprites.push({ sprite:spr, angle:pl.a, label:pl.label });
}

// Sun direction indicator (light rays)
function createLightRays(){
  const group = new THREE.Group();
  const mat = new THREE.LineBasicMaterial({ color:0xffdd44, transparent:true, opacity:0.06 });
  for(let i=0; i<30; i++){
    const y = (Math.random()-0.5)*6;
    const z = (Math.random()-0.5)*6;
    const pts = [
      new THREE.Vector3(-1, y, z),
      new THREE.Vector3(ORBIT_RADIUS+0.5, y, z),
    ];
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    const line = new THREE.Line(g, mat);
    group.add(line);
  }
  scene.add(group);
}
createLightRays();

// Directional light helper (subtle)
const arrowDir = new THREE.Vector3(1, 0, 0);
const arrowHelper = new THREE.ArrowHelper(arrowDir, new THREE.Vector3(-ORBIT_RADIUS-0.5, 0, 0), 3.5, 0xffdd44, 0.4, 0.2);
arrowHelper.line.material.transparent = true;
arrowHelper.line.material.opacity = 0.15;
arrowHelper.cone.material.transparent = true;
arrowHelper.cone.material.opacity = 0.15;
scene.add(arrowHelper);

// "日光方向" label
const sunLabelCanvas = document.createElement('canvas');
sunLabelCanvas.width = 120; sunLabelCanvas.height = 32;
const slCtx = sunLabelCanvas.getContext('2d');
slCtx.font = '12px "Segoe UI","PingFang SC",sans-serif';
slCtx.textAlign = 'center'; slCtx.textBaseline = 'middle';
slCtx.fillStyle = 'rgba(255,221,68,0.2)';
slCtx.fillText('☀ 日光方向', 60, 16);
const slTex = new THREE.CanvasTexture(sunLabelCanvas);
const slMat = new THREE.SpriteMaterial({ map:slTex, transparent:true, depthTest:false, opacity:0.2 });
const slSprite = new THREE.Sprite(slMat);
slSprite.scale.set(2, 0.5, 1);
slSprite.position.set(ORBIT_RADIUS*0.7, 0.8, 0);
scene.add(slSprite);

// ──────────────────────────────────────────
// 2D Moon Phase Drawing
// ──────────────────────────────────────────
const phaseCanvas = document.getElementById('phase-canvas');
const pctx = phaseCanvas.getContext('2d');
const P_SIZE = 220;
const P_R = 95;
const P_CX = P_SIZE/2;
const P_CY = P_SIZE/2;

function drawPhaseViewer(phase){
  const p = ((phase % 1) + 1) % 1;
  pctx.clearRect(0, 0, P_SIZE, P_SIZE);

  // Background glow
  const grd = pctx.createRadialGradient(P_CX, P_CY, 0, P_CX, P_CY, P_R*0.3);
  grd.addColorStop(0, 'rgba(255,255,230,0.03)');
  grd.addColorStop(1, 'rgba(255,255,230,0)');
  pctx.fillStyle = grd;
  pctx.fillRect(0, 0, P_SIZE, P_SIZE);

  // Moon dark side
  pctx.save();
  pctx.beginPath();
  pctx.arc(P_CX, P_CY, P_R, 0, Math.PI*2);
  pctx.clip();

  // Dark lunar surface
  const darkGrd = pctx.createRadialGradient(P_CX-10, P_CY-10, 5, P_CX, P_CY, P_R);
  darkGrd.addColorStop(0, '#4a4845');
  darkGrd.addColorStop(1, '#1a1918');
  pctx.fillStyle = darkGrd;
  pctx.fillRect(0, 0, P_SIZE, P_SIZE);

  // Mare on dark side
  pctx.fillStyle = 'rgba(40,38,35,0.3)';
  const darkMare = [
    {x:-15,y:-10,r:12},{x:10,y:-5,r:8},{x:-5,y:15,r:10},
    {x:20,y:5,r:6},{x:-25,y:5,r:7},
  ];
  for(const m of darkMare){
    pctx.beginPath();
    pctx.ellipse(P_CX+m.x, P_CY+m.y, m.r, m.r*0.7, 0.2, 0, Math.PI*2);
    pctx.fill();
  }

  // ──  Lit portion — elliptical terminator ──
  // Terminator = great circle projected onto the viewing disk
  // Ellipse: x²/(R²·cos²(2πp)) + y²/R² = 1
  const ea = P_R * Math.abs(Math.cos(p * 2 * Math.PI));
  const eb = P_R;

  // Lit surface gradient
  const litGrd = pctx.createLinearGradient(P_CX+P_R*0.5, P_CY, P_CX-P_R*0.5, P_CY);
  litGrd.addColorStop(0, '#fff8e8');
  litGrd.addColorStop(0.3, '#fff5d6');
  litGrd.addColorStop(0.6, '#f5e8c8');
  litGrd.addColorStop(1, '#e8d8b8');

  if(p < 0.005){
    // Near new moon - thin crescent on right
    pctx.beginPath();
    pctx.ellipse(P_CX, P_CY, ea, eb, 0, -Math.PI/2, Math.PI/2, false);
    pctx.arc(P_CX, P_CY, P_R, Math.PI/2, -Math.PI/2, true);
    pctx.closePath();
    pctx.fillStyle = litGrd;
    pctx.fill();
  } else if(p > 0.495 && p < 0.505){
    // Near full moon - entire disk lit
    pctx.beginPath();
    pctx.arc(P_CX, P_CY, P_R, 0, Math.PI*2, false);
    pctx.closePath();
    pctx.fillStyle = litGrd;
    pctx.fill();
  } else if(p < 0.25){
    // Waxing crescent - lit right crescent
    pctx.beginPath();
    pctx.ellipse(P_CX, P_CY, ea, eb, 0, -Math.PI/2, Math.PI/2, false);
    pctx.arc(P_CX, P_CY, P_R, Math.PI/2, -Math.PI/2, true);
    pctx.closePath();
    pctx.fillStyle = litGrd;
    pctx.fill();
  } else if(p < 0.5){
    // Waxing gibbous - full circle lit, dark left crescent
    pctx.beginPath();
    pctx.arc(P_CX, P_CY, P_R, 0, Math.PI*2, false);
    pctx.closePath();
    pctx.fillStyle = litGrd;
    pctx.fill();
    pctx.beginPath();
    pctx.ellipse(P_CX, P_CY, ea, eb, 0, Math.PI/2, 3*Math.PI/2, false);
    pctx.arc(P_CX, P_CY, P_R, 3*Math.PI/2, Math.PI/2, true);
    pctx.closePath();
    pctx.fillStyle = darkGrd;
    pctx.fill();
  } else if(p < 0.75){
    // Waning gibbous - full circle lit, dark right crescent
    pctx.beginPath();
    pctx.arc(P_CX, P_CY, P_R, 0, Math.PI*2, false);
    pctx.closePath();
    pctx.fillStyle = litGrd;
    pctx.fill();
    pctx.beginPath();
    pctx.ellipse(P_CX, P_CY, ea, eb, 0, -Math.PI/2, Math.PI/2, false);
    pctx.arc(P_CX, P_CY, P_R, Math.PI/2, -Math.PI/2, true);
    pctx.closePath();
    pctx.fillStyle = darkGrd;
    pctx.fill();
  } else {
    // Waning crescent - lit left crescent
    pctx.beginPath();
    pctx.ellipse(P_CX, P_CY, ea, eb, 0, Math.PI/2, 3*Math.PI/2, false);
    pctx.arc(P_CX, P_CY, P_R, 3*Math.PI/2, Math.PI/2, true);
    pctx.closePath();
    pctx.fillStyle = litGrd;
    pctx.fill();
  }

  // Craters on lit side
  pctx.fillStyle = 'rgba(200,190,175,0.15)';
  const litCraters = [
    {x:P_CX-25, y:P_CY-30, r:6}, {x:P_CX+15, y:P_CY-20, r:4},
    {x:P_CX-10, y:P_CY+25, r:5}, {x:P_CX+30, y:P_CY+10, r:3},
    {x:P_CX-35, y:P_CY+5, r:4},
  ];
  for(const c of litCraters){
    pctx.beginPath();
    pctx.arc(c.x, c.y, c.r, 0, Math.PI*2);
    pctx.fill();
  }

  // Mare on lit side
  const litMare = [
    {x:P_CX-8,y:P_CY-12,r:14},{x:P_CX+12,y:P_CY-8,r:10},{x:P_CX-20,y:P_CY+8,r:8},
    {x:P_CX+5,y:P_CY+18,r:11},{x:P_CX-30,y:P_CY-5,r:6},
  ];
  for(const m of litMare){
    pctx.beginPath();
    pctx.ellipse(m.x, m.y, m.r, m.r*0.7, Math.random()*0.3, 0, Math.PI*2);
    pctx.fillStyle = `rgba(${100+Math.random()*30},${95+Math.random()*30},${85+Math.random()*30},0.1)`;
    pctx.fill();
  }

  // Remove clip
  pctx.restore();

  // Outermost ring
  pctx.beginPath();
  pctx.arc(P_CX, P_CY, P_R, 0, Math.PI*2);
  pctx.strokeStyle = 'rgba(255,255,255,0.08)';
  pctx.lineWidth = 1;
  pctx.stroke();

  // Outer glow
  const glow2 = pctx.createRadialGradient(P_CX, P_CY, P_R-2, P_CX, P_CY, P_R+8);
  glow2.addColorStop(0, 'rgba(255,240,200,0)');
  glow2.addColorStop(0.5, 'rgba(255,240,200,0.02)');
  glow2.addColorStop(1, 'rgba(255,240,200,0)');
  pctx.fillStyle = glow2;
  pctx.beginPath();
  pctx.arc(P_CX, P_CY, P_R+8, 0, Math.PI*2);
  pctx.fill();
}

// ──────────────────────────────────────────
// Phase helpers
// ──────────────────────────────────────────
function getPhase(dayVal){
  return ((dayVal / LUNAR_CYCLE) % 1 + 1) % 1;
}

function getPhaseName(phase){
  for(const p of PHASE_NAMES){
    if(phase >= p.min && phase < p.max) return p;
  }
  return PHASE_NAMES[0];
}

function getIllumination(phase){
  // f = (1 - cos(2π·p)) / 2  ;  p=0 new, p=0.5 full
  return (1 - Math.cos(phase * 2 * Math.PI)) / 2;
}

// ──────────────────────────────────────────
// Update scene
// ──────────────────────────────────────────
function updateScene(dayVal){
  const angle = (dayVal / LUNAR_CYCLE) * Math.PI * 2;
  const phase = getPhase(dayVal);

  // Moon position
  moon.position.set(
    ORBIT_RADIUS * Math.cos(angle),
    0,
    ORBIT_RADIUS * Math.sin(angle)
  );

  // Moon self-rotation (tidal locked approx)
  moon.rotation.y = -angle;
  moon.rotation.x = 0.1;

  // Earth rotation (1 full rotation per day, around tilted axis)
  const earthAngle = (dayVal * 2 * Math.PI) % (2 * Math.PI);
  earth.rotation.y = earthAngle;
  atmo.rotation.y = earthAngle;


  // Update 2D phase viewer
  drawPhaseViewer(phase);

  // Update phase labels
  const nearestAngle = angle % (Math.PI*2);
  let minDist = Infinity;
  let nearestIdx = -1;
  for(let i=0; i<labelSprites.length; i++){
    let diff = labelSprites[i].angle - nearestAngle;
    diff = ((diff + Math.PI) % (Math.PI*2) + Math.PI*2) % (Math.PI*2) - Math.PI;
    if(Math.abs(diff) < minDist){
      minDist = Math.abs(diff);
      nearestIdx = i;
    }
  }
  labelSprites.forEach((ls, i) => {
    const active = i === nearestIdx;
    ls.sprite.material.opacity = active ? 0.8 : 0.15;
  });

  // ── Update UI ──
  const dayDisp = dayVal.toFixed(1);
  document.getElementById('day-num').textContent = dayDisp;

  const illum = getIllumination(phase);
  const pct = (illum * 100).toFixed(1);

  const pn = getPhaseName(phase);
  document.getElementById('phase-name').textContent = pn.name;
  document.getElementById('phase-illum').textContent = `光照 ${pct}%`;

  document.getElementById('day-info').textContent = `第 ${dayDisp} 天 / ${LUNAR_CYCLE} 天`;
  document.getElementById('illum-info').textContent = `光照 ${pct}%`;

  // Date label
  const subLabels = {
    '🌑 新月':'月出·月落同太阳同步',
    '🌒 蛾眉月':'傍晚西方可见',
    '🌓 上弦月':'下午至午夜可见',
    '🌔 盈凸月':'傍晚至凌晨可见',
    '🌕 满月':'整夜可见',
    '🌖 亏凸月':'深夜至早晨可见',
    '🌗 下弦月':'午夜至上午可见',
    '🌘 残月':'黎明前东方可见',
  };
  document.getElementById('date-label').textContent = subLabels[pn.name] || '';

  // Slider
  document.getElementById('day-slider').value = Math.round(dayVal * 10);

  // Phase bar
  document.getElementById('phase-fill').style.width = `${(phase * 100).toFixed(1)}%`;
}

// ──────────────────────────────────────────
// Animation loop
// ──────────────────────────────────────────
let lastTime = 0;

function animate(time){
  requestAnimationFrame(animate);

  const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0.016;
  lastTime = time;

  if(isPlaying){
    day = (day + dt * speed * (1 / 2)) % LUNAR_CYCLE;
    // 1 day per ~2 seconds at 1× speed
  }

  updateScene(day);

  controls.update();
  renderer.render(scene, camera);
}

// ──────────────────────────────────────────
// UI event bindings
// ──────────────────────────────────────────
const slider = document.getElementById('day-slider');
slider.addEventListener('input', () => {
  isPlaying = false;
  document.getElementById('play-btn').textContent = '▶';
  document.getElementById('play-btn').classList.remove('active');
  day = parseFloat(slider.value) / 10;
  updateScene(day);
});

const playBtn = document.getElementById('play-btn');
playBtn.addEventListener('click', () => {
  isPlaying = !isPlaying;
  playBtn.textContent = isPlaying ? '⏸' : '▶';
  playBtn.classList.toggle('active', isPlaying);
});

document.getElementById('reset-btn').addEventListener('click', () => {
  isPlaying = false;
  playBtn.textContent = '▶';
  playBtn.classList.remove('active');
  day = 0;
  slider.value = '0';
  updateScene(day);
});

document.getElementById('today-btn').addEventListener('click', () => {
  isPlaying = false;
  playBtn.textContent = '▶';
  playBtn.classList.remove('active');
  day = LUNAR_CYCLE / 2; // full moon
  slider.value = Math.round(day * 10);
  updateScene(day);
});

document.getElementById('speed-select').addEventListener('change', (e) => {
  speed = parseFloat(e.target.value);
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if(e.key === ' '){
    e.preventDefault();
    playBtn.click();
  }
  if(e.key === 'ArrowRight'){
    const step = LUNAR_CYCLE / 100;
    isPlaying = false;
    playBtn.textContent = '▶';
    playBtn.classList.remove('active');
    day = Math.min(day + step, LUNAR_CYCLE);
    slider.value = Math.round(day * 10);
    updateScene(day);
  }
  if(e.key === 'ArrowLeft'){
    const step = LUNAR_CYCLE / 100;
    isPlaying = false;
    playBtn.textContent = '▶';
    playBtn.classList.remove('active');
    day = Math.max(day - step, 0);
    slider.value = Math.round(day * 10);
    updateScene(day);
  }
  if(e.key === 'f' || e.key === 'F'){
    document.getElementById('today-btn').click();
  }
  if(e.key === 'r' || e.key === 'R'){
    document.getElementById('reset-btn').click();
  }
});

// Resize
window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});

// ──────────────────────────────────────────
// Start
// ──────────────────────────────────────────
day = 0;
updateScene(0);
animate(0);

console.log('🌙 月球光照3D演变已启动 — 鼠标拖拽旋转场景');
</script>
</body>
</html>
```
