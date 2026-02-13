#!/usr/bin/env node
// ============================================================
// TabFlow AI — Zip packager for Chrome Web Store
// ============================================================

import { createWriteStream, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import archiver from 'archiver'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = join(__dirname, '..', 'dist')
const outFile = join(__dirname, '..', 'tabflow-ai.zip')

if (!existsSync(distDir)) {
  console.error('❌ dist/ not found. Run `npm run build` first.')
  process.exit(1)
}

const output = createWriteStream(outFile)
const archive = archiver('zip', { zlib: { level: 9 } })

output.on('close', () => {
  const sizeKB = (archive.pointer() / 1024).toFixed(1)
  console.log(`✅ Created ${outFile} (${sizeKB} KB)`)
})

archive.on('error', (err) => { throw err })
archive.pipe(output)
archive.directory(distDir, false)
archive.finalize()
