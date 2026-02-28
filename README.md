# 法音文库 Foyue Library

净土宗经典文献与讲义稿在线阅读平台，是 [净土法音](https://foyue.org) 的子项目。

## 在线访问

- 文库：https://wenku.foyue.org（部署中）
- 主站：https://foyue.org

## 功能特性

- 讲义稿在线阅读（大安法师讲法集 TXT）
- 佛教经典查看（PDF 经论）
- 4 种阅读模式：普通、护眼（Sepia）、夜间（Dark）、墨水屏（E-ink）
- 字号 / 字体切换（无衬线、宋体、楷体）
- 阅读进度书签（自动保存滚动位置）
- 搜索功能（标题 / 内容 / 系列名模糊搜索）
- 系列内上下篇导航
- 音频讲座关联（跳转主站对应音频）
- PWA 支持

## 技术栈

- **前端**：Vite + Vanilla JS（ES Modules）
- **托管**：Cloudflare Pages（Git Push 自动部署）
- **后端 API**：Cloudflare Pages Functions
- **数据库**：Cloudflare D1（与主站共用 foyue-db）
- **文件存储**：Cloudflare R2（jingdianwendang 桶）

## 快速开始

```bash
git clone https://github.com/lianbang999-crypto/wenku.git
cd wenku
npm install
npm run dev
npm run build
```

## 项目结构

```
foyue-wenku/
├── index.html              # HTML 入口
├── package.json
├── vite.config.js           # Vite 构建配置
├── wrangler.toml            # Cloudflare D1/R2 绑定
├── public/                  # 静态资源
│   ├── manifest.json        # PWA 配置
│   └── robots.txt
├── src/
│   ├── css/                 # 6 个 CSS 模块
│   │   ├── tokens.css       # CSS 变量（4 种阅读模式）
│   │   ├── reset.css        # CSS Reset
│   │   ├── layout.css       # Header + 内容区布局
│   │   ├── cards.css        # 分类卡片 / 系列列表
│   │   ├── reader.css       # 阅读器页面样式
│   │   └── components.css   # 搜索面板 / 设置面板 / Toast
│   └── js/                  # 10 个 JS 模块
│       ├── main.js          # 入口（初始化）
│       ├── state.js         # 共享状态（localStorage 持久化）
│       ├── api.js           # API 请求封装
│       ├── router.js        # Hash 路由
│       ├── utils.js         # 工具函数
│       ├── settings.js      # 阅读设置控制
│       ├── search.js        # 搜索功能
│       └── pages/           # 页面组件
│           ├── home.js      # 首页
│           ├── category.js  # 分类页
│           ├── series.js    # 系列详情页
│           └── reader.js    # 阅读器
├── functions/               # Cloudflare Pages Functions
│   └── api/[[path]].js      # API 路由（5 个接口）
├── data/
│   └── schema.sql           # D1 数据库 schema
└── scripts/
    └── sync-r2-to-d1.js     # R2 数据同步脚本
```

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/wenku/categories` | 获取分类列表 |
| GET | `/api/wenku/documents?category=&series=` | 获取文档列表 |
| GET | `/api/wenku/documents/:id` | 获取文档详情（含内容 + 上下篇） |
| GET | `/api/wenku/search?q=` | 搜索文档 |
| POST | `/api/wenku/read-count` | 记录阅读次数 |

## R2 数据来源

jingdianwendang 桶（304 个文件，97 MB）：

| 目录 | 内容 | 格式 |
|------|------|------|
| 大安法师/大安法师（讲法集）TXT/ | ~35 个系列，~290 篇讲义稿 | TXT |
| 佛教经典/ | 6 部经论（无量寿经、阿弥陀经等） | PDF |
| 印光大师文钞/ | 5 个文件 | PDF/EPUB/DOCX |
| 省庵大师/ | 1 个文件 | PDF |

## 部署步骤

1. GitHub 创建 `foyue-wenku` 仓库并推送代码
2. Cloudflare Pages 创建项目，连接 GitHub 仓库
   - 构建命令：`npm run build`
   - 输出目录：`dist`
3. 绑定资源：
   - D1：变量名 `DB`，数据库 `foyue-db`
   - R2：变量名 `R2`，桶 `jingdianwendang`（如需直接访问）
4. 执行 D1 schema：`wrangler d1 execute foyue-db --file=data/schema.sql`
5. 运行 R2 同步脚本填充文档数据
6. 绑定自定义域名 `wenku.foyue.org`

## 与主站的关系

| 项目 | 域名 | 功能 | 仓库 |
|------|------|------|------|
| 净土法音 | foyue.org | 音频播放器 | lianbang999-crypto/foyue |
| 法音文库 | wenku.foyue.org | 文献阅读 | lianbang999-crypto/wenku |

两个项目共用同一个 Cloudflare 账户下的 D1 数据库（foyue-db）和 R2 存储桶。

## 许可

本项目为佛教公益项目，仅供学习和弘法使用。

南无阿弥陀佛 Namo Amitabha
