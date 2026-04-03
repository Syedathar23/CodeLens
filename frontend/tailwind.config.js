/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#0e0e0e',
        'surface-container': '#191a1a',
        'surface-container-low': '#131313',
        'surface-container-high': '#202020',
        'surface-container-lowest': '#000000',
        'surface-container-highest': '#262626',
        'surface-bright': '#2c2c2c',
        primary: '#aaa4ff',
        'primary-dim': '#9891ff',
        'on-primary': '#26158a',
        'primary-container': '#9b94ff',
        secondary: '#65f3b6',
        'secondary-dim': '#55e4a9',
        'on-secondary': '#00583b',
        error: '#ff6e84',
        'error-dim': '#d73357',
        'on-surface': '#ffffff',
        'on-surface-variant': '#adaaaa',
        'outline-variant': '#484848',
        outline: '#767575',
      },
      fontFamily: {
        headline: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        label: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
