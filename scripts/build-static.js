'use strict';

const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const store = require('../lib/store');
const { renderMarkdown, getToc } = require('../lib/markdown');

const ROOT = path.join(__dirname, '..');
const VIEWS_DIR = path.join(ROOT, 'views', 'site');
const PUBLIC_DIR = path.join(ROOT, 'public');
const LAYOUT = path.join(VIEWS_DIR, 'layout.ejs');

function formatDate(iso, withTime = false) {
  if (!iso) return '';
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

function renderSite(view, data) {
  const template = fs.readFileSync(LAYOUT, 'utf8');
  return ejs.render(template, {
    site: store.getSettings(),
    path: '/',
    user: null,
    staticSite: true,
    view,
    formatDate,
    readTime,
    renderMarkdown,
    ...data
  }, {
    views: VIEWS_DIR,
    filename: LAYOUT
  });
}

function writeFile(relPath, html) {
  const file = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

function copyDir(src, dest) {
  fs.cpSync(src, dest, { recursive: true });
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function staticLinks(html, tagFiles) {
  return html
    .replace(/href="\/post\/([^"?#]+)"/g, (match, slug) => `href="/post/${slug}.html"`)
    .replace(/href="\/tags\?tag=([^"]+)"/g, (match, encoded) => {
      const key = decodeURIComponent(encoded).toLowerCase();
      const file = tagFiles.get(key) || 'tags.html';
      return `href="/tags/${file}"`;
    })
    .replace(/href="\/archive"/g, 'href="/archive.html"')
    .replace(/href="\/tags"/g, 'href="/tags.html"')
    .replace(/href="\/about"/g, 'href="/about.html"');
}

function build() {
  const published = store.listPosts({ status: 'published' });
  const tags = store.getTags();
  const stats = store.getStats();
  const tagFiles = new Map(tags.map((tag, index) => [tag.name.toLowerCase(), `tag-${index + 1}.html`]));

  writeFile('index.html', staticLinks(renderSite('home', {
    path: '/',
    pageTitle: '首页',
    featured: published[0] || null,
    posts: published.slice(1),
    stats,
    tags: tags.slice(0, 8)
  }), tagFiles));

  writeFile('archive.html', staticLinks(renderSite('archive', {
    path: '/archive',
    pageTitle: '归档',
    heading: '全部文章',
    description: `按时间倒序排列，一共 ${published.length} 篇。`,
    posts: published,
    tags: []
  }), tagFiles));

  writeFile('tags.html', staticLinks(renderSite('tags', {
    path: '/tags',
    pageTitle: '标签',
    selected: '',
    posts: [],
    tags
  }), tagFiles));

  tags.forEach((tag, index) => {
    writeFile(`tags/tag-${index + 1}.html`, staticLinks(renderSite('tags', {
      path: '/tags',
      pageTitle: `标签：${tag.name}`,
      selected: tag.name,
      posts: store.listPosts({ status: 'published', tag: tag.name }),
      tags
    }), tagFiles));
  });

  for (const post of published) {
    const postView = {
      ...post,
      contentHtml: renderMarkdown(post.content),
      toc: getToc(post.content),
      readMinutes: readTime(post.content)
    };
    writeFile(`post/${post.slug}.html`, staticLinks(renderSite('post', {
      path: `/post/${post.slug}`,
      pageTitle: post.title,
      post: postView,
      prev: store.getAdjacent(post.id, 'prev'),
      next: store.getAdjacent(post.id, 'next'),
      related: store.getRelated(post.id, post.tags, 3)
    }), tagFiles));
  }

  writeFile('about.html', staticLinks(renderSite('about', {
    path: '/about',
    pageTitle: '关于'
  }), tagFiles));

  writeFile('404.html', staticLinks(renderSite('error', {
    path: '/',
    pageTitle: '未找到',
    statusCode: 404,
    message: '页面不存在或已被移走。'
  }), tagFiles));

  const searchTemplate = fs.readFileSync(path.join(VIEWS_DIR, 'static-search.ejs'), 'utf8');
  const searchHtml = ejs.render(searchTemplate, {
    site: store.getSettings(),
    path: '/search',
    pageTitle: '搜索',
    staticSite: true,
    formatDate,
    posts: published
  }, {
    views: VIEWS_DIR,
    filename: path.join(VIEWS_DIR, 'static-search.ejs')
  });
  writeFile('search.html', searchHtml);

  copyDir(path.join(PUBLIC_DIR, 'css'), path.join(ROOT, 'css'));
  copyDir(path.join(PUBLIC_DIR, 'js'), path.join(ROOT, 'js'));
  copyDir(path.join(PUBLIC_DIR, 'img'), path.join(ROOT, 'img'));
  copyDir(path.join(PUBLIC_DIR, 'uploads'), path.join(ROOT, 'uploads'));
  copyFile(
    path.join(ROOT, 'node_modules', 'highlight.js', 'styles', 'github-dark.min.css'),
    path.join(ROOT, 'vendor', 'highlight', 'styles', 'github-dark.min.css')
  );
  writeFile('.nojekyll', '');

  console.log(`Static site generated: ${published.length} posts, ${tags.length} tags.`);
}

build();
