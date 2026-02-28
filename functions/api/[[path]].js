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
