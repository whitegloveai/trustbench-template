import { db } from "@/server/db/config/database"
import { items } from "@/server/db/schemas"
import { HydrateClient, trpc } from "@/trpc/server"
import { eq } from "drizzle-orm"

import { configuration } from "@/lib/config"
import { ItemInfo } from "@/components/item/item-info"
import { SectionWrapper } from "@/components/layout/section-wrapper"

type ItemIdPageProps = {
  params: Promise<{
    itemId: string
    slug: string
  }>
}

export async function generateMetadata({ params }: ItemIdPageProps) {
  const { itemId } = await params

  const [item] = await db.select().from(items).where(eq(items.id, itemId)).limit(1)

  if (!item) return null

  return {
    title: `${item.name} | ${configuration.site.name}`,
    description: item.description,
  }
}

export default async function ItemIdPage({ params }: ItemIdPageProps) {
  const { itemId } = await params

  void trpc.items.getOne.prefetch({ id: itemId })

  return (
    <HydrateClient>
      <SectionWrapper>
        <ItemInfo id={itemId} />
      </SectionWrapper>
    </HydrateClient>
  )
}
