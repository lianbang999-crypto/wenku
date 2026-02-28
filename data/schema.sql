-- ============================================
-- 法音文库 D1 表结构
-- 在 foyue-db 中执行
-- ============================================

-- 文库文档表
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,                          -- 如 'daanfashi-wuliangshoujing-01'
  title TEXT NOT NULL,                          -- '佛说无量寿经要义卷上 第01讲'
  type TEXT NOT NULL DEFAULT 'transcript',      -- 'transcript' | 'sutra' | 'collection'
  category TEXT NOT NULL,                       -- '大安法师' | '佛教经典' | '印光大师文钞' | '省庵大师'
  series_name TEXT,                             -- '佛说无量寿经 要义全卷'
  episode_num INTEGER,                          -- 1, 2, 3...
  format TEXT NOT NULL DEFAULT 'txt',           -- 'txt' | 'pdf' | 'epub' | 'docx'
  r2_bucket TEXT NOT NULL DEFAULT 'jingdianwendang',
  r2_key TEXT NOT NULL,                         -- R2 完整路径
  content TEXT,                                 -- TXT 全文（PDF/EPUB 为 NULL）
  file_size INTEGER,                            -- 文件大小（字节）
  audio_series_id TEXT,                         -- 关联音频 series.id
  audio_episode_num INTEGER,                    -- 关联音频集数
  read_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 阅读书签表
CREATE TABLE IF NOT EXISTS bookmarks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id TEXT NOT NULL,
  client_hash TEXT NOT NULL,
  scroll_position REAL DEFAULT 0,
  last_read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES documents(id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_series ON documents(category, series_name);
CREATE INDEX IF NOT EXISTS idx_documents_audio ON documents(audio_series_id, audio_episode_num);
CREATE INDEX IF NOT EXISTS idx_bookmarks_client ON bookmarks(client_hash);
CREATE INDEX IF NOT EXISTS idx_bookmarks_document ON bookmarks(document_id);
