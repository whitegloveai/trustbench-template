import { db } from "@/server/db/config/database"
import { items } from "@/server/db/schemas"
import { getCurrentUser } from "@/server/queries/auth-queries"
import { eq } from "drizzle-orm"

import { redirectToRoute } from "@/lib/routes"
import { cn } from "@/lib/utils"
import {
  OnboardingChecklistItem,
  OnboardingChecklistItemSkeleton,
} from "@/components/global/onboarding-checklist-item"

type OnboardingChecklistProps = {
  className?: string
}

export async function OnboardingChecklist({ className }: OnboardingChecklistProps) {
  const { user } = await getCurrentUser()

  if (!user) {
    return redirectToRoute("sign-in")
  }

  const [dbItems] = await db.select().from(items).where(eq(items.userId, user.id)).limit(1)

  return (
    <div className={cn("mt-10 flex flex-col gap-y-2", className)}>
      <OnboardingChecklistItem type="subscription" active={true} />
      <OnboardingChecklistItem type="setup" />
      <OnboardingChecklistItem type="first item" active={!!!dbItems} />
    </div>
  )
}

export function OnboardingChecklistSkeleton() {
  return (
    <div className="flex flex-col gap-y-2">
      <OnboardingChecklistItemSkeleton />
      <OnboardingChecklistItemSkeleton />
      <OnboardingChecklistItemSkeleton />
    </div>
  )
}
