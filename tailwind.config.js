/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: 'var(--color-background)',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          elevated: 'var(--color-surface-elevated)',
        },
        primary: {
          DEFAULT: '#7C3AED',
          light: '#A78BFA',
        },
        cta: '#F43F5E',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        border: {
          DEFAULT: 'var(--color-border)',
        },
        muted: 'var(--color-muted)',
      },
      fontFamily: {
        heading: ['RussoOne_400Regular'],
        body: ['ChakraPetch_400Regular'],
        'body-medium': ['ChakraPetch_500Medium'],
        'body-semibold': ['ChakraPetch_600SemiBold'],
        'body-bold': ['ChakraPetch_700Bold'],
      },
      borderRadius: {
        card: '16px',
        button: '14px',
      },
    },
  },
  plugins: [],
};
