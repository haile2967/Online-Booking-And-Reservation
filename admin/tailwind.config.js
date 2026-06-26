/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'discord': {
          'dark': '#36393f',
          'darker': '#2f3136',
          'light': '#40444b',
        },
      },
    },
  },
  plugins: [],
}

