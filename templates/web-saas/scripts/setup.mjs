#!/usr/bin/env node

/**
 * {{PRODUCT_NAME}} Setup Script
 *
 * Usage:
 *   node scripts/setup.mjs
 *
 * Or with a generator:
 *   node scripts/setup.mjs --name "My SaaS" --domain "mysaas.com" --desc "The best SaaS ever"
 *
 * This script replaces all {{PLACEHOLDER}} values in the project with actual values.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";
import { createInterface } from "readline";

const PLACEHOLDERS = {
  "{{PRODUCT_NAME}}": { prompt: "Product name", default: "My SaaS" },
  "{{PRODUCT_SLUG}}": { prompt: "Product slug (package name)", default: "my-saas" },
  "{{PRODUCT_DESC}}": { prompt: "Product description", default: "The modern SaaS platform" },
  "{{PRODUCT_HEADLINE}}": { prompt: "Hero headline", default: "Build Something Amazing" },
  "{{PRODUCT_TAGLINE}}": { prompt: "Tagline (short)", default: "The Modern Way to Build" },
  "{{PRODUCT_DOMAIN}}": { prompt: "Domain name", default: "example.com" },
  "{{PRODUCT_URL}}": { prompt: "Full URL", default: "https://example.com" },
  "{{PRODUCT_KEYWORDS}}": { prompt: "SEO keywords (comma-separated)", default: "saas, platform, tool" },
  "{{AUTHOR_NAME}}": { prompt: "Author/company name", default: "Your Name" },
  "{{TWITTER_HANDLE}}": { prompt: "Twitter handle (no @)", default: "yourhandle" },
};

// Parse CLI args
const args = process.argv.slice(2);
const cliValues = {};
for (let i = 0; i < args.length; i += 2) {
  const key = args[i]?.replace("--", "");
  const value = args[i + 1];
  if (key && value) {
    const placeholder = Object.keys(PLACEHOLDERS).find(
      (p) => p.replace(/[{}]/g, "").toLowerCase().replace(/_/g, "") === key.toLowerCase().replace(/_/g, "").replace(/-/g, "")
    );
    if (placeholder) cliValues[placeholder] = value;
  }
}

const rl = createInterface({ input: process.stdin, output: process.stdout });

function ask(question, defaultVal) {
  return new Promise((resolve) => {
    rl.question(`${question} [${defaultVal}]: `, (answer) => {
      resolve(answer.trim() || defaultVal);
    });
  });
}

async function getValues() {
  const values = {};
  console.log("\n🚀 Setting up your SaaS project\n");

  for (const [placeholder, config] of Object.entries(PLACEHOLDERS)) {
    if (cliValues[placeholder]) {
      values[placeholder] = cliValues[placeholder];
      console.log(`  ✓ ${config.prompt}: ${cliValues[placeholder]}`);
    } else {
      values[placeholder] = await ask(`  ${config.prompt}`, config.default);
    }

    // Auto-derive slug from name if not set
    if (placeholder === "{{PRODUCT_NAME}}" && !cliValues["{{PRODUCT_SLUG}}"]) {
      const slug = values[placeholder].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      values["{{PRODUCT_SLUG}}"] = slug;
    }
  }

  rl.close();
  return values;
}

function replaceInFile(filePath, replacements) {
  const SKIP_EXTS = [".png", ".jpg", ".jpeg", ".gif", ".ico", ".woff", ".woff2", ".ttf", ".eot"];
  if (SKIP_EXTS.includes(extname(filePath))) return;

  let content = readFileSync(filePath, "utf-8");
  let changed = false;

  for (const [placeholder, value] of Object.entries(replacements)) {
    if (content.includes(placeholder)) {
      content = content.replaceAll(placeholder, value);
      changed = true;
    }
  }

  if (changed) {
    writeFileSync(filePath, content, "utf-8");
    console.log(`  ✏️  ${filePath}`);
  }
}

function walkDir(dir, replacements) {
  const SKIP_DIRS = ["node_modules", ".next", ".git", ".supabase"];

  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      if (!SKIP_DIRS.includes(entry)) {
        walkDir(fullPath, replacements);
      }
    } else {
      replaceInFile(fullPath, replacements);
    }
  }
}

async function main() {
  const values = await getValues();

  console.log("\n📝 Replacing placeholders...\n");
  walkDir(".", values);

  console.log("\n✅ Setup complete!\n");
  console.log("Next steps:");
  console.log("  1. Copy .env.example to .env.local and fill in your keys");
  console.log("  2. Run: pnpm install");
  console.log("  3. Run: pnpm dev");
  console.log("  4. Set up Supabase: pnpm db:migrate");
  console.log("  5. Set up Stripe webhooks: pnpm stripe:listen\n");
}

main().catch(console.error);
