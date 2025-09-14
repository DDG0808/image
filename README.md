# 🧩 在线拼图工具



一个功能强大的在线图片拼图工具，支持多种布局模板和自定义参数调整。

[![在线演示](https://img.shields.io/badge/在线演示-立即体验-brightgreen)](https://image.orm.li/)

## ✨ 特性

- 🎨 **多种模板**：支持2-5张图片的30+种布局模板
- 🖼️ **图片上传**：支持拖拽上传，多格式支持(JPG/PNG/WebP/GIF)
- 🎛️ **参数调整**：间距、圆角、背景颜色等实时调整
- 📱 **响应式设计**：完美适配桌面端和移动端
- 🔒 **隐私保护**：所有处理在本地完成，不上传服务器
- ⚡ **高性能**：基于Canvas的高效渲染引擎
- 💾 **多格式导出**：支持PNG/JPG等格式，多种分辨率选择

## 🛠️ 技术栈

- **前端框架**: Vue 3 + TypeScript
- **状态管理**: Pinia
- **UI 组件**: Tailwind CSS + Headless UI
- **构建工具**: Vite
- **图片处理**: Canvas API + html2canvas

## 🚀 快速开始

### 环境要求

- Node.js >= 20.19.0 || >= 22.12.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 代码检查

```bash
npm run lint
```

### 代码格式化

```bash
npm run format
```

### 类型检查

```bash
npm run type-check
```

## 📁 项目结构

```
src/
├── components/           # 组件目录
│   ├── ui/              # 通用UI组件
│   ├── TemplateSelector/ # 模板选择器
│   ├── Canvas/          # 画布组件
│   ├── ParameterPanel/  # 参数调整面板
│   └── ImageUploader/   # 图片上传组件
├── composables/         # 组合式函数
├── stores/             # Pinia状态管理
├── types/              # TypeScript类型定义
├── utils/              # 工具函数
├── assets/             # 静态资源
└── views/              # 页面视图
```

## 📖 文档导航

### 🔧 开发相关
- **[快速测试指南](puzzle-tool/QUICK_TEST.md)** - 快速验证功能是否正常工作
- **[调试指南](puzzle-tool/DEBUG_GUIDE.md)** - 详细的问题诊断和调试方法

### 🚀 部署相关
- **[快速部署](puzzle-tool/QUICK_DEPLOY.md)** - 3种常用部署方式的快速指南
- **[完整部署文档](puzzle-tool/DEPLOYMENT.md)** - 详细的部署说明和配置指南

### 📋 项目文档
- **[产品需求文档](在线拼图工具产品需求文档（PRD）.md)** - 完整的产品需求和设计说明

## 🎯 使用指南

### 1. 选择模板
- 选择需要的图片数量（2-5张）
- 从可用模板中选择合适的布局

### 2. 上传图片
- 点击上传区域选择图片
- 支持拖拽批量上传

### 3. 编辑调整
- 实时预览拼图效果
- 调整间距、圆角等参数

### 4. 导出保存
- 选择导出格式和质量
- 一键下载到本地

💡 **提示**: 这个工具完全在浏览器中运行，您的图片不会上传到任何服务器，确保了完全的隐私保护。

## 🐳 Docker 部署

项目提供了完整的 Docker 配置：

```bash
# 进入项目目录
cd puzzle-tool

# 使用 docker-compose 快速启动
docker-compose up -d

# 访问应用
open http://localhost:8080
```

## 🛠️ 开发工具

### 推荐的 VS Code 插件
- Vue Language Features (Volar)
- TypeScript Vue Plugin (Volar)
- Tailwind CSS IntelliSense
- ESLint
- Prettier

### 调试工具
- Vue.js devtools
- 详细的控制台日志系统
- 完整的错误追踪机制

遇到问题？查看 **[调试指南](puzzle-tool/DEBUG_GUIDE.md)** 获取帮助。

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证。

---

<div align="center">

**🎨 让创意无界限，让拼图更简单 🧩**

</div>
