'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync, spawn } = require('child_process');

const ROOT = path.join(__dirname, '..');
const PORT = 32000 + Math.floor(Math.random() * 1000);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'myblog-smoke-'));
const STATIC_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'myblog-static-'));
const SESSION_COOKIE = 'blog_session';
const VISITOR_COOKIE = 'blog_visitor_id';
const serverLogs = [];

let server;
let publishedPdfPath = '';

function cookieValue(response, name) {
  const header = response.headers.get('set-cookie') || '';
  const match = header.match(new RegExp(`(?:^|,\\s*)${name}=([^;]+)`));
  return match ? `${name}=${match[1]}` : '';
}

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(BASE_URL + '/login');
      if (response.ok) return;
    } catch (error) {
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 120));
  }
  throw new Error('server did not start');
}

function cleanup() {
  if (server && !server.killed) server.kill();
  if (publishedPdfPath) fs.rmSync(publishedPdfPath, { force: true });
  const tempRoot = path.resolve(os.tmpdir()) + path.sep;
  const resolved = path.resolve(DATA_DIR);
  if (resolved.startsWith(tempRoot) && path.basename(resolved).startsWith('myblog-smoke-')) {
    fs.rmSync(resolved, { recursive: true, force: true });
  }
  const staticResolved = path.resolve(STATIC_DIR);
  if (
    staticResolved.startsWith(tempRoot)
    && path.basename(staticResolved).startsWith('myblog-static-')
  ) {
    fs.rmSync(staticResolved, { recursive: true, force: true });
  }
}

async function run() {
  server = spawn(process.execPath, ['server.js'], {
    cwd: ROOT,
    env: {
      ...process.env,
      PORT: String(PORT),
      BLOG_DATA_DIR: DATA_DIR,
      BLOG_VISITOR_SESSION_MS: '80'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  server.stdout.on('data', (chunk) => serverLogs.push(chunk.toString()));
  server.stderr.on('data', (chunk) => serverLogs.push(chunk.toString()));
  await waitForServer();

  const firstVisit = await fetch(BASE_URL + '/');
  assert.strictEqual(firstVisit.status, 200);
  const html = await firstVisit.text();
  assert(html.includes('data-live-stats'));
  assert(html.includes('data-live-endpoint="/api/audience"'));
  assert(!html.includes('&#34;/api/audience&#34;'));
  assert(html.includes('随访用户'));
  const visitorCookie = cookieValue(firstVisit, VISITOR_COOKIE);
  assert(visitorCookie, 'visitor cookie was not issued');

  await new Promise((resolve) => setTimeout(resolve, 120));
  const secondVisit = await fetch(BASE_URL + '/', {
    headers: { Cookie: visitorCookie }
  });
  assert.strictEqual(secondVisit.status, 200);

  const audienceResponse = await fetch(BASE_URL + '/api/audience', {
    headers: {
      Accept: 'application/json',
      Cookie: visitorCookie
    }
  });
  assert.strictEqual(audienceResponse.status, 200);
  const audience = await audienceResponse.json();
  assert(audience.online >= 1);
  assert(audience.returning >= 1);
  assert(audience.visitors >= 1);

  const loginResponse = await fetch(BASE_URL + '/login', {
    method: 'POST',
    redirect: 'manual',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ username: 'admin', password: 'admin123' })
  });
  assert.strictEqual(loginResponse.status, 302);
  const sessionCookie = cookieValue(loginResponse, SESSION_COOKIE);
  assert(sessionCookie, 'admin session cookie was not issued');

  const pdfBytes = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF\n');
  const form = new FormData();
  form.append('pdf', new Blob([pdfBytes], { type: 'application/pdf' }), 'smoke-test.pdf');
  form.append('title', 'Smoke PDF');
  form.append('slug', 'smoke-pdf');
  form.append('summary', 'Smoke test document');
  form.append('category', '资料');
  form.append('tags', 'PDF, Test');
  form.append('action', 'publish');
  const publishResponse = await fetch(BASE_URL + '/admin/pdfs', {
    method: 'POST',
    redirect: 'manual',
    headers: { Cookie: sessionCookie },
    body: form
  });
  assert.strictEqual(publishResponse.status, 302);

  const postResponse = await fetch(BASE_URL + '/post/smoke-pdf');
  assert.strictEqual(postResponse.status, 200);
  const postHtml = await postResponse.text();
  assert(postHtml.includes('PDF 文档预览'));
  assert(postHtml.includes('/uploads/pdfs/'));

  const db = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'db.json'), 'utf8'));
  const post = db.posts.find((item) => item.slug === 'smoke-pdf');
  assert(post, 'published PDF post was not stored');
  assert.strictEqual(post.kind, 'pdf');
  assert.strictEqual(post.status, 'published');

  const generatedPdf = path.join(ROOT, 'public', post.pdfUrl.replace(/^\/+/, ''));
  publishedPdfPath = generatedPdf;
  assert(fs.existsSync(generatedPdf), 'uploaded PDF was not stored');
  const pdfResponse = await fetch(BASE_URL + post.pdfUrl);
  assert.strictEqual(pdfResponse.status, 200);
  const served = Buffer.from(await pdfResponse.arrayBuffer());
  assert.strictEqual(served.subarray(0, 5).toString('ascii'), '%PDF-');

  execFileSync(process.execPath, ['scripts/build-static.js'], {
    cwd: ROOT,
    env: {
      ...process.env,
      BLOG_DATA_DIR: DATA_DIR,
      BLOG_STATIC_OUTPUT_DIR: STATIC_DIR
    },
    stdio: 'pipe'
  });
  const staticHome = fs.readFileSync(path.join(STATIC_DIR, 'index.html'), 'utf8');
  const staticPdfPost = fs.readFileSync(path.join(STATIC_DIR, 'post', 'smoke-pdf.html'), 'utf8');
  assert(staticHome.includes('随访用户'));
  assert(!staticHome.includes('data-live-stats'));
  assert(staticPdfPost.includes('PDF 文档预览'));
  assert(fs.existsSync(path.join(STATIC_DIR, post.pdfUrl.replace(/^\/+/, ''))));

  fs.rmSync(generatedPdf, { force: true });

  console.log('Smoke test passed: live audience, direct PDF publishing, and static export work.');
}

run()
  .catch((error) => {
    console.error(error.stack || error.message);
    if (serverLogs.length) console.error(serverLogs.join(''));
    process.exitCode = 1;
  })
  .finally(() => {
    cleanup();
    setTimeout(() => process.exit(process.exitCode || 0), 50);
  });
