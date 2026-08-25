import sharp from 'sharp'
import { join } from 'node:path'
import { readFile, writeFile, mkdir } from 'node:fs/promises'

const brand = 'C:/Users/ESSA8/Documents/veterinarian-fronted/src/assets/branding'
const pub = 'C:/Users/ESSA8/Documents/veterinarian-fronted/public/branding'
await mkdir(brand, { recursive: true })
await mkdir(pub, { recursive: true })

const sourceJpeg = 'C:/Users/ESSA8/Downloads/logo_letras.jpeg'

async function makePair(inputPath, baseName) {
  const meta = await sharp(inputPath).metadata()
  const targetW = Math.max((meta.width ?? 600) * 4, 2400)
  const withBgBuf = await sharp(inputPath)
    .resize({ width: targetW, kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 9 })
    .toBuffer()

  const withBgPath = join(brand, `${baseName}-with-bg.png`)
  const withBgPublic = join(pub, `${baseName}-with-bg.png`)
  await sharp(withBgBuf).toFile(withBgPath)
  await sharp(withBgBuf).toFile(withBgPublic)

  const { data, info } = await sharp(withBgBuf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const pixels = Buffer.from(data)
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i]
    const g = pixels[i + 1]
    const b = pixels[i + 2]
    if (r > 228 && g > 228 && b > 228) {
      pixels[i + 3] = 0
    } else if (r > 200 && g > 200 && b > 200) {
      const avg = (r + g + b) / 3
      pixels[i + 3] = Math.max(0, Math.min(255, Math.round((230 - avg) * 10)))
    }
  }

  const transparentBuf = await sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toBuffer()

  const trPath = join(brand, `${baseName}-transparent.png`)
  const trPublic = join(pub, `${baseName}-transparent.png`)
  await sharp(transparentBuf).toFile(trPath)
  await sharp(transparentBuf).toFile(trPublic)

  return { width: info.width, height: info.height, withBgPath, trPath }
}

const wordmark = await makePair(sourceJpeg, 'huellitas-wordmark')

// SVG wrappers (vector container + hi-res raster for fidelity)
function svgFor(pngFile, width, height, withBackground) {
  const bg = withBackground
    ? `<rect width="100%" height="100%" fill="#F5F5F5"/>`
    : ''
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Huellitas">
  ${bg}
  <image href="${pngFile}" xlink:href="${pngFile}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet"/>
</svg>
`
}

await writeFile(
  join(brand, 'huellitas-wordmark-with-bg.svg'),
  svgFor('./huellitas-wordmark-with-bg.png', wordmark.width, wordmark.height, true),
)
await writeFile(
  join(brand, 'huellitas-wordmark-transparent.svg'),
  svgFor('./huellitas-wordmark-transparent.png', wordmark.width, wordmark.height, false),
)
await writeFile(
  join(pub, 'huellitas-wordmark-with-bg.svg'),
  svgFor('./huellitas-wordmark-with-bg.png', wordmark.width, wordmark.height, true),
)
await writeFile(
  join(pub, 'huellitas-wordmark-transparent.svg'),
  svgFor('./huellitas-wordmark-transparent.png', wordmark.width, wordmark.height, false),
)

console.log(JSON.stringify(wordmark, null, 2))
