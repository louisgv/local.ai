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
      animation: {
        "delayed-fadein-once": "fadein .42s ease-in-out 1.47s forwards",
        "fadein-once": "fadein ease-in-out 1.47s forwards",
        "fadein-once-quick": "fadein ease-in-out 0.47s forwards"
      },
      keyframes: {
        fadein: {
          "0%": { opacity: 0 },
          "100%": {
            opacity: 1
          }
        }
      },
      // TODO: Get this to actually work
      lineClamp: {
        10: "10"
      }
    }
  },
  variants: { extend: { typography: ["dark"] } },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("windy-radix-palette")
  ]
}
