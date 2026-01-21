/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-yellow': '#F3A683', // Muted Coral/Peach
        'sage-green': '#D1D8C4', // Very Muted Sage
        'warm-cream': '#FDFBF7',
        'soft-charcoal': '#2D3436',
        'paper-blue': '#D1E9F6',
        'paper-pink': '#FADFA1',
        'paper-green': '#D1D8C4',
        'paper-yellow': '#FFF4E0',
        'paper-purple': '#E5D9F2',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        hand: ['"ZCOOL KuaiLe"', 'cursive'],
        display: ['ZCOOL KuaiLe', 'serif'],
        josefin: ['"Josefin Sans"', 'sans-serif'],
        sans: ['"Josefin Sans"', 'Inter', 'sans-serif'],
        quebec: ['"Alfa Slab One"', 'serif'],
        minou: ['"ZCOOL KuaiLe"', 'cursive'],
      },
      boxShadow: {
        'soft': '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        'soft-lg': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
      },
      dropShadow: {
        'soft': '0 4px 6px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'neo': '1.5rem',
        'soft-xl': '2rem',
        'soft-2xl': '3rem',
      },
      borderWidth: {
        'neo': '1px',
      }
    },
  },
  plugins: [],
}
