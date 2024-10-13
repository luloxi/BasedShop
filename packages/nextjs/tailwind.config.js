/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./utils/**/*.{js,ts,jsx,tsx}"],
  plugins: [require("daisyui")],
  darkTheme: "dark",
  darkMode: ["selector", "[data-theme='dark']"], // Dark mode setup
  // DaisyUI theme colors
  daisyui: {
    themes: [
      {
        light: {
          primary: "#FFB07A", // Slightly lighter orange for primary
          "primary-content": "#A0522D", // Slightly lighter contrast for text
          secondary: "#CD853F", // Slightly lighter orange for secondary
          "secondary-content": "#A0522D", // Slightly lighter tone for contrast
          accent: "#FFD1A3", // Slightly lighter orange for accent
          "accent-content": "#CD853F", // Slightly lighter brown for accent content
          neutral: "#FFEBCD", // Slightly lighter neutral orange background
          "neutral-content": "#A0522D", // Slightly lighter text color
          "base-100": "#FFB84C", // Darker brown for base background
          "base-200": "#F5DEB3", // Lighter brown for sections
          "base-300": "#DEB887", // Darker brown for borders/secondary base
          "base-content": "#8B4513", // Darker content color for base
          info: "#CD853F", // Darker brown for info messages
          success: "#3CB371", // Slightly lighter green for success
          warning: "#D2691E", // Darker brown for warnings
          error: "#A52A2A", // Darker red for errors

          "--rounded-btn": "9999rem", // Keep the button rounded

          ".tooltip": {
            "--tooltip-tail": "6px",
            "--tooltip-color": "oklch(var(--p))",
          },
          ".link": {
            textUnderlineOffset: "2px",
          },
          ".link:hover": {
            opacity: "80%",
          },
        },
      },
      {
        dark: {
          primary: "#003366", // Dark blue
          "primary-content": "#F9FBFF",
          secondary: "#001a33", // Darker blue
          "secondary-content": "#F9FBFF",
          accent: "#001122", // Even darker blue
          "accent-content": "#F9FBFF",
          neutral: "#F9FBFF",
          "neutral-content": "#001122", // Dark blue
          "base-100": "#001122", // Dark blue
          "base-200": "#001a33", // Darker blue
          "base-300": "#003366", // Dark blue
          "base-400": "#002233", // Darker blue
          "base-content": "#F9FBFF",
          info: "#001122", // Dark blue
          success: "#34EEB6",
          warning: "#FFCF72",
          error: "#FF8863",

          "--rounded-btn": "9999rem",

          ".tooltip": {
            "--tooltip-tail": "6px",
            "--tooltip-color": "oklch(var(--p))",
          },
          ".link": {
            textUnderlineOffset: "2px",
          },
          ".link:hover": {
            opacity: "80%",
          },
        },
      },
    ],
  },
  theme: {
    extend: {
      boxShadow: {
        center: "0 0 12px -2px rgb(0 0 0 / 0.05)",
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
};
