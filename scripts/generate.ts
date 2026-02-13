#!/usr/bin/env tsx
/**
 * Small Bets Product Generator ⚡
 * 
 * 从模板一键生成新产品项目
 * 
 * Usage:
 *   tsx generate.ts --type chrome --name "AI Writer" --slug ai-writer --desc "AI writing assistant for Chrome"
 *   tsx generate.ts --type web --name "QuickNote" --slug quicknote --desc "Lightning fast note-taking app"
 */

import * as fs from 'fs';
import * as path from 'path';

// ==================== CONFIG ====================

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');
const PRODUCTS_DIR = path.join(__dirname, '..', 'products');

interface ProductConfig {
  type: 'chrome-extension' | 'web-saas';
  name: string;
  slug: string;
  description: string;
  primaryColor?: string;
  pricingMonthly?: number;
  pricingYearly?: number;
  pricingLifetime?: number;
}

// ==================== ARGS PARSER ====================

function parseArgs(): ProductConfig {
  const args = process.argv.slice(2);
  const config: any = {};
  
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    config[key] = value;
  }
  
  if (!config.type || !config.name || !config.slug) {
    console.error('Usage: tsx generate.ts --type <chrome|web> --name "Product Name" --slug product-slug --desc "Description"');
    process.exit(1);
  }
  
  return {
    type: config.type === 'chrome' ? 'chrome-extension' : 'web-saas',
    name: config.name,
    slug: config.slug,
    description: config.desc || config.name,
    primaryColor: config.color || '#6366f1', // indigo
    pricingMonthly: parseFloat(config.monthly || '4.99'),
    pricingYearly: parseFloat(config.yearly || '39.99'),
    pricingLifetime: parseFloat(config.lifetime || '79.99'),
  };
}

// ==================== FILE OPERATIONS ====================

function copyDirRecursive(src: string, dest: string) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      // 跳过 node_modules, .next, dist 等
      if (['node_modules', '.next', 'dist', '.git', '.turbo'].includes(entry.name)) continue;
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function replaceInFile(filePath: string, replacements: Record<string, string>) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    for (const [placeholder, value] of Object.entries(replacements)) {
      content = content.replaceAll(placeholder, value);
    }
    
    fs.writeFileSync(filePath, content);
  } catch (e) {
    // 跳过二进制文件
  }
}

function replaceInAllFiles(dir: string, replacements: Record<string, string>) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (['node_modules', '.next', 'dist', '.git'].includes(entry.name)) continue;
      replaceInAllFiles(fullPath, replacements);
    } else {
      // 只处理文本文件
      const ext = path.extname(entry.name).toLowerCase();
      const textExts = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.html', '.css', '.yml', '.yaml', '.toml', '.env', '.txt', '.svg'];
      if (textExts.includes(ext) || entry.name.startsWith('.env') || entry.name === 'manifest.json') {
        replaceInFile(fullPath, replacements);
      }
    }
  }
}

// ==================== GENERATOR ====================

function generate(config: ProductConfig) {
  const templateDir = path.join(TEMPLATES_DIR, config.type);
  const productDir = path.join(PRODUCTS_DIR, config.slug);
  
  // 检查模板是否存在
  if (!fs.existsSync(templateDir)) {
    console.error(`Template not found: ${templateDir}`);
    console.error(`Available templates: ${fs.readdirSync(TEMPLATES_DIR).join(', ')}`);
    process.exit(1);
  }
  
  // 检查产品是否已存在
  if (fs.existsSync(productDir)) {
    console.error(`Product already exists: ${productDir}`);
    console.error('Use a different slug or delete the existing product first.');
    process.exit(1);
  }
  
  console.log(`\n⚡ Generating ${config.type}: "${config.name}" (${config.slug})\n`);
  
  // Step 1: 复制模板
  console.log('1. Copying template...');
  copyDirRecursive(templateDir, productDir);
  
  // Step 2: 替换占位符
  console.log('2. Replacing placeholders...');
  const replacements: Record<string, string> = {
    '{{PRODUCT_NAME}}': config.name,
    '{{PRODUCT_SLUG}}': config.slug,
    '{{PRODUCT_DESC}}': config.description,
    '{{PRIMARY_COLOR}}': config.primaryColor || '#6366f1',
    '{{PRICING_MONTHLY}}': String(config.pricingMonthly || 4.99),
    '{{PRICING_YEARLY}}': String(config.pricingYearly || 39.99),
    '{{PRICING_LIFETIME}}': String(config.pricingLifetime || 79.99),
    '{{YEAR}}': String(new Date().getFullYear()),
    '{{DATE}}': new Date().toISOString().split('T')[0],
  };
  
  replaceInAllFiles(productDir, replacements);
  
  // Step 3: 生成产品配置文件
  console.log('3. Writing product config...');
  const productConfig = {
    ...config,
    createdAt: new Date().toISOString(),
    status: 'development', // development → live → monitoring → archived
    analytics: {
      installs: 0,
      dau: 0,
      revenue: 0,
      rating: 0,
    },
    deployedAt: null,
    archivedAt: null,
  };
  
  fs.writeFileSync(
    path.join(productDir, 'product.json'),
    JSON.stringify(productConfig, null, 2)
  );
  
  // Done!
  console.log('\n✅ Product generated successfully!\n');
  console.log(`Location: ${productDir}`);
  console.log('\nNext steps:');
  console.log(`  cd ${productDir}`);
  console.log('  pnpm install');
  console.log('  pnpm dev');
  console.log('\nCustomize the core feature, then:');
  console.log('  pnpm build');
  console.log(`  tsx ../scripts/deploy.ts --product ${config.slug}`);
}

// ==================== MAIN ====================

const config = parseArgs();
generate(config);
