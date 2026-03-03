/* 首页 */
import { navigate } from '../router.js';
import { getRecentBookmarks } from '../state.js';
import { escapeHtml } from '../utils.js';

export async function renderHome(container) {
  const recent = getRecentBookmarks(1);

  let continueHtml = '';
  if (recent.length > 0) {
    const { docId, percent } = recent[0];
    // 从 docId 中解析出可读信息
    const readableTitle = docId.replace(/-/g, ' ');
    continueHtml = `
      <div class="section-label">继续阅读</div>
      <div class="continue-card" data-doc="${escapeHtml(docId)}">
        <div class="continue-title">${escapeHtml(readableTitle)}</div>
        <div class="continue-meta">已读 ${Math.round(percent)}%</div>
        <div class="continue-progress">
          <div class="continue-progress-bar" style="width:${percent}%"></div>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="page-container">
      ${continueHtml}

      <div class="section-label">文库分类</div>

      <div class="category-card" data-category="大安法师">
        <div class="category-icon">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
            <path d="M8 7h6"/>
            <path d="M8 11h4"/>
          </svg>
        </div>
        <div class="category-info">
          <div class="category-title">讲义稿</div>
          <div class="category-desc">大安法师讲法集 · 约35个系列</div>
        </div>
        <div class="category-arrow">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill="currentColor"/></svg>
        </div>
      </div>

      <a href="https://book.lsdls.cn/bookcase/dewwg/index.html" target="_blank" rel="noopener" class="category-card category-card--external">
        <div class="category-icon">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
        </div>
        <div class="category-info">
          <div class="category-title">东林期刊</div>
          <div class="category-desc">佛经 · 善书 · 净土杂志 · 祖师论著 · 共102本</div>
        </div>
        <div class="category-arrow">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M7 17L17 7"/>
            <path d="M7 7h10v10"/>
          </svg>
        </div>
      </a>

      <a href="https://foyue.org" class="back-to-main">
        <svg viewBox="0 0 24 24" width="16" height="16"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor"/></svg>
        返回净土法音
      </a>
    </div>
  `;

  // 事件绑定
  container.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.dataset.category;
      navigate(`#/category/${encodeURIComponent(cat)}`);
    });
  });

  const continueCard = container.querySelector('.continue-card');
  if (continueCard) {
    continueCard.addEventListener('click', () => {
      navigate(`#/read/${encodeURIComponent(continueCard.dataset.doc)}`);
    });
  }
}
