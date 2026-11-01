/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#07080c',
          900: '#0d0f17',
          800: '#151926',
          700: '#1f2538',
        },
        emerald: {
          DEFAULT: '#10b981',
          glow: '#34d399',
        },
        enchant: {
          DEFAULT: '#a855f7',
          glow: '#c084fc',
        },
        gold: {
          DEFAULT: '#f59e0b',
          glow: '#fbbf24',
        },
      },
      fontFamily: {
        display: ['"Press Start 2P"', '"Space Grotesk"', 'monospace'],
        sans: ['"Plus Jakarta Sans"', '"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'mc-slot': 'inset -2px -2px 0px 0px rgba(255,255,255,0.12), inset 2px 2px 0px 0px rgba(0,0,0,0.65)',
        'mc-panel': '0 0 0 2px #1f2538, 0 12px 32px -4px rgba(0, 0, 0, 0.8)',
        'mc-btn': 'inset 0 -4px 0 0 rgba(0,0,0,0.45), inset 0 2px 0 0 rgba(255,255,255,0.25)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        glint: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        glint: 'glint 5s linear infinite',
      },
    },
  },
  plugins: [],
};
