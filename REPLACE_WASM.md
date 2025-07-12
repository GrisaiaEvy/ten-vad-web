# 替换 WASM 文件说明

## 当前状态

目前项目使用的是占位符 WASM 模块，用于测试和演示。要使用真实的 TEN VAD 功能，需要替换以下文件：

## 需要替换的文件

```
public/wasm/
├── ten_vad.js    ← 替换为真实的 Emscripten 生成的 JS 文件
└── ten_vad.wasm  ← 替换为真实的 WASM 二进制文件
```

## 替换步骤

### 1. 获取真实的 WASM 文件

从你的 TEN VAD 项目获取编译好的 WASM 文件：

```bash
# 假设你的 TEN VAD 项目在 ../lib/Web/ 目录
cp ../lib/Web/ten_vad.js public/wasm/
cp ../lib/Web/ten_vad.wasm public/wasm/
```

### 2. 验证文件

确保文件正确放置后，重启开发服务器：

```bash
npm start
```

### 3. 检查状态

在应用界面中，你应该看到：
- ✅ VAD Module Loaded (而不是 ⚠️ Using Placeholder Module)
- 真实的 VAD 版本号

## 文件要求

### ten_vad.js
- 必须是 Emscripten 生成的浏览器兼容版本
- 必须导出 `createVADModule` 函数
- 必须支持 ES 模块导入

### ten_vad.wasm
- 必须是有效的 WebAssembly 二进制文件
- 必须包含所有必需的 VAD 函数

## 验证功能

替换文件后，测试以下功能：

1. **模块加载**: 检查控制台是否有错误
2. **文件上传**: 上传 WAV 文件测试 VAD 处理
3. **结果查看**: 查看处理结果是否合理

## 故障排除

### 模块加载失败
- 检查文件路径和权限
- 确认文件格式正确
- 查看浏览器控制台错误

### VAD 处理失败
- 确认 WASM 文件包含所有必需函数
- 检查音频格式是否符合要求
- 查看控制台错误信息

## 注意事项

- 占位符模块仅用于测试，不会进行真实的语音检测
- 真实模块需要正确的音频格式和参数
- 建议使用 16kHz, 16-bit, 单声道 WAV 文件 