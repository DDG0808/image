# 快速部署指南

选择适合你的部署方式：

## 🚀 方式一：Gitee Pages（推荐新手）

1. **修改配置**：
   ```bash
   # 编辑 vite.config.ts，设置正确的 base 路径
   base: '/你的仓库名/'
   ```

2. **一键部署**：
   ```bash
   # 修改脚本中的仓库地址
   vim scripts/deploy-gitee.sh

   # 执行部署
   ./scripts/deploy-gitee.sh
   ```

3. **启用 Pages**：
   - 进入 Gitee 仓库 → 服务 → Gitee Pages
   - 选择 `gh-pages` 分支
   - 点击启动

## 🐳 方式二：Docker（推荐生产环境）

```bash
# 构建并启动
docker-compose up -d

# 访问应用
open http://localhost:8080
```

## 🌐 方式三：传统服务器

```bash
# 部署到 Nginx 服务器
./scripts/deploy-nginx.sh 用户名 服务器地址

# 或者手动构建
npm run build
# 然后将 dist/ 目录内容上传到服务器
```

## 📋 部署前检查清单

- [ ] 已通过所有测试：`npm run type-check && npm run lint`
- [ ] 已配置正确的 base 路径（如果需要）
- [ ] 已设置正确的仓库地址或服务器信息
- [ ] 已备份重要数据（生产环境）

需要详细说明？请查看完整的 [DEPLOYMENT.md](./DEPLOYMENT.md)