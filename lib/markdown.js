'use strict';

const MarkdownIt = require('markdown-it');
const hljs = require('highlight.js');
const katex = require('katex');

function slugify(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  breaks: true,
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code class="language-${lang}">${hljs.highlight(str, { language: lang }).value}</code></pre>`;
      } catch (err) {
        // fall through to escaped output
      }
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  }
});

function katexOptions(displayMode) {
  return { throwOnError: false, strict: 'ignore', displayMode };
}

md.inline.ruler.before('text', 'math_inline', function mathInline(state, silent) {
  const src = state.src;
  const start = state.pos;
  if (src[start] !== '$' || src[start + 1] === '$') return false;
  if (start > 0 && src[start - 1] === '\\') return false;

  let end = -1;
  for (let i = start + 1; i < state.posMax; i++) {
    if (src[i] === '\n') break;
    if (src[i] === '$') {
      end = i;
      break;
    }
  }
  if (end === -1) return false;

  const content = src.slice(start + 1, end).trim();
  if (!content) return false;

  if (!silent) {
    const token = state.push('math_inline', 'math', 0);
    token.content = content;
    token.markup = '$';
  }
  state.pos = end + 1;
  return true;
});

md.renderer.rules.math_inline = (tokens, idx) =>
  katex.renderToString(tokens[idx].content, katexOptions(false));

md.block.ruler.before('fence', 'math_block', function mathBlock(state, startLine, endLine, silent) {
  const start = state.bMarks[startLine] + state.tShift[startLine];
  const src = state.src;
  if (!src.startsWith('$$', start)) return false;

  const end = src.indexOf('$$', start + 2);
  if (end === -1) return false;

  let endLineIndex = startLine;
  for (let line = startLine; line < endLine; line++) {
    if (end >= state.bMarks[line] && end <= state.eMarks[line]) {
      endLineIndex = line;
      break;
    }
  }

  const content = src.slice(start + 2, end).trim();
  if (!content) return false;

  if (!silent) {
    const token = state.push('math_block', 'math', 0);
    token.block = true;
    token.content = content;
    token.map = [startLine, endLineIndex + 1];
  }
  state.line = endLineIndex + 1;
  return true;
});

md.renderer.rules.math_block = (tokens, idx) =>
  `<div class="math-block">${katex.renderToString(tokens[idx].content, katexOptions(true))}</div>`;

md.renderer.rules.heading_open = function renderHeading(tokens, idx, options, env, self) {
  const token = tokens[idx];
  const inline = tokens[idx + 1];
  const text = inline ? inline.content : '';
  const id = slugify(text) || `heading-${idx}`;
  token.attrSet('id', id);
  token.attrSet('class', 'prose-heading');
  return self.renderToken(tokens, idx, options);
};

function renderMarkdown(src) {
  return md.render(String(src || ''));
}

function getToc(src) {
  const tokens = md.parse(String(src || ''), {});
  const toc = [];
  let open = null;
  for (const token of tokens) {
    if (token.type === 'heading_open') {
      open = {
        level: Number(token.tag.slice(1)),
        text: ''
      };
    } else if (token.type === 'inline' && open) {
      open.text = token.content;
    } else if (token.type === 'heading_close' && open) {
      toc.push({
        level: open.level,
        text: open.text,
        id: slugify(open.text) || `heading-${toc.length}`
      });
      open = null;
    }
  }
  return toc;
}

module.exports = { renderMarkdown, getToc };
