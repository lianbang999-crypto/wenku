/* 阅读页 */
import { getDocument, recordRead } from '../api.js';
import { state, saveBookmark, getBookmark } from '../state.js';
import { textToHtml, debounce, escapeHtml } from '../utils.js';

let scrollHandler = null;

export async function renderReader(container, documentId) {
  const data = await getDocument(documentId);
  const doc = data.document;

  if (!doc) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-text">文档不存在</div></div>';
    return;
  }

  // 更新顶栏
  const headerTitle = document.getElementById('headerTitle');
  if (headerTitle) headerTitle.textContent = doc.title;

  // 应用阅读设置
  document.documentElement.setAttribute('data-font-size', state.fontSize);
  document.documentElement.setAttribute('data-font-family', state.fontFamily);
  document.documentElement.setAttribute('data-reading-mode', state.readingMode);

  // 渲染内容
  const contentHtml = doc.content ? textToHtml(doc.content) : '<p>此文档暂无在线文本内容。</p>';

  // 上/下一讲信息
  const prevId = data.prevId || null;
  const nextId = data.nextId || null;
  const totalEpisodes = data.totalEpisodes || 0;
  const currentEp = doc.episode_num || 0;

  container.innerHTML = `
    <div class="reader-container">
      <div class="reader-header">
        <div class="reader-series-title">${escapeHtml(doc.series_name || doc.category || '')}</div>
        <h2 class="reader-title">${escapeHtml(doc.title)}</h2>
        <div class="reader-author">${escapeHtml(doc.category || '')}</div>
      </div>
      <div class="reader-body" id="readerBody">
        ${contentHtml}
      </div>
    </div>

    <div class="reader-footer">
      <button class="reader-nav-btn" id="prevBtn" ${!prevId ? 'disabled' : ''} data-id="${escapeHtml(prevId || '')}">← 上一讲</button>
      <div class="reader-progress">${currentEp && totalEpisodes ? currentEp + '/' + totalEpisodes : ''}</div>
      <button class="reader-nav-btn" id="nextBtn" ${!nextId ? 'disabled' : ''} data-id="${escapeHtml(nextId || '')}">下一讲 →</button>
    </div>
  `;

  // 添加阅读设置按钮到顶栏
  addReaderHeaderActions();

  // 记录阅读
  recordRead(documentId);

  // 恢复阅读进度
  const bookmark = getBookmark(documentId);
  if (bookmark && bookmark.percent > 0) {
    requestAnimationFrame(() => {
      const scrollTarget = (document.documentElement.scrollHeight - window.innerHeight) * (bookmark.percent / 100);
      window.scrollTo(0, scrollTarget);
    });
  }

  // 保存阅读进度
  if (scrollHandler) {
    window.removeEventListener('scroll', scrollHandler);
  }
  scrollHandler = debounce(() => {
    const scrollTop = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHeight > 0) {
      const percent = Math.min(100, (scrollTop / scrollHeight) * 100);
      saveBookmark(documentId, percent);
    }
  }, 500);
  window.addEventListener('scroll', scrollHandler);

  // 上/下一讲按钮
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  if (prevBtn && prevId) {
    prevBtn.addEventListener('click', () => {
      location.hash = `#/read/${encodeURIComponent(prevId)}`;
    });
  }
  if (nextBtn && nextId) {
    nextBtn.addEventListener('click', () => {
      location.hash = `#/read/${encodeURIComponent(nextId)}`;
    });
  }
}

function addReaderHeaderActions() {
  const searchBtn = document.getElementById('searchBtn');
  if (!searchBtn) return;

  // 替换搜索按钮为设置按钮
  const settingsBtn = document.createElement('button');
  settingsBtn.className = 'header-btn';
  settingsBtn.id = 'readerSettingsBtn';
  settingsBtn.title = '阅读设置';
  settingsBtn.innerHTML = '<span style="font-size:16px;font-weight:600">Aa</span>';
  settingsBtn.addEventListener('click', () => {
    const panel = document.getElementById('readerSettings');
    if (panel) panel.classList.toggle('hidden');
  });

  searchBtn.parentNode.insertBefore(settingsBtn, searchBtn);
  searchBtn.style.display = 'none';
}
