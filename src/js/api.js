/* API 接口封装 */

const API_BASE = '/api/wenku';

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

/** 获取文库分类列表 */
export async function getCategories() {
  return fetchJSON(`${API_BASE}/categories`);
}

/** 获取某分类下的系列/文集列表 */
export async function getDocumentsByCategory(category) {
  return fetchJSON(`${API_BASE}/documents?category=${encodeURIComponent(category)}`);
}

/** 获取某系列下的集数列表 */
export async function getDocumentsBySeries(category, seriesName) {
  return fetchJSON(`${API_BASE}/documents?category=${encodeURIComponent(category)}&series=${encodeURIComponent(seriesName)}`);
}

/** 获取单篇文档详情（含内容） */
export async function getDocument(id) {
  return fetchJSON(`${API_BASE}/documents/${encodeURIComponent(id)}`);
}

/** 搜索文档 */
export async function searchDocuments(query) {
  return fetchJSON(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
}

/** 记录阅读 */
export async function recordRead(id) {
  try {
    await fetch(`${API_BASE}/read-count`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId: id }),
    });
  } catch (e) {
    // 静默失败，不影响阅读体验
  }
}
