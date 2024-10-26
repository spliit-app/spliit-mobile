/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./{app,components,utils}/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {},
  },
  plugins: [],
}
