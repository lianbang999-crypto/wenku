/* 分类列表页 */
import { navigate } from '../router.js';
import { getDocumentsByCategory } from '../api.js';
import { setCategoryMeta } from '../seo.js';

export async function renderCategory(container, category) {
  const data = await getDocumentsByCategory(category);
  const documents = data.documents || [];

  // 更新SEO meta标签
  setCategoryMeta(category, documents.length);

  // 按 type 分组：transcript（有系列）和其他（独立文档）
  const seriesMap = new Map();
  const standalone = [];

  for (const doc of documents) {
    if (doc.type === 'transcript' && doc.series_name) {
      if (!seriesMap.has(doc.series_name)) {
        seriesMap.set(doc.series_name, {
          name: doc.series_name,
          count: 0,
          hasAudio: !!doc.audio_series_id,
        });
      }
      seriesMap.get(doc.series_name).count++;
    } else {
      standalone.push(doc);
    }
  }

  const seriesList = Array.from(seriesMap.values());

  let html = '<div class="page-container">';

  // 系列列表（讲义稿）
  if (seriesList.length > 0) {
    html += '<div class="section-label">系列讲义</div><div class="series-list">';
    for (const s of seriesList) {
      html += `
        <div class="series-item" data-series="${s.name}">
          <div class="series-info">
            <div class="series-title">${s.name}</div>
            <div class="series-meta">${s.count} 讲${s.hasAudio ? ' · 🎧 有音频' : ''}</div>
          </div>
          <div class="category-arrow">
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill="currentColor"/></svg>
          </div>
        </div>
      `;
    }
    html += '</div>';
  }

  // 独立文档（PDF 等）
  if (standalone.length > 0) {
    html += '<div class="section-label" style="margin-top:20px">经论文集</div><div class="series-list">';
    for (const doc of standalone) {
      const badge = doc.format === 'pdf' ? 'PDF' : doc.format === 'epub' ? 'EPUB' : '';
      html += `
        <div class="series-item" data-doc-id="${doc.id}" data-format="${doc.format}" data-r2-key="${doc.r2_key || ''}">
          <div class="series-info">
            <div class="series-title">${doc.title}</div>
            <div class="series-meta">${doc.format.toUpperCase()}${doc.file_size ? ' · ' + formatFileSize(doc.file_size) : ''}</div>
          </div>
          ${badge ? `<span class="series-badge">${badge}</span>` : ''}
        </div>
      `;
    }
    html += '</div>';
  }

  if (seriesList.length === 0 && standalone.length === 0) {
    html += '<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-text">暂无内容</div></div>';
  }

  html += '</div>';
  container.innerHTML = html;

  // 事件绑定 — 系列
  container.querySelectorAll('.series-item[data-series]').forEach(el => {
    el.addEventListener('click', () => {
      navigate(`#/series/${encodeURIComponent(category)}/${encodeURIComponent(el.dataset.series)}`);
    });
  });

  // 事件绑定 — 独立文档
  container.querySelectorAll('.series-item[data-doc-id]').forEach(el => {
    el.addEventListener('click', () => {
      const format = el.dataset.format;
      if (format === 'pdf' || format === 'epub') {
        // PDF/EPUB 直接打开 R2 链接
        const r2Key = el.dataset.r2Key;
        if (r2Key) {
          window.open(`https://pub-jingdianwendang.r2.dev/${r2Key}`, '_blank');
        }
      } else {
        navigate(`#/read/${encodeURIComponent(el.dataset.docId)}`);
      }
    });
  });
}

function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
