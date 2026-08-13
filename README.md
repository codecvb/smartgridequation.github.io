# 常青笔记

一套开箱即用的自建博客：自己登录、用 Markdown 写文章、发布到自己的域名。

## 功能

- 管理员登录与 30 天会话，登录失败限流
- Markdown 编辑器：工具栏、实时预览、本地自动保存
- 图片上传，自动插入 Markdown 图片语法
- 草稿 / 发布切换，阅读次数统计
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

## GitHub Pages 静态发布

GitHub Pages 只能托管静态文件，无法运行 Express。项目内置了静态导出脚本，会把当前已发布文章导出为可直接访问的静态站点：

```bash
npm run build:static
git add -A
git commit -m "build static site"
git push
```

导出的 `index.html`、`post/`、`tags/`、`search.html` 等文件位于仓库根目录，推送到 `<username>.github.io` 仓库后即可通过 `https://<username>.github.io/` 访问。后台登录、写作、上传等动态功能仍需要部署到 Node 服务，见 [DEPLOY.md](DEPLOY.md)。

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
