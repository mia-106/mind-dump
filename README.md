# Mind Dump

## 治愈系 AI 情绪物理废纸篓 (The Healing AI Trash Bin)

> "将无形的情绪，丢进有形的废纸篓 —— 让每一次倾诉都落地有声。"

[Live Demo](#) | [Report Bug](#) | [Request Feature](#)

---

## 关于项目

Mind Dump 是一个探索「交互式情绪疗愈」的实验性项目。

我们将抽象的「情绪」通过 2D 物理引擎转化为具备重力、碰撞感的「实体纸团」。当你输入文字并点击丢弃时，情绪不再是转瞬即逝的念头，而是一个可以被看见、被触摸、被堆积的物理对象。

项目践行 **「当下的力量」** —— 不追悔过去，不焦虑未来，只专注于此刻的情绪释放。

### 设计哲学

- **交互哲学**：用 Matter.js 物理引擎赋予情绪实体感，碰撞与堆积模拟真实世界的释放体验
- **设计语言**："Lil." Style × Neo-Brutalism（新野兽派），高饱和色 (#F4D03F) + 硬阴影，粗粝而温暖
- **体验优先**：丢弃情绪 0 延时，AI 治愈异步送达，惊喜感与即时感并存

---

## Tech Stack

### Frontend
- **React 18** + **TypeScript** - 类型安全的前端开发
- **Vite** - 极速开发与构建体验
- **Tailwind CSS** - 原子化 CSS，快速构建设计系统
- **Matter.js** - 2D 物理引擎，赋予情绪重力与碰撞

### Backend
- **Vercel Edge Functions** - Serverless API，全球边缘计算
- **DeepSeek API** - 基于 Tree of Thoughts 的治愈对话

### DevOps
- **ESLint** + **Prettier** - 代码质量保障
- **Husky** + **lint-staged** - Git Hooks 自动化

---

## 核心亮点

- **物理化书写** - 输入情绪 → 生成纸团 → 物理碰撞与堆积，每一次丢弃都有反馈
- **AI 治愈 (Thinking Chain)** - 基于「思维树 (Tree of Thoughts)」的 AI 角色，提供有温度的心理支持
- **延迟加载机制** - 「丢弃 0 延时」与「AI 回复惊喜感」的体验分流，让释放不被等待打断
- **日历审计** - 将碎片化情绪聚合为结构化的情感光谱，回溯与自我觉察
- **Neo-Brutalism 设计** - 硬朗线条 + 高饱和色，打破传统疗愈产品的柔和刻板印象

---

## Getting Started

### Prerequisites

- Node.js >= 18
- npm / pnpm / yarn
- DeepSeek API Key

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/mind-dump.git
cd mind-dump

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

创建 `.env.local` 文件并配置：

```env
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

### Build & Deploy

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Roadmap

- [ ] 情绪标签系统
- [ ] 多语言支持
- [ ] 移动端手势优化
- [ ] 情绪数据导出
- [ ] 社区匿名分享

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

## Acknowledgments

- [Matter.js](https://brm.io/matter-js/) - 2D 物理引擎
- [Vercel](https://vercel.com/) - 部署平台
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架

---

*Built with craft by a fellow builder. Let's make something meaningful.*
