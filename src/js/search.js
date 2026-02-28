/* 搜索功能 */
import { searchDocuments } from './api.js';
import { navigate } from './router.js';
import { debounce } from './utils.js';

export function initSearch() {
  const searchBtn = document.getElementById('searchBtn');
  const searchPanel = document.getElementById('searchPanel');
  const searchInput = document.getElementById('searchInput');
  const searchClose = document.getElementById('searchClose');
  const searchResults = document.getElementById('searchResults');

  if (!searchBtn || !searchPanel) return;

  // 打开搜索
  searchBtn.addEventListener('click', () => {
    searchPanel.classList.remove('hidden');
    searchInput.focus();
  });

  // 关闭搜索
  searchClose.addEventListener('click', () => {
    searchPanel.classList.add('hidden');
    searchInput.value = '';
    searchResults.innerHTML = '';
  });

  // 搜索输入
  searchInput.addEventListener('input', debounce(async () => {
    const query = searchInput.value.trim();
    if (query.length < 2) {
      searchResults.innerHTML = '';
      return;
    }

    searchResults.innerHTML = '<div class="loading"></div>';

    try {
      const data = await searchDocuments(query);
      const results = data.documents || [];

      if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-empty">未找到相关内容</div>';
        return;
      }

      searchResults.innerHTML = results.map(doc => `
        <div class="series-item" data-doc-id="${doc.id}" data-format="${doc.format || 'txt'}">
          <div class="series-info">
            <div class="series-title">${doc.title}</div>
            <div class="series-meta">${doc.category}${doc.series_name ? ' · ' + doc.series_name : ''}</div>
          </div>
        </div>
      `).join('');

      // 点击搜索结果
      searchResults.querySelectorAll('.series-item').forEach(el => {
        el.addEventListener('click', () => {
          searchPanel.classList.add('hidden');
          searchInput.value = '';
          if (el.dataset.format === 'txt' || el.dataset.format === 'transcript') {
            navigate(`#/read/${encodeURIComponent(el.dataset.docId)}`);
          }
        });
      });
    } catch (err) {
      searchResults.innerHTML = '<div class="search-empty">搜索出错，请重试</div>';
    }
  }, 400));

  // ESC 关闭搜索
  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      searchPanel.classList.add('hidden');
      searchInput.value = '';
    }
  });
}
