'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const store = require('../lib/store');
const { getPdfMetadata } = require('../lib/pdf');

const ROOT = path.join(__dirname, '..');
const PDF_DIR = path.join(ROOT, 'public', 'uploads', 'pdfs');
const BUILD_SCRIPT = path.join(__dirname, 'build-static.js');
const VALUE_OPTIONS = new Set(['title', 'slug', 'summary', 'tags', 'category']);

function usage() {
  console.log('用法: npm run publish:pdf -- <文件.pdf|目录> [选项]');
  console.log('选项: --title "标题" --slug article-slug --summary "摘要"');
  console.log('      --tags "PDF, 讲义" --category "资料" --draft');
}

function parseArgs(args) {
  const options = { draft: false, file: '' };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--draft') {
      options.draft = true;
      continue;
    }
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      if (!VALUE_OPTIONS.has(key)) throw new Error('未知选项: ' + arg);
      const value = args[index + 1];
      if (!value || value.startsWith('--')) throw new Error('选项缺少值: ' + arg);
      options[key] = value;
      index += 1;
      continue;
    }
    if (!options.file) options.file = arg;
  }
  return options;
}

function fileSize(bytes) {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  if (bytes >= 1024) return Math.round(bytes / 1024) + ' KB';
  return bytes + ' B';
}

function isPdfFile(filePath) {
  const header = Buffer.alloc(1024);
  const fd = fs.openSync(filePath, 'r');
  try {
    const read = fs.readSync(fd, header, 0, header.length, 0);
    return header.subarray(0, read).toString('ascii').includes('%PDF-');
  } finally {
    fs.closeSync(fd);
  }
}

function collectPdfFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...collectPdfFiles(fullPath));
    else if (/\.pdf$/i.test(entry.name)) files.push(fullPath);
  }
  return files.sort((a, b) => a.localeCompare(b, 'zh-CN'));
}

function publishFile(source, options) {
  const originalName = path.basename(source);
  const metadata = getPdfMetadata(source);
  const title =
    String(options.title || '').trim() ||
    metadata.title ||
    originalName.replace(/\.pdf$/i, '').replace(/[-_]+/g, ' ').trim() ||
    'PDF 文档';
  const duplicate = store
    .listPosts({})
    .find((post) => post.kind === 'pdf' && post.pdfName === originalName);
  if (duplicate) {
    console.log(`Skipped: ${title}`);
    console.log(`  reason: already published as /post/${duplicate.slug}`);
    return false;
  }

  const storedName = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.pdf`;
  const target = path.join(PDF_DIR, storedName);
  fs.mkdirSync(PDF_DIR, { recursive: true });
  fs.copyFileSync(source, target);

  let post;
  try {
    post = store.createPost({
      kind: 'pdf',
      title,
      slug: options.slug,
      summary: options.summary || metadata.subject || `PDF 文档 · ${fileSize(fs.statSync(source).size)}`,
      content: '',
      tags: options.tags || 'PDF',
      category: options.category || '资料',
      status: options.draft ? 'draft' : 'published',
      pdfUrl: '/uploads/pdfs/' + storedName,
      pdfName: originalName,
      pdfSize: fs.statSync(source).size
    });
  } catch (error) {
    fs.rmSync(target, { force: true });
    throw error;
  }

  console.log(`${options.draft ? 'Draft' : 'Published'}: ${post.title}`);
  console.log(`  source: ${source}`);
  console.log(`  url: /post/${post.slug}`);
  return true;
}

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    usage();
    process.exit(1);
  }

  if (!options.file) {
    usage();
    process.exit(1);
  }

  const source = path.resolve(options.file);
  if (!fs.existsSync(source)) {
    console.error('找不到文件或目录: ' + source);
    process.exit(1);
  }

  const stats = fs.statSync(source);
  const files = stats.isDirectory() ? collectPdfFiles(source) : [source];
  if (!files.length) {
    console.error('目录中没有 PDF 文件: ' + source);
    process.exit(1);
  }
  if (files.length > 1 && (options.title || options.slug)) {
    console.error('批量发布时不能统一指定 --title 或 --slug，标题将从 PDF 元数据读取。');
    process.exit(1);
  }
  for (const file of files) {
    if (!isPdfFile(file)) {
      console.error('文件内容不是有效的 PDF: ' + file);
      process.exit(1);
    }
  }

  let published = 0;
  for (const file of files) {
    if (publishFile(file, options)) published += 1;
  }

  if (!options.draft && published) {
    execFileSync(process.execPath, [BUILD_SCRIPT], { stdio: 'inherit' });
    console.log('Static site rebuilt.');
  } else if (!published) {
    console.log('No new PDF files were published.');
  }
}

main();
