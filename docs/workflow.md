# Small Bets Workflow 全自动化文档

## 来源
基于 B站视频《8个月开发28款App月入10万》中 Max 的工作流。

## 五步工作流

### Step 1: 机会发现 🔍
**原版**: ASO 工具（SensorTower, Astro）找 iOS 关键词
**我们的版本**: 
- Chrome Web Store 关键词扫描
- Product Hunt / Reddit 需求抓取
- 竞品评分+安装量分析
- 自动打分排序

**关键指标**:
- 搜索量尚可 + 竞争难度低 (<50)
- 竞品月收入 $200-$500 = 值得做
- 竞品评分低 (<4.0) = 有改进空间

### Step 2: 极速开发 ⚡
**原版**: 代码模板 + AI 编程 + MVP 原则
**我们的版本**:
- Chrome Extension boilerplate (Manifest V3 + React + Tailwind)
- Web SaaS boilerplate (Next.js + Stripe + Supabase)
- `generate.ts` 一键生成项目，替换占位符
- 开发周期目标: 1-3 天/产品

### Step 3: 上线变现 🚀
**原版**: 第一版就收费，App Store 自然流量
**我们的版本**:
- Chrome: LemonSqueezy 付费墙 (订阅/终身买断)
- Web: Stripe 订阅 (月付/年付/终身)
- `deploy.ts` 一键部署 (Vercel / Chrome Web Store)
- 自然流量: Chrome Web Store SEO / Product Hunt Launch

### Step 4: 决策分流 📊
**原版**: 80% 没量就扔, 20% 有量就加注
**我们的版本**:
- Plausible/Umami 自托管分析
- 7 天观察期自动报告
- 阈值:
  - DAU < 10 且 收入 = 0 → 冷藏
  - DAU > 50 或 收入 > $50 → 加注
  - 中间地带 → 再观察 7 天

### Step 5: 矩阵裂变 🔄
**原版**: 换 Prompt/数据库，同代码不同品类
**我们的版本**:
- `clone.ts` 一键换皮
- 替换品牌+文案+核心 Prompt
- 一个赢家 → 3-5 个变体

## 月度目标
- Month 1: 搭建基建 + 出 5-8 个产品
- Month 2: 数据驱动迭代 + 换皮复制赢家
- Month 3: 优化变现 + 扩展到新平台

## 成功标准
- 3 个月内: 至少 1 个产品月收入 > $200
- 6 个月内: 产品矩阵月收入 > $1000
