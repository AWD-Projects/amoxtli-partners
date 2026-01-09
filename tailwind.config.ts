import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1F2A44',
          hover: '#162033',
          active: '#121A2A',
          soft: '#EEF2FF',
        },
        surface: {
          bg: '#F7F8FA',
          card: '#FFFFFF',
          border: '#D6DCE8',
        },
        text: {
          primary: '#0B1220',
          secondary: '#5B667A',
          muted: '#5B667A',
          disabled: '#9AA4B2',
        },
        accent: {
          gold: '#C7A667',
        },
        state: {
          success: '#16A34A',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#2563EB',
        },
        background: '#F7F8FA',
        card: '#FFFFFF',
        border: '#D6DCE8',
      },
      borderRadius: {
        xl: '12px',
        lg: '10px',
        md: '8px',
        sm: '6px',
      },
      boxShadow: {
        subtle: '0 1px 2px rgba(15, 23, 42, 0.06)',
        card: '0 1px 3px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
