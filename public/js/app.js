(function () {
  const navToggle = document.querySelector('[data-nav-toggle]');
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      document.getElementById('site-nav').classList.toggle('is-open');
    });
  }

  document.querySelectorAll('form[data-confirm]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      if (!window.confirm(form.getAttribute('data-confirm'))) {
        event.preventDefault();
      }
    });
  });

  const copyLink = document.querySelector('[data-copy-link]');
  if (copyLink) {
    copyLink.addEventListener('click', function () {
      navigator.clipboard
        .writeText(window.location.href)
        .then(function () {
          copyLink.textContent = '已复制';
          window.setTimeout(function () {
            copyLink.textContent = '复制链接';
          }, 1600);
        })
        .catch(function () {});
    });
  }

  document.querySelectorAll('.prose pre').forEach(function (pre) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'code-copy';
    button.textContent = '复制';
    button.addEventListener('click', function () {
      navigator.clipboard
        .writeText(pre.innerText)
        .then(function () {
          button.textContent = '已复制';
          window.setTimeout(function () {
            button.textContent = '复制';
          }, 1600);
        })
        .catch(function () {});
    });
    pre.appendChild(button);
  });

  const liveStats = document.querySelector('[data-live-stats]');
  if (liveStats && window.fetch) {
    const endpoint = liveStats.getAttribute('data-live-endpoint') || '/api/audience';
    const updated = document.querySelector('[data-live-updated]');
    const fields = {
      online: document.querySelector('[data-live-online]'),
      returning: document.querySelector('[data-live-returning]'),
      visitors: document.querySelector('[data-live-visitors]')
    };
    let refreshing = false;

    function renderCount(node, value) {
      if (!node || value === undefined || value === null) return;
      node.textContent = Number(value).toLocaleString('zh-CN');
    }

    async function refreshLiveStats() {
      if (refreshing || document.hidden) return;
      refreshing = true;
      try {
        const response = await fetch(endpoint, {
          cache: 'no-store',
          credentials: 'same-origin',
          headers: { Accept: 'application/json' }
        });
        if (!response.ok) throw new Error('audience request failed with status ' + response.status);
        const data = await response.json();
        renderCount(fields.online, data.online);
        renderCount(fields.returning, data.returning);
        renderCount(fields.visitors, data.visitors);
        if (updated) {
          updated.textContent = new Date().toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });
        }
      } catch (error) {
        console.warn('Live audience refresh failed:', error);
        if (updated) updated.textContent = '连接中断，稍后重试';
      } finally {
        refreshing = false;
      }
    }

    refreshLiveStats();
    window.setInterval(refreshLiveStats, 8000);
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) refreshLiveStats();
    });
  }
})();
