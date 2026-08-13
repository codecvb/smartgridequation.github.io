'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const store = require('../lib/store');

const ROOT = path.join(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'posts');
const BUILD_SCRIPT = path.join(__dirname, 'build-static.js');

function cleanValue(value) {
  const text = String(value).trim();
  if (
    (text.startsWith('"') && text.endsWith('"')) ||
    (text.startsWith("'") && text.endsWith("'"))
  ) {
    return text.slice(1, -1).trim();
  }
  return text;
}

function parseFrontmatter(source) {
  const match = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/);
  if (!match) return { frontmatter: {}, content: source };

  const lines = match[1].split(/\r?\n/);
  const frontmatter = {};
  let currentListKey = null;

  for (const line of lines) {
    const listItem = line.match(/^\s*-\s*(.+)$/);
    if (listItem) {
      if (currentListKey && Array.isArray(frontmatter[currentListKey])) {
        frontmatter[currentListKey].push(cleanValue(listItem[1]));
      }
      continue;
    }

    const colon = line.indexOf(':');
    if (colon === -1) continue;

    const key = line.slice(0, colon).trim().toLowerCase();
    const raw = line.slice(colon + 1).trim();
    if (raw === '') {
      frontmatter[key] = [];
      currentListKey = key;
    } else {
      frontmatter[key] = cleanValue(raw);
      currentListKey = null;
    }
  }

  return { frontmatter, content: source.slice(match[0].length) };
}

function firstHeading(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : '';
}

function summaryOf(content) {
  const paragraphs = content.replace(/\r/g, '').split(/\n\s*\n/);
  for (const paragraph of paragraphs) {
    const text = paragraph
      .replace(/^#{1,6}\s+/m, '')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/[*_>`~]/g, '')
      .replace(/^\s*[-•]\s+/gm, '')
      .trim();
    if (!text) continue;
    return text.length > 180 ? `${text.slice(0, 180)}…` : text;
  }
  return '';
}

function normalizeTags(value) {
  if (Array.isArray(value)) return value.join(', ');
  return String(value || '')
    .split(/[,，]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .join(', ');
}

function publishFile(file) {
  const absolute = path.resolve(file);
  const source = fs.readFileSync(absolute, 'utf8');
  const { frontmatter, content } = parseFrontmatter(source);
  const title = frontmatter.title || firstHeading(content) || path.basename(absolute, path.extname(absolute));
  const slug = frontmatter.slug || store.slugify(title) || `post-${Date.now().toString(36)}`;
  const summary = frontmatter.summary || summaryOf(content);
  const tags = normalizeTags(frontmatter.tags);
  const category = String(frontmatter.category || '').trim();
  const existing = store.getPostBySlug(slug);

  let post;
  let action;
  if (existing) {
    post = store.updatePost(existing.id, { title, slug, summary, content, tags, category }, 'publish');
    action = 'updated';
  } else {
    post = store.createPost({ title, slug, summary, content, tags, category, status: 'published' });
    action = 'published';
  }

  return { post, action, file };
}

function main() {
  const args = process.argv.slice(2);
  let files = args.length ? args : [];
  const IGNORE_DIRS = new Set(['CSDN博文备份']);
  function collectMarkdown(dir) {
    if (!fs.existsSync(dir)) return [];
    const results = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!IGNORE_DIRS.has(entry.name)) results.push(...collectMarkdown(path.join(dir, entry.name)));
      } else if (/\.md$/i.test(entry.name)) {
        results.push(path.join(dir, entry.name));
      }
    }
    return results;
  }

  if (!files.length && fs.existsSync(POSTS_DIR)) {
    files = collectMarkdown(POSTS_DIR).sort();
  }

  if (!files.length) {
    console.error('No markdown file provided.');
    console.error('Usage: npm run publish -- path/to/article.md');
    console.error('Or put .md files into posts/ and run: npm run publish');
    process.exit(1);
  }

  for (const file of files) {
    const { post, action, file: sourceFile } = publishFile(file);
    console.log(`${action === 'updated' ? 'Updated' : 'Published'}: ${post.title}`);
    console.log(`  source: ${sourceFile}`);
    console.log(`  url:    /post/${post.slug}.html`);
  }

  execFileSync(process.execPath, [BUILD_SCRIPT], { stdio: 'inherit' });
  console.log('Static site rebuilt.');
}

main();
