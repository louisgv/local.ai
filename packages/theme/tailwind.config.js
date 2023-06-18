/** @type {import('tailwindcss/tailwind-config').TailwindConfig} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "!./../../packages/ui/node_modules",
    "./../../packages/ui/**/*.{ts,tsx}"
  ],
  theme: {
    fontFamily: {
      // https://github.com/adobe-fonts/source-code-pro/releases
      // mono: ["Source Code Pro", "monospace"],
      sans: ["Inter", "sans-serif"],
      serif: ["Georgia", "serif"]
    },
    extend: {
      keyframes: {
        "k-scroll-x": {
          "0%": { transform: "translateX(0%)" },
          "42%": { transform: "translateX(-100%)" },
          "69%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0%)" }
        }
      },
      animation: {
        "scroll-x": "k-scroll-x 10s linear infinite"
      }
    }
  },
  variants: { extend: { typography: ["dark"] } },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("windy-radix-palette"),
    require("tailwindcss-animate")
  ]
}
