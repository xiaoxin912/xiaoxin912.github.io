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

  function runTypewriter() {
    if (!typewriterEl) return;

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
        setTimeout(type, 80);
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
