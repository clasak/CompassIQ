# CompassIQ Logo Integration Guide

## Logo Files

The CompassIQ branding system includes the following logo assets:

### SVG Logo Files
- **`/public/compass-iq-logo.svg`** - Main logo icon (compass with circular ring and arrow)
- **`/public/compass-iq-wordmark-light.svg`** - Full wordmark for light backgrounds
- **`/public/compass-iq-wordmark-dark.svg`** - Full wordmark for dark backgrounds

## Logo Design

The CompassIQ logo features:
- **Circular Ring**: Blue gradient (cyan → blue → dark blue)
- **Compass Needle**: Green gradient (lime → emerald → teal)
- **Wordmark**: "Compass" in white/dark, "IQ" in teal (#00BFA5)

## Where the Logo Appears

### Default Integration
The logo is automatically integrated into:
1. **Sidebar** - Top left corner with brand mark and wordmark
2. **Topbar** - Brand mark in mobile view
3. **Login/Auth pages** - Full logo with wordmark

### Components

#### BrandMark Component
Located: `components/branding/BrandMark.tsx`

The compass icon/logo mark. Shows the circular ring with compass needle.

```tsx
import { BrandMark } from '@/components/branding/BrandMark'

// Default (uses built-in SVG)
<BrandMark size={32} />

// Custom URL
<BrandMark url="/path/to/logo.png" size={40} />
```

#### BrandWordmark Component
Located: `components/branding/BrandWordmark.tsx`

The full "CompassIQ" text logo.

```tsx
import { BrandWordmark } from '@/components/branding/BrandWordmark'

// Default (uses built-in styled text)
<BrandWordmark brandName="CompassIQ" />

// With custom image
<BrandWordmark
  brandName="CompassIQ"
  logoLightUrl="/compass-iq-wordmark-light.svg"
  logoDarkUrl="/compass-iq-wordmark-dark.svg"
  height={32}
/>
```

## Customizing the Logo

### Using Custom Logo Files

To use custom logo files (e.g., uploaded by users), update the branding configuration through the admin settings:

1. Navigate to **Settings → Branding**
2. Upload logo files for:
   - Logo Mark (square icon)
   - Wordmark Light (for dark backgrounds)
   - Wordmark Dark (for light backgrounds)

The system will automatically use these custom logos instead of the defaults.

### Programmatic Configuration

Update the BrandProvider context:

```tsx
import { BrandProvider } from '@/components/branding/BrandProvider'

<BrandProvider
  branding={{
    brandName: 'CompassIQ',
    logoMarkUrl: '/path/to/logo-icon.svg',
    logoWordmarkLightUrl: '/path/to/wordmark-light.svg',
    logoWordmarkDarkUrl: '/path/to/wordmark-dark.svg',
    primaryColor: '#0080FF',
    accentColor: '#00BFA5',
  }}
>
  {children}
</BrandProvider>
```

## Logo Colors

The CompassIQ brand colors extracted from the logo:

```css
/* Primary Blue Gradient */
--compass-blue-light: #00D9FF;  /* Cyan */
--compass-blue-mid: #0080FF;     /* Blue */
--compass-blue-dark: #0040C0;    /* Dark Blue */

/* Compass Needle Green Gradient */
--compass-green-light: #C0FF00;  /* Lime */
--compass-green-mid: #00E676;    /* Emerald */
--compass-green-dark: #00BFA5;   /* Teal */

/* Brand Accent (IQ text) */
--brand-accent: #00BFA5;         /* Teal */
```

## Adding Your Own Logo

### Option 1: Replace SVG Files
Replace the files in `/public/` with your own:
- `compass-iq-logo.svg`
- `compass-iq-wordmark-light.svg`
- `compass-iq-wordmark-dark.svg`

### Option 2: Update Components
Edit `components/branding/BrandMark.tsx` and `BrandWordmark.tsx` to change the default SVG or text styling.

### Option 3: Database Configuration
Use the admin UI to upload logos which get stored in the database and override the defaults.

## Logo Specifications

### Recommended Sizes
- **Logo Mark**: 512×512px (square)
- **Wordmark**: 400×80px (5:1 aspect ratio)

### File Formats
- **Preferred**: SVG (scalable, crisp at any size)
- **Accepted**: PNG (transparent background recommended)
- **Not recommended**: JPEG (no transparency support)

### Design Guidelines
- Keep the circular ring and compass concept for brand consistency
- Use gradients for visual depth
- Ensure sufficient contrast for light and dark modes
- Maintain the teal accent color (#00BFA5) for brand recognition

## Troubleshooting

### Logo Not Showing
1. Check file paths are correct in `/public/`
2. Verify BrandProvider is wrapping your app
3. Clear browser cache and hard refresh
4. Check console for 404 errors

### Logo Looks Blurry
- Use SVG format instead of raster images
- Ensure PNG images are at least 2x the display size
- Check image compression settings

### Dark Mode Logo Issues
- Provide separate logos for light and dark modes
- Use `logoLightUrl` for dark backgrounds
- Use `logoDarkUrl` for light backgrounds
- Test in both color modes

## Examples

### Sidebar Header with Logo
```tsx
<div className="flex items-center gap-3 px-4 py-3">
  <BrandMark size={32} />
  <BrandWordmark brandName="CompassIQ" height={24} />
</div>
```

### Login Page with Full Logo
```tsx
<div className="flex flex-col items-center gap-4">
  <BrandMark size={80} className="mb-4" />
  <BrandWordmark brandName="CompassIQ" height={40} />
  <p className="text-muted-foreground">Sign in to your account</p>
</div>
```

---

**Last Updated:** 2025-12-16
**Design System Version:** BI Sleek v2.0
