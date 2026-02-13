#!/usr/bin/env tsx
/**
 * Small Bets Auto Deploy 🚀
 * 
 * 自动构建 + 部署产品
 * 
 * Chrome Extension: 构建 → 打包 zip → 上传 Chrome Web Store
 * Web SaaS: 构建 → 部署 Vercel
 * 
 * Usage:
 *   tsx deploy.ts --product ai-writer
 *   tsx deploy.ts --product quicknote --env production
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const PRODUCTS_DIR = path.join(__dirname, '..', 'products');

interface ProductMeta {
  type: 'chrome-extension' | 'web-saas';
  name: string;
  slug: string;
  status: string;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const config: any = {};
  for (let i = 0; i < args.length; i += 2) {
    config[args[i].replace('--', '')] = args[i + 1];
  }
  return config;
}

function run(cmd: string, cwd: string) {
  console.log(`  $ ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

// ==================== CHROME EXTENSION DEPLOY ====================

async function deployChromeExtension(productDir: string, meta: ProductMeta) {
  console.log('\n📦 Building Chrome Extension...\n');
  
  // Step 1: Install deps
  run('pnpm install', productDir);
  
  // Step 2: Build
  run('pnpm build', productDir);
  
  // Step 3: Zip
  const distDir = path.join(productDir, 'dist');
  const zipPath = path.join(productDir, `${meta.slug}.zip`);
  
  if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
  run(`cd dist && zip -r "${zipPath}" .`, productDir);
  
  console.log(`\n✅ Extension built: ${zipPath}`);
  console.log('\n📤 Chrome Web Store Upload:');
  console.log('---');
  console.log('Automatic upload requires Chrome Web Store API credentials.');
  console.log('Set these environment variables:');
  console.log('  CHROME_CLIENT_ID=<your-client-id>');
  console.log('  CHROME_CLIENT_SECRET=<your-client-secret>');
  console.log('  CHROME_REFRESH_TOKEN=<your-refresh-token>');
  console.log('');
  
  if (process.env.CHROME_CLIENT_ID && process.env.CHROME_REFRESH_TOKEN) {
    console.log('Credentials found! Uploading...');
    // TODO: Implement Chrome Web Store API upload
    // POST https://www.googleapis.com/upload/chromewebstore/v1.1/items
    console.log('⚠️ Auto-upload not yet implemented. Upload manually at:');
    console.log('https://chrome.google.com/webstore/devconsole');
  } else {
    console.log('No credentials found. Upload manually at:');
    console.log('https://chrome.google.com/webstore/devconsole');
  }
  
  console.log(`\nZip file: ${zipPath}`);
}

// ==================== WEB SAAS DEPLOY ====================

async function deployWebSaaS(productDir: string, meta: ProductMeta) {
  console.log('\n🌐 Deploying Web SaaS to Vercel...\n');
  
  // Step 1: Install deps
  run('pnpm install', productDir);
  
  // Step 2: Build
  run('pnpm build', productDir);
  
  // Step 3: Deploy
  const env = process.argv.includes('--env') ? 'production' : 'preview';
  
  if (env === 'production') {
    run('npx vercel --prod --yes', productDir);
  } else {
    run('npx vercel --yes', productDir);
  }
  
  console.log(`\n✅ Deployed to Vercel (${env})`);
}

// ==================== MAIN ====================

async function main() {
  const args = parseArgs();
  
  if (!args.product) {
    console.error('Usage: tsx deploy.ts --product <slug>');
    process.exit(1);
  }
  
  const productDir = path.join(PRODUCTS_DIR, args.product);
  const metaPath = path.join(productDir, 'product.json');
  
  if (!fs.existsSync(metaPath)) {
    console.error(`Product not found: ${args.product}`);
    console.error(`Available products: ${fs.readdirSync(PRODUCTS_DIR).join(', ')}`);
    process.exit(1);
  }
  
  const meta: ProductMeta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
  
  console.log(`🚀 Deploying: ${meta.name} (${meta.type})`);
  
  if (meta.type === 'chrome-extension') {
    await deployChromeExtension(productDir, meta);
  } else {
    await deployWebSaaS(productDir, meta);
  }
  
  // Update product status
  const fullMeta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
  fullMeta.status = 'live';
  fullMeta.deployedAt = new Date().toISOString();
  fs.writeFileSync(metaPath, JSON.stringify(fullMeta, null, 2));
  
  console.log('\n🎉 Done!');
}

main().catch(console.error);
