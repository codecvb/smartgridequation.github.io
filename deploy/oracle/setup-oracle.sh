#!/usr/bin/env bash
# Oracle Cloud 一键部署脚本（在服务器上以 root 或 sudo 运行）
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive

APP_DIR="${BLOG_APP_DIR:-/opt/blog}"
DOMAIN="${BLOG_DOMAIN:-}"
ADMIN_USERNAME="${BLOG_ADMIN_USERNAME:-admin}"
ADMIN_PASSWORD="${BLOG_ADMIN_PASSWORD:-}"
CERTBOT_EMAIL="${BLOG_CERTBOT_EMAIL:-}"
ARCHIVE="${BLOG_ARCHIVE:-/tmp/blog.tar.gz}"

if [[ -z "$ADMIN_PASSWORD" ]]; then
  echo "错误：必须通过 BLOG_ADMIN_PASSWORD 提供管理员密码" >&2
  exit 1
fi

echo "==> 安装系统依赖"
apt-get update -y
apt-get install -y curl tar ca-certificates gnupg

if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

if ! command -v nginx >/dev/null 2>&1; then
  apt-get install -y nginx
fi

if ! command -v certbot >/dev/null 2>&1; then
  apt-get install -y certbot python3-certbot-nginx
fi

echo "==> 解压应用代码到 $APP_DIR"
mkdir -p "$APP_DIR"
tar -xzf "$ARCHIVE" -C "$APP_DIR" --strip-components=1

if [[ ! -f "$APP_DIR/.env" ]]; then
  if [[ -n "$DOMAIN" ]]; then
    cat > "$APP_DIR/.env" <<EOF
ADMIN_USERNAME=$ADMIN_USERNAME
ADMIN_PASSWORD=$ADMIN_PASSWORD
COOKIE_SECURE=1
EOF
  else
    cat > "$APP_DIR/.env" <<EOF
ADMIN_USERNAME=$ADMIN_USERNAME
ADMIN_PASSWORD=$ADMIN_PASSWORD
COOKIE_SECURE=0
EOF
  fi
  echo "已创建 $APP_DIR/.env（含管理员账号）"
else
  echo "检测到已有 .env，保留原配置"
fi

cd "$APP_DIR"
echo "==> 安装 npm 依赖"
if ! npm ci --omit=dev 2>/dev/null; then
  npm install --omit=dev
fi

if ! id -u blog >/dev/null 2>&1; then
  useradd --system --home "$APP_DIR" --shell /usr/sbin/nologin blog
fi
mkdir -p "$APP_DIR/.data" "$APP_DIR/public/uploads"
chown -R blog:blog "$APP_DIR"

echo "==> 配置 systemd 服务"
cat > /etc/systemd/system/blog.service <<EOF
[Unit]
Description=Evergreen Blog
After=network.target

[Service]
Type=simple
User=blog
Group=blog
WorkingDirectory=$APP_DIR
EnvironmentFile=$APP_DIR/.env
Environment=NODE_ENV=production
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable --now blog

echo "==> 配置 Nginx 反向代理"
cat > /etc/nginx/sites-available/blog <<EOF
server {
  listen 80;
  listen [::]:80;
  server_name ${DOMAIN:-_};
  client_max_body_size 12m;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }
}
EOF
ln -sf /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/blog
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

if [[ -n "$DOMAIN" && -n "$CERTBOT_EMAIL" ]]; then
  echo "==> 申请 HTTPS 证书"
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$CERTBOT_EMAIL" --redirect
fi

if command -v ufw >/dev/null 2>&1 && ufw status | grep -q "Status: active"; then
  echo "==> 开放防火墙端口"
  ufw allow OpenSSH >/dev/null 2>&1 || true
  ufw allow 'Nginx Full' >/dev/null 2>&1 || true
fi

echo "==> 配置每日备份"
cat > "$APP_DIR/backup.sh" <<'SCRIPT'
#!/usr/bin/env bash
set -euo pipefail
APP_DIR="/opt/blog"
BACKUP_DIR="$APP_DIR/backups"
mkdir -p "$BACKUP_DIR"
STAMP=$(date +%F_%H%M%S)
tar -czf "$BACKUP_DIR/blog-$STAMP.tar.gz" -C "$APP_DIR" .data public/uploads .env
find "$BACKUP_DIR" -name '*.tar.gz' -mtime +14 -delete
SCRIPT
chmod +x "$APP_DIR/backup.sh"
(crontab -l 2>/dev/null || true; echo "0 3 * * * $APP_DIR/backup.sh") | crontab -

echo "==> 验证服务"
sleep 3
if curl -fsS http://127.0.0.1:3000/ >/dev/null 2>&1; then
  echo "本地服务检查通过"
else
  echo "警告：本地 3000 端口未响应，请查看: journalctl -u blog -n 50"
fi
systemctl is-enabled blog >/dev/null 2>&1 && echo "blog 服务已设为开机自启"

echo "部署完成。"
if [[ -n "$DOMAIN" ]]; then
  echo "访问 https://$DOMAIN"
else
  echo "先用公网 IP 访问 http://<服务器IP>，并在 Oracle 控制台安全列表放行 80/443。"
fi
