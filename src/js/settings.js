/* 阅读设置控制 */
import { state, saveSettings } from './state.js';

export function initSettings() {
  // 初始化：应用已保存的设置
  applySettings();

  // 字号
  document.getElementById('fontSizeOptions')?.addEventListener('click', e => {
    const btn = e.target.closest('button[data-size]');
    if (!btn) return;
    state.fontSize = btn.dataset.size;
    saveSettings();
    applySettings();
    updateActiveButtons();
  });

  // 字体
  document.getElementById('fontFamilyOptions')?.addEventListener('click', e => {
    const btn = e.target.closest('button[data-font]');
    if (!btn) return;
    state.fontFamily = btn.dataset.font;
    saveSettings();
    applySettings();
    updateActiveButtons();
  });

  // 阅读模式
  document.getElementById('readingModeOptions')?.addEventListener('click', e => {
    const btn = e.target.closest('button[data-mode]');
    if (!btn) return;
    state.readingMode = btn.dataset.mode;
    saveSettings();
    applySettings();
    updateActiveButtons();
  });

  // 关闭设置面板
  document.getElementById('settingsClose')?.addEventListener('click', () => {
    document.getElementById('readerSettings')?.classList.add('hidden');
  });

  // 点击蒙层关闭
  document.querySelector('.settings-overlay')?.addEventListener('click', () => {
    document.getElementById('readerSettings')?.classList.add('hidden');
  });

  updateActiveButtons();
}

function applySettings() {
  document.documentElement.setAttribute('data-font-size', state.fontSize);
  document.documentElement.setAttribute('data-font-family', state.fontFamily);
  document.documentElement.setAttribute('data-reading-mode', state.readingMode);
}

function updateActiveButtons() {
  // 字号
  document.querySelectorAll('#fontSizeOptions button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.size === state.fontSize);
  });

  // 字体
  document.querySelectorAll('#fontFamilyOptions button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.font === state.fontFamily);
  });

  // 模式
  document.querySelectorAll('#readingModeOptions button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === state.readingMode);
  });
}
