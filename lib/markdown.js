'use strict';

const MarkdownIt = require('markdown-it');
const hljs = require('highlight.js');

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
