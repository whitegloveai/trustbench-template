import { Suspense } from "react"
import { Metadata } from "next"
import Image from "next/image"

import { configuration } from "@/lib/config"
import { createRoute, ROUTES } from "@/lib/routes"
import { CtaCard } from "@/components/global/cta-card"
import {
  OnboardingChecklist,
  OnboardingChecklistSkeleton,
} from "@/components/global/onboarding-checklist"
import { SectionWrapper } from "@/components/layout/section-wrapper"

export const metadata: Metadata = ROUTES.dashboard.metadata

type DashboardPageProps = {
  params: Promise<{
    slug: string
  }>
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { slug } = await params

  return (
    <SectionWrapper className="max-w-2xl gap-y-8">
      <div className="flex flex-col items-center justify-center gap-y-4">
        <Image src="/logo.svg" width={64} height={64} alt={configuration.site.name + " Logo"} />
        <h1 className="text-center text-xl font-bold">Welcome to {configuration.site.name}</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <CtaCard
          color="blue"
          href={"#"}
          heading="Add new item"
          description="Create a new item for your workspace and start generating content"
          icon="briefcase"
        />
        <CtaCard
          color="green"
          href={createRoute("analytics", { slug }).href}
          heading="View Analytics"
          description="View analytics for your workspace and see how your content is performing"
          icon="chart"
        />
        <CtaCard
          color="purple"
          href={createRoute("settings-members", { slug }).href}
          heading="Invite members"
          description="Invite members to your workspace and start generating content"
          icon="userPlus"
        />
        <CtaCard
          color="orange"
          href="#"
          heading="Coming soon..."
          description="Coming soon..."
          icon="sparkles"
        />
      </div>

      <Suspense fallback={<OnboardingChecklistSkeleton />}>
        <OnboardingChecklist />
      </Suspense>
    </SectionWrapper>
  )
}
