# 水象恋爱实验室

巨蟹 / 天蝎 / 双鱼 的聊天与恋爱教育指南。纯前端项目，内容全部以结构化数据存放，
前端只做检索与展示 —— 方便后续接搜索、CMS 或 AI 问答。

- **5 个教学模块**，21 个小节
- **39 条可复制话术**，按场景 + 星座双重筛选，支持一键复制与本地收藏
- 全站模糊检索（正文 + 话术），命中高亮、可深链到具体小节
- 深色水元素配色，mobile-first 响应式，中文排版优化

## 快速开始

> **需要 Node ≥ 22.22**（`react-router@8` 的 `engines` 要求，比 Vite 自身的下限更高）。
> 已写入 `package.json` 的 `engines` 字段，部署平台（Vercel / Netlify）会据此选择 Node 版本；
> 用 Node 20 会在安装/构建阶段直接失败。

```bash
npm install
npm run dev      # 开发服务器，默认 http://localhost:5173
npm run build    # 类型检查 + 生产构建，产物在 dist/
npm run preview  # 本地预览生产构建
```

> 开发服务器默认绑定 `localhost`。如果你的环境解析到 IPv6 回环，用
> `http://localhost:5173` 访问；`127.0.0.1` 可能连接被拒。

## 技术栈

| 用途 | 选型 | 版本 |
| --- | --- | --- |
| 构建 | Vite | 8.3 |
| 框架 | React + TypeScript | 19.3 / 7.0 |
| 样式 | Tailwind CSS（v4，CSS 内配置） | 4.3 |
| 路由 | react-router | 8.4 |
| 正文渲染 | react-markdown + remark-gfm | 10.1 / 4.0 |
| 排版 | @tailwindcss/typography | 0.5 |

两个容易踩的点：

- Tailwind v4 **没有** `tailwind.config.js` / `postcss.config.js`，主题写在
  `src/index.css` 的 `@theme` 块里，插件用 `@plugin` 引入。
- 路由包是 **`react-router`**，不是 `react-router-dom` —— 后者在 v8 已被移除，
  两个同时装会导致 React context 重复，运行时抛
  `useNavigate() may be used only in the context of a <Router>`。

## 目录结构

```
src/
├── components/          # Layout / Sidebar / SearchBar / TemplateCard / Markdown …
├── data/
│   ├── types.ts             # 全部类型 + 星座/场景元数据
│   ├── modules.ts           # 五个模块的正文（Markdown 字符串）
│   └── speech-templates.ts  # 话术模板库（结构化）
├── lib/
│   ├── search.ts            # 检索索引 + 模糊匹配 + 高亮
│   ├── favorites.ts         # 收藏（localStorage，模块级 store）
│   ├── useCopy.ts           # 复制到剪贴板
│   └── useActiveSection.ts  # 目录滚动联动
├── pages/               # Home / ModulePage / TemplatesPage / SearchPage / FavoritesPage
├── App.tsx              # 路由表
└── index.css            # @theme 设计令牌 + 基础样式
```

## 怎么加内容

### 加一个小节

在 `src/data/modules.ts` 对应模块的 `sections` 里追加：

```ts
{
  id: 'm2-new',                    // 全站唯一，用作锚点
  title: '小节标题',
  content: `
正文用 Markdown。支持 ### 小标题、**粗体**、- 列表、> 引用、表格。
`,
  zodiac: ['cancer', 'pisces'],    // 可选：该小节针对的星座
  keywords: ['补充检索词'],         // 可选：正文没出现但用户可能搜的词
  relatedTemplates: ['cold'],      // 可选：在此小节内联展示的话术场景
}
```

> ⚠️ 模板字符串里的正文**不要缩进** —— Markdown 会把 4 个空格以上的缩进当成代码块。

### 加一条话术

在 `src/data/speech-templates.ts` 里追加一条记录即可，模块页与话术库会自动带上：

```ts
{
  id: 'cold-7',
  scene: 'cold',                   // 见 SCENE_META
  text: '话术正文',
  zodiac: ['all'],                 // 'all' = 三座通用
  tags: ['关心代替指责'],
  why: '这句话为什么有效',
}
```

星座筛选的语义是「这条话术对某星座**是否适用**」，所以筛「巨蟹」时通用话术也会出现
（排在专属话术之后）。筛选器的「不限」= 不筛选，「通用」= 只看打了 `all` 标签的。

## 部署

Vercel / Netlify 直接导入仓库即可，构建命令 `npm run build`，产物目录 `dist`。

本项目是单页应用，**需要把未匹配的路径回退到 `index.html`**，否则直接访问
`/module/module-1` 会 404：

- **Vercel**：加 `vercel.json` → `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`
- **Netlify**：加 `public/_redirects` → `/*  /index.html  200`

部署到子路径（如 `https://example.com/water-sign/`）时，在 `vite.config.ts` 里设置
`base: '/water-sign/'`。

## 已知边界

- 收藏只存在浏览器 `localStorage`，换设备/清缓存即丢失，没有后端。
- 检索是内存线性扫描。内容量级在几百 KB 以内都够快；再大应换成预建索引（如 Fuse.js 或 Pagefind）。
- 内容仅供娱乐与自我觉察参考，不构成心理或情感咨询建议。
