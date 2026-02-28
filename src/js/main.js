/* ============================================
   法音文库 — 入口
   ============================================ */

// CSS imports
import '../css/tokens.css';
import '../css/reset.css';
import '../css/layout.css';
import '../css/cards.css';
import '../css/reader.css';
import '../css/components.css';

// JS modules
import { initRouter } from './router.js';
import { initSettings } from './settings.js';
import { initSearch } from './search.js';
import { state } from './state.js';

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  // 应用已保存的阅读模式
  document.documentElement.setAttribute('data-reading-mode', state.readingMode);
  document.documentElement.setAttribute('data-font-size', state.fontSize);
  document.documentElement.setAttribute('data-font-family', state.fontFamily);

  // 初始化模块
  initRouter();
  initSettings();
  initSearch();
});
