# Oracle Cloud 部署包

## 前置条件

1. 已在 Oracle Cloud 创建 Ubuntu 虚拟机，并拿到公网 IP
2. 本机能用 SSH 登录：`ssh opc@1.2.3.4` 或 `ssh ubuntu@1.2.3.4`
3. 如使用密钥登录，准备好私钥文件路径
4. 建议在 Oracle 控制台的安全列表放行 `80`、`443`、`22` 端口

## 一键部署

在项目根目录打开 PowerShell：

```powershell
.\deploy\oracle\deploy.ps1 -Remote opc@1.2.3.4 -Key C:\path\to\your_key -Domain blog.example.com -CertbotEmail you@example.com
```

不传 `-Domain` 会先用公网 IP 以 HTTP 方式上线；不传 `-AdminPassword` 会自动生成一个 20 位密码并打印在终端。

## 手动部署

如果不想自动执行，也可以只上传代码包，然后登录服务器手动跑：

```bash
sudo BLOG_APP_DIR=/opt/blog BLOG_ADMIN_PASSWORD=你的密码 BLOG_ARCHIVE=/tmp/blog.tar.gz bash /tmp/setup-oracle.sh
```

## 部署后

- 用 `admin` 和打印出来的密码登录 `/admin`，然后立刻改密码
- 数据保存在 `/opt/blog/.data/db.json`，上传图片在 `/opt/blog/public/uploads/`
- 每天凌晨 3 点自动备份到 `/opt/blog/backups/`，保留 14 天
- 日志查看：`journalctl -u blog -f`
