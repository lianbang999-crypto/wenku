/**
 * Pages Function: /api/wenku/*
 * 法音文库 API 路由
 */

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (method === 'OPTIONS') {
    return new Response(null, { headers: cors });
  }

  try {
    const db = env.DB;

    // GET /api/wenku/categories — 获取文库分类
    if (path === '/api/wenku/categories' && method === 'GET') {
      return json(await getCategories(db), cors);
    }

    // GET /api/wenku/documents?category=&series= — 获取文档列表
    if (path === '/api/wenku/documents' && method === 'GET') {
      const category = url.searchParams.get('category');
      const series = url.searchParams.get('series');
      if (series && category) {
        return json(await getDocumentsBySeries(db, category, series), cors);
      }
      if (category) {
        return json(await getDocumentsByCategory(db, category), cors);
      }
      return json({ error: 'Missing category parameter' }, cors, 400);
    }

    // GET /api/wenku/documents/:id — 获取单个文档（含内容）
    const docMatch = path.match(/^\/api\/wenku\/documents\/(.+)$/);
    if (docMatch && method === 'GET') {
      return json(await getDocument(db, decodeURIComponent(docMatch[1])), cors);
    }

    // GET /api/wenku/search?q= — 搜索文档
    if (path === '/api/wenku/search' && method === 'GET') {
      const q = url.searchParams.get('q');
      if (!q) return json({ documents: [] }, cors);
      return json(await searchDocuments(db, q), cors);
    }

    // POST /api/wenku/read-count — 记录阅读
    if (path === '/api/wenku/read-count' && method === 'POST') {
      const body = await request.json();
      return json(await recordRead(db, body.documentId), cors);
    }

    // GET /api/wenku/sync — 同步 R2 数据到 D1（一次性使用，完成后可删除此路由）
    if (path === '/api/wenku/sync' && method === 'GET') {
      const r2 = env.R2_WENKU || env.R2;
      if (!r2) return json({ error: 'R2 binding not found (tried R2_WENKU and R2)' }, cors, 500);
      const force = url.searchParams.get('force') === '1'; // force=1 则更新已有记录的内容
      return json(await syncR2ToD1(db, r2, force), cors);
    }

    return json({ error: 'Not Found' }, cors, 404);
  } catch (err) {
    console.error('Wenku API Error:', err);
    return json({ error: 'Internal Server Error', message: err.message }, cors, 500);
  }
}

// ============================================================
function json(data, cors, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': status === 200 ? 'public, max-age=300' : 'no-cache',
      ...cors,
    },
  });
}

// ============================================================

async function getCategories(db) {
  const result = await db.prepare(
    `SELECT category, type, COUNT(*) as count
     FROM documents GROUP BY category ORDER BY category`
  ).all();

  return { categories: result.results };
}

async function getDocumentsByCategory(db, category) {
  const result = await db.prepare(
    `SELECT id, title, type, category, series_name, episode_num, format,
            r2_key, file_size, audio_series_id, read_count
     FROM documents WHERE category = ? ORDER BY series_name, episode_num`
  ).bind(category).all();

  return { documents: result.results };
}

async function getDocumentsBySeries(db, category, seriesName) {
  const result = await db.prepare(
    `SELECT id, title, type, category, series_name, episode_num, format,
            r2_key, file_size, audio_series_id, audio_episode_num, read_count
     FROM documents WHERE category = ? AND series_name = ?
     ORDER BY episode_num`
  ).bind(category, seriesName).all();

  return { documents: result.results };
}

async function getDocument(db, id) {
  const doc = await db.prepare(
    `SELECT * FROM documents WHERE id = ?`
  ).bind(id).first();

  if (!doc) return { document: null };

  // 获取上一篇/下一篇
  let prevId = null;
  let nextId = null;
  let totalEpisodes = 0;

  if (doc.series_name && doc.episode_num) {
    const prev = await db.prepare(
      `SELECT id FROM documents
       WHERE category = ? AND series_name = ? AND episode_num < ?
       ORDER BY episode_num DESC LIMIT 1`
    ).bind(doc.category, doc.series_name, doc.episode_num).first();

    const next = await db.prepare(
      `SELECT id FROM documents
       WHERE category = ? AND series_name = ? AND episode_num > ?
       ORDER BY episode_num ASC LIMIT 1`
    ).bind(doc.category, doc.series_name, doc.episode_num).first();

    const total = await db.prepare(
      `SELECT COUNT(*) as count FROM documents
       WHERE category = ? AND series_name = ?`
    ).bind(doc.category, doc.series_name).first();

    prevId = prev?.id || null;
    nextId = next?.id || null;
    totalEpisodes = total?.count || 0;
  }

  return { document: doc, prevId, nextId, totalEpisodes };
}

async function searchDocuments(db, query) {
  // 对标题和内容进行模糊搜索
  const pattern = `%${query}%`;
  const result = await db.prepare(
    `SELECT id, title, type, category, series_name, episode_num, format, read_count
     FROM documents
     WHERE title LIKE ? OR content LIKE ? OR series_name LIKE ?
     ORDER BY read_count DESC LIMIT 30`
  ).bind(pattern, pattern, pattern).all();

  return { documents: result.results };
}

async function recordRead(db, documentId) {
  if (!documentId) return { error: 'Missing documentId' };

  await db.prepare(
    'UPDATE documents SET read_count = read_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).bind(documentId).run();

  return { success: true };
}

// ============================================================
// R2 → D1 同步逻辑（一次性使用）
// ============================================================

async function syncR2ToD1(db, r2, force = false) {
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

  // 2. 获取已有文档的 r2_key
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

    // 已存在且非强制模式则跳过
    if (existingMap.has(key) && !force) {
      stats.skipped++;
      continue;
    }

    try {
      // 如果是 TXT，读取内容（尝试多种编码）
      let content = null;
      if (parsed.format === 'txt') {
        const r2Obj = await r2.get(key);
        if (r2Obj) {
          const buf = await r2Obj.arrayBuffer();
          // 先尝试 UTF-8，如果出现替换字符再用 GBK
          content = new TextDecoder('utf-8').decode(buf);
          if (content.includes('\uFFFD')) {
            // UTF-8 解码失败，尝试 GBK
            try {
              content = new TextDecoder('gbk').decode(buf);
            } catch (e) {
              // GBK 不可用，保留 UTF-8 结果
            }
          }
        }
      }

      const id = generateDocId(key, parsed);

      if (existingMap.has(key) && force) {
        // 强制更新：覆盖已有记录的内容
        await db.prepare(
          `UPDATE documents SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE r2_key = ?`
        ).bind(content, key).run();
        stats.updated++;
      } else {
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
      }
    } catch (err) {
      stats.errors.push({ key, error: err.message });
    }
  }

  return stats;
}

function parseR2Key(key) {
  const parts = key.split('/');
  const fileName = parts[parts.length - 1];
  const ext = fileName.split('.').pop().toLowerCase();

  let format = ext;
  if (!['txt', 'pdf', 'epub', 'docx'].includes(format)) return null;

  const category = parts[0];

  // 大安法师讲义稿（TXT）
  if (category === '大安法师' && parts.length >= 4 && format === 'txt') {
    const seriesFolder = parts[2];
    const seriesMatch = seriesFolder.match(/^\d+\s+(.+?)\s+\d+讲$/);
    const seriesName = seriesMatch ? seriesMatch[1] : seriesFolder;
    const epMatch = fileName.match(/第(\d+)讲/);
    const episodeNum = epMatch ? parseInt(epMatch[1]) : null;
    const title = fileName.replace(/\.txt$/i, '');
    return { title, type: 'transcript', category: '大安法师', seriesName, episodeNum, format: 'txt' };
  }

  // 大安法师独立 PDF
  if (category === '大安法师' && format === 'pdf') {
    return { title: fileName.replace(/\.pdf(\.pdf)?$/i, ''), type: 'collection', category: '大安法师', seriesName: null, episodeNum: null, format: 'pdf' };
  }

  // 佛教经典
  if (category === '佛教经典') {
    return { title: fileName.replace(/\.\w+$/i, ''), type: 'sutra', category: '佛教经典', seriesName: null, episodeNum: null, format };
  }

  // 印光大师文钞
  if (category === '印光大师文钞') {
    return { title: fileName.replace(/\.\w+$/i, ''), type: 'collection', category: '印光大师文钞', seriesName: null, episodeNum: null, format };
  }

  // 省庵大师
  if (category === '省庵大师') {
    return { title: fileName.replace(/\.\w+$/i, ''), type: 'collection', category: '省庵大师', seriesName: null, episodeNum: null, format };
  }

  return null;
}

function generateDocId(r2Key, parsed) {
  // 基于 R2 key 生成唯一 ID，确保不冲突
  const keySlug = slugify(r2Key.replace(/\.\w+$/, ''));
  // 如果超长，截取后加简易哈希后缀避免冲突
  if (keySlug.length > 120) {
    const hash = simpleHash(r2Key);
    return keySlug.slice(0, 110) + '-' + hash;
  }
  return keySlug;
}

function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36).slice(0, 8);
}

function slugify(str) {
  return str
    .replace(/[（）()《》\[\]【】]/g, '')
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}
