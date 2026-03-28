/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Cook Book Bake brand colors - Light Theme
        primary: {
          light: '#B8E0E8',      // Primary light blue background
          'light-alt': '#D4EFF5',   // Lighter blue for cards/hover
          white: '#FFFFFF',      // Elevated surfaces
        },
        text: {
          primary: '#1A3A42',    // Main text - dark blue-gray
          secondary: '#2E5862',  // Medium blue-gray
          muted: '#6B8E95',      // Borders/disabled
          'on-accent': '#FFFFFF',   // Text on buttons/accents
        },
        accent: {
          teal: '#1B9AAA',       // Vibrant teal - primary CTA
          'teal-dark': '#147482',   // Teal hover states
          blue: '#0D7C8E',       // Secondary actions
          coral: '#FF8B6A',      // Featured badges
        }
      },
      fontFamily: {
        karla: ['Karla', 'Arial', 'sans-serif'],
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      }
    },
  },
  plugins: [],
};
