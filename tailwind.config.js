/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f3e5f5', 100: '#e1bee7', 200: '#ce93d8',
          300: '#ba68c8', 400: '#ab47bc', 500: '#9B59B6',
          600: '#8e24aa', 700: '#7b1fa2', 800: '#6a1b9a', 900: '#4a148c',
        },
        accent: { 400: '#F1C40F', 500: '#f1c40f' },
        dark: { 900: '#0D0D1A', 800: '#1A1A2E', 700: '#16213E' }
      },
      fontFamily: {
        sans: ['Segoe UI', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
        mono: ['Consolas', 'Monaco', 'monospace']
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite'
      }
    }
  },
  plugins: []
}