/**
 * 粒子拖尾光标（分区策略）
 * 首屏 Hero 区：正常密度，配合黑洞背景
 * 内容区：极低密度，不干扰阅读
 * 移动端自动禁用
 */

(function () {
  'use strict';

  if (window.matchMedia('(hover: none)').matches) return;
  if ('ontouchstart' in window) return;

  // Canvas
  var canvas = document.createElement('canvas');
  canvas.className = 'cursor-particles-canvas';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99999;';
  document.body.appendChild(canvas);
  document.body.classList.add('has-custom-cursor');

  var ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // 小圆点 —— 精确指示鼠标位置，零延迟跟手
  var dot = document.createElement('div');
  dot.className = 'cursor-dot';
  document.body.appendChild(dot);

  var particles = [];
  var MAX_PARTICLES = 120;

  var mouseX = -100, mouseY = -100;
  var prevX = -100, prevY = -100;
  var hovering = false;
  var frameCount = 0; // 隔帧控制
  var isLightTheme = document.documentElement.getAttribute('data-theme') === 'light';

  var colors = isLightTheme
    ? [{ r: 0, g: 180, b: 255 }, { r: 140, g: 80, b: 220 }, { r: 99, g: 130, b: 255 }]
    : [{ r: 0, g: 212, b: 255 }, { r: 168, g: 85, b: 247 }, { r: 99, g: 102, b: 241 }];

  var observer = new MutationObserver(function () {
    isLightTheme = document.documentElement.getAttribute('data-theme') === 'light';
    colors = isLightTheme
      ? [{ r: 0, g: 180, b: 255 }, { r: 140, g: 80, b: 220 }, { r: 99, g: 130, b: 255 }]
      : [{ r: 0, g: 212, b: 255 }, { r: 168, g: 85, b: 247 }, { r: 99, g: 102, b: 241 }];
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // 判断鼠标是否在 Hero 区
  var heroEl = document.getElementById('hero');
  function isInHero(y) {
    if (!heroEl) return false;
    var rect = heroEl.getBoundingClientRect();
    return y >= rect.top && y <= rect.bottom;
  }

  // 生成粒子
  function spawn(x, y, count, opts) {
    opts = opts || {};
    var sizeMin = opts.sizeMin || 1.5;
    var sizeRange = opts.sizeRange || 3;
    var decayMin = opts.decayMin || 0.015;
    var decayRange = opts.decayRange || 0.02;
    var speedForce = opts.force || 1;
    var glowMul = opts.glowMul || 1;

    for (var i = 0; i < count; i++) {
      if (particles.length >= MAX_PARTICLES) particles.shift();
      var angle = Math.random() * Math.PI * 2;
      var speed = (Math.random() * 1.5 + 0.3) * speedForce;
      var color = colors[Math.floor(Math.random() * colors.length)];

      particles.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 6,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        decay: decayMin + Math.random() * decayRange,
        size: Math.random() * sizeRange + sizeMin,
        r: color.r, g: color.g, b: color.b,
        glow: glowMul
      });
    }
  }

  // 鼠标移动
  document.addEventListener('mousemove', function (e) {
    prevX = mouseX; prevY = mouseY;
    mouseX = e.clientX; mouseY = e.clientY;

    // 小圆点零延迟跟手
    dot.style.transform = 'translate3d(' + (mouseX - 3) + 'px,' + (mouseY - 3) + 'px,0)';
    dot.classList.add('cursor-visible');

    var dx = mouseX - prevX;
    var dy = mouseY - prevY;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var inHero = isInHero(mouseY);

    if (inHero) {
      // Hero 区：正常密度
      var count = hovering ? 3 : Math.min(Math.ceil(dist / 8) + 1, 4);
      spawn(mouseX, mouseY, count, {});
    } else {
      // 内容区：隔帧生成 1 个，小尺寸，快速消失
      frameCount++;
      if (frameCount % 2 === 0) {
        spawn(mouseX, mouseY, 1, {
          sizeMin: 0.5,
          sizeRange: 1,
          decayMin: 0.04,
          decayRange: 0.03,
          glowMul: 0.4
        });
      }
    }
  });

  // hover
  var hoverSelector = 'a, button, .glow-card, .nav-link, .icon-btn, .btn, .tag, input, textarea, [role="button"]';
  document.addEventListener('mouseover', function (e) {
    if (e.target.closest(hoverSelector)) {
      hovering = true;
      dot.classList.add('cursor-hover');
    }
  });
  document.addEventListener('mouseout', function (e) {
    if (e.target.closest(hoverSelector)) {
      hovering = false;
      dot.classList.remove('cursor-hover');
    }
  });

  // 点击爆发（内容区减弱）
  document.addEventListener('mousedown', function (e) {
    dot.classList.add('cursor-click');
    if (isInHero(e.clientY)) {
      spawn(e.clientX, e.clientY, 18, { force: 3 });
    } else {
      spawn(e.clientX, e.clientY, 5, { force: 1.5, sizeMin: 0.5, sizeRange: 1.5, glowMul: 0.5 });
    }
  });
  document.addEventListener('mouseup', function () {
    dot.classList.remove('cursor-click');
  });

  // 渲染
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'lighter';

    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.94;
      p.vy *= 0.94;
      p.life -= p.decay;
      if (p.life <= 0) { particles.splice(i, 1); continue; }

      var alpha = p.life;
      var size = p.size * p.life;
      var g = p.glow || 1;

      // 外发光（内容区减弱）
      var gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 4);
      gradient.addColorStop(0, 'rgba(' + p.r + ',' + p.g + ',' + p.b + ',' + (alpha * 0.8 * g) + ')');
      gradient.addColorStop(0.4, 'rgba(' + p.r + ',' + p.g + ',' + p.b + ',' + (alpha * 0.3 * g) + ')');
      gradient.addColorStop(1, 'rgba(' + p.r + ',' + p.g + ',' + p.b + ',0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, size * 4, 0, Math.PI * 2);
      ctx.fill();

      // 实心核心
      ctx.fillStyle = 'rgba(' + p.r + ',' + p.g + ',' + p.b + ',' + alpha + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(render);
  }
  render();
})();
