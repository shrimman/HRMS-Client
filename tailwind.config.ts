import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f6fc',
          100: '#d9ebf5',
          200: '#b3d7eb',
          300: '#8cc2df',
          400: '#6db2d8',
          500: '#34699a', // Main blue
          600: '#2e5f8c',
          700: '#245577',
          800: '#1e4b62',
          900: '#113f67', // Dark navy
        },
        secondary: {
          50: '#f0f7fb',
          100: '#d9ebf5',
          200: '#b3d5eb',
          300: '#8cc3e1',
          400: '#6eb4d8',
          500: '#58a0c8', // Light blue
          600: '#4a8cb5',
          700: '#3d78a2',
          800: '#306490',
          900: '#23507d',
        },
        accent: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#f0f0ed',
          300: '#e8e8e4',
          400: '#dcdcd7',
          500: '#d0d0ca', // Main off-white
          600: '#c4c4be',
          700: '#b8b8b1',
          800: '#acaca5',
          900: '#a0a099',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
