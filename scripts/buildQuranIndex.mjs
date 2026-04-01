/**
 * Run once: node scripts/buildQuranIndex.mjs
 * Fetches quran-simple text + page numbers from alquran.cloud and writes
 * public/quran-index.json  →  array of [surahNum, ayahNum, pageNum, arabicText]
 */
import https from 'https'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '..', 'public', 'quran-index.json')

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let d = ''
      res.on('data', c => d += c)
      res.on('end', () => {
        try { resolve(JSON.parse(d)) }
        catch (e) { reject(new Error('JSON parse failed: ' + e.message)) }
      })
      res.on('error', reject)
    }).on('error', reject)
  })
}

console.log('Fetching quran-simple from alquran.cloud …')
const r = await get('https://api.alquran.cloud/v1/quran/quran-simple')

if (r.code !== 200) {
  console.error('API error:', r)
  process.exit(1)
}

const index = []
for (const surah of r.data.surahs) {
  for (const ayah of surah.ayahs) {
    index.push([surah.number, ayah.numberInSurah, ayah.page, ayah.text])
  }
}

fs.writeFileSync(OUT, JSON.stringify(index))
console.log(`✓ ${index.length} ayahs written to ${path.relative(process.cwd(), OUT)}`)
console.log(`  File size: ${(fs.statSync(OUT).size / 1024).toFixed(1)} KB`)
