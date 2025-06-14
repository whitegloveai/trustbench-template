import { Metadata } from "next"
import { db } from "@/server/db/config/database"
import { userSettings } from "@/server/db/schemas"
import { getCurrentUser } from "@/server/queries/auth-queries"
import { eq } from "drizzle-orm"

import { redirectToRoute, ROUTES } from "@/lib/routes"
import { CreateWorkspaceForm } from "@/components/forms/create-workspace-form"
import { OnboardingWrapper } from "@/components/layout/onboarding-wrapper"

export const metadata: Metadata = ROUTES["onboarding-workspace"].metadata

export default async function OnboardingWorkspacePage() {
  const { user } = await getCurrentUser()

  if (!user) {
    return redirectToRoute("sign-in")
  }

  const [settings] = await db
    .select({
      onboardingStatus: userSettings.onboardingStatus,
      step: userSettings.onboardingStep,
    })
    .from(userSettings)
    .where(eq(userSettings.userId, user.id))
    .limit(1)

  if (!settings) {
    return redirectToRoute("sign-in")
  }

  const completedOnboarding = settings.onboardingStatus === "completed"

  if (!completedOnboarding && settings.step === "collaborate") {
    return redirectToRoute("onboarding-collaborate")
  }

  if (!completedOnboarding && settings.step === "profile") {
    return redirectToRoute("onboarding-profile")
  }

  if (completedOnboarding) {
    return redirectToRoute("callback")
  }

  return (
    <OnboardingWrapper step={2} title="Create your first Workspace">
      <CreateWorkspaceForm isInitial />
    </OnboardingWrapper>
  )
}
