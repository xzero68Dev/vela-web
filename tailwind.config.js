/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        vela: {
          cream:   '#EDE8DF',
          'cream-dark': '#E0D9CE',
          red:     '#D64B2A',
          'red-dark': '#B03A1E',
          'red-light': '#F2EAE6',
          brown:   '#3D1F0F',
          muted:   '#8C7B6E',
          faint:   '#C5BAB0',
        }
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body:    ['var(--font-body)'],
        mono:    ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'fade-up':   'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-in':   'fadeIn 0.4s ease forwards',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'wiggle':    'wiggle 0.4s ease',
        'float':     'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:   { '0%': { opacity:'0', transform:'translateY(16px)' }, '100%': { opacity:'1', transform:'translateY(0)' } },
        fadeIn:   { '0%': { opacity:'0' }, '100%': { opacity:'1' } },
        bounceIn: { '0%': { opacity:'0', transform:'scale(0.8)' }, '100%': { opacity:'1', transform:'scale(1)' } },
        wiggle:   { '0%,100%': { transform:'rotate(0deg)' }, '25%': { transform:'rotate(-8deg)' }, '75%': { transform:'rotate(8deg)' } },
        float:    { '0%,100%': { transform:'translateY(0px)' }, '50%': { transform:'translateY(-6px)' } },
      },
    },
  },
  plugins: [],
}
