param(
  [Parameter(Mandatory = $true)][string]$Remote,
  [string]$Key,
  [string]$Domain,
  [string]$AdminUsername = 'admin',
  [string]$AdminPassword,
  [string]$CertbotEmail,
  [string]$AppDir = '/opt/blog'
)

$ErrorActionPreference = 'Stop'
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path (Join-Path $ScriptDir '..\..')
$Archive = Join-Path $ScriptDir 'blog-deploy.tar.gz'

if (-not $AdminPassword) {
  $chars = 48..57 + 65..90 + 97..122
  $AdminPassword = -join (1..20 | ForEach-Object { [char]$chars[(Get-Random -Maximum $chars.Count)] })
  Write-Host "Generated admin password: $AdminPassword" -ForegroundColor Yellow
  Write-Host "Save it now; change it after login." -ForegroundColor Yellow
}

Write-Host '==> Building archive (excluding node_modules / .data / .git)'
if (Test-Path $Archive) { Remove-Item -LiteralPath $Archive -Force }
$excludes = @('--exclude=node_modules', '--exclude=.data', '--exclude=.git', '--exclude=backups', '--exclude=deploy/oracle/blog-deploy.tar.gz')
& tar -czf $Archive @excludes -C $ProjectRoot .
if ($LASTEXITCODE -ne 0) { throw 'Archive failed' }

$sshArgs = @()
if ($Key) {
  $sshArgs += @('-i', $Key)
}

Write-Host "==> Uploading to $Remote"
& scp @sshArgs $Archive "$Remote`:/tmp/blog.tar.gz"
if ($LASTEXITCODE -ne 0) { throw 'Upload archive failed' }
& scp @sshArgs (Join-Path $ScriptDir 'setup-oracle.sh') "$Remote`:/tmp/setup-oracle.sh"
if ($LASTEXITCODE -ne 0) { throw 'Upload script failed' }

$envCommand = "sudo BLOG_APP_DIR='$AppDir' BLOG_ADMIN_USERNAME='$AdminUsername' BLOG_ADMIN_PASSWORD='$AdminPassword' BLOG_DOMAIN='$Domain' BLOG_CERTBOT_EMAIL='$CertbotEmail' BLOG_ARCHIVE=/tmp/blog.tar.gz bash /tmp/setup-oracle.sh"
$keyArg = ''
if ($Key) { $keyArg = "-i $Key " }

Write-Host '==> Checking passwordless sudo'
& ssh @sshArgs $Remote 'sudo -n true'
if ($LASTEXITCODE -ne 0) {
  Write-Host 'Sudo requires a password, so automation cannot continue.' -ForegroundColor Yellow
  Write-Host 'Run this manually (you will be prompted for the sudo password):' -ForegroundColor Yellow
  Write-Host "ssh $keyArg$Remote $envCommand" -ForegroundColor Cyan
  exit 1
}

Write-Host '==> Installing Node.js / Nginx / services'
& ssh @sshArgs $Remote $envCommand
if ($LASTEXITCODE -ne 0) { throw 'Remote deploy failed' }

Write-Host '==> Done'
if ($Domain) {
  Write-Host "Visit: https://$Domain"
} else {
  $ip = $Remote.Split('@')[-1]
  Write-Host "Visit: http://$ip"
  Write-Host 'If it does not open, allow ports 80/443 in the Oracle security list.'
}
Write-Host "Admin username: $AdminUsername"
