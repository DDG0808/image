#!/usr/bin/env bash

set -e

echo "🚀 开始部署到 Nginx 服务器..."

# 配置变量
SERVER_USER=${1:-"user"}
SERVER_HOST=${2:-"your-server.com"}
DEPLOY_PATH=${3:-"/var/www/puzzle-tool"}

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

# 检查参数
if [ "$SERVER_HOST" = "your-server.com" ]; then
    echo "❌ 错误：请提供正确的服务器信息"
    echo "用法: $0 <用户名> <服务器地址> [部署路径]"
    echo "示例: $0 ubuntu example.com /var/www/puzzle-tool"
    exit 1
fi

echo "📋 部署配置:"
echo "   服务器: $SERVER_USER@$SERVER_HOST"
echo "   部署路径: $DEPLOY_PATH"
echo

# 测试服务器连接
echo "🔗 测试服务器连接..."
if ! ssh -o ConnectTimeout=10 "$SERVER_USER@$SERVER_HOST" 'echo "连接成功"'; then
    echo "❌ 错误：无法连接到服务器"
    exit 1
fi

# 构建项目
echo "📦 构建项目..."
npm run type-check
npm run lint
npm run build

if [ ! -d "dist" ]; then
    echo "❌ 错误：构建失败，dist 目录不存在"
    exit 1
fi

# 备份现有部署
echo "💾 备份现有部署..."
ssh "$SERVER_USER@$SERVER_HOST" "
    if [ -d '$DEPLOY_PATH' ]; then
        sudo cp -r '$DEPLOY_PATH' '${DEPLOY_PATH}.backup.$(date +%Y%m%d_%H%M%S)'
        echo '备份完成'
    fi
"

# 上传文件到服务器
echo "📤 上传文件到服务器..."
rsync -avz --delete --progress \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='.env*' \
    dist/ "$SERVER_USER@$SERVER_HOST:$DEPLOY_PATH/"

# 设置正确的权限
echo "🔐 设置文件权限..."
ssh "$SERVER_USER@$SERVER_HOST" "
    sudo chown -R www-data:www-data '$DEPLOY_PATH'
    sudo chmod -R 755 '$DEPLOY_PATH'
"

# 测试 Nginx 配置并重新加载
echo "🔄 重新加载 Nginx..."
ssh "$SERVER_USER@$SERVER_HOST" "
    sudo nginx -t && sudo systemctl reload nginx
    echo 'Nginx 重新加载完成'
"

# 健康检查
echo "🏥 健康检查..."
HEALTH_URL="http://$SERVER_HOST"
if curl -f -s -o /dev/null "$HEALTH_URL"; then
    echo "✅ 网站正常访问"
else
    echo "⚠️  警告：网站可能无法正常访问，请检查配置"
fi

echo "✅ 部署完成！"
echo "🌐 访问地址: $HEALTH_URL"
echo "📝 如有问题，可通过备份进行回滚"