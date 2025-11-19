#!/bin/bash

# Agent iHub 质量检查脚本
# 自动运行 lint、type-check 和 build

set -e  # 遇到错误立即退出

echo "🚀 Starting Agent iHub Quality Check..."
echo "======================================"

# 检查 Node.js 和 npm
echo "📋 Checking environment..."
node --version
npm --version
echo ""

# 安装依赖（如果需要）
echo "📦 Installing dependencies..."
npm ci
echo ""

# TypeScript 类型检查
echo "📝 Running TypeScript type checking..."
npm run type-check
echo "✅ Type checking passed!"
echo ""

# ESLint 检查
echo "🔍 Running ESLint..."
npm run lint
echo "✅ ESLint passed!"
echo ""

# Prettier 格式检查
echo "💅 Checking code formatting..."
npm run format:check
echo "✅ Code formatting is correct!"
echo ""


# 构建项目
echo "🏗️  Building project..."
npm run build
echo "✅ Build successful!"
echo ""

echo "🎉 All quality checks passed!"
echo "======================================"
echo "Your code is ready for commit/deployment! 🚀"