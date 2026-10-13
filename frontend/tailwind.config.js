import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: ['class', '[data-theme="chatchi-dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Vazirmatn', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        'chatchi-light': {
          primary: '#1b693a',
          'primary-content': '#ffffff',
          secondary: '#334155',
          'secondary-content': '#ffffff',
          accent: '#0d9488',
          neutral: '#0f172a',
          'neutral-content': '#f8fafc',
          'base-100': '#ffffff',
          'base-200': '#f8fafc',
          'base-300': '#e2e8f0',
          'base-content': '#0f172a',
          info: '#0284c7',
          success: '#16a34a',
          warning: '#d97706',
          error: '#dc2626',
          '--rounded-box': '0.5rem',
          '--rounded-btn': '0.375rem',
          '--rounded-badge': '0.25rem',
          '--animation-btn': '0.1s',
          '--border-btn': '1px',
        },
        'chatchi-dark': {
          primary: '#22c55e',
          'primary-content': '#052e16',
          secondary: '#94a3b8',
          'secondary-content': '#0f172a',
          accent: '#14b8a6',
          neutral: '#1e293b',
          'neutral-content': '#f1f5f9',
          'base-100': '#0b0f17',
          'base-200': '#111827',
          'base-300': '#1f2937',
          'base-content': '#f3f4f6',
          info: '#38bdf8',
          success: '#4ade80',
          warning: '#fbbf24',
          error: '#f87171',
          '--rounded-box': '0.5rem',
          '--rounded-btn': '0.375rem',
          '--rounded-badge': '0.25rem',
          '--animation-btn': '0.1s',
          '--border-btn': '1px',
        },
      },
    ],
    darkTheme: 'chatchi-dark',
  },
};
