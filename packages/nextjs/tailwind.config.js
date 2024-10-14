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
          primary: "#CCE4F6", // More visible light blue for primary
          "primary-content": "#000000", // Darker contrast for text
          secondary: "#A0C4E0", // More visible light blue for secondary
          "secondary-content": "#000000", // Darker contrast for text
          accent: "#000000", // More visible light blue for accent
          "accent-content": "#000000", // Darker contrast for accent content
          neutral: "#F0F8FF", // Light blue for neutral background
          "neutral-content": "#000000", // Darker contrast for text
          "base-100": "#CCE4F6", // Light blue for base background
          "base-200": "#E0F0FF", // Slightly darker light blue for sections
          "base-300": "#A0C4E0", // Slightly darker light blue for borders/secondary base
          "base-content": "#000000", // Darker contrast for base content
          info: "#A0C4E0", // Light blue for info messages
          success: "#32CD32", // Bright green for success
          warning: "#FFD700", // Bright yellow for warnings
          error: "#FF6347", // Bright red for errors

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
          accent: "#FFFFFF", // Even darker blue
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
