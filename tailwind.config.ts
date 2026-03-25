import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        mirsa: {
          bg: '#faf9f6',
          device: '#0d0d0b',
          teal: '#2d9e75',
          amber: '#d97706',
          muted: '#6b6b6e',
          text: '#1c1c1e',
        },
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
      },
      maxWidth: {
        app: '430px',
      },
    },
  },
  plugins: [],
}
export default config
