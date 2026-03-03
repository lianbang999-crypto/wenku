-- ============================================================
-- 迁移脚本：清理「已用」文件夹中的重复和错误分类数据
--
-- 操作说明：
--   1. 删除 14 篇重复文档（一函遍复 4篇 + 龙舒净土文马来西亚 10篇）
--   2. 将 32 篇独有文档的 series_name 从「已用」改为正确的系列名
--
-- 执行方式：
--   wrangler d1 execute foyue-db --file=scripts/migrate-yiyong.sql
--   (加 --remote 在生产环境执行)
-- ============================================================

-- === 第一步：删除 14 篇重复文档 ===

-- 一函遍复（与「一函遍复（汕头）」系列重复）
DELETE FROM documents WHERE id = '大安法师-大安法师讲法集txt-已用-16-一函遍复-4讲-一函遍复-第1讲';
DELETE FROM documents WHERE id = '大安法师-大安法师讲法集txt-已用-16-一函遍复-4讲-一函遍复-第2讲';
DELETE FROM documents WHERE id = '大安法师-大安法师讲法集txt-已用-16-一函遍复-4讲-一函遍复-第3讲';
DELETE FROM documents WHERE id = '大安法师-大安法师讲法集txt-已用-16-一函遍复-4讲-一函遍复-第4讲';

-- 龙舒净土文（马来西亚）（与「龙舒净土文」系列重复）
DELETE FROM documents WHERE id = '大安法师-大安法师讲法集txt-已用-32-龙舒净土文马来西亚-10讲-龙舒净土文马来西亚-第01讲';
DELETE FROM documents WHERE id = '大安法师-大安法师讲法集txt-已用-32-龙舒净土文马来西亚-10讲-龙舒净土文马来西亚-第02讲';
DELETE FROM documents WHERE id = '大安法师-大安法师讲法集txt-已用-32-龙舒净土文马来西亚-10讲-龙舒净土文马来西亚-第03讲';
DELETE FROM documents WHERE id = '大安法师-大安法师讲法集txt-已用-32-龙舒净土文马来西亚-10讲-龙舒净土文马来西亚-第04讲';
DELETE FROM documents WHERE id = '大安法师-大安法师讲法集txt-已用-32-龙舒净土文马来西亚-10讲-龙舒净土文马来西亚-第05讲';
DELETE FROM documents WHERE id = '大安法师-大安法师讲法集txt-已用-32-龙舒净土文马来西亚-10讲-龙舒净土文马来西亚-第06讲';
DELETE FROM documents WHERE id = '大安法师-大安法师讲法集txt-已用-32-龙舒净土文马来西亚-10讲-龙舒净土文马来西亚-第07讲';
DELETE FROM documents WHERE id = '大安法师-大安法师讲法集txt-已用-32-龙舒净土文马来西亚-10讲-龙舒净土文马来西亚-第08讲';
DELETE FROM documents WHERE id = '大安法师-大安法师讲法集txt-已用-32-龙舒净土文马来西亚-10讲-龙舒净土文马来西亚-第09讲';
DELETE FROM documents WHERE id = '大安法师-大安法师讲法集txt-已用-32-龙舒净土文马来西亚-10讲-龙舒净土文马来西亚-第10讲';

-- === 第二步：更新 32 篇独有文档的 series_name ===

-- 佛说阿弥陀经（新加坡）7讲
UPDATE documents SET series_name = '佛说阿弥陀经（新加坡）', updated_at = CURRENT_TIMESTAMP WHERE id = '大安法师-大安法师讲法集txt-已用-02-佛说阿弥陀经新加坡-7讲-佛说阿弥陀经-第1讲';
UPDATE documents SET series_name = '佛说阿弥陀经（新加坡）', updated_at = CURRENT_TIMESTAMP WHERE id = '大安法师-大安法师讲法集txt-已用-02-佛说阿弥陀经新加坡-7讲-佛说阿弥陀经-第2讲';
UPDATE documents SET series_name = '佛说阿弥陀经（新加坡）', updated_at = CURRENT_TIMESTAMP WHERE id = '大安法师-大安法师讲法集txt-已用-02-佛说阿弥陀经新加坡-7讲-佛说阿弥陀经-第3讲';
UPDATE documents SET series_name = '佛说阿弥陀经（新加坡）', updated_at = CURRENT_TIMESTAMP WHERE id = '大安法师-大安法师讲法集txt-已用-02-佛说阿弥陀经新加坡-7讲-佛说阿弥陀经-第4讲';
UPDATE documents SET series_name = '佛说阿弥陀经（新加坡）', updated_at = CURRENT_TIMESTAMP WHERE id = '大安法师-大安法师讲法集txt-已用-02-佛说阿弥陀经新加坡-7讲-佛说阿弥陀经-第5讲';
UPDATE documents SET series_name = '佛说阿弥陀经（新加坡）', updated_at = CURRENT_TIMESTAMP WHERE id = '大安法师-大安法师讲法集txt-已用-02-佛说阿弥陀经新加坡-7讲-佛说阿弥陀经-第6讲';
UPDATE documents SET series_name = '佛说阿弥陀经（新加坡）', updated_at = CURRENT_TIMESTAMP WHERE id = '大安法师-大安法师讲法集txt-已用-02-佛说阿弥陀经新加坡-7讲-佛说阿弥陀经-第7讲';

-- 与徐福贤女士书 4讲
UPDATE documents SET series_name = '与徐福贤女士书', updated_at = CURRENT_TIMESTAMP WHERE id = '大安法师-大安法师讲法集txt-已用-20-与徐福贤女士书-4讲-与徐福贤女士书-第1讲';
UPDATE documents SET series_name = '与徐福贤女士书', updated_at = CURRENT_TIMESTAMP WHERE id = '大安法师-大安法师讲法集txt-已用-20-与徐福贤女士书-4讲-与徐福贤女士书-第2讲';
UPDATE documents SET series_name = '与徐福贤女士书', updated_at = CURRENT_TIMESTAMP WHERE id = '大安法师-大安法师讲法集txt-已用-20-与徐福贤女士书-4讲-与徐福贤女士书-第3讲';
UPDATE documents SET series_name = '与徐福贤女士书', updated_at = CURRENT_TIMESTAMP WHERE id = '大安法师-大安法师讲法集txt-已用-20-与徐福贤女士书-4讲-与徐福贤女士书-第4讲';

-- 净土百问 2辑
UPDATE documents SET series_name = '净土百问', updated_at = CURRENT_TIMESTAMP WHERE id = '大安法师-大安法师讲法集txt-已用-25-净土百问-2辑-净土百问-第1辑';
UPDATE documents SET series_name = '净土百问', updated_at = CURRENT_TIMESTAMP WHERE id = '大安法师-大安法师讲法集txt-已用-25-净土百问-2辑-净土百问-第2辑';

-- 大学演讲录 2讲
UPDATE documents SET series_name = '大学演讲录', updated_at = CURRENT_TIMESTAMP WHERE id = '大安法师-大安法师讲法集txt-已用-26-大学演讲录-2讲-净土文化与现代人的心灵提升';
UPDATE documents SET series_name = '大学演讲录', updated_at = CURRENT_TIMESTAMP WHERE id = '大安法师-大安法师讲法集txt-已用-26-大学演讲录-2讲-道德危机的原因与应对';

-- 净业三福的时代意义 2讲
UPDATE documents SET series_name = '净业三福的时代意义', updated_at = CURRENT_TIMESTAMP WHERE id = '大安法师-大安法师讲法集txt-已用-27-净业三福的时代意义-2讲-净业三福的时代意义-第1讲';
UPDATE documents SET series_name = '净业三福的时代意义', updated_at = CURRENT_TIMESTAMP WHERE id = '大安法师-大安法师讲法集txt-已用-27-净业三福的时代意义-2讲-净业三福的时代意义-第2讲';

-- 念佛法门的原理与方法 1讲
UPDATE documents SET series_name = '念佛法门的原理与方法', updated_at = CURRENT_TIMESTAMP WHERE id = '大安法师-大安法师讲法集txt-已用-29-念佛法门的原理与方法-1讲-念佛法门的原理与方法';

-- 佛说阿弥陀经要解述义 6讲
UPDATE documents SET series_name = '佛说阿弥陀经要解述义', updated_at = CURRENT_TIMESTAMP WHERE id = '大安法师-大安法师讲法集txt-已用-34-佛说阿弥陀经要解述义-6讲-佛说阿弥陀经要解述义-第1讲';
UPDATE documents SET series_name = '佛说阿弥陀经要解述义', updated_at = CURRENT_TIMESTAMP WHERE id = '大安法师-大安法师讲法集txt-已用-34-佛说阿弥陀经要解述义-6讲-佛说阿弥陀经要解述义-第2讲';
UPDATE documents SET series_name = '佛说阿弥陀经要解述义', updated_at = CURRENT_TIMESTAMP WHERE id = '大安法师-大安法师讲法集txt-已用-34-佛说阿弥陀经要解述义-6讲-佛说阿弥陀经要解述义-第3讲';
UPDATE documents SET series_name = '佛说阿弥陀经要解述义', updated_at = CURRENT_TIMESTAMP WHERE id = '大安法师-大安法师讲法集txt-已用-34-佛说阿弥陀经要解述义-6讲-佛说阿弥陀经要解述义-第4讲';
UPDATE documents SET series_name = '佛说阿弥陀经要解述义', updated_at = CURRENT_TIMESTAMP WHERE id = '大安法师-大安法师讲法集txt-已用-34-佛说阿弥陀经要解述义-6讲-佛说阿弥陀经要解述义-第5讲';
UPDATE documents SET series_name = '佛说阿弥陀经要解述义', updated_at = CURRENT_TIMESTAMP WHERE id = '大安法师-大安法师讲法集txt-已用-34-佛说阿弥陀经要解述义-6讲-佛说阿弥陀经要解述义-第6讲';

-- 与大兴善寺体安和尚书 4讲
UPDATE documents SET series_name = '与大兴善寺体安和尚书', updated_at = CURRENT_TIMESTAMP WHERE id = '大安法师-大安法师讲法集txt-已用-37-与大兴善寺体安和尚书-4讲-与大兴善寺体安和尚-第1讲';
UPDATE documents SET series_name = '与大兴善寺体安和尚书', updated_at = CURRENT_TIMESTAMP WHERE id = '大安法师-大安法师讲法集txt-已用-37-与大兴善寺体安和尚书-4讲-与大兴善寺体安和尚-第2讲';
UPDATE documents SET series_name = '与大兴善寺体安和尚书', updated_at = CURRENT_TIMESTAMP WHERE id = '大安法师-大安法师讲法集txt-已用-37-与大兴善寺体安和尚书-4讲-与大兴善寺体安和尚-第3讲';
UPDATE documents SET series_name = '与大兴善寺体安和尚书', updated_at = CURRENT_TIMESTAMP WHERE id = '大安法师-大安法师讲法集txt-已用-37-与大兴善寺体安和尚书-4讲-与大兴善寺体安和尚-第4讲';

-- 净业三福 4讲
UPDATE documents SET series_name = '净业三福', updated_at = CURRENT_TIMESTAMP WHERE id = '大安法师-大安法师讲法集txt-已用-38-净业三福-4讲-净业三福-第1讲';
UPDATE documents SET series_name = '净业三福', updated_at = CURRENT_TIMESTAMP WHERE id = '大安法师-大安法师讲法集txt-已用-38-净业三福-4讲-净业三福-第2讲';
UPDATE documents SET series_name = '净业三福', updated_at = CURRENT_TIMESTAMP WHERE id = '大安法师-大安法师讲法集txt-已用-38-净业三福-4讲-净业三福-第3讲';
UPDATE documents SET series_name = '净业三福', updated_at = CURRENT_TIMESTAMP WHERE id = '大安法师-大安法师讲法集txt-已用-38-净业三福-4讲-净业三福-第4讲';

-- === 验证：确认不再有 series_name = '已用' 的文档 ===
-- SELECT COUNT(*) as remaining FROM documents WHERE series_name = '已用';
