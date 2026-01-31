import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-instrument)', 'system-ui', 'sans-serif'],
        display: ['var(--font-instrument)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Semantic Business Colors
        revenue: {
          DEFAULT: '#10B981',
          muted: '#10B98133',
          glow: '#10B98166',
        },
        pipeline: {
          DEFAULT: '#3B82F6',
          muted: '#3B82F633',
          glow: '#3B82F666',
        },
        warning: {
          DEFAULT: '#F59E0B',
          muted: '#F59E0B33',
          glow: '#F59E0B66',
        },
        danger: {
          DEFAULT: '#EF4444',
          muted: '#EF444433',
          glow: '#EF444466',
        },
        // Base palette - sophisticated dark
        surface: {
          DEFAULT: '#0A0A0B',
          raised: '#111113',
          overlay: '#18181B',
          subtle: '#1F1F23',
        },
        border: {
          DEFAULT: '#27272A',
          subtle: '#1F1F23',
          accent: '#3F3F46',
        },
        text: {
          primary: '#FAFAFA',
          secondary: '#A1A1AA',
          tertiary: '#71717A',
        },
      },
      backgroundImage: {
        'grid-pattern': `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2327272A' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glow-revenue': 'radial-gradient(ellipse at center, #10B98122 0%, transparent 70%)',
        'glow-pipeline': 'radial-gradient(ellipse at center, #3B82F622 0%, transparent 70%)',
      },
      boxShadow: {
        'glow-sm': '0 0 20px -5px',
        'glow-md': '0 0 40px -10px',
        'glow-lg': '0 0 60px -15px',
        'inner-glow': 'inset 0 1px 0 0 rgba(255,255,255,0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'slide-in-right': 'slideInRight 0.4s ease-out forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'number-tick': 'numberTick 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        numberTick: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
