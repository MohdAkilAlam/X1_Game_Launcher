/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/renderer/index.html',
    './src/renderer/src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        background: '#07080b',
        'surface-lowest': '#05070a',
        'surface-dim': '#0b0c10',
        surface: '#0b0c10',
        'surface-container-lowest': '#07080b',
        'surface-container-low': '#0f1217',
        'surface-container': '#14171d',
        'surface-container-high': '#1e222b',
        'surface-container-highest': '#282d3b',
        'surface-variant': '#222733',
        'surface-bright': '#2e3442',
        primary: '#fbbf24',
        'primary-hover': '#f59e0b',
        'primary-container': '#f59e0b',
        'on-primary': '#000000',
        'on-surface': '#f3f4f6',
        'on-surface-variant': '#9ca3af',
        outline: '#78716c',
        'outline-variant': '#282d3b',
        status: {
          running: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        headline: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem'
      },
      boxShadow: {
        'amber-glow': '0 0 15px rgba(245, 158, 11, 0.25)',
        'card-glow': '0 8px 24px -4px rgba(0, 0, 0, 0.6)'
      }
    }
  },
  plugins: []
}
