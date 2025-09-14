# 多阶段构建 - 构建阶段
FROM node:20-alpine as build-stage

LABEL maintainer="Puzzle Tool Team"
LABEL description="拼图工具构建阶段"

WORKDIR /app

# 设置 npm 镜像（可选，提高国内构建速度）
RUN npm config set registry https://registry.npmmirror.com

# 复制 package 文件
COPY package*.json ./

# 安装构建依赖
RUN npm ci --only=production --silent

# 复制源代码
COPY . .

# 构建项目
RUN npm run type-check && \
    npm run lint && \
    npm run build

# 生产阶段
FROM nginx:stable-alpine as production-stage

LABEL maintainer="Puzzle Tool Team"
LABEL description="拼图工具生产环境"

# 安装必要工具
RUN apk --no-cache add curl

# 复制构建结果
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 创建健康检查脚本
RUN echo '#!/bin/sh' > /health-check.sh && \
    echo 'curl -f http://localhost/ || exit 1' >> /health-check.sh && \
    chmod +x /health-check.sh

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD ["/health-check.sh"]

# 暴露端口
EXPOSE 80

# 启动命令
CMD ["nginx", "-g", "daemon off;"]