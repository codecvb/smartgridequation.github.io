'use strict';

const fs = require('fs');
const path = require('path');
const TurndownService = require('turndown');
const store = require('../lib/store');

const ROOT = path.join(__dirname, '..');
const RAW_DIR = path.join(ROOT, 'posts', 'CSDN博文备份');
const POSTS_DIR = path.join(ROOT, 'posts');
const IMG_ROOT = path.join(ROOT, 'public', 'uploads', 'csdn');
const CONCURRENCY = 5;
const REQUEST_TIMEOUT_MS = 30000;

const CATEGORY_RULES = [
  {
    name: '读书笔记',
    match: /毛泽东|读书笔记|读后感|书评|阅读/,
    tags: ['读书笔记']
  },
  {
    name: '物理与天文',
    match: /物理|相对论|卫星|轨道|航天|火星|月球|太阳|行星|三体|引力|电磁|麦克斯韦|摆线|单摆|天体|导弹|流体|辐射|扩散|黏滞|碰撞|激光衍射|透镜|火车|列车|水星/,
    tags: ['物理', '天文']
  },
  {
    name: '数学',
    match: /数学|拉马努金|数论|微积分|概率|正态|泰勒|傅里叶|凸包|最小二乘|优惠券|数列|狄拉克|贝叶斯|未解决/,
    tags: ['数学']
  },
  {
    name: '科技与社会',
    match: /AI时代|AI竞争|AI发展|Gemini|财富|社会|科学家|程序员|智能电网|智慧农业|地理信息|豆包|千问|科技|创新成果|经济|职业|机器人|公司|行业|大学生|校园/,
    tags: ['科技', '社会']
  },
  {
    name: '人工智能',
    match: /人工智能|神经网络|机器学习|大模型|YOLO|OCR|人脸|指纹|目标检测|图像分割|图像增强|图像加密|贝叶斯|Transformer|无人|智能体|智能感知|算法模型|AI算力|AI/,
    tags: ['人工智能']
  },
  {
    name: 'MATLAB 仿真',
    match: /MATLAB|Matlab|matlab/,
    tags: ['MATLAB']
  },
  {
    name: 'Python 编程',
    match: /Python|python|PyQt|PySide|turtle|OpenCV|海龟|GIF|二维码|语音|爬虫|网页|selenium|numpy|matplotlib/,
    tags: ['Python']
  },
  {
    name: '算法与数据结构',
    match: /LeetCode|算法|动态规划|最小生成树|图论|背包|递归|排序|查找|哈希表|凸包|TSP|路径规划|数据结构|复杂度|题解/,
    tags: ['算法']
  },
  {
    name: 'C/C++ 与 Rust',
    match: /C\+|C20|C语言|C二进制|C\b|Rust|rust|协程|多继承|虚继承|内存|指针|回调函数|控制台|终端/,
    tags: ['C/C++', 'Rust']
  },
  {
    name: '嵌入式与硬件',
    match: /STM32|LVGL|lvgl|WOKWI|ESP32|Proteus|Arduino|ILI9341|QT6|Qt6|Android|嵌入式|物联网|电子时钟|智能手表|单片机|FreeRTOS|SD卡/,
    tags: ['嵌入式', '物联网']
  },
  {
    name: '编程技术',
    match: /代码|编程|程序|函数|计算|练习|教程|基础/,
    tags: ['编程']
  }
];

const TOPIC_KEYWORDS = [
  ['Python', /Python|python/],
  ['MATLAB', /MATLAB|Matlab|matlab/],
  ['C++', /C\+|C20|c\+\+/],
  ['C', /C语言|C二进制|\bC\b/],
  ['Rust', /Rust|rust/],
  ['STM32', /STM32/],
  ['LVGL', /LVGL|lvgl/],
  ['QT6', /QT6|Qt6/],
  ['Android', /Android/],
  ['YOLO', /YOLO/],
  ['OpenCV', /OpenCV/],
  ['AI', /AI|人工智能/],
  ['神经网络', /神经网络/],
  ['图像处理', /图像|图片|OCR|视觉/],
  ['卫星', /卫星|轨道|航天/],
  ['物理仿真', /物理|力学|电磁/],
  ['数学', /数学|数论|微积分/]
];

function classify(fileName) {
  const text = path.basename(fileName, path.extname(fileName));
  for (const rule of CATEGORY_RULES) {
    if (rule.match.test(text)) return rule;
  }
  return { name: '科技与社会', tags: ['随笔'] };
}

function topicTags(fileName) {
  const text = path.basename(fileName, path.extname(fileName));
  const tags = [];
  for (const [name, re] of TOPIC_KEYWORDS) {
    if (re.test(text) && !tags.includes(name)) tags.push(name);
  }
  return tags;
}

function extractTitle(html, fileName) {
  const fromName = path
    .basename(fileName, path.extname(fileName))
    .replace(/-\d+$/, '')
    .replace(/[-_]+/g, ' ')
    .trim();
  if (fromName) return fromName;

  const heading = html.match(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/);
  if (heading) {
    const text = heading[1]
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();
    if (text) return text;
  }
  return '未命名文章';
}

function decodeEntities(text) {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&middot;/g, '·')
    .replace(/&times;/g, '×')
    .replace(/&divide;/g, '÷');
}

function extractTeX(mathml) {
  const lines = mathml
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\u200b/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) return '';
  let tex = lines[lines.length - 1];
  if (tex.length < 3) tex = lines.slice(-2).join(' ');
  tex = tex.replace(/\s+/g, ' ').trim();
  return decodeEntities(tex);
}

function replaceKatex(html) {
  let out = html;
  const pattern = /<span class="katex--(inline|display)[^"]*"[^>]*>/g;
  const matches = [];
  let match;
  while ((match = pattern.exec(out))) {
    matches.push({ index: match.index, display: match[1] === 'display' });
  }
  if (!matches.length) return out;

  const chunks = [];
  let cursor = 0;
  for (const found of matches) {
    let depth = 0;
    const re = /<span\b[^>]*>|<\/span>/g;
    re.lastIndex = found.index;
    let inner = null;
    let m;
    while ((m = re.exec(out))) {
      if (m[0].startsWith('</')) {
        depth -= 1;
        if (depth === 0) {
          inner = out.slice(found.index, m.index + m[0].length);
          break;
        }
      } else {
        depth += 1;
      }
    }
    if (!inner) continue;
    const mathmlMatch = inner.match(/class="katex-mathml"[^>]*>([\s\S]*?)<\/span>/);
    const tex = mathmlMatch ? extractTeX(mathmlMatch[1]) : '';
    chunks.push(out.slice(cursor, found.index));
    if (tex) {
      chunks.push(found.display ? `\n\n$$\n${tex}\n$$\n\n` : ` $${tex}$ `);
    }
    cursor = found.index + inner.length;
  }
  chunks.push(out.slice(cursor));
  return chunks.join('');
}

function normalizePre(html) {
  return html.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (match, body) => {
    const withLang = body.match(/<code\s+class="([^"]+)"[^>]*>([\s\S]*?)<\/code>/i);
    const plain = body.match(/<code[^>]*>([\s\S]*?)<\/code>/i);
    let lang = '';
    let content = body;
    if (withLang) {
      const langMatch = withLang[1].match(/language-([^\s"']+)/i);
      lang = langMatch ? langMatch[1] : '';
      content = withLang[2];
    } else if (plain) {
      content = plain[1];
    } else {
      content = body.replace(/<code[^>]*>/gi, '').replace(/<\/code>/gi, '');
    }
    content = content
      .replace(/<br\s*\/?\s*>/gi, '\n')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const attr = lang ? ` class="language-${lang}"` : '';
    return `<pre><code${attr}>${content}</code></pre>`;
  });
}

function extractImages(html) {
  const urls = [];
  const seen = new Set();
  const re = /<img\b[^>]*src="([^"]+)"[^>]*>/gi;
  let match;
  while ((match = re.exec(html))) {
    let url = decodeEntities(match[1]).trim();
    if (!url || url.startsWith('data:')) continue;
    if (!/^https?:\/\//i.test(url)) continue;
    if (seen.has(url)) continue;
    seen.add(url);
    urls.push(url);
  }
  return urls;
}

function convertToMarkdown(rawHtml) {
  let html = replaceKatex(rawHtml);
  html = normalizePre(html);
  const turndown = new TurndownService({
    headingStyle: 'atx',
    hr: '---',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    fence: '```',
    emDelimiter: '*',
    strongDelimiter: '**',
    linkStyle: 'inlined',
    linkReferenceStyle: 'full'
  });
  turndown.keep(['del', 'ins', 'sub', 'sup', 'kbd', 'mark', 'ruby', 'rt', 'rp']);
  return turndown.turndown(html);
}

async function fetchWithTimeout(url, timeout = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (blog import)' }
    });
  } finally {
    clearTimeout(timer);
  }
}

function extFromUrl(url) {
  const clean = url.split(/[?#]/)[0].toLowerCase();
  const match = clean.match(/\.(png|jpe?g|gif|webp|bmp|svg)$/);
  return match ? match[1] : '';
}

function extFromType(type) {
  const map = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/bmp': 'bmp',
    'image/svg+xml': 'svg'
  };
  return map[String(type).toLowerCase().split(';')[0].trim()] || '';
}

async function downloadImage(url, destDir, index) {
  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${url}`);
  }
  const type = response.headers.get('content-type') || '';
  if (!/^image\//.test(type)) {
    throw new Error(`not an image (${type}): ${url}`);
  }
  const ext = extFromUrl(url) || extFromType(type) || 'bin';
  const file = path.join(destDir, `img-${String(index).padStart(2, '0')}.${ext}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(file, buffer);
  return `/uploads/csdn/${path.basename(destDir)}/${path.basename(file)}`;
}

async function downloadAll(urls, destDir) {
  const results = new Array(urls.length).fill(null);
  let next = 0;
  const worker = async () => {
    while (next < urls.length) {
      const index = next;
      next += 1;
      results[index] = await downloadImage(urls[index], destDir, index + 1);
    }
  };
  const workers = Array.from({ length: Math.min(CONCURRENCY, urls.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

function firstParagraph(markdown) {
  const paras = markdown
    .replace(/^---[\s\S]*?---\s*/, '')
    .split(/\n\s*\n/)
    .map((p) =>
      p
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        .replace(/[*_>`~]/g, '')
        .trim()
    )
    .filter((p) => p && !/^!\[/.test(p));
  const text = paras[0] || '';
  return text.length > 200 ? `${text.slice(0, 200)}…` : text;
}

function restoreMathEscapes(markdown) {
  return markdown.replace(/(\$\$[\s\S]*?\$\$|\$[^\n$]+\$)/g, (match) => {
    return match
      .replace(/\\\\/g, '\\')
      .replace(/\\_/g, '_')
      .replace(/\\\*/g, '*')
      .replace(/\\~/g, '~')
      .replace(/\\\[/g, '[')
      .replace(/\\\]/g, ']')
      .replace(/\\#/g, '#');
  });
}
function buildFrontmatter(meta) {
  const lines = ['---', `title: ${meta.title}`, `slug: ${meta.slug}`, `category: ${meta.category}`];
  if (meta.summary) lines.push(`summary: ${meta.summary}`);
  if (meta.tags.length) lines.push(`tags: ${meta.tags.join(', ')}`);
  lines.push('---', '');
  return lines.join('\n');
}

async function processFile(file, log) {
  const rawHtml = fs.readFileSync(file, 'utf8');
  const fileName = path.basename(file);
  const category = classify(fileName);
  const title = extractTitle(rawHtml, fileName);
  const slugBase = store.slugify(title) || `post-${Date.now().toString(36)}`;
  const existing = store.getPostBySlug(slugBase);
  const slug = existing ? existing.slug : slugBase;
  const imageUrls = extractImages(rawHtml);
  const destDir = path.join(IMG_ROOT, slug);
  const localImages = [];

  if (imageUrls.length) {
    fs.mkdirSync(destDir, { recursive: true });
    let urls = [];
    let lastError = null;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        urls = await downloadAll(imageUrls, destDir);
        break;
      } catch (err) {
        lastError = err;
        fs.rmSync(destDir, { recursive: true, force: true });
        fs.mkdirSync(destDir, { recursive: true });
      }
    }
    if (!urls.length) {
      fs.rmSync(destDir, { recursive: true, force: true });
      fs.rmSync(file, { force: true });
      log(`SKIP ${fileName}: 图片下载失败 (${lastError && lastError.message})`);
      return { ok: false, reason: lastError && lastError.message };
    }
    for (let i = 0; i < urls.length; i += 1) {
      localImages.push(urls[i]);
    }
  }

  let markdown;
  try {
    markdown = convertToMarkdown(rawHtml);
  } catch (err) {
    fs.rmSync(destDir, { recursive: true, force: true });
    fs.rmSync(file, { force: true });
    log(`SKIP ${fileName}: Markdown 转换失败 (${err.message})`);
    return { ok: false, reason: err.message };
  }

  localImages.forEach((localPath, index) => {
    const remote = imageUrls[index];
    markdown = markdown.split(remote).join(localPath);
  });

  markdown = markdown
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();
  markdown = restoreMathEscapes(markdown);

  const tags = [...new Set([...category.tags, ...topicTags(fileName)])];
  const meta = {
    title,
    slug,
    category: category.name,
    summary: firstParagraph(markdown),
    tags
  };
  const safeDir = category.name.replace(/[\\/:*?"<>|]/g, '-');
  const outDir = path.join(POSTS_DIR, safeDir);
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `${slug}.md`);
  fs.writeFileSync(outFile, buildFrontmatter(meta) + '\n' + markdown + '\n', 'utf8');
  log(`OK   ${fileName} -> ${path.relative(ROOT, outFile)} (${imageUrls.length} 张图片)`);
  return { ok: true };
}

async function main() {
  if (!fs.existsSync(RAW_DIR)) {
    console.error(`未找到目录: ${RAW_DIR}`);
    process.exit(1);
  }
  let files = fs
    .readdirSync(RAW_DIR)
    .filter((name) => /\.md$/i.test(name))
    .sort()
    .map((name) => path.join(RAW_DIR, name));

  const log = (line) => console.log(line);
  const dryRun = process.argv.includes('--dry-run');
  const checkImages = process.argv.includes('--check-images');
  if (checkImages) {
    log('CHECK-IMAGES 模式：只探测图片源，不下载、不删除');
    let total = 0;
    let brokenFiles = [];
    for (const file of files) {
      const rawHtml = fs.readFileSync(file, 'utf8');
      const urls = extractImages(rawHtml);
      total += urls.length;
      const broken = [];
      for (const url of urls) {
        try {
          const response = await fetchWithTimeout(url);
          const type = response.headers.get('content-type') || '';
          if (!response.ok || !/^image\//.test(type)) broken.push(url);
        } catch (err) {
          broken.push(url);
        }
      }
      if (broken.length) {
        brokenFiles.push({ file: path.basename(file), urls: broken });
        log(`BROKEN ${path.basename(file)}: ${broken.length}/${urls.length} 张不可用`);
      }
    }
    log(`图片检查完成：共 ${total} 张，${brokenFiles.length} 篇文章有失效图片`);
    return;
  }
  if (dryRun) {
    const fileIndex = process.argv.indexOf('--file');
    if (fileIndex !== -1 && process.argv[fileIndex + 1]) {
      const wanted = process.argv[fileIndex + 1];
      files = files.filter((f) => path.basename(f).includes(wanted));
    }
    log('DRY-RUN 模式：仅测试转换，不下载图片、不删除文件');
    for (const file of files.slice(0, 3)) {
      const rawHtml = fs.readFileSync(file, 'utf8');
      const category = classify(path.basename(file));
      log(`--- ${path.basename(file)}`);
      log(`标题: ${extractTitle(rawHtml, path.basename(file))}`);
      log(`分类: ${category.name}`);
      log(`图片: ${extractImages(rawHtml).length} 张`);
      try {
        const md = convertToMarkdown(rawHtml);
        log('Markdown 前 1200 字:');
        log(md.slice(0, 1200));
      } catch (err) {
        log(`转换失败: ${err.message}`);
      }
      log('');
    }
    return;
  }

  log(`共发现 ${files.length} 篇 CSDN 备份文章，开始转换与图片下载...`);
  let ok = 0;
  let skipped = 0;
  const skippedFiles = [];
  for (const file of files) {
    const result = await processFile(file, log);
    if (result.ok) ok += 1;
    else {
      skipped += 1;
      skippedFiles.push(path.basename(file));
    }
  }

  log('==============================================');
  log(`转换完成：成功 ${ok} 篇，跳过 ${skipped} 篇`);
  if (skippedFiles.length) {
    log('已删除以下文章（图片无来源）:');
    skippedFiles.forEach((name) => log(`  - ${name}`));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
