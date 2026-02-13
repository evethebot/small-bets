#!/usr/bin/env tsx
/**
 * Small Bets Fast Discovery 🔍
 * 
 * 快速版选品：用 fetch 抓 Chrome Web Store 搜索结果
 * 不开浏览器，速度快 10x
 */

const KEYWORDS = [
  // AI 工具 - 当前最热
  'ai writer', 'ai summarizer', 'ai translator', 'ai grammar checker',
  'ai screenshot to code', 'ai email writer', 'ai tab organizer',
  'chatgpt sidebar', 'ai bookmark', 'ai readability',
  // 生产力
  'tab manager', 'screenshot tool', 'screen recorder',
  'clipboard manager', 'read later', 'speed reader',
  'focus mode', 'website blocker', 'new tab',
  // 开发者工具
  'json formatter', 'api tester', 'color picker', 'css inspector',
  'regex tester', 'github enhancer', 'web scraper',
  // 内容/社交
  'youtube summary', 'twitter tools', 'linkedin assistant',
  'video speed controller', 'picture in picture',
  // 实用工具
  'dark mode', 'price tracker', 'coupon finder',
  'qr code generator', 'text to speech', 'translate page',
];

interface ExtensionResult {
  keyword: string;
  totalResults: number;
  topExtensions: {
    name: string;
    id: string;
    rating: number;
    ratingCount: number;
    users: string;
    category: string;
  }[];
}

interface ScoredOpportunity {
  keyword: string;
  score: number;
  difficulty: 'easy' | 'medium' | 'hard';
  reason: string;
  topCompetitor: string;
  competitorRating: number;
  competitorUsers: string;
  gap: string;
  suggestedType: 'chrome-extension' | 'web-saas' | 'both';
  monetization: string;
}

// Chrome Web Store 内部 API
async function searchChromeStore(keyword: string): Promise<ExtensionResult> {
  // 用 Google 搜索 Chrome Web Store 结果
  const url = `https://chrome.google.com/webstore/search/${encodeURIComponent(keyword)}?hl=en&_category=extensions`;
  
  try {
    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    });
    
    const html = await resp.text();
    
    // 从 HTML 中提取扩展信息 (简单 regex)
    const nameMatches = html.match(/<h2[^>]*>([^<]+)<\/h2>/g) || [];
    const names = nameMatches.map(m => m.replace(/<[^>]+>/g, '').trim()).filter(n => n.length > 2);
    
    return {
      keyword,
      totalResults: names.length,
      topExtensions: names.slice(0, 5).map(name => ({
        name,
        id: '',
        rating: 0,
        ratingCount: 0,
        users: 'unknown',
        category: 'unknown',
      })),
    };
  } catch (e) {
    return { keyword, totalResults: 0, topExtensions: [] };
  }
}

// 评分逻辑
function scoreKeyword(keyword: string, result: ExtensionResult): ScoredOpportunity {
  let score = 50;
  let reasons: string[] = [];
  
  // 竞争度评估
  if (result.totalResults <= 2) {
    score += 25;
    reasons.push('极少竞品');
  } else if (result.totalResults <= 5) {
    score += 15;
    reasons.push('竞品较少');
  } else if (result.totalResults > 10) {
    score -= 10;
    reasons.push('竞品较多');
  }
  
  // AI 类关键词热度加成
  if (keyword.toLowerCase().includes('ai')) {
    score += 15;
    reasons.push('AI热点赛道');
  }
  
  // 生产力工具付费意愿高
  const highPayKeywords = ['manager', 'tracker', 'recorder', 'blocker', 'organizer', 'assistant'];
  if (highPayKeywords.some(k => keyword.includes(k))) {
    score += 10;
    reasons.push('付费意愿高品类');
  }
  
  // 开发难度评估
  const easyKeywords = ['formatter', 'generator', 'picker', 'converter', 'dark mode', 'new tab'];
  const hardKeywords = ['recorder', 'scraper', 'vpn', 'password'];
  
  let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
  if (easyKeywords.some(k => keyword.includes(k))) {
    difficulty = 'easy';
    score += 10;
    reasons.push('开发简单');
  } else if (hardKeywords.some(k => keyword.includes(k))) {
    difficulty = 'hard';
    score -= 5;
    reasons.push('开发复杂');
  }
  
  // 判断适合的产品类型
  const webSaasKeywords = ['tracker', 'reader', 'manager', 'organizer'];
  const chromeOnlyKeywords = ['tab', 'dark mode', 'new tab', 'picture in picture', 'speed controller'];
  
  let suggestedType: 'chrome-extension' | 'web-saas' | 'both' = 'chrome-extension';
  if (webSaasKeywords.some(k => keyword.includes(k))) {
    suggestedType = 'both';
  }
  if (chromeOnlyKeywords.some(k => keyword.includes(k))) {
    suggestedType = 'chrome-extension';
  }
  
  // 变现方式
  let monetization = 'Freemium + 月订阅 $3.99';
  if (keyword.includes('ai')) {
    monetization = 'API 用量限制 + Pro 订阅 $9.99/月';
  } else if (difficulty === 'easy') {
    monetization = '一次性买断 $4.99 或 Pro 解锁 $2.99/月';
  }
  
  const topComp = result.topExtensions[0];
  
  return {
    keyword,
    score: Math.max(0, Math.min(100, score)),
    difficulty,
    reason: reasons.join(' | '),
    topCompetitor: topComp?.name || 'N/A',
    competitorRating: topComp?.rating || 0,
    competitorUsers: topComp?.users || 'unknown',
    gap: analyzeGap(keyword),
    suggestedType,
    monetization,
  };
}

function analyzeGap(keyword: string): string {
  // 基于关键词分析可能的差异化方向
  const gaps: Record<string, string> = {
    'ai writer': '专注特定场景(邮件/推文/简历)，而非通用写作',
    'ai summarizer': '支持更多格式(PDF/YouTube/播客)，输出更结构化',
    'ai translator': '侧栏实时翻译 + 双语对照，而非整页替换',
    'ai grammar checker': '轻量免费版抢 Grammarly 低端用户',
    'ai screenshot to code': 'Screenshot → 可编辑 HTML/React 代码',
    'ai email writer': '一键生成+直接插入 Gmail/Outlook',
    'ai tab organizer': 'AI 自动分组 + 节省内存 + 搜索历史',
    'chatgpt sidebar': '多模型切换(GPT/Claude/Gemini) + 页面上下文',
    'ai bookmark': 'AI 自动打标签 + 语义搜索书签',
    'ai readability': 'AI 精简文章 + 阅读时间估算 + TTS',
    'tab manager': '树形标签页 + 工作区切换 + 同步',
    'screenshot tool': '滚动截图 + 标注 + 一键分享',
    'clipboard manager': '跨设备同步 + 搜索历史 + 分类',
    'read later': '离线阅读 + AI 摘要 + 高亮笔记',
    'json formatter': '支持 JSONPath 查询 + diff 对比 + 转换器',
    'youtube summary': 'AI 章节总结 + 关键时刻跳转 + 笔记',
    'dark mode': '自适应暗色 + 网站级自定义 + 时间表',
    'price tracker': '价格历史图 + 降价提醒 + 跨站比价',
    'qr code generator': '批量生成 + 样式自定义 + 短链追踪',
  };
  
  return gaps[keyword] || '做更好的 UI/UX + 更快的性能 + 免费基础版';
}

// ==================== MAIN ====================

async function main() {
  console.log('🔍 Small Bets Fast Discovery\n');
  console.log(`Scanning ${KEYWORDS.length} keywords...\n`);
  
  const results: ScoredOpportunity[] = [];
  
  for (let i = 0; i < KEYWORDS.length; i++) {
    const kw = KEYWORDS[i];
    process.stdout.write(`[${i + 1}/${KEYWORDS.length}] ${kw}...`);
    
    const storeResult = await searchChromeStore(kw);
    const scored = scoreKeyword(kw, storeResult);
    results.push(scored);
    
    console.log(` → ${scored.score}pts (${scored.difficulty})`);
    
    // 小延迟防封
    await new Promise(r => setTimeout(r, 500));
  }
  
  // 排序
  results.sort((a, b) => b.score - a.score);
  
  // 输出 Top 15
  console.log('\n\n🏆 TOP 15 OPPORTUNITIES\n');
  console.log('='.repeat(80));
  
  results.slice(0, 15).forEach((r, i) => {
    console.log(`\n${i + 1}. 【${r.score}分】${r.keyword}`);
    console.log(`   类型: ${r.suggestedType} | 难度: ${r.difficulty} | 变现: ${r.monetization}`);
    console.log(`   差异化: ${r.gap}`);
    console.log(`   评分理由: ${r.reason}`);
  });
  
  // 保存完整结果
  const outputPath = new URL('../candidates.json', import.meta.url).pathname;
  const fs = await import('fs');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n\n📄 完整结果已保存: candidates.json`);
  
  // 输出推荐的第一批产品
  const topPicks = results.filter(r => r.score >= 65 && r.difficulty !== 'hard').slice(0, 5);
  console.log('\n\n🎯 推荐首批开发 (高分+易做):\n');
  topPicks.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.keyword} → ${p.suggestedType}`);
    console.log(`     ${p.gap}`);
    console.log(`     ${p.monetization}\n`);
  });
}

main().catch(console.error);
