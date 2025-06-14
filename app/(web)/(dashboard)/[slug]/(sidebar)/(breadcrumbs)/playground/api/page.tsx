import { Metadata } from "next"

import { ROUTES } from "@/lib/routes"
import { SectionWrapper } from "@/components/layout/section-wrapper"
import { PlaygroundWrapper } from "@/components/playground/playground-wrapper"

export const metadata: Metadata = ROUTES["playground-api"].metadata

export const dynamic = "force-dynamic"

type ItemsPageProps = {
  params: Promise<{ slug: string }>
}

export default async function ItemsPage({ params }: ItemsPageProps) {
  const { slug } = await params

  return (
    <SectionWrapper>
      <PlaygroundWrapper title="Playground for API" />
    </SectionWrapper>
  )
}
