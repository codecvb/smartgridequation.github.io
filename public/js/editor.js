(function () {
  const title = document.getElementById('post-title');
  const slug = document.getElementById('post-slug');
  const tags = document.getElementById('post-tags');
  const summary = document.getElementById('post-summary');
  const content = document.getElementById('post-content');
  const preview = document.getElementById('preview');
  const charCount = document.getElementById('char-count');
  const saveState = document.getElementById('save-state');
  const imageInput = document.getElementById('image-input');
  const form = document.getElementById('post-form');

  if (!content || !preview || !window.markdownit) return;

  const formAction = form.getAttribute('action') || '';
  const idMatch = formAction.match(/\/admin\/posts\/([^/]+)$/);
  const postId = idMatch ? idMatch[1] : 'new';
  const draftKey = 'blog-draft-' + postId;

  function clientSlugify(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
  }

  let slugAuto = !slug.value;

  title.addEventListener('input', function () {
    if (slugAuto) slug.value = clientSlugify(title.value);
  });

  slug.addEventListener('input', function () {
    slugAuto = !slug.value;
  });

  const md = window.markdownit({
    html: false,
    linkify: true,
    typographer: true,
    breaks: true,
    highlight: function (str, lang) {
      if (window.hljs && lang && hljs.getLanguage(lang)) {
        try {
          return '<pre class="hljs"><code class="language-' + lang + '">' + hljs.highlight(str, { language: lang }).value + '</code></pre>';
        } catch (err) {
          // fall through
        }
      }
      return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
    }
  });

  function renderPreview() {
    preview.innerHTML = md.render(content.value || '');
    charCount.textContent = (content.value || '').length + ' 字';
  }

  content.addEventListener('input', renderPreview);
  renderPreview();

  function setSaveState(text, className) {
    saveState.textContent = text;
    saveState.className = 'save-state' + (className ? ' ' + className : '');
  }

  function persistLocalDraft() {
    try {
      localStorage.setItem(
        draftKey,
        JSON.stringify({
          title: title.value,
          slug: slug.value,
          summary: summary.value,
          tags: tags.value,
          content: content.value,
          at: Date.now()
        })
      );
      setSaveState('已保存到本地', 'is-saved');
    } catch (err) {
      setSaveState('本地保存失败', '');
    }
  }

  let autosaveTimer = null;
  content.addEventListener('input', function () {
    setSaveState('正在保存…', 'is-saving');
    window.clearTimeout(autosaveTimer);
    autosaveTimer = window.setTimeout(persistLocalDraft, 1200);
  });

  window.addEventListener('beforeunload', persistLocalDraft);

  if (!idMatch) {
    try {
      const saved = JSON.parse(localStorage.getItem(draftKey) || 'null');
      if (saved && (saved.title || saved.content)) {
        title.value = saved.title || '';
        slug.value = saved.slug || '';
        summary.value = saved.summary || '';
        tags.value = saved.tags || '';
        content.value = saved.content || '';
        renderPreview();
        setSaveState('已恢复本地草稿', 'is-saved');
      }
    } catch (err) {
      // ignore broken local drafts
    }
  }

  function insertAtCursor(text) {
    const start = content.selectionStart;
    const end = content.selectionEnd;
    content.value = content.value.slice(0, start) + text + content.value.slice(end);
    const pos = start + text.length;
    content.focus();
    content.setSelectionRange(pos, pos);
    renderPreview();
  }

  const toolbar = document.querySelector('[data-editor-toolbar]');
  if (toolbar) {
    toolbar.addEventListener('click', function (event) {
      const button = event.target.closest('[data-md]');
      if (!button) return;
      const action = button.getAttribute('data-md');
      if (action === 'image') {
        imageInput.click();
        return;
      }
      applyMarkdownAction(action);
      content.focus();
    });
  }

  function applyMarkdownAction(action) {
    const start = content.selectionStart;
    const end = content.selectionEnd;
    const selected = content.value.slice(start, end);
    const templates = {
      bold: ['**', '**'],
      italic: ['*', '*'],
      h2: ['\n## ', '\n'],
      quote: ['\n> ', '\n'],
      code: ['`', '`'],
      link: ['[', '](https://)'],
      list: ['\n- ', ''],
      task: ['\n- [ ] ', '']
    };
    const pair = templates[action];
    if (!pair) return;
    const before = content.value.slice(0, start);
    const after = content.value.slice(end);
    const wrapped = pair[0] + selected + pair[1];
    content.value = before + wrapped + after;
    content.setSelectionRange(start + pair[0].length, start + pair[0].length + selected.length);
    renderPreview();
  }

  imageInput.addEventListener('change', async function () {
    const file = imageInput.files[0];
    if (!file) return;
    setSaveState('图片上传中…', 'is-saving');
    const data = new FormData();
    data.append('image', file);
    try {
      const response = await fetch('/admin/api/upload', { method: 'POST', body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || '上传失败');
      insertAtCursor('\n\n![' + file.name + '](' + result.url + ')\n\n');
      setSaveState('图片已插入', 'is-saved');
    } catch (err) {
      setSaveState('上传失败', '');
      window.alert(err.message || '图片上传失败');
    } finally {
      imageInput.value = '';
    }
  });
})();
