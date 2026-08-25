import sharp from 'sharp'
import { join } from 'node:path'
import { mkdir, copyFile, writeFile } from 'node:fs/promises'

const brand = 'C:/Users/ESSA8/Documents/veterinarian-fronted/src/assets/branding'
const pub = 'C:/Users/ESSA8/Documents/veterinarian-fronted/public/branding'
const source =
  'C:/Users/ESSA8/Downloads/WhatsApp Image 2026-08-25 at 10.31.14 AM.jpeg'
const hqGen =
  'C:/Users/ESSA8/.cursor/projects/c-Users-ESSA8-Documents-veterinarian-fronted/assets/huellitas-logo-principal-hq.png'

await mkdir(brand, { recursive: true })
await mkdir(pub, { recursive: true })

await copyFile(source, join(brand, 'huellitas-logo-principal-source.jpeg'))
await copyFile(source, join(pub, 'huellitas-logo-principal-source.jpeg'))

/** Recorta márgenes claros y exporta PNG hi-res con/sin fondo. */
async function exportLogo(inputPath, baseName) {
  const trimmed = await sharp(inputPath)
    .trim({
      background: { r: 255, g: 255, b: 255, alpha: 1 },
      threshold: 12,
    })
    .png()
    .toBuffer()

  const meta = await sharp(trimmed).metadata()
  const side = Math.max(meta.width ?? 1, meta.height ?? 1)
  const padded = await sharp(trimmed)
    .extend({
      top: Math.floor((side - (meta.height ?? 0)) / 2),
      bottom: Math.ceil((side - (meta.height ?? 0)) / 2),
      left: Math.floor((side - (meta.width ?? 0)) / 2),
      right: Math.ceil((side - (meta.width ?? 0)) / 2),
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .resize({ width: 2048, height: 2048, fit: 'fill', kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 9 })
    .toBuffer()

  const withBgName = `${baseName}-with-bg.png`
  const trName = `${baseName}-transparent.png`

  await sharp(padded).toFile(join(brand, withBgName))
  await sharp(padded).toFile(join(pub, withBgName))

  const { data, info } = await sharp(padded)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const pixels = Buffer.from(data)
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i]
    const g = pixels[i + 1]
    const b = pixels[i + 2]
    if (r > 235 && g > 235 && b > 235) {
      pixels[i + 3] = 0
    } else if (r > 210 && g > 210 && b > 210) {
      const avg = (r + g + b) / 3
      pixels[i + 3] = Math.max(0, Math.min(255, Math.round((240 - avg) * 12)))
    }
  }

  const transparent = await sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toBuffer()

  await sharp(transparent).toFile(join(brand, trName))
  await sharp(transparent).toFile(join(pub, trName))

  const svgBg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${info.width}" height="${info.height}" viewBox="0 0 ${info.width} ${info.height}" role="img" aria-label="Huellitas">
  <rect width="100%" height="100%" fill="#FFFFFF"/>
  <image href="./${withBgName}" xlink:href="./${withBgName}" width="${info.width}" height="${info.height}"/>
</svg>
`
  const svgTr = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${info.width}" height="${info.height}" viewBox="0 0 ${info.width} ${info.height}" role="img" aria-label="Huellitas">
  <image href="./${trName}" xlink:href="./${trName}" width="${info.width}" height="${info.height}"/>
</svg>
`

  await writeFile(join(brand, `${baseName}-with-bg.svg`), svgBg)
  await writeFile(join(brand, `${baseName}-transparent.svg`), svgTr)
  await writeFile(join(pub, `${baseName}-with-bg.svg`), svgBg)
  await writeFile(join(pub, `${baseName}-transparent.svg`), svgTr)

  return { width: info.width, height: info.height, baseName }
}

const fromSource = await exportLogo(source, 'huellitas-logo-principal')
console.log(JSON.stringify({ fromSource }, null, 2))
