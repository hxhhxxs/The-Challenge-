import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        challenge: {
          dark: '#0f172a',
          green: '#1f7a4d',
          gold: '#f5c542',
          cream: '#fff8ed',
        },
      },
    },
  },
  plugins: [],
};

export default config;
