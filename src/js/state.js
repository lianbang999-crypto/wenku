/* 共享状态 */
export const state = {
  route: 'home',        // home | category | series | read
  categoryId: null,     // 当前分类
  seriesName: null,     // 当前系列名
  documentId: null,     // 当前阅读的文档 ID
  documents: [],        // 文档列表缓存
  categories: [],       // 分类列表缓存

  // 阅读设置
  fontSize: localStorage.getItem('wenku-font-size') || 'medium',
  fontFamily: localStorage.getItem('wenku-font-family') || 'sans',
  readingMode: localStorage.getItem('wenku-reading-mode') || 'normal',

  // 书签
  bookmarks: JSON.parse(localStorage.getItem('wenku-bookmarks') || '{}'),
};

export function saveSettings() {
  localStorage.setItem('wenku-font-size', state.fontSize);
  localStorage.setItem('wenku-font-family', state.fontFamily);
  localStorage.setItem('wenku-reading-mode', state.readingMode);
}

export function saveBookmark(docId, scrollPercent) {
  state.bookmarks[docId] = {
    percent: scrollPercent,
    timestamp: Date.now(),
  };
  localStorage.setItem('wenku-bookmarks', JSON.stringify(state.bookmarks));
}

export function getBookmark(docId) {
  return state.bookmarks[docId] || null;
}

export function getRecentBookmarks(limit = 1) {
  const entries = Object.entries(state.bookmarks);
  entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
  return entries.slice(0, limit).map(([docId, data]) => ({ docId, ...data }));
}
