/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      colors: {
        campus: {
          primary: '#2563EB',
          secondary: '#1E40AF',
          accent: '#EF4444',
          background: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
        }
      }
    }
  },
  plugins: [],
}