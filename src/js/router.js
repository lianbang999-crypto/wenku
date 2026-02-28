/* 路由管理 */
import { state } from './state.js';
import { renderHome } from './pages/home.js';
import { renderCategory } from './pages/category.js';
import { renderSeries } from './pages/series.js';
import { renderReader } from './pages/reader.js';

const content = () => document.getElementById('contentArea');
const headerTitle = () => document.getElementById('headerTitle');
const headerBack = () => document.getElementById('headerBack');

/** 解析 hash 路由 */
function parseRoute() {
  const hash = location.hash.slice(1) || '/';
  const parts = hash.split('/').filter(Boolean);

  if (parts.length === 0) return { route: 'home' };
  if (parts[0] === 'category' && parts[1]) return { route: 'category', categoryId: decodeURIComponent(parts[1]) };
  if (parts[0] === 'series' && parts[1] && parts[2]) return { route: 'series', categoryId: decodeURIComponent(parts[1]), seriesName: decodeURIComponent(parts[2]) };
  if (parts[0] === 'read' && parts[1]) return { route: 'read', documentId: decodeURIComponent(parts[1]) };
  return { route: 'home' };
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
      case 'home':
        await renderHome(el);
        break;
      case 'category':
        await renderCategory(el, parsed.categoryId);
        break;
      case 'series':
        await renderSeries(el, parsed.categoryId, parsed.seriesName);
        break;
      case 'read':
        await renderReader(el, parsed.documentId);
        break;
      default:
        await renderHome(el);
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
