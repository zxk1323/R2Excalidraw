# Excalidraw R2 Sync

Chrome 浏览器扩展，用于将 Excalidraw.com 的绘图数据同步到 Cloudflare R2 存储。

## 功能特性

- ✅ **上传功能**: 从 Excalidraw 页面提取 localStorage 数据并上传到 R2
- ✅ **下载功能**: 从 R2 下载数据并恢复到 Excalidraw 页面
- ✅ **配置管理**: 安全的凭证存储和连接测试
- ✅ **Manifest V3**: 符合最新的 Chrome 扩展规范

## 开发

### 安装依赖

```bash
npm install
```

### 构建项目

```bash
npm run build
```

构建输出在 `dist/` 目录。

### 开发模式（监听文件变化）

```bash
npm run dev
```

## 安装到 Chrome

1. 构建项目: `npm run build`
2. 打开 Chrome，访问 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `dist/` 目录

## 使用说明

1. **配置 R2 凭证**:
   - 点击扩展图标，选择"打开设置"
   - 填写您的 Cloudflare R2 配置信息：
     - R2 Endpoint URL (例如: `https://<accountid>.r2.cloudflarestorage.com`)
     - Bucket Name
     - Access Key ID
     - Secret Access Key
   - 点击"测试连接"验证配置
   - 点击"保存配置"

2. **上传数据**:
   - 在 Excalidraw.com 打开您的绘图
   - 点击扩展图标
   - 点击"上传到 R2"按钮

3. **下载数据**:
   - 在 Excalidraw.com 打开任意页面
   - 点击扩展图标
   - 点击"从 R2 下载"按钮
   - 页面会自动刷新并加载云端数据

## 技术栈

- **构建工具**: Vite
- **SDK**: @aws-sdk/client-s3
- **扩展规范**: Manifest V3
- **语言**: 原生 JavaScript (ES Modules)

## 项目结构

```
.
├── src/
│   ├── popup/          # 弹出窗口界面
│   ├── options/        # 设置页面
│   ├── content/        # 内容脚本
│   ├── background/     # 后台服务
│   └── utils/          # 工具函数 (R2 集成)
├── icons/              # 扩展图标
├── manifest.json       # 扩展清单
├── vite.config.js      # Vite 配置
└── package.json
```

## 注意事项

- 确保您的 R2 Bucket 已正确配置 CORS（如果需要）
- 凭证信息存储在 `chrome.storage.sync` 中，仅同步到您的 Chrome 账户
- 上传的文件名为 `excalidraw-backup.json`

## 许可证

ISC

