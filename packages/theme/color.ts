import {
  blackA,
  gray,
  mauve,
  mauveA,
  purple,
  violet,
  violetA,
  whiteA,
  yellow
} from "@radix-ui/colors"

export const palette = {
  ...violetA,
  ...gray,
  ...mauve,
  ...mauveA,
  ...blackA,
  ...whiteA,
  ...yellow,

  ...violet,
  ...purple,

  purple: "#713ACA",
  lightPurple: "#9569D6",
  darkPurple: "#5f0a87",

  violet: "#644FC1",
  violetLight3: "#F5F2FF",
  violetDark3: "#251E40",

  black: "#111111",
  white: "#FFFAFD",
  gray: "#868686",
  darkGray: "#0A0A0A",
  subtleGray: "#242424"
}

export const primary = palette.purple5
