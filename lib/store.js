'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const DATA_DIR = process.env.BLOG_DATA_DIR
  ? path.resolve(process.env.BLOG_DATA_DIR)
  : path.join(__dirname, '..', '.data');
const DB_PATH = path.join(DATA_DIR, 'db.json');
const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads');

let cache = null;

const DEFAULT_SETTINGS = {
  siteTitle: '常青笔记',
  siteSubtitle: '一盏灯，一个角落，写给自己的文字',
  author: '我',
  bio: '这里是我的自留地：记录阅读、写作、代码和生活的切片。',
  footerText: '用文字把日子留住。',
  github: '',
  email: ''
};

function ensureDirs() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

function load() {
  if (cache) return cache;
  ensureDirs();
  if (!fs.existsSync(DB_PATH)) {
    cache = {
      users: [],
      sessions: [],
      settings: { ...DEFAULT_SETTINGS },
      posts: [],
      analytics: {
        visitors: [],
        daily: {}
      }
    };
    save(cache);
  } else {
    cache = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    cache.settings = { ...DEFAULT_SETTINGS, ...(cache.settings || {}) };
    if (!cache.analytics || typeof cache.analytics !== 'object') {
      cache.analytics = { visitors: [], daily: {} };
    }
    if (!Array.isArray(cache.analytics.visitors)) cache.analytics.visitors = [];
    if (!cache.analytics.daily || typeof cache.analytics.daily !== 'object') {
      cache.analytics.daily = {};
    }
  }
  return cache;
}

function save(db = cache) {
  const tmp = DB_PATH + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), 'utf8');
  if (fs.existsSync(DB_PATH)) fs.rmSync(DB_PATH, { force: true });
  fs.renameSync(tmp, DB_PATH);
}

function nowIso() {
  return new Date().toISOString();
}

function dateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function uid() {
  return crypto.randomUUID();
}

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

function normalizeTags(tags) {
  if (!tags) return [];
  const list = String(tags)
    .split(/[,，]/)
    .map((t) => t.trim())
    .filter(Boolean);
  return [...new Set(list)];
}

function slugify(text) {
  const slug = String(text || '')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return slug || '';
}

function uniqueSlug(base, excludeId) {
  const db = load();
  const stem = slugify(base) || `post-${Date.now().toString(36)}`;
  let slug = stem;
  let n = 2;
  while (db.posts.some((p) => p.slug === slug && p.id !== excludeId)) {
    slug = `${stem}-${n}`;
    n += 1;
  }
  return slug;
}

function ensureAdmin(password) {
  const db = load();
  if (db.users.length > 0) return false;
  db.users.push({
    id: uid(),
    username: process.env.ADMIN_USERNAME || 'admin',
    passwordHash: hashPassword(password || 'admin123'),
    createdAt: nowIso()
  });
  save(db);
  return true;
}

function getUsers() {
  return load().users;
}

function findUser(username) {
  return load().users.find((u) => u.username.toLowerCase() === String(username || '').toLowerCase());
}

function findUserById(id) {
  return load().users.find((u) => u.id === id);
}

function verifyPassword(id, password) {
  const user = findUserById(id);
  return !!user && bcrypt.compareSync(password || '', user.passwordHash);
}

function changePassword(id, newPassword) {
  const db = load();
  const user = db.users.find((u) => u.id === id);
  if (!user) return false;
  user.passwordHash = hashPassword(newPassword);
  save(db);
  return true;
}

function createSession(userId) {
  const db = load();
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  db.sessions = db.sessions.filter((s) => s.expiresAt > now);
  db.sessions.push({
    token,
    userId,
    createdAt: nowIso(),
    expiresAt: now + 30 * 24 * 60 * 60 * 1000
  });
  save(db);
  return token;
}

function getUserByToken(token) {
  if (!token) return null;
  const db = load();
  const session = db.sessions.find((s) => s.token === token && s.expiresAt > Date.now());
  if (!session) return null;
  return db.users.find((u) => u.id === session.userId) || null;
}

function deleteSession(token) {
  const db = load();
  db.sessions = db.sessions.filter((s) => s.token !== token);
  save(db);
}

function getSettings() {
  return { ...load().settings };
}

function saveSettings(patch) {
  const db = load();
  const allowed = [
    'siteTitle',
    'siteSubtitle',
    'author',
    'bio',
    'footerText',
    'github',
    'email'
  ];
  for (const key of allowed) {
    if (key in patch) db.settings[key] = String(patch[key] || '').trim();
  }
  save(db);
  return getSettings();
}

function createPost(input) {
  const db = load();
  const now = nowIso();
  const kind = input.kind === 'pdf' ? 'pdf' : 'markdown';
  const post = {
    id: uid(),
    kind,
    title: String(input.title || '').trim() || '无标题',
    slug: uniqueSlug(input.slug || input.title),
    summary: String(input.summary || '').trim(),
    content: String(input.content || ''),
    tags: normalizeTags(input.tags),
    category: String(input.category || '').trim(),
    status: input.status === 'published' ? 'published' : 'draft',
    viewCount: 0,
    createdAt: now,
    updatedAt: now,
    publishedAt: input.status === 'published' ? now : null
  };
  if (kind === 'pdf') {
    post.pdfUrl = String(input.pdfUrl || '').trim();
    post.pdfName = String(input.pdfName || '').trim();
    post.pdfSize = Number(input.pdfSize) || 0;
  }
  db.posts.unshift(post);
  save(db);
  return post;
}

function updatePost(id, patch, action) {
  const db = load();
  const post = db.posts.find((p) => p.id === id);
  if (!post) return null;
  const now = nowIso();
  if ('title' in patch) post.title = String(patch.title || '').trim() || '无标题';
  if ('slug' in patch) post.slug = uniqueSlug(patch.slug || post.title, id);
  if ('summary' in patch) post.summary = String(patch.summary || '').trim();
  if ('content' in patch) post.content = String(patch.content || '');
  if ('tags' in patch) post.tags = normalizeTags(patch.tags);
  if ('category' in patch) post.category = String(patch.category || '').trim();
  if (action === 'publish' && post.status !== 'published') {
    post.status = 'published';
    post.publishedAt = now;
  } else if (action === 'save') {
    post.status = 'draft';
    post.publishedAt = null;
  }
  post.updatedAt = now;
  save(db);
  return post;
}

function deletePost(id) {
  const db = load();
  const before = db.posts.length;
  db.posts = db.posts.filter((p) => p.id !== id);
  if (db.posts.length !== before) save(db);
  return db.posts.length !== before;
}

function getPost(id) {
  return load().posts.find((p) => p.id === id) || null;
}

function getPostBySlug(slug) {
  return load().posts.find((p) => p.slug === slug) || null;
}

function incrementViews(id) {
  const db = load();
  const post = db.posts.find((p) => p.id === id);
  if (!post) return;
  post.viewCount = (post.viewCount || 0) + 1;
  save(db);
}

function sortPosts(posts, status) {
  return posts
    .filter((p) => (status ? p.status === status : true))
    .sort((a, b) => {
      const at = a.status === 'published' ? a.publishedAt : a.updatedAt;
      const bt = b.status === 'published' ? b.publishedAt : b.updatedAt;
      return String(bt).localeCompare(String(at));
    });
}

function listPosts({ status = null, q = '', tag = '', category = '', limit = 0 } = {}) {
  let posts = sortPosts(load().posts, status);
  const query = String(q || '').trim().toLowerCase();
  if (query) {
    posts = posts.filter((p) =>
      [p.title, p.summary, p.content, p.tags.join(' ')].join('\n').toLowerCase().includes(query)
    );
  }
  const tagName = String(tag || '').trim();
  if (tagName) {
    posts = posts.filter((p) => p.tags.some((t) => t.toLowerCase() === tagName.toLowerCase()));
  }
  const categoryName = String(category || '').trim();
  if (categoryName) {
    posts = posts.filter((p) => {
      const value = String(p.category || '').trim();
      return value.toLowerCase() === categoryName.toLowerCase() || slugify(value) === slugify(categoryName);
    });
  }
  if (limit > 0) posts = posts.slice(0, limit);
  return posts;
}

function getTags() {
  const counts = new Map();
  for (const post of sortPosts(load().posts, 'published')) {
    for (const tag of post.tags) {
      const key = tag.toLowerCase();
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([key, count]) => ({ name: key, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'));
}

function getStats() {
  const posts = load().posts;
  const published = posts.filter((p) => p.status === 'published');
  return {
    posts: published.length,
    drafts: posts.length - published.length,
    pdfs: published.filter((p) => p.kind === 'pdf').length,
    views: published.reduce((sum, p) => sum + (p.viewCount || 0), 0),
    tags: new Set(published.flatMap((p) => p.tags)).size,
    categories: new Set(published.map((p) => String(p.category || '').trim() || '随笔')).size
  };
}

function recordVisitorVisit(visitorKey, sessionWindowMs = 30 * 60 * 1000) {
  const key = String(visitorKey || '').trim();
  if (!key) return { visitor: null, startedSession: false, isReturning: false };

  const db = load();
  const analytics = db.analytics;
  let visitor = analytics.visitors.find((item) => item.key === key);
  const now = Date.now();
  const today = dateKey();
  let startedSession = false;
  let isReturning = false;

  if (!visitor) {
    visitor = {
      key,
      visits: 1,
      firstSeenAt: new Date(now).toISOString(),
      lastVisitAt: new Date(now).toISOString()
    };
    analytics.visitors.push(visitor);
    startedSession = true;
  } else {
    const lastVisitAt = Date.parse(visitor.lastVisitAt || visitor.firstSeenAt || 0);
    if (!lastVisitAt || now - lastVisitAt > sessionWindowMs) {
      visitor.visits = (Number(visitor.visits) || 1) + 1;
      visitor.lastVisitAt = new Date(now).toISOString();
      startedSession = true;
      isReturning = visitor.visits > 1;
    }
  }

  if (startedSession) {
    const day = analytics.daily[today] || { visits: 0, visitors: [] };
    if (!Array.isArray(day.visitors)) day.visitors = [];
    day.visits = (Number(day.visits) || 0) + 1;
    if (!day.visitors.includes(key)) day.visitors.push(key);
    analytics.daily[today] = day;
    save(db);
  }

  return {
    visitor: { ...visitor },
    startedSession,
    isReturning: (Number(visitor.visits) || 1) > 1
  };
}

function getAudienceStats() {
  const analytics = load().analytics;
  const visitors = analytics.visitors || [];
  const today = analytics.daily[dateKey()] || { visits: 0, visitors: [] };
  return {
    visitors: visitors.length,
    returning: visitors.filter((visitor) => (Number(visitor.visits) || 1) > 1).length,
    visits: visitors.reduce((sum, visitor) => sum + (Number(visitor.visits) || 1), 0),
    todayVisitors: Array.isArray(today.visitors) ? today.visitors.length : 0,
    todayVisits: Number(today.visits) || 0
  };
}

function getCategories() {
  const counts = new Map();
  for (const post of sortPosts(load().posts, 'published')) {
    const name = String(post.category || '').trim() || '随笔';
    counts.set(name, (counts.get(name) || 0) + 1);
  }
  const order = ['读书笔记', '数学', '物理与天文', '编程技术', 'Python 编程', 'MATLAB 仿真', 'C/C++ 与 Rust', '算法与数据结构', '嵌入式与硬件', '人工智能', '科技与社会'];
  return [...counts.entries()]
    .map(([name, count]) => ({ name, slug: slugify(name) || 'misc', count }))
    .sort((a, b) => {
      const ia = order.indexOf(a.name);
      const ib = order.indexOf(b.name);
      if (ia === -1 && ib === -1) return b.count - a.count;
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
}
function getAdjacent(id, dir) {
  const posts = sortPosts(load().posts, 'published');
  const index = posts.findIndex((p) => p.id === id);
  if (index === -1) return null;
  const target = dir === 'next' ? posts[index + 1] : posts[index - 1];
  return target || null;
}

function getRelated(id, tags, limit = 3) {
  if (!tags || !tags.length) return [];
  const posts = sortPosts(load().posts, 'published').filter((p) => p.id !== id);
  return posts
    .map((p) => ({ post: p, score: p.tags.filter((t) => tags.includes(t)).length }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || String(b.post.publishedAt).localeCompare(String(a.post.publishedAt)))
    .slice(0, limit)
    .map((item) => item.post);
}

function __saveDemoDates(posts) {
  const db = load();
  for (const demo of posts) {
    const target = db.posts.find((p) => p.id === demo.id);
    if (target) {
      target.createdAt = demo.createdAt;
      target.updatedAt = demo.updatedAt;
      target.publishedAt = demo.publishedAt;
    }
  }
  save(db);
}

module.exports = {
  ensureAdmin,
  __saveDemoDates,
  getUsers,
  findUser,
  verifyPassword,
  changePassword,
  createSession,
  getUserByToken,
  deleteSession,
  getSettings,
  saveSettings,
  createPost,
  updatePost,
  deletePost,
  getPost,
  getPostBySlug,
  incrementViews,
  listPosts,
  getTags,
  getCategories,
  getStats,
  recordVisitorVisit,
  getAudienceStats,
  getAdjacent,
  getRelated,
  slugify
};
