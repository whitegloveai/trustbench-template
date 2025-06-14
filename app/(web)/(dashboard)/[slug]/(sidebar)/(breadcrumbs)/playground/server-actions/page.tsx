import { Metadata } from "next"
import { HydrateClient, trpc } from "@/trpc/server"

import { ROUTES } from "@/lib/routes"
import { ItemsGrid } from "@/components/item/items-grid"
import { SectionWrapper } from "@/components/layout/section-wrapper"

export const metadata: Metadata = ROUTES["playground-server-actions"].metadata

export const dynamic = "force-dynamic"

type ItemsPageProps = {
  params: Promise<{ slug: string }>
}

export default async function ItemsPage({ params }: ItemsPageProps) {
  const { slug } = await params

  return (
    <HydrateClient>
      <div>Hello</div>
    </HydrateClient>
  )
}
