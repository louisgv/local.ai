import { clsx } from "clsx"
import { Tools, TriangleFlag, WarningWindow } from "iconoir-react"
import type { NextPage } from "next"
import { NextSeo } from "next-seo"

import { BasicLayout } from "~features/layouts/base"
import { DemoButton } from "~features/press/demo-button"

const FeatureCard = ({ Icon = TriangleFlag, name = "", description = `` }) => (
  <div className="p-8 md:w-1/3 w-full">
    <div className="bg-mauve-3 text-mauve-11 flex flex-col items-center p-12 rounded">
      <div className="rounded-full bg-mauve-6 w-min p-4 mb-6">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="font-bold text-xl mb-2">{name}</h3>
      <p>{description}</p>
    </div>
  </div>
)

const IndexPage: NextPage = () => (
  <BasicLayout>
    <NextSeo
      title=""
      titleTemplate="%s – local.ai"
      description="local.ai enables developers to quickly test AI models in their local machine."
      openGraph={{
        title: "Quickly test AI models in your local machine.",
        description:
          "local.ai enables developers to quickly test AI models in their local machine.",
        url: "https://www.localai.app",
        siteName: "local.ai",
        type: "website"
      }}
    />

    {/* <!-- Hero Section --> */}
    <section className="py-20">
      <div className="container mx-auto px-8 flex flex-col items-center justify-center h-full">
        <h1 className="text-5xl md:text-6xl mb-8 text-mauve-12 text-center font-medium max-w-5xl">
          Local Model Development{" "}
          <span className="text-blue-9">streamlined</span> for Developers.
        </h1>
        <p className="text-xl mb-16 text-center max-w-xl">
          A native app that allow you to test out your AI models in your local
          machine.
        </p>
        <DemoButton />
      </div>
    </section>

    {/* <!-- Features Section --> */}
    <section className="bg-mauve-1 py-20 px-8" id="features">
      <div
        className={clsx(
          "container mx-auto",
          "flex flex-col md:flex-row md:flex-wrap md:justify-center"
        )}></div>
    </section>
  </BasicLayout>
)

export default IndexPage
