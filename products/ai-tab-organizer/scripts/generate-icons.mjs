#!/usr/bin/env node
// ============================================================
// TabFlow AI — Icon Generator
// ============================================================
// Generates SVG placeholder icons for the extension.
// For CWS publishing, convert to PNG using Figma, Sharp, etc.

import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const iconsDir = join(__dirname, '..', 'public', 'icons')

mkdirSync(iconsDir, { recursive: true })

function generateSvgIcon(size) {
  const r = Math.round(size * 0.18)
  const sw = Math.max(1.5, Math.round(size * 0.07))
  const p = Math.round(size * 0.25)
  const y1 = Math.round(size * 0.33)
  const y2 = Math.round(size * 0.50)
  const y3 = Math.round(size * 0.67)
  const x2 = size - p
  const x2s = Math.round(p + (x2 - p) * 0.55)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${r}" fill="#6366f1"/>
  <line x1="${p}" y1="${y1}" x2="${x2}" y2="${y1}" stroke="white" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="${p}" y1="${y2}" x2="${x2}" y2="${y2}" stroke="white" stroke-width="${sw}" stroke-linecap="round" opacity="0.8"/>
  <line x1="${p}" y1="${y3}" x2="${x2s}" y2="${y3}" stroke="white" stroke-width="${sw}" stroke-linecap="round" opacity="0.6"/>
</svg>`
}

for (const size of [16, 48, 128]) {
  const svg = generateSvgIcon(size)
  // Write as .png (SVG content — Chrome dev mode handles this)
  writeFileSync(join(iconsDir, `icon-${size}.png`), svg)
}

console.log('✅ Icons generated in public/icons/')
