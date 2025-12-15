export type OrgBranding = {
  brand_name: string
  tagline: string | null
  logo_light_url: string | null
  logo_dark_url: string | null
  mark_url: string | null
  primary_color: string
  accent_color: string
}

export const BRANDING_DEFAULTS: OrgBranding = {
  brand_name: 'CompassIQ',
  tagline: null,
  logo_light_url: null,
  logo_dark_url: null,
  mark_url: null,
  primary_color: '#0A192F',
  accent_color: '#007BFF',
}

export function normalizeBranding(input: Partial<OrgBranding> | null | undefined): OrgBranding {
  const out: OrgBranding = { ...BRANDING_DEFAULTS }
  if (!input) return out

  if (typeof input.brand_name === 'string' && input.brand_name.trim()) out.brand_name = input.brand_name.trim()
  if (typeof input.tagline === 'string') out.tagline = input.tagline.trim() || null

  if (typeof input.logo_light_url === 'string') out.logo_light_url = input.logo_light_url.trim() || null
  if (typeof input.logo_dark_url === 'string') out.logo_dark_url = input.logo_dark_url.trim() || null
  if (typeof input.mark_url === 'string') out.mark_url = input.mark_url.trim() || null

  if (typeof input.primary_color === 'string' && isHexColor(input.primary_color)) out.primary_color = input.primary_color.trim()
  if (typeof input.accent_color === 'string' && isHexColor(input.accent_color)) out.accent_color = input.accent_color.trim()

  return out
}

export function isHexColor(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value.trim())
}

function hexToRgb(hex: string) {
  const clean = hex.replace('#', '').trim()
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return { r, g, b }
}

export function hexToHslString(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  const r1 = r / 255
  const g1 = g / 255
  const b1 = b / 255

  const max = Math.max(r1, g1, b1)
  const min = Math.min(r1, g1, b1)
  const delta = max - min

  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1))
    if (max === r1) h = ((g1 - b1) / delta) % 6
    else if (max === g1) h = (b1 - r1) / delta + 2
    else h = (r1 - g1) / delta + 4
    h = Math.round(h * 60)
    if (h < 0) h += 360
  }

  const sPct = Math.round(s * 1000) / 10
  const lPct = Math.round(l * 1000) / 10
  return `${h} ${sPct}% ${lPct}%`
}

export function getBrandCssVars(branding: OrgBranding) {
  const brandPrimaryHsl = hexToHslString(branding.primary_color)
  const brandAccentHsl = hexToHslString(branding.accent_color)

  return {
    '--brand-primary': branding.primary_color,
    '--brand-accent': branding.accent_color,
    '--brand-primary-hsl': brandPrimaryHsl,
    '--brand-accent-hsl': brandAccentHsl,
    // Use accent as the main interactive primary across the UI.
    '--primary': brandAccentHsl,
    '--ring': brandAccentHsl,
  } as const
}

