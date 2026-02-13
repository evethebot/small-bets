/**
 * Small Bets Discovery Script 🔍
 * 
 * 自动发现 Chrome Web Store + Web SaaS 机会
 * 
 * 数据源:
 * 1. Chrome Web Store - 搜索关键词, 分析竞品评分/安装量/评论
 * 2. Product Hunt - 新上线产品, 找灵感
 * 3. Reddit - r/SideProject, r/InternetIsBeautiful, r/webdev
 * 4. AlternativeTo - 找差评竞品的替代品需求
 * 
 * 输出: candidates.json - 候选产品清单
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

// ==================== CONFIG ====================

const CHROME_STORE_CATEGORIES = [
  'productivity',
  'developer-tools', 
  'search-tools',
  'shopping',
  'social-networking',
  'communication',
  'accessibility',
  'fun',
];

// 有付费潜力的关键词种子
const SEED_KEYWORDS = [
  // AI 工具类
  'ai writer', 'ai summarizer', 'ai translator', 'ai grammar',
  'ai image', 'ai screenshot', 'chatgpt', 'ai assistant',
  // 生产力类
  'tab manager', 'bookmark manager', 'screenshot', 'screen recorder',
  'note taking', 'todo list', 'time tracker', 'pomodoro',
  'clipboard manager', 'password manager', 'read later',
  // 社交/内容类
  'twitter tools', 'youtube downloader', 'youtube summary',
  'instagram', 'linkedin tools', 'email tracker',
  // 开发者类
  'json formatter', 'api tester', 'color picker', 'css tools',
  'regex tester', 'github tools', 'web scraper',
  // 购物/比价
  'price tracker', 'coupon finder', 'cashback',
  // 隐私/安全
  'ad blocker', 'vpn', 'privacy', 'tracker blocker',
];

interface Candidate {
  keyword: string;
  type: 'chrome-extension' | 'web-saas';
  name: string;
  opportunity: string;
  competitors: {
    name: string;
    rating: number;
    users: string;
    lastUpdated: string;
    weaknesses: string[];
  }[];
  estimatedDifficulty: 'easy' | 'medium' | 'hard';
  estimatedRevenue: string;
  score: number; // 0-100 综合评分
  reason: string;
}

// ==================== CHROME WEB STORE SCRAPER ====================

async function scrapeChromeStore(keyword: string): Promise<any[]> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    const url = `https://chromewebstore.google.com/search/${encodeURIComponent(keyword)}`;
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    // 等待结果加载
    await page.waitForSelector('[class*="extension"]', { timeout: 10000 }).catch(() => {});
    
    // 提取扩展信息
    const extensions = await page.evaluate(() => {
      const items: any[] = [];
      // Chrome Web Store 的 DOM 结构可能变化，这里用通用选择器
      const cards = document.querySelectorAll('a[href*="/detail/"]');
      
      cards.forEach((card) => {
        const name = card.querySelector('h2, [class*="name"], [class*="title"]')?.textContent?.trim();
        const desc = card.querySelector('p, [class*="description"]')?.textContent?.trim();
        const rating = card.querySelector('[class*="rating"], [aria-label*="rating"]')?.textContent?.trim();
        const users = card.querySelector('[class*="user"], [class*="install"]')?.textContent?.trim();
        
        if (name) {
          items.push({
            name,
            description: desc || '',
            rating: parseFloat(rating || '0'),
            users: users || 'unknown',
            url: (card as HTMLAnchorElement).href,
          });
        }
      });
      
      return items.slice(0, 10); // 前10个结果
    });
    
    return extensions;
  } catch (e) {
    console.error(`Failed to scrape Chrome Store for "${keyword}":`, e);
    return [];
  } finally {
    await browser.close();
  }
}

// ==================== SCORING ====================

function scoreOpportunity(keyword: string, competitors: any[]): number {
  let score = 50; // 基础分
  
  // 竞品少 = 机会多
  if (competitors.length < 3) score += 20;
  else if (competitors.length < 5) score += 10;
  else if (competitors.length > 15) score -= 20;
  
  // 竞品评分低 = 有改进空间
  const avgRating = competitors.reduce((sum, c) => sum + (c.rating || 0), 0) / (competitors.length || 1);
  if (avgRating < 3.5) score += 20;
  else if (avgRating < 4.0) score += 10;
  else if (avgRating > 4.5) score -= 10;
  
  // AI 相关关键词当前热度高
  if (keyword.toLowerCase().includes('ai')) score += 10;
  
  return Math.max(0, Math.min(100, score));
}

// ==================== MAIN ====================

async function discover() {
  console.log('🔍 Small Bets Discovery Starting...\n');
  console.log(`Keywords to scan: ${SEED_KEYWORDS.length}`);
  console.log('---');
  
  const candidates: Candidate[] = [];
  
  for (const keyword of SEED_KEYWORDS) {
    console.log(`\nScanning: "${keyword}"...`);
    
    const competitors = await scrapeChromeStore(keyword);
    const score = scoreOpportunity(keyword, competitors);
    
    if (score >= 50) { // 只保留及格的
      candidates.push({
        keyword,
        type: 'chrome-extension',
        name: `[AUTO] ${keyword}`,
        opportunity: `Found ${competitors.length} competitors, avg rating suggests room for improvement`,
        competitors: competitors.slice(0, 5).map(c => ({
          name: c.name,
          rating: c.rating,
          users: c.users,
          lastUpdated: 'unknown',
          weaknesses: [],
        })),
        estimatedDifficulty: score > 70 ? 'easy' : score > 50 ? 'medium' : 'hard',
        estimatedRevenue: '$100-500/mo',
        score,
        reason: `Score ${score}/100 - ${competitors.length} competitors found`,
      });
    }
    
    // 防止请求过快
    await new Promise(r => setTimeout(r, 2000));
  }
  
  // 按分数排序
  candidates.sort((a, b) => b.score - a.score);
  
  // 输出结果
  const outputPath = path.join(__dirname, '..', 'candidates.json');
  fs.writeFileSync(outputPath, JSON.stringify(candidates, null, 2));
  
  console.log('\n\n==================== RESULTS ====================\n');
  console.log(`Total candidates: ${candidates.length}\n`);
  
  candidates.slice(0, 10).forEach((c, i) => {
    console.log(`${i + 1}. [${c.score}pts] ${c.keyword}`);
    console.log(`   Difficulty: ${c.estimatedDifficulty} | Revenue: ${c.estimatedRevenue}`);
    console.log(`   Competitors: ${c.competitors.length} | ${c.reason}`);
    console.log('');
  });
  
  console.log(`\nFull results saved to: ${outputPath}`);
}

discover().catch(console.error);
