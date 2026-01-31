/**
 * Color extraction from images
 * Uses browser Canvas API for reliable color extraction
 */

export interface ExtractedColors {
  primary: string
  accent: string
  neutral?: string
}

/**
 * Extract dominant colors from an image using Canvas API
 * This runs in the browser and extracts colors from the image
 */
export async function extractColorsFromImage(
  imageFile: File | Blob
): Promise<ExtractedColors | null> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(imageFile)

    img.onload = () => {
      try {
        // Create canvas
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          URL.revokeObjectURL(url)
          resolve(null)
          return
        }

        // Resize for performance (max 200px)
        const maxSize = 200
        let width = img.width
        let height = img.height
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height)
          width = Math.floor(width * ratio)
          height = Math.floor(height * ratio)
        }

        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)

        // Get image data
        const imageData = ctx.getImageData(0, 0, width, height)
        const pixels = imageData.data

        // Sample pixels (every 10th pixel for performance)
        const sampledColors: Array<{ r: number; g: number; b: number }> = []
        for (let i = 0; i < pixels.length; i += 40) {
          // RGBA format, so every 4 values is one pixel
          const r = pixels[i]
          const g = pixels[i + 1]
          const b = pixels[i + 2]
          const a = pixels[i + 3]

          // Skip transparent pixels
          if (a < 128) continue

          // Skip very light/white pixels (likely background)
          if (r > 240 && g > 240 && b > 240) continue

          // Skip very dark/black pixels (likely text/outline)
          if (r < 20 && g < 20 && b < 20) continue

          sampledColors.push({ r, g, b })
        }

        if (sampledColors.length === 0) {
          URL.revokeObjectURL(url)
          resolve(null)
          return
        }

        // Simple k-means clustering to find dominant colors
        const colors = kMeansClustering(sampledColors, 3)

        // Sort by frequency/brightness to pick primary and accent
        colors.sort((a, b) => {
          // Prefer more saturated colors
          const aSat = getSaturation(a)
          const bSat = getSaturation(b)
          return bSat - aSat
        })

        const primary = rgbToHex(colors[0] || { r: 10, g: 25, b: 47 })
        const accent = rgbToHex(colors[1] || colors[0] || { r: 0, g: 123, b: 255 })
        const neutral = colors[2] ? rgbToHex(colors[2]) : undefined

        URL.revokeObjectURL(url)
        resolve({ primary, accent, neutral })
      } catch (error) {
        console.error('Color extraction error:', error)
        URL.revokeObjectURL(url)
        resolve(null)
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(null)
    }

    img.src = url
  })
}

/**
 * Simple k-means clustering for color extraction
 */
function kMeansClustering(
  colors: Array<{ r: number; g: number; b: number }>,
  k: number
): Array<{ r: number; g: number; b: number }> {
  if (colors.length === 0) return []
  if (colors.length < k) return colors

  // Initialize centroids randomly
  const centroids: Array<{ r: number; g: number; b: number }> = []
  for (let i = 0; i < k; i++) {
    const randomIndex = Math.floor(Math.random() * colors.length)
    centroids.push({ ...colors[randomIndex] })
  }

  // Run k-means iterations
  for (let iter = 0; iter < 10; iter++) {
    // Assign colors to nearest centroid
    const clusters: Array<Array<{ r: number; g: number; b: number }>> = Array(k)
      .fill(null)
      .map(() => [])

    for (const color of colors) {
      let minDist = Infinity
      let nearestCentroid = 0

      for (let i = 0; i < centroids.length; i++) {
        const dist = colorDistance(color, centroids[i])
        if (dist < minDist) {
          minDist = dist
          nearestCentroid = i
        }
      }

      clusters[nearestCentroid].push(color)
    }

    // Update centroids
    let changed = false
    for (let i = 0; i < centroids.length; i++) {
      if (clusters[i].length === 0) continue

      const newCentroid = {
        r: Math.round(clusters[i].reduce((sum, c) => sum + c.r, 0) / clusters[i].length),
        g: Math.round(clusters[i].reduce((sum, c) => sum + c.g, 0) / clusters[i].length),
        b: Math.round(clusters[i].reduce((sum, c) => sum + c.b, 0) / clusters[i].length),
      }

      if (
        newCentroid.r !== centroids[i].r ||
        newCentroid.g !== centroids[i].g ||
        newCentroid.b !== centroids[i].b
      ) {
        changed = true
        centroids[i] = newCentroid
      }
    }

    if (!changed) break
  }

  return centroids
}

function colorDistance(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number }
): number {
  const dr = a.r - b.r
  const dg = a.g - b.g
  const db = a.b - b.b
  return Math.sqrt(dr * dr + dg * dg + db * db)
}

function getSaturation(color: { r: number; g: number; b: number }): number {
  const max = Math.max(color.r, color.g, color.b)
  const min = Math.min(color.r, color.g, color.b)
  if (max === 0) return 0
  return (max - min) / max
}

function rgbToHex(color: { r: number; g: number; b: number }): string {
  return `#${[color.r, color.g, color.b]
    .map((x) => {
      const hex = x.toString(16)
      return hex.length === 1 ? '0' + hex : hex
    })
    .join('')}`
}

/**
 * Extract colors from SVG (simple approach - parse fill/stroke attributes)
 * This is a fallback for SVG files
 */
export async function extractColorsFromSvg(svgText: string): Promise<ExtractedColors | null> {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgText, 'image/svg+xml')
    const colors = new Set<string>()

    // Find all elements with fill or stroke attributes
    const elements = doc.querySelectorAll('[fill], [stroke]')
    for (const el of Array.from(elements)) {
      const fill = el.getAttribute('fill')
      const stroke = el.getAttribute('stroke')

      if (fill && fill.startsWith('#') && fill.length === 7) {
        colors.add(fill)
      }
      if (stroke && stroke.startsWith('#') && stroke.length === 7) {
        colors.add(stroke)
      }
    }

    const colorArray = Array.from(colors)
    if (colorArray.length === 0) return null

    // Use first two colors as primary and accent
    return {
      primary: colorArray[0] || '#0A192F',
      accent: colorArray[1] || colorArray[0] || '#007BFF',
    }
  } catch {
    return null
  }
}


