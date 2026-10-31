/** @type {import('tailwindcss').Config} */
const primary = {
  50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7',
  400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857',
  800: '#065f46', 900: '#064e3b', 950: '#022c22',
};
const accent = {
  50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d',
  400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309',
  800: '#92400e', 900: '#78350f', 950: '#451a03',
};
const info = {
  50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
  400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8',
  800: '#1e40af', 900: '#1e3a8a', 950: '#172554',
};
const warning = {
  50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74',
  400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c',
  800: '#9a3412', 900: '#7c2d12', 950: '#431407',
};
const error = {
  50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5',
  400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c',
  800: '#991b1b', 900: '#7f1d1d', 950: '#450a0a',
};
const neutral = {
  50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
  400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155',
  800: '#1e293b', 900: '#0f172a', 950: '#020617',
};

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary, accent, info, warning, error, neutral,
        ink: neutral[900],
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Cairo"', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', '"Cairo"', 'system-ui', 'sans-serif'],
        ar: ['"Cairo"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -12px rgba(15,23,42,0.12)',
        pop: '0 4px 16px -4px rgba(15,23,42,0.18)',
        glow: '0 0 0 4px rgba(16,185,129,0.18)',
        'glow-accent': '0 0 0 4px rgba(245,158,11,0.18)',
        'inner-soft': 'inset 0 1px 2px rgba(15,23,42,0.06)',
        'path-node': '0 2px 8px -2px rgba(16,185,129,0.25), 0 4px 16px -4px rgba(15,23,42,0.1)',
        'path-node-active': '0 4px 12px -2px rgba(16,185,129,0.4), 0 8px 24px -4px rgba(15,23,42,0.15)',
      },
      keyframes: {
        'pop-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '60%': { transform: 'scale(1.03)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'shake': {
          '0%,100%': { transform: 'translateX(0)' },
          '20%,60%': { transform: 'translateX(-6px)' },
          '40%,80%': { transform: 'translateX(6px)' },
        },
        'float-up': {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'coin-bounce': {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(12px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-reverse': {
          '0%': { transform: 'translateX(-12px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0.7)', opacity: '0' },
          '50%': { transform: 'scale(1.1)' },
          '70%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.95)', opacity: '0.7' },
          '70%': { transform: 'scale(1.3)', opacity: '0' },
          '100%': { transform: 'scale(1.3)', opacity: '0' },
        },
        'float-gentle': {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'path-draw': {
          '0%': { strokeDashoffset: '100%' },
          '100%': { strokeDashoffset: '0%' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'confetti': {
          '0%': { transform: 'translateY(0) rotate(0)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(360deg)', opacity: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'wiggle': {
          '0%,100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        'heartbeat': {
          '0%,100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
        },
      },
      animation: {
        'pop-in': 'pop-in 0.28s ease-out',
        'shake': 'shake 0.4s ease-in-out',
        'float-up': 'float-up 0.4s ease-out',
        'coin-bounce': 'coin-bounce 1.6s ease-in-out infinite',
        'slide-in': 'slide-in 0.3s ease-out',
        'slide-in-reverse': 'slide-in-reverse 0.3s ease-out',
        'bounce-in': 'bounce-in 0.4s ease-out',
        'pulse-ring': 'pulse-ring 1.5s ease-out infinite',
        'float-gentle': 'float-gentle 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'confetti': 'confetti 3s ease-in forwards',
        'fade-in': 'fade-in 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'heartbeat': 'heartbeat 0.6s ease-in-out',
      },
      backgroundImage: {
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
      },
    },
  },
  plugins: [],
};
