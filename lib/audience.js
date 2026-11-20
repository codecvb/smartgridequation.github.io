'use strict';

const crypto = require('crypto');
const store = require('./store');

const VISITOR_COOKIE = 'blog_visitor_id';
const VISITOR_COOKIE_MAX_AGE = 365 * 24 * 60 * 60 * 1000;
const ONLINE_WINDOW_MS = 75 * 1000;
const SESSION_WINDOW_MS = Number(process.env.BLOG_VISITOR_SESSION_MS) || 30 * 60 * 1000;
const BOT_PATTERN = /bot|crawler|spider|slurp|bingpreview|headless|curl|wget|python-requests/i;
const activeVisitors = new Map();

function isTrackableRequest(req) {
  if (req.method !== 'GET' || !req.accepts('html')) return false;
  if (req.path.startsWith('/admin') || req.path.startsWith('/api/')) return false;
  return !BOT_PATTERN.test(req.get('user-agent') || '');
}

function visitorKey(token) {
  return crypto.createHash('sha256').update(token).digest('hex').slice(0, 32);
}

function ensureVisitor(req, res) {
  const current = req.cookies[VISITOR_COOKIE];
  const token = /^[a-f0-9]{32}$/i.test(current || '')
    ? current
    : crypto.randomBytes(16).toString('hex');

  if (token !== current) {
    req.cookies[VISITOR_COOKIE] = token;
    res.cookie(VISITOR_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: !!process.env.COOKIE_SECURE,
      maxAge: VISITOR_COOKIE_MAX_AGE,
      path: '/'
    });
  }

  return visitorKey(token);
}

function markActive(key) {
  const now = Date.now();
  activeVisitors.set(key, now);
  for (const [visitor, seenAt] of activeVisitors) {
    if (now - seenAt > ONLINE_WINDOW_MS) activeVisitors.delete(visitor);
  }
}

function onlineCount() {
  const now = Date.now();
  for (const [visitor, seenAt] of activeVisitors) {
    if (now - seenAt > ONLINE_WINDOW_MS) activeVisitors.delete(visitor);
  }
  return activeVisitors.size;
}

function trackPage(req, res) {
  if (!isTrackableRequest(req)) return null;
  const key = ensureVisitor(req, res);
  store.recordVisitorVisit(key, SESSION_WINDOW_MS);
  markActive(key);
  return key;
}

function trackPresence(req, res) {
  const key = ensureVisitor(req, res);
  markActive(key);
  return key;
}

function getAudienceStats() {
  return {
    ...store.getAudienceStats(),
    online: onlineCount()
  };
}

module.exports = {
  trackPage,
  trackPresence,
  getAudienceStats
};
