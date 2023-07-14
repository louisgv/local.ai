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
          "42%": { transform: "translateX(0%)" },
          "69%": { transform: "translateX(-99%)" },
          "88%": { transform: "translateX(-69%)" },
          "100%": { transform: "translateX(0%)" }
        },
        "fade-in": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 }
        }
      },
      animation: {
        "scroll-x": "k-scroll-x 10s linear infinite",
        "fade-in-once": "fade-in ease-in-out 0.47s forwards",
        "fade-in-once-delayed": "fade-in ease-in-out 0.47s forwards 1.47s"
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
