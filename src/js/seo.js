/* SEO 工具函数 - 动态更新meta标签 */

/**
 * 更新页面标题和meta描述
 * @param {string} title - 页面标题
 * @param {string} description - 页面描述
 * @param {Object} options - 可选的OG标签数据
 */
export function updateMeta(title, description, options = {}) {
  // 更新标题
  document.title = title + ' - 法音文库';

  // 更新描述
  updateOrCreateMeta('description', description);

  // 更新OG标签
  updateOrCreateMeta('og:title', title, 'property');
  updateOrCreateMeta('og:description', description, 'property');
  updateOrCreateMeta('og:type', options.type || 'website', 'property');
  updateOrCreateMeta('og:url', options.url || window.location.href, 'property');
  updateOrCreateMeta('og:image', options.image || '', 'property');
  updateOrCreateMeta('og:site_name', '法音文库', 'property');
  updateOrCreateMeta('og:locale', 'zh_CN', 'property');

  // 更新Twitter标签
  updateOrCreateMeta('twitter:card', 'summary_large_image');
  updateOrCreateMeta('twitter:title', title);
  updateOrCreateMeta('twitter:description', description);
  updateOrCreateMeta('twitter:image', options.image || '');
}

/**
 * 更新或创建meta标签
 * @param {string} name - meta名称或property
 * @param {string} content - meta内容
 * @param {string} attrType - 使用name还是property属性
 */
function updateOrCreateMeta(name, content, attrType = 'name') {
  let meta = document.querySelector(`meta[${attrType}="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attrType, name);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

/**
 * 重置meta标签到首页默认值
 */
export function resetMeta() {
  updateMeta(
    '法音文库',
    '净土宗讲义稿、佛教经论在线阅读。南无阿弥陀佛',
    { type: 'website' }
  );
}

/**
 * 为阅读页面设置meta标签
 * @param {Object} doc - 文档对象
 */
export function setDocumentMeta(doc) {
  const description = doc.content
    ? doc.content.substring(0, 150).replace(/\n/g, ' ') + '...'
    : `${doc.title} - ${doc.category || '法音文库'}`;

  updateMeta(
    doc.title,
    description,
    {
      type: 'article',
      url: window.location.href,
      // 可以添加文档相关的图片
      image: ''
    }
  );
}

/**
 * 为分类页面设置meta标签
 * @param {string} category - 分类名称
 * @param {number} count - 文档数量
 */
export function setCategoryMeta(category, count = 0) {
  updateMeta(
    `${category} - 法音文库`,
    `${category}相关讲义稿和经论，共${count}篇文档。南无阿弥陀佛`,
    { type: 'website' }
  );
}

/**
 * 为系列页面设置meta标签
 * @param {string} category - 分类名称
 * @param {string} series - 系列名称
 * @param {number} count - 文档数量
 */
export function setSeriesMeta(category, series, count = 0) {
  updateMeta(
    `${series} - 法音文库`,
    `${series}完整讲义系列，共${count}讲。${category} - 南无阿弥陀佛`,
    { type: 'website' }
  );
}
