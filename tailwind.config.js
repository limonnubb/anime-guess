/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#08080d',
        card: '#111119',
        border: '#1e1e2e',
        text: '#eaeaf0',
        muted: '#6b6b80',
        accent: '#f43f5e',
        ok: '#10b981',
        err: '#ef4444',
      },
    },
  },
  plugins: [],
}