import { clsx } from "clsx"
import { Tools, TriangleFlag, WarningWindow } from "iconoir-react"
import type { NextPage } from "next"
import { NextSeo } from "next-seo"

import { BasicLayout } from "~features/layouts/base"
import { DemoButton } from "~features/press/demo-button"

const FeatureCard = ({
  Icon = TriangleFlag,
  name = "User Journey Analysis",
  description = `Discover the path that led to security breaches with Jalias's
  advanced user journey analysis.`
}) => (
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
      title="Streamline Cybersecurity Response for Blue Teams in Enterprise Companies"
      titleTemplate="%s – Jalias"
      description="Jalias is a cutting-edge cybersecurity response platform specifically designed for Blue Teams in large enterprise companies. Our advanced AI-driven solution streamlines the incident response process by analyzing user journeys to determine the path that led to security breaches. Jalias seamlessly integrates with SIEM, SOAR, EDR, NSM, and SOC tools to provide a comprehensive and efficient cybersecurity response."
      openGraph={{
        title: "Uncover the How and Why of Security Incidents with Jalias",
        description:
          "Discover the how and why behind security incidents with Jalias, an AI-driven cybersecurity response platform for Blue Teams in large enterprise companies.",
        url: "https://www.jalias.com",
        siteName: "Jalias",
        type: "website"
      }}
    />

    {/* <!-- Hero Section --> */}
    <section className="py-20">
      <div className="container mx-auto px-8 flex flex-col items-center justify-center h-full">
        <h1 className="text-5xl md:text-6xl mb-8 text-mauve-12 text-center font-medium max-w-5xl">
          Cybersecurity response{" "}
          <span className="text-blue-9">streamlined</span> for large
          Enterprises.
        </h1>
        <p className="text-xl mb-16 text-center max-w-xl">
          An LLM-driven solution that produces actionable visibility to incident
          response, enabling faster decision making for SOC analysts.
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
        )}>
        {/* <!-- Feature 1 --> */}
        <FeatureCard
          Icon={TriangleFlag}
          name="User Journey Analysis"
          description={`Discover the path that led to security breaches with Jalias's advanced user journey analysis.`}
        />

        {/* <!-- Feature 2 --> */}
        {/* <FeatureCard
          Icon={PathArrow}
          name="AI-Driven Incident Triage"
          description={`Respond to incidents efficiently with Jalias's AI-driven incident triage capabilities.`}
        /> */}

        {/* <!-- Feature 3 --> */}
        <FeatureCard
          Icon={Tools}
          name="Seamless Tool Integration"
          description={`Integrate Jalias with your existing SIEM, SOAR, EDR, NSM, and SOC tools for a comprehensive cybersecurity response.`}
        />

        {/* <!-- Feature 4 --> */}
        <FeatureCard
          Icon={WarningWindow}
          name="Alert Management"
          description={`Customize alert management to suit your enterprise's unique needs and enhance incident response.`}
        />
      </div>
    </section>
  </BasicLayout>
)

export default IndexPage
