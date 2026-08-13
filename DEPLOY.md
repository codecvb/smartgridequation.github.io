# 免费挂载指南

核对日期：2026-08-10。以下信息来自各平台官方页面，套餐政策会变，部署前请再确认一次。

## 结论先看

| 平台 | 是否长期免费 | 适合场景 |
| --- | --- | --- |
| Oracle Cloud Always Free | 是 | 认真长期挂博客，推荐 |
| Render Free Web Service | 免费试用友好 | 快速上线体验 |
| Railway | 30 天试用后约 $1/月 | 想低价换便利 |
| Fly.io | 新用户无免费档 | 已有旧账户再用 |
| Cloudflare Workers | 免费但需改造 | 有精力重构到 Workers 架构 |

## 方案一：Render 免费 Web Service（最快）

Render 官方免费档支持直接部署 Node.js Web Service，也提供免费 Postgres 与 Key Value 实例，适合快速验证。

限制：免费 Web Service 15 分钟无访问会自动休眠，再次访问需要约 1 分钟唤醒；免费实例不适用于生产环境。

步骤：

1. 把项目推到 GitHub/GitLab 仓库。
2. 在 [render.com](https://render.com) 注册后点击 `New +` → `Web Service`。
3. 连接仓库，配置：
   - Build Command：`npm install`
   - Start Command：`npm start`
4. 添加环境变量：
   - `ADMIN_PASSWORD`：设置一个强密码
   - `COOKIE_SECURE=1`：启用 HTTPS Cookie
5. 部署完成后会得到一个 `*.onrender.com` 地址。

注意：免费实例磁盘是临时的，`.data/db.json` 在实例重建时可能丢失。想保留数据，请升级到带持久磁盘的实例，或改用方案二。

## 方案二：Oracle Cloud Always Free（长期免费，推荐）

Oracle Cloud 免费档包含 Always Free 服务，官方页面注明 Always Free 服务无限期可用，另有 $300 / 30 天的试用额度。Always Free 计算资源包括 AMD 与 Arm 虚拟机，适合长期挂载 Node.js 博客。

步骤概要：

1. 注册 [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/)，创建计算实例（Ubuntu 或 Debian）。
2. 开通安全组 80/443 端口，绑定弹性公网 IP。
3. 在服务器上安装 Node.js 20+，把项目代码放入 `/opt/blog`。
4. 安装依赖并启动：

```bash
npm install
ADMIN_PASSWORD=你的强密码 PORT=3000 npm start
```

5. 用 `pm2` 或 `systemd` 保持常驻：

```bash
npm install -g pm2
pm2 start server.js --name blog
pm2 save && pm2 startup
```

6. 用 Nginx 反代到本机 3000 端口，再配置你的域名与 HTTPS。

这台服务器的磁盘是持久的，`.data/db.json` 与 `public/uploads/` 都会长期保留，记得定期备份。

## 方案三：Railway

Railway 官方定价页显示：新用户 30 天免费试用并赠送 $5 额度，之后 `$0/月` 的免费档可用，但项目、资源等有较多限制；`$1/月` 的 Hobby 档更适合长期使用。适合想要省心、又愿意付少量费用的人。

## 方案四：Fly.io

Fly.io 官方定价页显示：新的免费额度仅对已停售的 Hobby 等旧套餐保留，新组织默认按 Pay As You Go 计费。因此新用户不建议把这里当作免费长期方案；已有老账户可查看自己是否保留免费额度。

## 方案五：Cloudflare Workers

Cloudflare Workers 官方定价页显示：默认使用 Workers Free 计划，每天 10 万次请求以内免费，请求静态资源不计费。但本项目的 Express + JSON 文件存储架构无法直接跑在 Workers 上，需要改造成 Workers + D1/KV 的 Serverless 架构。如果愿意重构，这是一条不错的免费持久化路线。

## 上线前检查清单

## Oracle 自动部署脚本

项目里已经放好一键部署包 `deploy/oracle/`：

- `deploy.ps1`：本地打包、上传代码包，并在服务器上自动执行安装
- `setup-oracle.sh`：服务器端安装 Node.js 22、Nginx、Certbot、systemd 服务与每日备份

```powershell
.\deploy\oracle\deploy.ps1 -Remote opc@你的IP -Key C:\path\to\key -Domain blog.example.com -CertbotEmail you@example.com
```

不传 `-Domain` 会先用公网 IP 以 HTTP 上线；不传 `-AdminPassword` 会自动生成一个 20 位密码。要求 SSH 用户的 sudo 为免密；如果 sudo 需要密码，脚本会打印一条手动命令，你在终端运行并输入 sudo 密码即可。

- [ ] 设置强密码：`ADMIN_PASSWORD`，不要用默认 `admin123`
- [ ] 登录后台修改管理员密码
- [ ] HTTPS 环境下设置 `COOKIE_SECURE=1`
- [ ] 定期备份 `.data/db.json` 和 `public/uploads/`
- [ ] 如果平台会休眠，说明平台免费档限制，考虑 Oracle Cloud 长期挂载
