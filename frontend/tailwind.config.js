/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        guardian: '#B8663F',
        'guardian-dark': '#9A5232',
        'guardian-bg': '#F7EDE5',
        healthy: '#4F7D62',
        'healthy-bg': '#EDF4F0',
        attention: '#D39A3D',
        'attention-bg': '#FBF3E3',
        critical: '#C85C4A',
        'critical-bg': '#FAE9E7',
        surface: '#FFFDF8',
        'warm-bg': '#F7F3EC',
        border: '#E8E2D9',
        charcoal: '#242321',
        'nav-bg': '#1E1C1A',
        'nav-text': '#C8C2BA',
      },
      fontFamily: {
        ui: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
