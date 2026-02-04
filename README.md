# Mind Dump

> **"将流逝的时间，堆叠成可触的成就 —— 让每一天都掷地有声。"**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)
![React](https://img.shields.io/badge/React-19.0-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6.svg)

### 🔗 [点击体验 Mind Dump 在线版](https://mind-dump-pi.vercel.app/)

---

## 📖 项目简介

**Mind Dump** 是一个探索「时间可视化」的实验性项目。它的核心理念是将抽象的“任务完成”转化为具象的“物理堆叠”。

在日常工作中，我们完成的任务往往随着时间的流逝而消散。Mind Dump 允许你在完成任务后，将其“揉成”一个纸团丢入虚拟的垃圾桶中。利用物理引擎，这些纸团会真实地碰撞、堆叠。到了晚上，看着满屏幕的纸团，你会获得一种直观的成就感 —— “今天没有白过”。

此外，项目集成了 **DeepSeek AI** 作为你的“时光合伙人”和“灵魂镜像”。它不仅仅是简单的自动回复，而是通过“思维树决策模型”分析你的情绪与状态，提供深层的接纳、现实的锚点或幽默的调侃。

## 🏗 技术架构

本项目采用现代化的前后端分离架构（Serverless 模式）：

### 数据流向
1.  **用户交互**: 用户在前端输入任务内容并“丢弃”。
2.  **物理模拟**: 前端利用 `Matter.js` 实时解算纸团的物理运动（重力、碰撞、摩擦）。
3.  **AI 交互**:
    *   前端将任务内容发送至 `/api/chat`。
    *   后端 (Vercel Edge Function) 接收请求，构建 Prompt（包含思维树决策模型）。
    *   调用 **DeepSeek API** 获取智能回复。
    *   AI 的回复（颜色、文案）被回传给前端，渲染在纸团或界面上。

### 技术栈
*   **前端**:
    *   React 19 + TypeScript
    *   Vite (构建工具)
    *   Tailwind CSS (新野兽派设计风格)
    *   Matter.js (2D 物理引擎)
    *   Framer Motion (动画库)
*   **后端**:
    *   Node.js / Vercel Serverless Functions
*   **人工智能**:
    *   DeepSeek API (大语言模型)

## 📺 演示视频
<video src="https://github.com/user-attachments/assets/4312d578-fca8-4a33-946f-418a4a448c81" controls="controls" width="100%" style="max-width: 800px;"></video>


## ✅ 环境要求

在开始之前，请确保您的开发环境满足以下要求：

*   **Node.js**: >= 18.0.0
*   **包管理器**: npm, pnpm, 或 yarn
*   **API Key**: 一个有效的 DeepSeek API Key

## 🚀 安装与运行

### 1. 克隆仓库
```bash
git clone https://github.com/your-username/mind-dump.git
cd mind-dump
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境
在项目根目录下创建一个 `.env` 文件，并添加以下配置（参考配置说明章节）：
```bash
cp .env.example .env # 如果有示例文件
# 或者直接新建 .env
```

### 4. 启动开发服务器
```bash
npm run dev
```
启动后，访问 `http://localhost:5173` 即可体验。

## ⚙️ 配置说明

项目主要依赖环境变量来配置 AI 服务。请在根目录下创建 `.env` 文件：

| 变量名 | 描述 | 是否必须 |
| :--- | :--- | :--- |
| `DEEPSEEK_API_KEY` | DeepSeek 平台的 API 密钥，用于驱动 AI 回复功能 | 是 |

> **注意**: 请勿将包含真实 API Key 的 `.env` 文件提交到版本控制系统中。

## 📄 开源协议

本项目采用 [MIT License](LICENSE) 开源协议。
