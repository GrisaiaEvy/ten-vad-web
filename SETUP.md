# 快速设置指南

## 🚀 快速开始

### 1. 准备 WASM 文件

将你的 TEN VAD WASM 文件放到正确位置：

```bash
# 将实际的 WASM 文件复制到项目目录
cp /path/to/your/ten_vad.js public/wasm/
cp /path/to/your/ten_vad.wasm public/wasm/
```

### 2. 启动项目

```bash
# 方法1: 使用启动脚本
./start.sh

# 方法2: 手动启动
npm install
npm start
```

### 3. 访问应用

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 📁 项目结构

```
ten-vad-web/
├── public/wasm/           # WASM 文件目录
│   ├── ten_vad.js        # ← 需要替换为实际文件
│   └── ten_vad.wasm      # ← 需要替换为实际文件
├── src/
│   ├── components/       # React 组件
│   ├── utils/           # 工具函数
│   └── wasm/            # WASM 相关代码
└── README.md            # 详细文档
```

## ⚠️ 重要提醒

1. **WASM 文件**: 当前 `public/wasm/` 目录下的文件是占位符，需要替换为实际的 TEN VAD WASM 文件
2. **音频格式**: 推荐使用 16kHz, 16-bit, 单声道 WAV 文件
3. **浏览器支持**: 确保浏览器支持 WebAssembly

## 🔧 故障排除

### WASM 加载失败
- 检查文件路径是否正确
- 确认文件名大小写
- 查看浏览器控制台错误信息

### 音频处理失败
- 确认音频格式符合要求
- 检查文件是否损坏
- 尝试使用较小的测试文件

## 📞 获取帮助

如果遇到问题，请：
1. 检查浏览器控制台错误信息
2. 确认 WASM 文件是否正确放置
3. 查看 README.md 获取详细文档 