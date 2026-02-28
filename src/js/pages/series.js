/* 系列详情页 — 集数列表 */
import { navigate } from '../router.js';
import { getDocumentsBySeries } from '../api.js';
import { getBookmark } from '../state.js';

export async function renderSeries(container, category, seriesName) {
  const data = await getDocumentsBySeries(category, seriesName);
  const documents = data.documents || [];

  // 按 episode_num 排序
  documents.sort((a, b) => (a.episode_num || 0) - (b.episode_num || 0));

  let html = '<div class="page-container">';

  // 系列信息
  const hasAudio = documents.some(d => d.audio_series_id);
  html += `
    <div style="margin-bottom:20px;">
      <div style="font-size:13px;color:var(--text-secondary);margin-bottom:4px">${category}</div>
      <div style="font-size:20px;font-weight:700;color:var(--text);margin-bottom:8px">${seriesName}</div>
      <div style="font-size:14px;color:var(--text-secondary)">共 ${documents.length} 讲</div>
      ${hasAudio ? `
        <a href="https://foyue.org" class="reader-listen-btn" style="display:inline-flex;margin-top:10px">
          <svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 3v9.28a4.39 4.39 0 00-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" fill="currentColor"/></svg>
          收听此系列
        </a>
      ` : ''}
    </div>
  `;

  // 集数列表
  html += '<div class="section-label">目录</div><div class="series-list">';
  for (const doc of documents) {
    const bookmark = getBookmark(doc.id);
    const readMark = bookmark ? `<span class="episode-read-mark">${Math.round(bookmark.percent)}%</span>` : '';

    html += `
      <div class="episode-item" data-doc-id="${doc.id}">
        <div class="episode-num">${doc.episode_num || '-'}</div>
        <div class="episode-title">${doc.title}</div>
        ${readMark}
      </div>
    `;
  }
  html += '</div></div>';

  container.innerHTML = html;

  // 事件绑定
  container.querySelectorAll('.episode-item').forEach(el => {
    el.addEventListener('click', () => {
      navigate(`#/read/${encodeURIComponent(el.dataset.docId)}`);
    });
  });
}
