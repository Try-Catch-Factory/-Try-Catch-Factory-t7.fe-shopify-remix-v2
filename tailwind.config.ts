import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        extra: ["assistant", "sans-serif"],
        assistant: ["Assistant", "sans-serif"],
        
      },

    },
  },
  plugins: [],
} satisfies Config
