import { cn } from "@localai/theme/utils"
import { BasicLayout } from "@localai/ui/layouts/base"
import { QuickLink } from "@localai/ui/link"
import { clsx } from "clsx"
import {
  BrainElectricity,
  ListSelect,
  ServerConnection,
  ShoppingCodeCheck
} from "iconoir-react"
import type { NextPage } from "next"
import { NextSeo } from "next-seo"
import Image from "next/image"
import type { ReactNode } from "react"
import Balancer from "react-wrap-balancer"

import {
  DownloadButtonGroup,
  MiniDownloadButtonGroup
} from "~features/press/download-buttons"

import faviconPic from "../../public/favicon.png"
import convoPic from "../../public/screenshots/convo.png"
import digestComputePic from "../../public/screenshots/digest-compute.png"
import downloadPic from "../../public/screenshots/download.png"
import knownModelPic from "../../public/screenshots/known-model.png"
import notePic from "../../public/screenshots/note.png"

const FeatureCard = ({
  Icon = null as typeof ListSelect,
  title = "loremipsum",
  children = `Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut suscipit consequuntur nam distinctio blanditiis. Reprehenderit unde incidunt eaque alias nam aut. Beatae magni reiciendis sapiente illum quisquam fugiat tempore neque?` as ReactNode
}) => (
  <div className="p-2 lg:p-8 lg:w-1/3 w-full max-w-sm self-center">
    <div className="bg-mauve-3 text-mauve-11 flex flex-col items-center p-12 rounded-lg">
      <div className="rounded-full bg-mauve-6 w-min p-4 mb-6">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="font-bold text-xl mb-2 text-gray-12">{title}</h3>
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
    <ul className="list-disc text-xs flex flex-col gap-1 text-gray-10">
      {available.map((feature) => (
        <li key={feature}>{feature}</li>
      ))}
    </ul>
    <hr className="border-gray-6 border-dashed" />
    <p className="text-sm font-bold">Upcoming features:</p>
    <ul className="list-disc text-xs flex flex-col gap-1 text-gray-10">
      {upcoming.map((feature) => (
        <li key={feature}>{feature}</li>
      ))}
    </ul>
  </>
)

const Logo = () => (
  <QuickLink
    className={cn(
      "flex items-center justify-between gap-2 font-bold text-lg pr-3 rounded-xl transition-colors",
      "bg-mauve-1/60 text-mauve-12",
      "hover:bg-mauve-4 hover:shadow-inner"
    )}
    href="/">
    <Image
      src={faviconPic}
      alt="local.ai logo"
      placeholder="blur"
      className="w-12 h-12"
    />
    local.ai
  </QuickLink>
)

const SocialBumper = () => (
  <section className="flex w-full p-8 items-center justify-center">
    <a
      href="https://www.producthunt.com/posts/local-ai?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-local&#0045;ai"
      target="_blank">
      <picture>
        <img
          src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=397982&theme=light"
          alt="local&#0046;ai - Free&#0044;&#0032;Local&#0044;&#0032;Offline&#0032;AI&#0032;with&#0032;Zero&#0032;Technical&#0032;Setup&#0046; | Product Hunt"
          style={{
            width: "250px",
            height: "54px"
          }}
          width="250"
          height="54"
        />
      </picture>
    </a>
  </section>
)

const IndexPage: NextPage = () => (
  <BasicLayout logo={<Logo />} nav={[]} rightNav={<MiniDownloadButtonGroup />}>
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
    <section className="p-8 pt-16 flex flex-col lg:flex-row gap-8">
      <div
        className={clsx(
          "container mx-auto",
          "flex flex-col lg:flex-row lg:justify-center lg:items-between",
          "gap-8 lg:gap-8"
        )}>
        <div className="flex flex-col lg:w-1/3 h-full">
          <h1 className="text-5xl lg:text-6xl mb-8 text-mauve-12 font-medium max-w-5xl">
            <Balancer>
              Local AI <span className="text-blue-9">Management</span>,{" "}
              <span className="text-cyan-9">Verification</span>, &{" "}
              <span className="text-teal-9">Inferencing</span>.
            </Balancer>
          </h1>
          <p className="text-xl max-w-xl">
            <Balancer>
              Experiment with AI models locally with a native app designed to
              simplify the whole process.
            </Balancer>
          </p>
          <p className="text-md text-gray-10 mt-2">
            <Balancer>Free and open-source.</Balancer>
          </p>
        </div>
        <div className="w-full lg:w-2/3 flex flex-col gap-2">
          <video
            autoPlay
            loop
            muted
            controls
            width="1600"
            height="900"
            className="rounded-lg w-full aspect-video">
            <source
              src="https://github.com/louisgv/local.ai/assets/6723574/ba4a04dc-5087-4725-b619-165ad774aedd"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
          <span className="self-center text-sm text-gray-10">
            Starting an inference session with the{" "}
            <QuickLink
              className="text-blue-9"
              href="https://github.com/nlpxucan/WizardLM">
              WizardLM 7B model
            </QuickLink>{" "}
            <b className="text-gray-11">in 2 clicks.</b>
          </span>
        </div>
      </div>
    </section>

    <section className="w-full p-8 flex flex-col lg:flex-row lg:gap-2 gap-6 items-center justify-center mb-8">
      <DownloadButtonGroup />
    </section>

    {/* <!-- Features Section --> */}

    <section className="bg-mauve-2 py-20 px-8 lg:rounded-md" id="features">
      <div
        className={clsx(
          "container mx-auto",
          "flex flex-col lg:flex-row lg:justify-center lg:items-center",
          "gap-8 lg:gap-0"
        )}>
        <div className="flex flex-col gap-2 lg:w-2/3">
          <video
            autoPlay
            loop
            muted
            controls
            className="rounded-lg w-full aspect-video">
            <source
              src="https://github.com/louisgv/local.ai/assets/6723574/c56400b4-4520-47da-80fb-ab8552a2683b"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
          <span className="self-center text-sm text-gray-10">
            Power <b className="text-gray-11">any AI app</b>, offline or online.
            Here in tandem with{" "}
            <QuickLink className="text-blue-9" href="https://windowai.io/">
              window.ai
            </QuickLink>
            .
          </span>
        </div>
        <FeatureCard Icon={BrainElectricity} title="Powerful Native App">
          <div className="flex flex-col gap-2">
            <p className="h-24">
              With a Rust backend, local.ai is memory efficient and compact.{" "}
              <span className="text-xs text-gray-10">
                {`(<10MB on Mac M2, Windows, and Linux .deb)`}
              </span>
            </p>
            <FeaturesList
              available={[
                "CPU Inferencing",
                "Adapts to available threads",
                "GGML quantization q4, 5.1, 8, f16"
              ]}
              upcoming={["GPU Inferencing", "Parallel session"]}
            />
          </div>
        </FeatureCard>
      </div>
    </section>

    <section className="bg-mauve-1 py-20 px-8" id="features">
      <div
        className={clsx(
          "container mx-auto",
          "flex flex-col lg:flex-row-reverse lg:justify-center lg:items-center",
          "gap-8 lg:gap-0"
        )}>
        <div className="flex lg:w-2/3">
          <Image
            className="rounded-lg"
            src={downloadPic}
            alt="Model downloader"
            placeholder="blur"
          />
        </div>
        <FeatureCard Icon={ListSelect} title="Model Management">
          <div className="flex flex-col gap-2">
            <p className="h-24">
              Keep track of your AI models in one centralized location. Pick any
              directory!
            </p>
            <FeaturesList
              available={[
                "Resumable, concurrent downloader",
                "Usage-based sorting",
                "Directory agnostic"
              ]}
              upcoming={["Nested directory", "Custom Sorting and Searching"]}
            />
          </div>
        </FeatureCard>
      </div>
    </section>

    <section className="bg-mauve-2 py-20 px-8 lg:rounded-md">
      <div
        className={clsx(
          "container mx-auto",
          "flex flex-col lg:flex-row lg:justify-center lg:items-center",
          "gap-8 lg:gap-0"
        )}>
        <div className="flex lg:w-2/3 relative">
          <div className="flex flex-col gap-2 z-1">
            <Image
              className="rounded-lg"
              src={digestComputePic}
              alt="Digest Verification"
              placeholder="blur"
            />
            <Image
              className="rounded-lg"
              alt="Known Model"
              src={knownModelPic}
              placeholder="blur"
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
                "Digest compute",
                "Known-good model API",
                "License and Usage chips",
                "BLAKE3 quick check",
                "Model info card"
              ]}
              upcoming={[
                "Model Explorer",
                "Model Search",
                "Model Recommendation"
              ]}
            />
          </div>
        </FeatureCard>
      </div>
    </section>
    <section className="bg-mauve-1 py-20 px-8">
      <div
        className={clsx(
          "container mx-auto",
          "flex flex-col lg:flex-row-reverse lg:justify-center lg:items-center",
          "gap-8 lg:gap-0"
        )}>
        <div className="flex lg:w-2/3">
          <div className="flex flex-col gap-2">
            <Image
              className="rounded-lg"
              src={convoPic}
              alt="Conversation"
              placeholder="blur"
            />
            <Image
              className="rounded-lg"
              src={notePic}
              alt="Note taking"
              placeholder="blur"
            />
          </div>
        </div>
        <FeatureCard Icon={ServerConnection} title="Inferencing Server">
          <div className="flex flex-col gap-2">
            <p className="h-24">
              Start a local streaming server for AI inferencing in 2 clicks:
              Load model, then start server.
            </p>
            <FeaturesList
              available={[
                "Streaming server",
                "Quick inference UI",
                "Writes to .mdx",
                "Inference params",
                "Remote vocabulary"
              ]}
              upcoming={["Server Managet", "/audio", "/image"]}
            />
          </div>
        </FeatureCard>
      </div>
    </section>

    <section className="w-full px-8 pb-8 flex flex-col lg:flex-row lg:gap-2 gap-6 items-center justify-center">
      <DownloadButtonGroup />
    </section>
    <SocialBumper />
  </BasicLayout>
)

export default IndexPage
