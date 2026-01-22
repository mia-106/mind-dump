# Mind Dump

## 每日事项可视化堆叠器 (Daily Task Visualizer)

> "将流逝的时间，堆叠成可触的成就 —— 让每一天都掷地有声。"

[在线演示](#) | [报告问题](#) | [功能建议](#)

---

## 关于项目

Mind Dump 是一个探索「时间可视化」的实验性项目。

灵感来源于番茄钟的小物件堆叠功能 —— 当完成一段时间的专注，就会获得一个小物件放在主页，看着小物件慢慢堆叠起来很有成就感。但有一个问题：很多时候我在做事情时没有使用番茄钟，导致这一天很多事情没有被记录起来。

于是我产生了这个想法：做一个小软件来记录每天做了什么事情，然后通过堆叠的方式可视化今天干了什么。

你可以在做完这件事情后丢下一个纸团，也可以到了晚上把做的事情全部丢下去 —— 这样就有一种"今天也干了很多事情，没有白干"的感觉。

### 设计哲学

- **交互哲学**：用 Matter.js 物理引擎赋予事项实体感，碰撞与堆积模拟真实世界的积累体验
- **时间感知**：为每件事添加时间标签，让"干了多久"变得具象可感
- **灵活记录**：支持实时记录与批量回溯，不强制任何工作流
- **设计语言**："Lil." Style × Neo-Brutalism（新野兽派），高饱和色 (#F4D03F) + 硬阴影，粗粝而温暖

---

## 技术栈

### 前端
- **React 18** + **TypeScript** - 类型安全的前端开发
- **Vite** - 极速开发与构建体验
- **Tailwind CSS** - 原子化 CSS，快速构建设计系统
- **Matter.js** - 2D 物理引擎，赋予纸团重力与碰撞

### 后端
- **Vercel Edge Functions** - Serverless API，全球边缘计算

### 开发工具
- **ESLint** + **Prettier** - 代码质量保障
- **Husky** + **lint-staged** - Git Hooks 自动化

---

## 核心亮点

- **物理化记录** - 输入事项 + 时间 → 生成纸团 → 物理碰撞与堆积，每一次记录都有反馈
- **时间标签** - 为每件事记录耗时，让投入的时间一目了然
- **灵活的记录方式** - 实时记录 or 批量回溯，不改变你的工作习惯
- **成就可视化** - 看着纸团慢慢堆叠，感受一天的充实
- **日历审计** - 将每日事项聚合，回溯与自我觉察
- **Neo-Brutalism 设计** - 硬朗线条 + 高饱和色，温暖而有力

---

## 快速开始

### 前置要求

- Node.js >= 18
- npm / pnpm / yarn

### 安装

```bash
# Clone the repository
git clone https://github.com/yourusername/mind-dump.git
cd mind-dump

# Install dependencies
npm install

# Start development server
npm run dev
```

### 构建与部署

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 路线图

- [ ] 事项分类/标签系统
- [ ] 时间统计与图表
- [ ] 多天数据对比
- [ ] 数据导出功能
- [ ] 移动端手势优化

---

## 许可证

基于 MIT 许可证发布。详见 `LICENSE` 文件。

---

## 致谢

- [Matter.js](https://brm.io/matter-js/) - 2D 物理引擎
- [Vercel](https://vercel.com/) - 部署平台
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架

---

