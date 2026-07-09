/**
 * BorderGlow 边缘光晕效果（原生 JS 版）
 * 忠实移植 React Bits 的 BorderGlow 组件
 * 鼠标靠近卡片边缘时，沿指针方向亮起 mesh 渐变光晕
 */

(function () {
  'use strict';

  /* ---------- 工具函数（直接移植原版） ---------- */

  function parseHSL(hslStr) {
    var match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
    if (!match) return { h: 40, s: 80, l: 80 };
    return { h: parseFloat(match[1]), s: parseFloat(match[2]), l: parseFloat(match[3]) };
  }

  function buildGlowVars(glowColor, intensity) {
    var parsed = parseHSL(glowColor);
    var base = parsed.h + 'deg ' + parsed.s + '% ' + parsed.l + '%';
    var opacities = [100, 60, 50, 40, 30, 20, 10];
    var keys = ['', '-60', '-50', '-40', '-30', '-20', '-10'];
    var vars = {};
    for (var i = 0; i < opacities.length; i++) {
      vars['--glow-color' + keys[i]] = 'hsl(' + base + ' / ' + Math.min(opacities[i] * intensity, 100) + '%)';
    }
    return vars;
  }

  var GRADIENT_POSITIONS = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%'];
  var GRADIENT_KEYS = ['--gradient-one', '--gradient-two', '--gradient-three', '--gradient-four', '--gradient-five', '--gradient-six', '--gradient-seven'];
  var COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

  function buildGradientVars(colors) {
    var vars = {};
    for (var i = 0; i < 7; i++) {
      var c = colors[Math.min(COLOR_MAP[i], colors.length - 1)];
      vars[GRADIENT_KEYS[i]] = 'radial-gradient(at ' + GRADIENT_POSITIONS[i] + ', ' + c + ' 0px, transparent 50%)';
    }
    vars['--gradient-base'] = 'linear-gradient(' + colors[0] + ' 0 100%)';
    return vars;
  }

  function getCenterOfElement(el) {
    var rect = el.getBoundingClientRect();
    return [rect.width / 2, rect.height / 2];
  }

  function getEdgeProximity(el, x, y) {
    var center = getCenterOfElement(el);
    var cx = center[0], cy = center[1];
    var dx = x - cx;
    var dy = y - cy;
    var kx = Infinity;
    var ky = Infinity;
    if (dx !== 0) kx = cx / Math.abs(dx);
    if (dy !== 0) ky = cy / Math.abs(dy);
    return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
  }

  function getCursorAngle(el, x, y) {
    var center = getCenterOfElement(el);
    var cx = center[0], cy = center[1];
    var dx = x - cx;
    var dy = y - cy;
    if (dx === 0 && dy === 0) return 0;
    var radians = Math.atan2(dy, dx);
    var degrees = radians * (180 / Math.PI) + 90;
    if (degrees < 0) degrees += 360;
    return degrees;
  }

  /* ---------- 配置参数 ---------- */

  var CONFIG = {
    edgeSensitivity: 30,
    glowColor: '190 100 60',       // 青蓝色光晕（匹配网站主色调）
    glowIntensity: 1.0,
    glowRadius: 40,
    coneSpread: 25,
    fillOpacity: 0.5,
    colors: ['#00d4ff', '#a855f7', '#6366f1']  // 青蓝 / 紫 / 靛蓝
  };

  /* ---------- 初始化每个卡片 ---------- */

  var cards = document.querySelectorAll('.glow-card');
  if (!cards.length) return;

  // 预计算不随鼠标变化的 CSS 变量
  var glowVars = buildGlowVars(CONFIG.glowColor, CONFIG.glowIntensity);
  var gradientVars = buildGradientVars(CONFIG.colors);

  cards.forEach(function (card) {
    // 注入 edge-light 元素（原版结构必需）
    if (!card.querySelector(':scope > .edge-light')) {
      var edgeLight = document.createElement('span');
      edgeLight.className = 'edge-light';
      card.appendChild(edgeLight);
    }

    // 设置静态 CSS 变量
    card.style.setProperty('--edge-sensitivity', CONFIG.edgeSensitivity);
    card.style.setProperty('--glow-padding', CONFIG.glowRadius);
    card.style.setProperty('--cone-spread', CONFIG.coneSpread);
    card.style.setProperty('--fill-opacity', CONFIG.fillOpacity);
    card.style.setProperty('--edge-proximity', '0');
    card.style.setProperty('--cursor-angle', '45deg');

    for (var key in glowVars) {
      card.style.setProperty(key, glowVars[key]);
    }
    for (var gk in gradientVars) {
      card.style.setProperty(gk, gradientVars[gk]);
    }

    // 鼠标追踪（requestAnimationFrame 节流）
    var rafId = null;
    var lastEvent = null;

    function update() {
      rafId = null;
      if (!lastEvent) return;

      var rect = card.getBoundingClientRect();
      var x = lastEvent.clientX - rect.left;
      var y = lastEvent.clientY - rect.top;

      var edge = getEdgeProximity(card, x, y);
      var angle = getCursorAngle(card, x, y);

      card.style.setProperty('--edge-proximity', (edge * 100).toFixed(3));
      card.style.setProperty('--cursor-angle', angle.toFixed(3) + 'deg');
    }

    card.addEventListener('pointermove', function (e) {
      lastEvent = e;
      if (rafId) return;
      rafId = requestAnimationFrame(update);
    });

    card.addEventListener('pointerleave', function () {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      lastEvent = null;
      card.style.setProperty('--edge-proximity', '0');
    });
  });
})();
