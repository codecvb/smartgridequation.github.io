# 常青笔记

一套开箱即用的自建博客：自己登录、用 Markdown 写文章、发布到自己的域名。

## 功能

- 管理员登录与 30 天会话，登录失败限流
- Markdown 编辑器：工具栏、实时预览、本地自动保存
- 图片上传，自动插入 Markdown 图片语法
- PDF 直接发布：在线预览、下载、草稿与静态导出
- 草稿 / 发布切换，阅读次数统计
- 实时受众统计：在线用户、随访用户、独立访客
- 标签归档、全文搜索、文章目录、上一篇/下一篇、相关阅读
- 站点信息、关于页、页脚文字与密码全部可在后台修改
- 无外部 CDN，代码高亮和 Markdown 渲染全部本地提供

## 本地运行

```bash
npm install
npm start
```

然后打开 <http://localhost:3000>。

首次启动会自动创建管理员账号：

- 用户名：`admin`
- 密码：`admin123`（请登录后在「站点设置」里修改）

也可以通过环境变量预设账号：

```bash
ADMIN_USERNAME=admin ADMIN_PASSWORD=your-strong-password npm start
```

## 数据存放

所有内容保存在 `.data/db.json`，上传图片存放在 `public/uploads/`。备份时复制这两个位置即可。
PDF 文件存放在 `public/uploads/pdfs/`。访客统计只保存随机匿名标识的哈希值，不记录 IP 地址。

如需把数据放到其他目录，可设置 `BLOG_DATA_DIR`。

## GitHub Pages 静态发布

GitHub Pages 只能托管静态文件，无法运行 Express。项目内置了静态导出脚本，会把当前已发布文章导出为可直接访问的静态站点：

```bash
npm run build:static
git add -A
git commit -m "build static site"
git push
```

导出的 `index.html`、`post/`、`tags/`、`search.html` 等文件位于仓库根目录，推送到 `<username>.github.io` 仓库后即可通过 `https://<username>.github.io/` 访问。后台登录、写作、上传等动态功能仍需要部署到 Node 服务，见 [DEPLOY.md](DEPLOY.md)。

静态导出会保留 PDF 在线预览和下载。在线人数、随访用户等实时统计依赖 Node 服务，静态站点只显示导出时的访客快照。

## 一键发布 Markdown 文章

把 Markdown 文件放进 `posts/` 目录，然后执行：

```bash
npm run publish
git add -A
git commit -m "publish articles"
git push
```

也可以直接指定文件：

```bash
npm run publish -- 任意路径/文章.md
```

脚本会自动读取 Markdown，生成标题、摘要、标签、slug，写入文章数据并重新生成首页和静态页面。建议在文件开头用 frontmatter 写清元信息：

```markdown
---
title: 文章标题
slug: article-slug
summary: 一句话摘要
tags: 随笔, 读书笔记
---

# 文章标题
```

不写 frontmatter 也能发布：标题取第一个 `# 标题`，摘要取第一段正文，slug 自动由标题生成。

正文支持 KaTeX 数学公式：行内公式用 `$...$`，独立公式块用 `$$...$$`。

## 直接发布 PDF

登录后台，进入「发布 PDF」，选择文件并填写分类等信息，即可直接发布为正式文章。标题留空时优先读取 PDF 元数据中的 `Title`，读不到时再使用文件名。PDF 页面提供在线预览和下载，上传上限为 50 MB。

也可以在命令行发布：

```bash
npm run publish:pdf -- 路径/文档.pdf --title "文档标题" --category "资料"
```

常用选项：

- `--title "标题"`：不填则使用文件名
- `--slug article-slug`：自定义链接地址
- `--summary "摘要"`：文章摘要
- `--tags "PDF, 讲义"`：标签
- `--category "资料"`：分类
- `--draft`：只保存为草稿

也可以直接导入整个目录。批量导入时会从每个 PDF 的元数据读取标题，并自动跳过同名 PDF：

```bash
npm run publish:pdf -- 路径/PDF目录 --category "物理" --tags "物理, PDF"
```

命令行发布会自动重新生成静态站点。

## 实时访客统计

首页和后台仪表盘会在页面打开期间每 8 秒刷新一次受众数据：

- 在线：最近 75 秒内仍有心跳的匿名访客
- 随访用户：至少回访过一次的匿名访客
- 独立访客：当前数据文件中的匿名访客总数

运行端到端检查：

```bash
npm test
```

## 目录结构

```text
server.js             Express 服务与路由
lib/store.js          JSON 数据层（文章/用户/会话/设置）
lib/markdown.js       Markdown 渲染与目录提取
views/                EJS 模板（前台 + 后台）
public/css/app.css    整套视觉样式
public/js/editor.js   编辑器交互
scripts/              密码重置等工具
```

忘记密码时可执行：

```bash
npm run reset-password -- admin 新密码
```

部署到免费服务器的详细步骤见 [DEPLOY.md](DEPLOY.md)。
