/** @type {import('tailwindcss').Config} */
export const content = [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
];
export const theme = {
  extend: {
    colors: {
      primary: '#FF6F61', // Main color
      secondary: '#98FB98', // Secondary color
      background: '#87CEEB', // Background color
    },
  },
};
export const plugins = [];
