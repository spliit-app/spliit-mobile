/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./{app,components,utils}/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: { DEFAULT: 'var(--color-background)' },
        foreground: { DEFAULT: 'var(--color-foreground)' },
        'foreground-accent': { DEFAULT: 'var(--color-foreground-accent)' },
        'foreground-danger': { DEFAULT: 'var(--color-foreground-danger)' },
        'background-card': { DEFAULT: 'var(--color-background-card)' },
        'background-accent': { DEFAULT: 'var(--color-background-accent)' },
        'foreground-secondary': {
          DEFAULT: 'var(--color-foreground-secondary)',
        },
        'foreground-on-accent': {
          DEFAULT: 'var(--color-foreground-on-accent)',
        },
        border: { DEFAULT: 'var(--color-border)' },
        'background-positive': 'var(--color-background-positive)',
        'background-negative': 'var(--color-background-negative)',
        'background-overlay': 'var(--color-background-overlay)',
        'border-positive': 'var(--color-border-positive)',
        'border-negative': 'var(--color-border-negative)',
      },
    },
  },
  plugins: [],
}
