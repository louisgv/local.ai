"use client"

import { GlobalStyle } from "@localai/theme/global-style"

import "@localai/theme/fonts.css"
import "@localai/theme/scrollbar.css"
import "@localai/theme/tailwind.css"

import type { ReactNode } from "react"

import { Layout } from "~features/layout"
import { GlobalProvider } from "~providers/global"

const LocalAIDesktopApp = ({ children = null as ReactNode }) => (
  <html lang="en">
    <GlobalStyle />
    <body className="bg-gray-1 text-gray-11 w-screen h-screen">
      <GlobalProvider>
        <Layout>{children}</Layout>
      </GlobalProvider>
    </body>
  </html>
)

export default LocalAIDesktopApp
