# 推送到 https://github.com/MoRan3421/QiLing
# 需要 Git: https://git-scm.com/download/win

$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

$git = $null
foreach ($p in @(
    "git",
    "C:\Program Files\Git\bin\git.exe",
    "C:\Program Files (x86)\Git\bin\git.exe"
)) {
    if (Get-Command $p -ErrorAction SilentlyContinue) { $git = $p; break }
    if (Test-Path $p) { $git = $p; break }
}

if (-not $git) {
    Write-Host "未找到 Git，请先安装: https://git-scm.com/download/win" -ForegroundColor Red
    Write-Host "安装后重新运行此脚本" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path .git)) {
    & $git init
    & $git branch -M main
}

& $git remote remove origin 2>$null
& $git remote add origin https://github.com/MoRan3421/QiLing.git

& $git add .
Write-Host "`n已暂存文件:" -ForegroundColor Cyan
& $git status --short

$msg = "feat: v2.1 landing page, login, typing indicator, feature toggles, minute recovery"
& $git commit -m $msg 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "无新更改或已提交" -ForegroundColor Yellow
}

Write-Host "`n推送到 GitHub..." -ForegroundColor Cyan
& $git push -u origin main 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n成功: https://github.com/MoRan3421/QiLing" -ForegroundColor Green
} else {
    Write-Host "`n若仓库不存在，请先在 GitHub 创建空仓库 QiLing" -ForegroundColor Yellow
    Write-Host "然后: $git push -u origin main" -ForegroundColor Yellow
}
