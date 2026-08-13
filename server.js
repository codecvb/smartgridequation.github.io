'use strict';

const path = require('path');
require('dotenv').config();
const fs = require('fs');
const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const store = require('./lib/store');
const { renderMarkdown, getToc } = require('./lib/markdown');

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_COOKIE = 'blog_session';
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 8;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use('/vendor/markdown-it', express.static(path.join(__dirname, 'node_modules', 'markdown-it', 'dist')));
app.use('/vendor/highlight/styles', express.static(path.join(__dirname, 'node_modules', 'highlight.js', 'styles')));
app.use('/vendor/highlight/lib', express.static(path.join(__dirname, 'node_modules', 'highlight.js', 'lib')));

app.use((req, res, next) => {
  res.locals.site = store.getSettings();
  res.locals.path = req.path;
  res.locals.user = null;
  const token = req.cookies[SESSION_COOKIE];
  if (token) res.locals.user = store.getUserByToken(token);
  req.user = res.locals.user;
  next();
});

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.redirect('/login?next=' + encodeURIComponent(req.originalUrl));
  }
  next();
}

const loginAttempts = new Map();

function loginBlocked(ip) {
  const record = loginAttempts.get(ip);
  return !!(record && record.count >= LOGIN_MAX_ATTEMPTS && record.until > Date.now());
}

function recordLoginFail(ip) {
  const record = loginAttempts.get(ip) || { count: 0, until: 0 };
  record.count += 1;
  if (record.count >= LOGIN_MAX_ATTEMPTS) record.until = Date.now() + LOGIN_WINDOW_MS;
  loginAttempts.set(ip, record);
}

function formatDate(iso, withTime = false) {
  if (!iso) return '—';
  const date = new Date(iso);
  const opts = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {})
  };
  return new Intl.DateTimeFormat('zh-CN', opts).format(date);
}

function readTime(content) {
  const minutes = Math.ceil(String(content || '').length / 380);
  return Math.max(1, minutes);
}

app.locals.formatDate = formatDate;
app.locals.readTime = readTime;
app.locals.renderMarkdown = renderMarkdown;

// Public site ---------------------------------------------------------------

app.get('/', (req, res) => {
  const posts = store.listPosts({ status: 'published', limit: 8 });
  const featured = posts[0] || null;
  res.render('site/layout', {
    view: 'site/home',
    pageTitle: '首页',
    featured,
    posts: posts.slice(1),
    stats: store.getStats(),
    tags: store.getTags().slice(0, 8)
  });
});

app.get('/archive', (req, res) => {
  const posts = store.listPosts({ status: 'published' });
  res.render('site/layout', {
    view: 'site/archive',
    pageTitle: '归档',
    heading: '全部文章',
    description: '按时间倒序排列，一共 ' + posts.length + ' 篇。',
    posts,
    tags: []
  });
});

app.get('/tags', (req, res) => {
  const selected = String(req.query.tag || '').trim();
  const posts = selected ? store.listPosts({ status: 'published', tag: selected }) : [];
  res.render('site/layout', {
    view: 'site/tags',
    pageTitle: selected ? '标签：' + selected : '标签',
    selected,
    posts,
    tags: store.getTags()
  });
});

app.get('/search', (req, res) => {
  const q = String(req.query.q || '').trim();
  const posts = q ? store.listPosts({ status: 'published', q }) : [];
  res.render('site/layout', {
    view: 'site/archive',
    pageTitle: '搜索',
    heading: q ? `“${q}”的搜索结果` : '搜索文章',
    description: q ? `找到 ${posts.length} 篇相关文章。` : '输入关键词，搜索标题、摘要与正文。',
    posts,
    q,
    tags: []
  });
});

app.get('/about', (req, res) => {
  res.render('site/layout', {
    view: 'site/about',
    pageTitle: '关于'
  });
});

app.get('/post/:slug', (req, res, next) => {
  const post = store.getPostBySlug(req.params.slug);
  if (!post || post.status !== 'published') return next();
  store.incrementViews(post.id);
  const fresh = store.getPostBySlug(req.params.slug);
  const related = store.getRelated(fresh.id, fresh.tags, 3);
  res.render('site/layout', {
    view: 'site/post',
    pageTitle: fresh.title,
    post: {
      ...fresh,
      contentHtml: renderMarkdown(fresh.content),
      toc: getToc(fresh.content),
      readMinutes: readTime(fresh.content)
    },
    prev: store.getAdjacent(fresh.id, 'prev'),
    next: store.getAdjacent(fresh.id, 'next'),
    related
  });
});

app.get('/login', (req, res) => {
  if (req.user) return res.redirect('/admin');
  res.render('site/layout', {
    view: 'site/login',
    pageTitle: '登录',
    error: ''
  });
});

app.post('/login', (req, res) => {
  const ip = req.ip || 'unknown';
  if (loginBlocked(ip)) {
    return res.status(429).render('site/layout', {
      view: 'site/login',
      pageTitle: '登录',
      error: '尝试次数过多，请 15 分钟后再试。'
    });
  }
  const user = store.findUser(req.body.username);
  const ok = user && bcrypt.compareSync(req.body.password || '', user.passwordHash);
  if (!ok) {
    recordLoginFail(ip);
    return res.status(401).render('site/layout', {
      view: 'site/login',
      pageTitle: '登录',
      error: '用户名或密码不正确。'
    });
  }
  loginAttempts.delete(ip);
  const token = store.createSession(user.id);
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: !!process.env.COOKIE_SECURE,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/'
  });
  const next = String(req.query.next || req.body.next || '/admin');
  res.redirect(next.startsWith('/') && !next.startsWith('//') ? next : '/admin');
});

app.post('/logout', (req, res) => {
  const token = req.cookies[SESSION_COOKIE];
  if (token) store.deleteSession(token);
  res.clearCookie(SESSION_COOKIE, { path: '/' });
  res.redirect('/');
});

// Admin ---------------------------------------------------------------------

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      const dir = path.join(__dirname, 'public', 'uploads');
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname).toLowerCase().slice(0, 10);
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
    }
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (/^image\//.test(file.mimetype)) return cb(null, true);
    cb(new Error('仅支持上传图片'));
  }
});

const admin = express.Router();
admin.use(requireAuth);

admin.get('/', (req, res) => {
  const posts = store.listPosts({});
  const stats = store.getStats();
  res.render('admin/layout', {
    view: 'admin/dashboard',
    pageTitle: '仪表盘',
    stats,
    recent: posts.slice(0, 6),
    totalPosts: posts.length
  });
});

admin.get('/posts', (req, res) => {
  const filter = req.query.filter === 'draft' ? 'draft' : req.query.filter === 'all' ? null : 'published';
  const posts = store.listPosts({ status: filter });
  res.render('admin/layout', {
    view: 'admin/posts',
    pageTitle: '文章管理',
    posts,
    filter: filter || 'all',
    deleted: !!req.query.deleted
  });
});

function emptyPost() {
  return {
    id: '',
    title: '',
    slug: '',
    summary: '',
    content: '',
    tags: [],
    status: 'draft',
    viewCount: 0
  };
}

function renderEditor(res, post, error) {
  res.render('admin/layout', {
    view: 'admin/editor',
    pageTitle: post.id ? '编辑文章' : '写文章',
    post,
    error: error || '',
    ok: false
  });
}

admin.get('/posts/new', (req, res) => renderEditor(res, emptyPost()));

admin.get('/posts/:id/edit', (req, res, next) => {
  const post = store.getPost(req.params.id);
  if (!post) return next();
  res.render('admin/layout', {
    view: 'admin/editor',
    pageTitle: '编辑文章',
    post,
    error: '',
    ok: !!req.query.ok
  });
});

admin.post('/posts', (req, res) => {
  const action = req.body.action === 'publish' ? 'published' : 'draft';
  const post = store.createPost({
    title: req.body.title,
    slug: req.body.slug,
    summary: req.body.summary,
    content: req.body.content,
    tags: req.body.tags,
    status: action
  });
  res.redirect('/admin/posts/' + post.id + '/edit?ok=1');
});

admin.post('/posts/:id', (req, res) => {
  const post = store.getPost(req.params.id);
  if (!post) return res.status(404).send('文章不存在');
  store.updatePost(
    post.id,
    {
      title: req.body.title,
      slug: req.body.slug,
      summary: req.body.summary,
      content: req.body.content,
      tags: req.body.tags
    },
    req.body.action === 'publish' ? 'publish' : 'save'
  );
  res.redirect('/admin/posts/' + post.id + '/edit?ok=1');
});

admin.post('/posts/:id/delete', (req, res) => {
  store.deletePost(req.params.id);
  res.redirect('/admin/posts?deleted=1');
});

admin.post('/posts/:id/toggle', (req, res) => {
  const post = store.getPost(req.params.id);
  if (post) {
    store.updatePost(post.id, {}, post.status === 'published' ? 'save' : 'publish');
  }
  res.redirect('/admin/posts');
});

admin.get('/settings', (req, res) => {
  res.render('admin/layout', {
    view: 'admin/settings',
    pageTitle: '站点设置',
    settings: store.getSettings(),
    ok: !!req.query.ok,
    error: ''
  });
});

admin.post('/settings', (req, res) => {
  store.saveSettings({
    siteTitle: req.body.siteTitle,
    siteSubtitle: req.body.siteSubtitle,
    author: req.body.author,
    bio: req.body.bio,
    footerText: req.body.footerText,
    github: req.body.github,
    email: req.body.email
  });
  res.redirect('/admin/settings?ok=1');
});

admin.post('/password', (req, res) => {
  const oldPassword = req.body.oldPassword || '';
  const newPassword = req.body.newPassword || '';
  const settings = store.getSettings();
  if (!store.verifyPassword(req.user.id, oldPassword)) {
    return res.render('admin/layout', {
      view: 'admin/settings',
      pageTitle: '站点设置',
      settings,
      ok: false,
      error: '原密码不正确。'
    });
  }
  if (newPassword.length < 8) {
    return res.render('admin/layout', {
      view: 'admin/settings',
      pageTitle: '站点设置',
      settings,
      ok: false,
      error: '新密码至少需要 8 位。'
    });
  }
  if (newPassword !== (req.body.confirmPassword || '')) {
    return res.render('admin/layout', {
      view: 'admin/settings',
      pageTitle: '站点设置',
      settings,
      ok: false,
      error: '两次输入的新密码不一致。'
    });
  }
  store.changePassword(req.user.id, newPassword);
  res.redirect('/admin/settings?ok=1');
});

admin.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: '没有收到图片' });
  res.json({ url: '/uploads/' + req.file.filename });
});

app.use('/admin', admin);

// Errors --------------------------------------------------------------------

app.use((req, res) => {
  res.status(404).render('site/layout', {
    view: 'site/error',
    pageTitle: '未找到',
    statusCode: 404,
    message: '这篇文章可能被移走了，或者地址拼错了。'
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  if (req.path.startsWith('/admin/')) {
    return res.status(500).send('服务器出错了：' + err.message);
  }
  res.status(500).render('site/layout', {
    view: 'site/error',
    pageTitle: '服务器错误',
    statusCode: 500,
    message: '服务器出了点问题，稍后再试试。'
  });
});

// Boot ----------------------------------------------------------------------

function seedDemo() {
  if (store.listPosts({}).length > 0) return;
  const hello = `# 你好，世界

这是你的第一篇文章，由系统自动创建，用来演示整套博客的写作能力。

## 用 Markdown 写作

**加粗**、*斜体*、\`行内代码\`，还有链接 [OpenAI](https://openai.com)。

> 好的博客像一盏灯，不需要很亮，但要在黑夜里持续亮着。

## 代码块

\`\`\`js
console.log('欢迎来到你的博客');
\`\`\`

## 已经内置的能力

- 自动目录与阅读时长
- 标签归档与全文搜索
- 图片上传与 Markdown 编辑器
- 草稿、发布与阅读统计

登录后台后，在「写文章」页面开始你的第一篇正式内容吧。\``;
  const deploy = `# 把博客放上云端

写好的博客需要一台“常亮”的服务器。以下是 2026 年 8 月核实过的免费与低价挂载方案。

## 上手最快：Render 免费 Web Service

Render 官方免费档支持 Web Service 直接部署 Node.js 应用，15 分钟无访问会自动休眠，下次访问会唤醒。免费实例的磁盘是临时的，适合试用；长期使用建议挂载持久磁盘或外接数据库。

## 长期免费：Oracle Cloud Always Free

Oracle Cloud 的 Always Free 永久免费额度包含虚拟机（AMD 与 Arm），适合把博客长期挂在云上。需要自己配置系统、Node.js 环境与域名。

## 其他选择

- Railway：新用户 30 天 \\$5 试用，之后 \\$1/月起
- Fly.io：旧账户保留免费额度，新用户按量付费
- Cloudflare Workers：免费档每天 10 万次请求，但需要把应用改造成 Workers 架构

详细的步骤见仓库里的部署指南。\``;
  const now = new Date().toISOString();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  store.createPost({
    title: '把博客放上云端：免费挂载方案盘点',
    slug: 'free-hosting-options-2026',
    summary: '整理 2026 年仍可用的免费与低价部署方案，从开箱即用的 Render 到长期免费的 Oracle Cloud。',
    content: deploy,
    tags: '部署, 指南',
    status: 'published'
  });
  store.createPost({
    title: '你好，世界',
    slug: 'hello-world',
    summary: '这套博客的第一篇文章：介绍 Markdown 写作、目录、标签、搜索与图片上传等能力。',
    content: hello,
    tags: '随笔, Markdown',
    status: 'published'
  });
  const posts = store.listPosts({});
  posts[0].createdAt = now;
  posts[0].updatedAt = now;
  posts[0].publishedAt = now;
  posts[1].createdAt = yesterday;
  posts[1].updatedAt = yesterday;
  posts[1].publishedAt = yesterday;
  require('./lib/store').__saveDemoDates(posts);
}

const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
const created = store.ensureAdmin(adminPassword);
seedDemo();

app.listen(PORT, () => {
  console.log('==============================================');
  console.log('  博客已启动: http://localhost:' + PORT);
  if (created) {
    console.log('  首次启动管理员账号:');
    console.log('    用户名: ' + (process.env.ADMIN_USERNAME || 'admin'));
    console.log('    密码:   ' + (process.env.ADMIN_PASSWORD ? '(来自 ADMIN_PASSWORD 环境变量)' : adminPassword));
    if (!process.env.ADMIN_PASSWORD) {
      console.log('  请登录后台后尽快修改密码。');
    }
  }
  console.log('==============================================');
});
