# Small Bets Factory 🎰

全自动化 App 工厂，基于 Max 的"小赌注"工作流。

## 架构

```
small-bets/
├── templates/           # 产品模板（一键生成）
│   ├── chrome-extension/  # Chrome 扩展 boilerplate
│   └── web-saas/          # Web SaaS boilerplate
├── scripts/             # 自动化脚本
│   ├── discover.ts        # 选品机器人
│   ├── generate.ts        # 一键生成项目
│   ├── deploy.ts          # 一键部署
│   └── analytics.ts       # 数据看板
├── products/            # 生成的产品（每个子目录一个产品）
└── docs/                # 文档
    └── workflow.md        # 工作流详解
```

## 工作流（5 步）

### Step 1: 选品 🔍
```bash
pnpm run discover
```
自动抓取 Chrome Web Store / Product Hunt 数据，输出候选清单。

### Step 2: 生成 ⚡
```bash
pnpm run generate --type chrome --name "AI Writer" --desc "AI writing assistant"
```
从模板一键生成完整项目。

### Step 3: 部署 🚀
```bash
pnpm run deploy --product ai-writer
```
自动构建 + 上线。

### Step 4: 分析 📊
```bash
pnpm run analytics
```
查看所有产品数据，自动标记 kill/double-down。

### Step 5: 复制 🔄
```bash
pnpm run clone --source ai-writer --name "AI Poet" --niche poetry
```
换皮复制赢家。

## 平台

- ✅ Chrome 扩展
- ✅ Web SaaS
- 🔜 iOS (React Native)

## 技术栈

- **Chrome 扩展**: Manifest V3 + Vite + React + Tailwind
- **Web SaaS**: Next.js 15 + Tailwind + Stripe + Supabase Auth
- **支付**: LemonSqueezy (Chrome) / Stripe (Web)
- **部署**: Vercel (Web) / Chrome Web Store API (扩展)
- **分析**: Plausible / Umami (自托管)
