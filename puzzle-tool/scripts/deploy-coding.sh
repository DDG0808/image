#!/usr/bin/env bash

set -e

echo "🚀 开始部署到 Coding Pages..."

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

# 检查 Git 状态
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  警告：工作目录有未提交的更改"
    read -p "是否继续部署？(y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
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

# 进入构建目录
cd dist

# 初始化 git 仓库
echo "📄 初始化部署仓库..."
git init
git add -A
git commit -m "deploy: 部署到 Coding Pages $(date +'%Y-%m-%d %H:%M:%S')"

# 推送到 Coding Pages
echo "🔄 推送到 Coding Pages..."
# 请替换为你的 Coding 仓库地址
CODING_REPO="https://e.coding.net/yourusername/puzzle-tool.git"

if [ -n "$1" ]; then
    CODING_REPO="$1"
fi

echo "推送到: $CODING_REPO"
git push -f "$CODING_REPO" master:coding-pages

echo "✅ 部署完成！"
echo "🌐 访问地址: https://yourusername.coding.me/puzzle-tool"

# 清理
cd ..
rm -rf dist/.git

echo "🧹 清理完成"