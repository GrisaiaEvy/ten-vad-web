#!/bin/bash

echo "🚀 Starting TEN VAD Web Demo..."
echo ""

# 检查 WASM 文件是否存在
if [ ! -f "public/wasm/ten_vad.js" ] || [ ! -f "public/wasm/ten_vad.wasm" ]; then
    echo "⚠️  警告: WASM 文件不存在或为占位符文件"
    echo "   请将实际的 ten_vad.js 和 ten_vad.wasm 文件放到 public/wasm/ 目录下"
    echo ""
fi

# 安装依赖
echo "📦 Installing dependencies..."
npm install

# 启动开发服务器
echo "🌐 Starting development server..."
echo "   应用将在 http://localhost:3000 启动"
echo "   按 Ctrl+C 停止服务器"
echo ""

npm start 