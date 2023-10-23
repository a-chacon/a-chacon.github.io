module.exports = {
  content: [
    '*.html',
    '_layouts/**/*.html',
    '_includes/**/*.html'
  ],
  theme: {
    extend: {
      fontFamily: {
        'poppins': ['Raleway', 'sans-serif']
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
}
