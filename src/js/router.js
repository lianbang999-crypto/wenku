/* 路由管理 */
import { state } from './state.js';
import { resetMeta } from './seo.js';

const content = () => document.getElementById('contentArea');
const headerTitle = () => document.getElementById('headerTitle');
const headerBack = () => document.getElementById('headerBack');

// 懒加载页面组件
const loadHome = () => import('./pages/home.js');
const loadCategory = () => import('./pages/category.js');
const loadSeries = () => import('./pages/series.js');
const loadReader = () => import('./pages/reader.js');

/** 解析 hash 路由 */
function parseRoute() {
  const raw = location.hash.slice(1) || '/';
  // 分离 query string（支持 #/read/docId?q=keyword 格式）
  const qIdx = raw.indexOf('?');
  const path = qIdx >= 0 ? raw.slice(0, qIdx) : raw;
  const query = qIdx >= 0 ? Object.fromEntries(new URLSearchParams(raw.slice(qIdx + 1))) : {};

  const parts = path.split('/').filter(Boolean);

  if (parts.length === 0) return { route: 'home', query };
  if (parts[0] === 'category' && parts[1]) return { route: 'category', categoryId: decodeURIComponent(parts[1]), query };
  if (parts[0] === 'series' && parts[1] && parts[2]) return { route: 'series', categoryId: decodeURIComponent(parts[1]), seriesName: decodeURIComponent(parts[2]), query };
  if (parts[0] === 'read' && parts[1]) return { route: 'read', documentId: decodeURIComponent(parts[1]), query };
  return { route: 'home', query };
}

/** 导航到指定路由 */
export function navigate(hash) {
  location.hash = hash;
}

/** 路由变化时渲染 */
async function onRouteChange() {
  const parsed = parseRoute();
  state.route = parsed.route;
  state.categoryId = parsed.categoryId || null;
  state.seriesName = parsed.seriesName || null;
  state.documentId = parsed.documentId || null;

  const el = content();
  el.innerHTML = '<div class="loading"></div>';

  // 更新顶栏
  updateHeader(parsed);

  try {
    switch (parsed.route) {
      case 'home': {
        const module = await loadHome();
        await module.renderHome(el);
        break;
      }
      case 'category': {
        const module = await loadCategory();
        await module.renderCategory(el, parsed.categoryId);
        break;
      }
      case 'series': {
        const module = await loadSeries();
        await module.renderSeries(el, parsed.categoryId, parsed.seriesName);
        break;
      }
      case 'read': {
        const module = await loadReader();
        await module.renderReader(el, parsed.documentId, parsed.query);
        break;
      }
      default: {
        const module = await loadHome();
        await module.renderHome(el);
      }
    }
  } catch (err) {
    console.error('Route render error:', err);
    el.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⚠️</div><div class="empty-state-text">加载失败，请刷新重试</div></div>`;
  }
}

function updateHeader(parsed) {
  const title = headerTitle();
  const back = headerBack();

  switch (parsed.route) {
    case 'home':
      title.textContent = '法音文库';
      back.href = 'https://foyue.org';
      back.title = '返回净土法音';
      resetMeta();
      break;
    case 'category':
      title.textContent = parsed.categoryId;
      back.href = '#/';
      back.title = '返回文库';
      break;
    case 'series':
      title.textContent = parsed.seriesName;
      back.href = `#/category/${encodeURIComponent(parsed.categoryId)}`;
      back.title = '返回分类';
      break;
    case 'read':
      title.textContent = '';
      back.href = 'javascript:history.back()';
      back.title = '返回';
      break;
  }
}

export function initRouter() {
  window.addEventListener('hashchange', onRouteChange);
  onRouteChange();
}
