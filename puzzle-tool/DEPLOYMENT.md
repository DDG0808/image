# 拼图工具部署指南

本文档介绍如何将拼图工具部署到不同的平台。

## 目录

- [构建准备](#构建准备)
- [国内代码托管平台部署](#国内代码托管平台部署)
  - [Gitee Pages 部署](#gitee-pages-部署)
  - [Coding Pages 部署](#coding-pages-部署)
- [传统 Vue 项目部署](#传统-vue-项目部署)
  - [Nginx 部署](#nginx-部署)
  - [Apache 部署](#apache-部署)
  - [Node.js 服务器部署](#nodejs-服务器部署)
- [Docker 部署](#docker-部署)
- [CDN 加速优化](#cdn-加速优化)
- [常见问题](#常见问题)

---

## 构建准备

在部署之前，需要先构建项目：

```bash
# 安装依赖
npm install

# 运行类型检查
npm run type-check

# 运行代码检查
npm run lint

# 构建生产版本
npm run build
```

构建完成后，会在 `dist/` 目录生成静态文件。

---

## 国内代码托管平台部署

### Gitee Pages 部署

#### 1. 配置 Vite 构建

修改 `vite.config.ts`，添加正确的 base 路径：

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  base: '/puzzle-tool/', // 替换为你的 Gitee 仓库名
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 确保资源路径正确
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
  },
})
```

#### 2. 创建部署脚本

创建 `scripts/deploy-gitee.sh`：

```bash
#!/usr/bin/env bash

echo "🚀 开始部署到 Gitee Pages..."

# 构建项目
echo "📦 构建项目..."
npm run build

# 进入构建目录
cd dist

# 初始化 git 仓库
git init
git add -A
git commit -m 'deploy: 部署到 Gitee Pages'

# 推送到 Gitee Pages
# 替换为你的 Gitee 仓库地址
git push -f git@gitee.com:yourusername/puzzle-tool.git master:gh-pages

echo "✅ 部署完成！"
echo "🌐 访问地址: https://yourusername.gitee.io/puzzle-tool"

cd ..
```

#### 3. 部署步骤

1. **上传代码到 Gitee**：
   ```bash
   git remote add origin https://gitee.com/yourusername/puzzle-tool.git
   git push -u origin master
   ```

2. **开启 Gitee Pages**：
   - 进入 Gitee 仓库页面
   - 点击 "服务" → "Gitee Pages"
   - 选择部署分支为 `gh-pages`
   - 点击 "启动" 按钮

3. **执行部署**：
   ```bash
   chmod +x scripts/deploy-gitee.sh
   ./scripts/deploy-gitee.sh
   ```

4. **更新页面**：
   - 每次代码更新后，需要在 Gitee Pages 设置页面点击 "更新" 按钮

### Coding Pages 部署

#### 1. 配置构建

同样修改 `vite.config.ts` 的 base 路径：

```typescript
export default defineConfig({
  // ...其他配置
  base: '/puzzle-tool/', // Coding 项目名
})
```

#### 2. 创建部署脚本

创建 `scripts/deploy-coding.sh`：

```bash
#!/usr/bin/env bash

echo "🚀 开始部署到 Coding Pages..."

# 构建项目
npm run build

# 进入构建目录
cd dist

# 初始化并推送
git init
git add -A
git commit -m 'deploy: 部署到 Coding Pages'

# 推送到 Coding Pages
# 替换为你的 Coding 仓库地址
git push -f https://e.coding.net/yourusername/puzzle-tool.git master:coding-pages

echo "✅ 部署完成！"
echo "🌐 访问地址: https://yourusername.coding.me/puzzle-tool"

cd ..
```

#### 3. 部署步骤

1. **创建 Coding 项目**并上传代码
2. **开启静态网站功能**：
   - 进入项目 → "持续部署" → "静态网站"
   - 选择分支 `coding-pages`
   - 设置构建目录为根目录
3. **执行部署脚本**：
   ```bash
   chmod +x scripts/deploy-coding.sh
   ./scripts/deploy-coding.sh
   ```

---

## 传统 Vue 项目部署

### Nginx 部署

#### 1. 构建项目

```bash
npm run build
```

#### 2. Nginx 配置

创建 `/etc/nginx/sites-available/puzzle-tool`：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/puzzle-tool;
    index index.html;

    # 启用 gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 处理前端路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 安全头部
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
}
```

#### 3. 部署脚本

创建 `scripts/deploy-nginx.sh`：

```bash
#!/usr/bin/env bash

echo "🚀 开始部署到 Nginx 服务器..."

# 构建项目
npm run build

# 上传到服务器 (需要配置 SSH 密钥)
rsync -avz --delete dist/ user@your-server:/var/www/puzzle-tool/

# 重新加载 Nginx 配置
ssh user@your-server "sudo nginx -t && sudo systemctl reload nginx"

echo "✅ 部署完成！"
echo "🌐 访问地址: http://your-domain.com"
```

### Apache 部署

#### 1. Apache 配置

创建 `.htaccess` 文件到 `public/` 目录：

```apache
RewriteEngine On
RewriteBase /

# 处理前端路由
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# 启用压缩
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# 缓存设置
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>
```

### Node.js 服务器部署

创建简单的 Express 服务器 `server.js`：

```javascript
const express = require('express')
const path = require('path')
const history = require('connect-history-api-fallback')

const app = express()
const port = process.env.PORT || 3000

// 处理前端路由
app.use(history({
  rewrites: [
    { from: /^\/api\/.*$/, to: function(context) {
      return context.parsedUrl.pathname;
    }}
  ]
}))

// 静态文件服务
app.use(express.static(path.join(__dirname, 'dist')))

// 安全头部
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  next()
})

app.listen(port, () => {
  console.log(`🚀 拼图工具运行在: http://localhost:${port}`)
})
```

部署脚本 `scripts/deploy-node.sh`：

```bash
#!/usr/bin/env bash

echo "🚀 开始部署到 Node.js 服务器..."

# 安装 Node.js 依赖
npm install express connect-history-api-fallback

# 构建项目
npm run build

# 启动服务器
pm2 stop puzzle-tool 2>/dev/null || true
pm2 start server.js --name puzzle-tool

echo "✅ 部署完成！"
echo "🌐 访问地址: http://localhost:3000"
```

---

## Docker 部署

### Dockerfile

创建 `Dockerfile`：

```dockerfile
# 构建阶段
FROM node:20-alpine as build-stage

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建项目
RUN npm run build

# 生产阶段
FROM nginx:stable-alpine as production-stage

# 复制构建结果
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Nginx 配置文件

创建 `nginx.conf`：

```nginx
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 处理前端路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Docker Compose

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  puzzle-tool:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
```

### 部署命令

```bash
# 构建镜像
docker build -t puzzle-tool .

# 运行容器
docker run -d -p 8080:80 --name puzzle-tool puzzle-tool

# 或者使用 docker-compose
docker-compose up -d
```

---

## CDN 加速优化

### 1. 配置 CDN 资源

修改 `vite.config.ts`：

```typescript
export default defineConfig({
  // ...其他配置
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        return `https://cdn.example.com/puzzle-tool/${filename}`
      }
      return { relative: true }
    }
  }
})
```

### 2. 分离第三方库

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      external: ['vue', 'pinia'],
      output: {
        globals: {
          vue: 'Vue',
          pinia: 'Pinia'
        }
      }
    }
  }
})
```

在 `index.html` 中引入 CDN：

```html
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
<script src="https://unpkg.com/pinia@2/dist/pinia.iife.js"></script>
```

---

## 常见问题

### 1. 路由 404 问题

**问题**: 刷新页面或直接访问路由时出现 404

**解决**: 确保服务器配置了 fallback 到 `index.html`

### 2. 静态资源路径错误

**问题**: CSS、JS 文件加载失败

**解决**: 检查 `vite.config.ts` 中的 `base` 配置是否正确

### 3. Gitee Pages 更新不及时

**问题**: 代码更新后页面没有变化

**解决**:
- 在 Gitee Pages 设置中手动点击"更新"
- 清除浏览器缓存

### 4. 跨域问题

**问题**: API 请求失败

**解决**: 配置服务器 CORS 或使用代理

```nginx
# Nginx 配置
add_header Access-Control-Allow-Origin *;
add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
add_header Access-Control-Allow-Headers 'DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type';
```

### 5. 大文件加载慢

**解决**:
- 启用 Gzip 压缩
- 配置 CDN 加速
- 使用图片压缩

---

## 部署清单

部署前请确保：

- [ ] 代码已通过所有测试
- [ ] 已运行 `npm run lint` 和 `npm run type-check`
- [ ] 已配置正确的 `base` 路径
- [ ] 已备份重要数据
- [ ] 已配置服务器安全设置
- [ ] 已设置监控和日志

---

## 支持与反馈

如果在部署过程中遇到问题，请：

1. 查看控制台错误信息
2. 检查服务器日志
3. 验证网络连接
4. 联系技术支持

祝您部署顺利！ 🚀