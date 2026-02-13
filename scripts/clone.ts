#!/usr/bin/env tsx
/**
 * Small Bets Product Cloner 🔄
 * 
 * 换皮复制赢家产品
 * 
 * Usage:
 *   tsx clone.ts --source ai-writer --name "AI Poet" --slug ai-poet --desc "AI poetry generator"
 *   tsx clone.ts --source quicknote --name "DevNote" --slug devnote --desc "Note-taking for developers"
 */

import * as fs from 'fs';
import * as path from 'path';

const PRODUCTS_DIR = path.join(__dirname, '..', 'products');

function parseArgs() {
  const args = process.argv.slice(2);
  const config: any = {};
  for (let i = 0; i < args.length; i += 2) {
    config[args[i].replace('--', '')] = args[i + 1];
  }
  if (!config.source || !config.name || !config.slug) {
    console.error('Usage: tsx clone.ts --source <source-slug> --name "New Name" --slug new-slug --desc "Description"');
    process.exit(1);
  }
  return config;
}

function copyDirRecursive(src: string, dest: string) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.next', 'dist', '.git', '.vercel', '.turbo'].includes(entry.name)) continue;
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
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
      const ext = path.extname(entry.name).toLowerCase();
      const textExts = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.html', '.css', '.yml', '.yaml', '.env', '.txt', '.svg'];
      if (textExts.includes(ext) || entry.name.startsWith('.env')) {
        try {
          let content = fs.readFileSync(fullPath, 'utf-8');
          for (const [from, to] of Object.entries(replacements)) {
            content = content.replaceAll(from, to);
          }
          fs.writeFileSync(fullPath, content);
        } catch (e) { /* skip binary */ }
      }
    }
  }
}

function main() {
  const args = parseArgs();
  
  const sourceDir = path.join(PRODUCTS_DIR, args.source);
  const targetDir = path.join(PRODUCTS_DIR, args.slug);
  
  if (!fs.existsSync(sourceDir)) {
    console.error(`Source product not found: ${args.source}`);
    process.exit(1);
  }
  if (fs.existsSync(targetDir)) {
    console.error(`Target already exists: ${args.slug}`);
    process.exit(1);
  }
  
  const sourceMeta = JSON.parse(fs.readFileSync(path.join(sourceDir, 'product.json'), 'utf-8'));
  
  console.log(`\n🔄 Cloning "${sourceMeta.name}" → "${args.name}"\n`);
  
  // Step 1: Copy
  console.log('1. Copying project...');
  copyDirRecursive(sourceDir, targetDir);
  
  // Step 2: Replace all references
  console.log('2. Replacing branding...');
  const replacements: Record<string, string> = {
    [sourceMeta.name]: args.name,
    [sourceMeta.slug]: args.slug,
    [sourceMeta.description || sourceMeta.name]: args.desc || args.name,
  };
  replaceInAllFiles(targetDir, replacements);
  
  // Step 3: Update product.json
  console.log('3. Updating product config...');
  const newMeta = {
    ...sourceMeta,
    name: args.name,
    slug: args.slug,
    description: args.desc || args.name,
    createdAt: new Date().toISOString(),
    status: 'development',
    clonedFrom: args.source,
    analytics: { installs: 0, dau: 0, revenue: 0, rating: 0 },
    deployedAt: null,
    archivedAt: null,
  };
  fs.writeFileSync(path.join(targetDir, 'product.json'), JSON.stringify(newMeta, null, 2));
  
  // Step 4: Clean build artifacts
  const cleanDirs = ['node_modules', 'dist', '.next', '.vercel'];
  cleanDirs.forEach(d => {
    const p = path.join(targetDir, d);
    if (fs.existsSync(p)) fs.rmSync(p, { recursive: true });
  });
  
  console.log('\n✅ Clone complete!\n');
  console.log(`Location: ${targetDir}`);
  console.log(`\nNext: Customize the core feature for "${args.name}", then deploy.`);
}

main();
