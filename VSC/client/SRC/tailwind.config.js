/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0F172A',
        accent: '#3B82F6',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#6366F1',
        surface: '#FFFFFF',
        bg: '#F8FAFC',
        'text-primary': '#1E293B',
        'text-secondary': '#64748B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['monospace'],
      },
      borderRadius: {
        lg: '12px',
        md: '8px',
        sm: '4px',
        full: '9999px',
      },
    },
  },
  plugins: [],
};