import { BasicLayout } from "@localai/ui/layouts/base"
import { QuickLink } from "@localai/ui/link"
import { clsx } from "clsx"
import { ListSelect, ServerConnection, ShoppingCodeCheck } from "iconoir-react"
import type { NextPage } from "next"
import { NextSeo } from "next-seo"
import Image from "next/image"
import type { ReactNode } from "react"
import Balancer from "react-wrap-balancer"

import {
  DownloadButtonGroup,
  MiniDownloadButtonGroup
} from "~features/press/download-buttons"

const FeatureCard = ({
  Icon = null as typeof ListSelect,
  title = "loremipsum",
  children = `Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut suscipit consequuntur nam distinctio blanditiis. Reprehenderit unde incidunt eaque alias nam aut. Beatae magni reiciendis sapiente illum quisquam fugiat tempore neque?` as ReactNode
}) => (
  <div className="p-2 md:p-8 md:w-1/3 w-full">
    <div className="bg-mauve-3 text-mauve-11 flex flex-col items-center p-12 rounded-lg">
      <div className="rounded-full bg-mauve-6 w-min p-4 mb-6">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="font-bold text-xl mb-2">{title}</h3>
      {children}
    </div>
  </div>
)

const FeaturesList = ({
  available = [] as string[],
  upcoming = [] as string[]
}) => (
  <>
    <hr className="border-gray-6" />
    <p className="text-sm font-bold">Available features:</p>
    <ul className="list-disc text-xs">
      {available.map((feature) => (
        <li key={feature}>{feature}</li>
      ))}
    </ul>
    <hr className="border-gray-6 border-dashed" />
    <p className="text-sm font-bold">Upcoming features:</p>
    <ul className="list-disc text-xs">
      {upcoming.map((feature) => (
        <li key={feature}>{feature}</li>
      ))}
    </ul>
  </>
)

const Logo = () => (
  <QuickLink
    className="flex items-center justify-center gap-2 font-bold text-lg text-mauve-12"
    href="/">
    <Image src={"/favicon.png"} alt="local.ai logo" width={40} height={40} />
    local.ai
  </QuickLink>
)

const IndexPage: NextPage = () => (
  <BasicLayout
    logo={<Logo />}
    nav={[
      { name: "Download", link: "#download" },
      { name: "Features", link: "#features" }
    ]}
    rightNav={<MiniDownloadButtonGroup />}>
    <NextSeo
      title="The Local AI Playground"
      description="Experiment with AI models locally with zero technical setup, powered by a native app designed to simplify the whole process. No GPU required!"
      openGraph={{
        url: "https://www.localai.app",
        siteName: "local.ai",
        type: "website",
        images: [
          {
            url: "https://www.localai.app/seo.png"
          }
        ]
      }}
      twitter={{
        cardType: "summary_large_image",
        handle: "@litbid",
        site: "https://www.localai.app"
      }}
    />
    {/* <!-- Hero Section --> */}
    <section className="p-8 pt-16 md:px-20 flex flex-col md:flex-row gap-8 mb-16">
      <div className="container flex flex-col h-full">
        <h1 className="text-5xl md:text-6xl mb-8 text-mauve-12 font-medium max-w-5xl">
          <Balancer>
            Local AI Model <span className="text-blue-9">Management</span>,{" "}
            <span className="text-cyan-9">Verification</span>, and{" "}
            <span className="text-teal-9">Inferencing</span>.
          </Balancer>
        </h1>
        <p className="text-xl max-w-xl">
          <Balancer>
            Experiment with AI models locally with a native app designed to
            simplify the whole process.
          </Balancer>
        </p>
      </div>
      <div className="w-full md:w-4/5 flex flex-col gap-2">
        <video
          autoPlay
          loop
          muted
          controls
          className="rounded-lg w-full aspect-video">
          <source
            src="https://github.com/louisgv/local.ai/assets/6723574/900f6d83-0867-4aa1-886a-e3c59b144864"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
        <span className="text-sm text-gray-10">
          In this demo, local.ai is used to start an inference session with the{" "}
          <QuickLink
            className="text-blue-9"
            href="https://github.com/nlpxucan/WizardLM">
            WizardLM 7B model
          </QuickLink>
          . The chat interface is the sample chat app on{" "}
          <QuickLink className="text-blue-9" href="https://windowai.io/">
            window.ai
          </QuickLink>
        </span>
      </div>
    </section>

    <section className="w-full px-8 flex flex-col md:flex-row md:gap-2 gap-6 items-center justify-center">
      <DownloadButtonGroup />
    </section>

    {/* <!-- Features Section --> */}

    <section className="bg-mauve-1 py-20 px-8" id="features">
      <div
        className={clsx(
          "container mx-auto",
          "flex flex-col-reverse md:flex-row md:justify-center md:items-center",
          "gap-8 md:gap-0"
        )}>
        <FeatureCard Icon={ListSelect} title="Model Management">
          <div className="flex flex-col gap-2">
            <p className="h-24">
              Keep track of your AI models in one centralized location. Pick any
              directory!
            </p>
            <FeaturesList
              available={[
                "Resumable model downloader",
                "Usage-based sorting",
                "Pick any directory"
              ]}
              upcoming={["Nested directory", "Custom Sorting and Searching"]}
            />
          </div>
        </FeatureCard>
        <div className="flex md:w-2/3">
          <Image
            className="rounded-lg"
            src={"/screenshots/download.png"}
            alt="Model downloader"
            width={2146}
            height={1374}
          />
        </div>
      </div>
    </section>

    <section className="bg-mauve-2 py-20 px-8">
      <div
        className={clsx(
          "container mx-auto",
          "flex flex-col md:flex-row md:justify-center md:items-center",
          "gap-8 md:gap-0"
        )}>
        <div className="flex md:w-2/3 relative">
          <div className="flex flex-col gap-2 z-1">
            <Image
              className="rounded-lg"
              src={"/screenshots/digest-compute.png"}
              alt="Digest Verification"
              width={1990}
              height={328}
            />
            <Image
              className="rounded-lg"
              src={"/screenshots/known-model.png"}
              alt="Model downloader"
              width={1978}
              height={1390}
            />
          </div>
        </div>
        <FeatureCard Icon={ShoppingCodeCheck} title="Digest Verification">
          <div className="flex flex-col gap-2">
            <p className="h-24">
              {`Ensure the integrity of downloaded models with a robust BLAKE3 and SHA256 digest
              compute feature.`}
            </p>

            <FeaturesList
              available={[
                "Known-good model API",
                "Digest compute",
                "License and Usage tracking"
              ]}
              upcoming={["BLAKE3 quick check", "Model card"]}
            />
          </div>
        </FeatureCard>
      </div>
    </section>
    <section className="bg-mauve-1 py-20 px-8">
      <div
        className={clsx(
          "container mx-auto",
          "flex flex-col-reverse md:flex-row md:justify-center md:items-center",
          "gap-8 md:gap-0"
        )}>
        <FeatureCard Icon={ServerConnection} title="Inferencing Server">
          <div className="flex flex-col gap-2">
            <p className="h-24">
              Start a local streaming server for AI inferencing in 2 clicks:
              Load model, then start server.
            </p>
            <FeaturesList
              available={[
                "Streaming server",
                "Quick Inference UI",
                "Writes to .mdx"
              ]}
              upcoming={["/audio", "/image"]}
            />
          </div>
        </FeatureCard>

        <div className="flex md:w-2/3">
          <div className="flex flex-col gap-2">
            <Image
              className="rounded-lg"
              src={"/screenshots/convo.png"}
              alt="Conversation"
              width={2196}
              height={1500}
            />
            <Image
              className="rounded-lg"
              src={"/screenshots/note.png"}
              alt="Note taking"
              width={1204}
              height={702}
            />
          </div>
        </div>
      </div>
    </section>

    <section className="w-full px-8 pb-8 flex flex-col md:flex-row md:gap-2 gap-6 items-center justify-center">
      <DownloadButtonGroup />
    </section>
  </BasicLayout>
)

export default IndexPage
