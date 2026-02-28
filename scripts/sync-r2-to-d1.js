/**
 * R2 数据扫描入库脚本
 *
 * 用途：扫描 R2 jingdianwendang 桶，将文档信息写入 D1 documents 表
 *
 * 使用方式（部署为独立 Worker 或在本地用 wrangler 执行）：
 *   1. 确保 wrangler.toml 中绑定了 DB (D1) 和 R2_WENKU (R2)
 *   2. wrangler dev scripts/sync-r2-to-d1.js   (本地测试)
 *   3. 访问 http://localhost:8787/sync 触发同步
 *
 * 也可以设置为 Cron Trigger 定期执行
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/sync') {
      const result = await syncR2ToD1(env);
      return new Response(JSON.stringify(result, null, 2), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response('Visit /sync to trigger sync', { status: 200 });
  },
};

async function syncR2ToD1(env) {
  const db = env.DB;
  const r2 = env.R2_WENKU;
  const stats = { scanned: 0, inserted: 0, updated: 0, skipped: 0, errors: [] };

  // 1. 列出 R2 桶中所有对象
  let cursor = undefined;
  const allObjects = [];

  do {
    const listed = await r2.list({ cursor, limit: 500 });
    allObjects.push(...listed.objects);
    cursor = listed.truncated ? listed.cursor : undefined;
  } while (cursor);

  stats.scanned = allObjects.length;

  // 2. 获取已有文档 ID
  const existingDocs = await db.prepare('SELECT id, r2_key FROM documents').all();
  const existingMap = new Map(existingDocs.results.map(d => [d.r2_key, d.id]));

  // 3. 遍历对象，解析元数据并入库
  for (const obj of allObjects) {
    const key = obj.key;

    // 跳过目录标记
    if (key.endsWith('/')) continue;

    // 解析路径
    const parsed = parseR2Key(key);
    if (!parsed) {
      stats.skipped++;
      continue;
    }

    // 已存在则跳过
    if (existingMap.has(key)) {
      stats.skipped++;
      continue;
    }

    try {
      // 如果是 TXT，读取内容
      let content = null;
      if (parsed.format === 'txt') {
        const r2Obj = await r2.get(key);
        if (r2Obj) {
          content = await r2Obj.text();
        }
      }

      // 生成 ID
      const id = generateId(parsed);

      await db.prepare(
        `INSERT INTO documents (id, title, type, category, series_name, episode_num, format, r2_bucket, r2_key, content, file_size, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'jingdianwendang', ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      ).bind(
        id,
        parsed.title,
        parsed.type,
        parsed.category,
        parsed.seriesName,
        parsed.episodeNum,
        parsed.format,
        key,
        content,
        obj.size,
      ).run();

      stats.inserted++;
    } catch (err) {
      stats.errors.push({ key, error: err.message });
    }
  }

  return stats;
}

/**
 * 解析 R2 key 为文档元数据
 *
 * 支持的路径格式：
 *   大安法师/大安法师（讲法集）TXT/01 佛说无量寿经 要义全卷 24讲/佛说无量寿经要义卷上 第01讲.txt
 *   佛教经典/《金刚经》32分本简体注音打印电子版（大32K）.pdf
 *   印光大师文钞/印光大师全集净土法要（东林文库）2023.11.26.pdf
 *   省庵大师/A-013 省庵法师语录.2021.3.16.pdf
 */
function parseR2Key(key) {
  const parts = key.split('/');
  const fileName = parts[parts.length - 1];
  const ext = fileName.split('.').pop().toLowerCase();

  // 获取格式
  let format = ext;
  if (format === 'pdf' && fileName.endsWith('.pdf.pdf')) format = 'pdf'; // 修正双后缀

  // 只处理已知格式
  if (!['txt', 'pdf', 'epub', 'docx'].includes(format)) return null;

  // 获取分类（第一级目录）
  const category = parts[0];

  // 大安法师讲义稿
  if (category === '大安法师' && parts.length >= 4 && format === 'txt') {
    const seriesFolder = parts[2]; // "01 佛说无量寿经 要义全卷 24讲"
    // 提取系列名：去掉开头编号和结尾"N讲"
    const seriesMatch = seriesFolder.match(/^\d+\s+(.+?)\s+\d+讲$/);
    const seriesName = seriesMatch ? seriesMatch[1] : seriesFolder;

    // 从文件名提取集数
    const epMatch = fileName.match(/第(\d+)讲/);
    const episodeNum = epMatch ? parseInt(epMatch[1]) : null;

    const title = fileName.replace(/\.txt$/i, '');

    return {
      title,
      type: 'transcript',
      category: '大安法师',
      seriesName,
      episodeNum,
      format: 'txt',
    };
  }

  // 大安法师下的独立 PDF
  if (category === '大安法师' && format === 'pdf') {
    return {
      title: fileName.replace(/\.pdf(\.pdf)?$/i, ''),
      type: 'collection',
      category: '大安法师',
      seriesName: null,
      episodeNum: null,
      format: 'pdf',
    };
  }

  // 佛教经典
  if (category === '佛教经典') {
    return {
      title: fileName.replace(/\.\w+$/i, ''),
      type: 'sutra',
      category: '佛教经典',
      seriesName: null,
      episodeNum: null,
      format,
    };
  }

  // 印光大师文钞
  if (category === '印光大师文钞') {
    return {
      title: fileName.replace(/\.\w+$/i, ''),
      type: 'collection',
      category: '印光大师文钞',
      seriesName: null,
      episodeNum: null,
      format,
    };
  }

  // 省庵大师
  if (category === '省庵大师') {
    return {
      title: fileName.replace(/\.\w+$/i, ''),
      type: 'collection',
      category: '省庵大师',
      seriesName: null,
      episodeNum: null,
      format,
    };
  }

  return null;
}

/**
 * 生成文档 ID
 */
function generateId(parsed) {
  const base = pinyin(parsed.category);
  if (parsed.seriesName && parsed.episodeNum !== null) {
    return `${base}-${pinyin(parsed.seriesName)}-${String(parsed.episodeNum).padStart(2, '0')}`;
  }
  return `${base}-${pinyin(parsed.title)}`;
}

/**
 * 简易中文转拼音（取首字母）用于生成 ID
 * 实际使用时可以用更精确的方式
 */
function pinyin(str) {
  return str
    .replace(/[（）()《》\[\]【】]/g, '')
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 50);
}
