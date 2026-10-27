/* ============================================
   个人网站交互脚本
   ============================================ */

(function () {
  'use strict';

  /* ===== 主题切换 ===== */
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;

  function getStoredTheme() {
    return localStorage.getItem('theme') || 'dark';
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      html.setAttribute('data-theme', 'light');
    } else {
      html.removeAttribute('data-theme');
    }
  }

  applyTheme(getStoredTheme());

  themeToggle.addEventListener('click', function () {
    const current = html.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    applyTheme(next);
    localStorage.setItem('theme', next);
  });

  /* ===== 语言切换 ===== */
  const langToggle = document.getElementById('lang-toggle');

  function getStoredLang() {
    return localStorage.getItem('lang') || 'zh';
  }

  function applyLang(lang) {
    html.setAttribute('lang', lang);
  }

  applyLang(getStoredLang());

  langToggle.addEventListener('click', function () {
    const current = html.getAttribute('lang') || 'zh';
    const next = current === 'zh' ? 'en' : 'zh';
    applyLang(next);
    localStorage.setItem('lang', next);
  });

  /* ===== 移动端菜单 ===== */
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', function () {
      navLinks.classList.toggle('mobile-open');
    });

    document.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('mobile-open');
      });
    });
  }

  /* ===== 滚动渐入动画 ===== */
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ===== 技能进度条动画 ===== */
  const skillBars = document.querySelectorAll('.skill-bar-fill');

  const skillObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const level = entry.target.getAttribute('data-level');
        entry.target.style.width = level + '%';
        skillObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  skillBars.forEach(function (bar) {
    skillObserver.observe(bar);
  });

  /* ===== 导航高亮 ===== */
  const sections = document.querySelectorAll('section[id]');
  const navLinkElements = document.querySelectorAll('.nav-link');

  function updateActiveNav() {
    const scrollY = window.pageYOffset;

    sections.forEach(function (section) {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinkElements.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });

  /* ===== 打字机效果 ===== */
  const typewriterEl = document.querySelector('.typewriter');
  var typewriterTimer = null;

  function runTypewriter() {
    if (!typewriterEl) return;

    // 清除旧的打字循环，防止新旧循环同时写入导致中英文混杂
    if (typewriterTimer) {
      clearTimeout(typewriterTimer);
      typewriterTimer = null;
    }

    var currentLang = html.getAttribute('lang') || 'zh';
    var text = currentLang === 'zh'
      ? '代码如诗，Bug是剧情反转'
      : 'Code is poetry, bugs are plot twists.';

    typewriterEl.textContent = '';
    var i = 0;

    function type() {
      if (i < text.length) {
        typewriterEl.textContent += text.charAt(i);
        i++;
        typewriterTimer = setTimeout(type, 80);
      } else {
        typewriterTimer = null;
      }
    }

    type();
  }

  // 页面加载后稍延迟启动打字机
  setTimeout(runTypewriter, 600);

  // 语言切换时重新打字
  langToggle.addEventListener('click', function () {
    setTimeout(runTypewriter, 100);
  });

  /* ===== 导航栏滚动效果 ===== */
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', function () {
    if (window.pageYOffset > 50) {
      navbar.style.borderBottomColor = 'var(--border)';
      navbar.style.boxShadow = '0 4px 20px var(--shadow)';
    } else {
      navbar.style.borderBottomColor = 'var(--border-light)';
      navbar.style.boxShadow = 'none';
    }
  }, { passive: true });

})();

/* ===== 联系方式交互 ===== */

// 复制到剪贴板
function copyToClipboard(text, btn) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(function () {
      showCopied(btn);
    }).catch(function () {
      fallbackCopy(text, btn);
    });
  } else {
    fallbackCopy(text, btn);
  }
}

function fallbackCopy(text, btn) {
  var ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); } catch (e) {}
  document.body.removeChild(ta);
  showCopied(btn);
}

function showCopied(btn) {
  if (!btn) return;
  var zhSpan = btn.querySelector('.zh');
  var enSpan = btn.querySelector('.en');
  var origZh = zhSpan ? zhSpan.textContent : '';
  var origEn = enSpan ? enSpan.textContent : '';
  btn.classList.add('copied');
  if (zhSpan) zhSpan.textContent = '已复制';
  if (enSpan) enSpan.textContent = 'Copied';
  setTimeout(function () {
    btn.classList.remove('copied');
    if (zhSpan) zhSpan.textContent = origZh;
    if (enSpan) enSpan.textContent = origEn;
  }, 1500);
}

// 微信卡片翻转
function toggleWechatFlip(card) {
  if (card) card.classList.toggle('flipped');
}

// 给所有 .flip-trigger 按钮绑定翻转事件
document.querySelectorAll('.flip-trigger').forEach(function (btn) {
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    var card = btn.closest('.flip-card');
    toggleWechatFlip(card);
  });
});

// 点击卡片本身（不在按钮上）也翻转
document.querySelectorAll('.flip-card').forEach(function (card) {
  card.addEventListener('click', function (e) {
    if (e.target.closest('.contact-action-btn')) return;
    toggleWechatFlip(card);
  });
});
