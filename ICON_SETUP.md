# 图标设置说明

## 当前状态

我已经为 TEN VAD Web 创建了新的图标：

1. **SVG 图标** (`public/favicon.svg`) - 现代浏览器支持
2. **图标转换工具** (`convert-icon.html`) - 可以在浏览器中预览和下载图标
3. **Node.js 脚本** (`generate-icons.js`) - 可以生成 PNG 图标文件

## 使用方法

### 方法 1: 使用 SVG 图标（推荐）

当前已经配置使用 SVG 图标，现代浏览器会自动显示。SVG 图标具有以下优势：
- 矢量格式，在任何尺寸下都清晰
- 文件大小小
- 支持主题色变化

### 方法 2: 生成 PNG 图标

如果你需要 PNG 格式的图标，可以：

1. **使用浏览器工具**：
   - 打开 `convert-icon.html` 文件
   - 点击下载按钮获取不同尺寸的 PNG 图标
   - 将下载的文件重命名并放到 `public/` 目录

2. **使用 Node.js 脚本**：
   ```bash
   # 安装 canvas 依赖
   npm install canvas
   
   # 运行生成脚本
   node generate-icons.js
   ```

## 图标设计

新图标包含以下元素：
- **紫色圆形背景** (#7c3aed) - 与应用主题色一致
- **白色麦克风** - 代表语音输入
- **声波线** - 代表音频处理
- **彩色指示点** - 红色表示语音检测，绿色表示静音

## 文件说明

- `public/favicon.svg` - 新的 SVG 图标
- `public/icon.svg` - 512x512 版本的 SVG 图标
- `convert-icon.html` - 浏览器图标转换工具
- `generate-icons.js` - Node.js 图标生成脚本

## 更新内容

- ✅ 更新了 `index.html` 使用新的 SVG 图标
- ✅ 更新了主题色为紫色 (#7c3aed)
- ✅ 更新了页面描述
- ✅ 创建了图标转换工具

现在你的应用已经有了新的专业图标！ 