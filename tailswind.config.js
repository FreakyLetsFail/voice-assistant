/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary-color': 'var(--primary-color)',
        'primary-color-dark': 'var(--primary-color-dark)',
        'text-primary': 'var(--text-primary)',
        'bg-primary': 'var(--bg-primary)',
        'card-bg': 'var(--card-bg)',
        'border-color': 'var(--border-color)',
        'hover-color': 'var(--hover-color)',
      },
    },
  },
  plugins: [],
};