/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Lichess-inspired muted palette
        bg: {
          primary: '#312e2b',
          secondary: '#262421',
          card: '#262421',
          hover: '#3d3a37',
        },
        text: {
          primary: '#bababa',
          secondary: '#8a8886',
          muted: '#6a6966',
        },
        border: {
          DEFAULT: '#3d3a37',
        },
        // Board colors
        board: {
          light: '#f0d9b5',
          dark: '#b58863',
          selected: '#819669',
          hint: '#83934c',
          lastMove: '#cdd26a',
        },
        // Piece colors
        piece: {
          red: '#c33',
          redDark: '#a22',
          black: '#333',
          blackDark: '#222',
        },
        // Accent colors
        accent: {
          green: '#629924',
          greenHover: '#74ad2c',
        },
      },
      fontFamily: {
        sans: ['Noto Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'board': '0 2px 8px rgba(0, 0, 0, 0.3)',
        'piece': '0 2px 4px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
}
