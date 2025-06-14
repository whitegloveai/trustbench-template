import { Metadata } from "next"
import { HydrateClient, trpc } from "@/trpc/server"

import { ROUTES } from "@/lib/routes"
import { BillingForm } from "@/components/forms/billing-form"

export const metadata: Metadata = ROUTES["settings-billing"].metadata
export const dynamic = "force-dynamic"

type ProfileBillingSettingsPageProps = {
  params: Promise<{ slug: string }>
}

export default async function ProfileBillingSettingsPage({
  params,
}: ProfileBillingSettingsPageProps) {
  const { slug } = await params

  void trpc.subscriptions.getSubscription.prefetch()

  return (
    <HydrateClient>
      <BillingForm slug={slug} />
    </HydrateClient>
  )
}
