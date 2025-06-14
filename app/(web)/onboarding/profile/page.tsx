import { Suspense } from "react"
import { Metadata } from "next"
import { RedirectType } from "next/navigation"
import { db } from "@/server/db/config/database"
import { userSettings } from "@/server/db/schemas"
import { getCurrentUser } from "@/server/queries/auth-queries"
import { eq } from "drizzle-orm"

import { redirectToRoute, ROUTES } from "@/lib/routes"
import { CreateProfileForm } from "@/components/forms/create-profile-form"

export const metadata: Metadata = ROUTES["onboarding-profile"].metadata

export default async function CreateProfileFormPage() {
  const { user } = await getCurrentUser()

  if (!user) {
    return redirectToRoute("sign-in")
  }

  const [settings] = await db
    .select({
      onboardingStatus: userSettings.onboardingStatus,
    })
    .from(userSettings)
    .where(eq(userSettings.userId, user.id))
    .limit(1)

  if (settings && settings.onboardingStatus === "completed") {
    return redirectToRoute("callback", undefined, RedirectType.replace)
  }

  return (
    <Suspense>
      <CreateProfileForm user={user} />
    </Suspense>
  )
}
