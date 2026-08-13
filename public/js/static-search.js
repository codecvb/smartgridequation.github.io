(function () {
  'use strict';

  var posts = window.STATIC_POSTS || [];
  var form = document.getElementById('static-search-form');
  var input = document.getElementById('static-search-input');
  var results = document.getElementById('static-search-results');

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatDate(iso) {
    if (!iso) return '';
    var date = new Date(iso);
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  }

  function renderList(list) {
    if (!list.length) {
      results.innerHTML = '<p class="empty">没有匹配的文章。</p>';
      return;
    }
    results.innerHTML = list.map(function (post, i) {
      var tags = (post.tags || []).join(' / ');
      return [
        '<a class="list-item" href="post/' + encodeURIComponent(post.slug) + '.html">',
        '  <span class="list-index">' + String(i + 1).padStart(2, '0') + '</span>',
        '  <span class="list-main">',
        '    <span class="list-title">' + escapeHtml(post.title) + '</span>',
        '    <span class="list-summary">' + escapeHtml(post.summary || '……') + '</span>',
        '  </span>',
        '  <span class="list-meta">',
        '    <span class="list-tags">' + escapeHtml(tags) + '</span>',
        '    <time datetime="' + escapeHtml(post.publishedAt) + '">' + formatDate(post.publishedAt) + '</time>',
        '  </span>',
        '</a>'
      ].join('');
    }).join('');
  }

  function runSearch(q) {
    var query = String(q || '').trim().toLowerCase();
    var matches = posts;
    if (query) {
      matches = posts.filter(function (post) {
        return [post.title, post.summary, post.content, (post.tags || []).join(' ')]
          .join('\n')
          .toLowerCase()
          .indexOf(query) !== -1;
      });
    }
    renderList(matches);
  }

  if (form && input) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var q = input.value;
      var url = new URL(window.location.href);
      if (q.trim()) {
        url.searchParams.set('q', q);
      } else {
        url.searchParams.delete('q');
      }
      history.replaceState(null, '', url.toString());
      runSearch(q);
    });
  }

  var params = new URLSearchParams(window.location.search);
  var initial = params.get('q') || '';
  if (input) input.value = initial;
  runSearch(initial);
})();
