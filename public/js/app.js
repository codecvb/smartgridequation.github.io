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
})();
