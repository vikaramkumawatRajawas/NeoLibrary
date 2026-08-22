/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./frontend/src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        midnight: '#080B18',
        navy: {
          900: '#0B0F21',
          800: '#10162B',
          700: '#18203D',
          600: '#232D52',
        },
        violet: {
          accent: '#7C3AED',
          glow: '#9333EA',
        },
        cyber: {
          blue: '#2563EB',
          glow: '#3B82F6',
        },
        aqua: {
          DEFAULT: '#22D3EE',
          glow: '#06B6D4',
        },
        highlight: '#F8FAFC',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(16, 22, 43, 0.8) 0%, rgba(8, 11, 24, 0.9) 100%)',
        'gradient-accent': 'linear-gradient(135deg, #7C3AED 0%, #2563EB 50%, #22D3EE 100%)',
      },
      boxShadow: {
        'glass-sm': '0 4px 20px -2px rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)',
        'glass-md': '0 8px 32px 0 rgba(0, 0, 0, 0.6), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)',
        'glass-lg': '0 20px 50px 0 rgba(0, 0, 0, 0.8), inset 0 1px 2px 0 rgba(255, 255, 255, 0.2)',
        'glow-violet': '0 0 25px -5px rgba(124, 58, 237, 0.5)',
        'glow-cyber': '0 0 25px -5px rgba(37, 99, 235, 0.5)',
        'glow-aqua': '0 0 25px -5px rgba(34, 211, 238, 0.5)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite',
        'float-reverse': 'floatReverse 8s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 20s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-15px) rotate(2deg)' },
        },
        floatReverse: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(15px) rotate(-2deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', filter: 'blur(20px)' },
          '50%': { opacity: '0.8', filter: 'blur(30px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
