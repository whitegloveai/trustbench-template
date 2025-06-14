import { Metadata } from "next"
import { RedirectType } from "next/navigation"
import { db } from "@/server/db/config/database"
import { userSettings } from "@/server/db/schemas"
import { getCurrentUser } from "@/server/queries/auth-queries"
import { eq } from "drizzle-orm"

import { redirectToRoute, ROUTES } from "@/lib/routes"

export const metadata: Metadata = ROUTES.onboarding.metadata

export default async function OnboardingPage() {
  const { user } = await getCurrentUser()

  if (!user) {
    return redirectToRoute("sign-in")
  }

  const [settings] = await db
    .select({
      onboardingStatus: userSettings.onboardingStatus,
      onboardingStep: userSettings.onboardingStep,
    })
    .from(userSettings)
    .where(eq(userSettings.userId, user.id))
    .limit(1)

  if (settings?.onboardingStatus === "completed") {
    return redirectToRoute("callback", undefined, RedirectType.replace)
  }

  if (settings?.onboardingStep === "workspace") {
    return redirectToRoute("onboarding-workspace")
  }
  if (settings?.onboardingStep === "collaborate") {
    return redirectToRoute("onboarding-collaborate")
  }

  return redirectToRoute("onboarding-profile")
}
