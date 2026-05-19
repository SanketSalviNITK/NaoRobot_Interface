/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-darker': '#05070a',
        'bg-main': '#0a0c10',
        'bg-panel': '#0d1117',
        'primary': '#00f2ff',
        'accent': '#ff007a',
        'green': '#10b981',
        'yellow': '#f59e0b',
        'panel-border': '#1a212c',
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
