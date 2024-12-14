/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        color_bg: 'rgb(var(--color-bg) / <alpha-value>)',
        color_bg_overflow: 'rgb(var(--color-bg-overflow) / <alpha-value>)',
        color_text_main: 'rgb(var(--color-text-main) / <alpha-value>)',
        color_border: 'rgb(var(--color-border) / <alpha-value>)',
        color_text_active: 'rgb(var(--color-text-active) / <alpha-value>)',
        color_bg_active: 'rgb(var(--color-bg-active) / <alpha-value>)',
      }
    },
  },
  plugins: [],
}

