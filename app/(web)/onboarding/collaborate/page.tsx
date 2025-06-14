import { Metadata } from "next"
import { db } from "@/server/db/config/database"
import { userSettings } from "@/server/db/schemas"
import { getCurrentUser } from "@/server/queries/auth-queries"
import { eq } from "drizzle-orm"

import { redirectToRoute, ROUTES } from "@/lib/routes"
import { Separator } from "@/components/ui/separator"
import { CreateInvitationsForm } from "@/components/forms/create-invitations-form"
import { OnboardingWrapper } from "@/components/layout/onboarding-wrapper"

export const metadata: Metadata = ROUTES["onboarding-collaborate"].metadata

export default async function CollaboratePage() {
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

  if (!completedOnboarding && settings.step === "workspace") {
    return redirectToRoute("onboarding-workspace")
  }

  if (!completedOnboarding && settings.step === "profile") {
    return redirectToRoute("onboarding-profile")
  }

  if (completedOnboarding) {
    return redirectToRoute("callback")
  }

  return (
    <OnboardingWrapper step={3} title="Add collaborators">
      <div>
        <h3 className="text-base font-semibold">Invite others</h3>
        <p className="text-muted-foreground text-sm">
          Invite your team members to collaborate on this Site with you.
        </p>
      </div>
      <Separator />
      <CreateInvitationsForm userId={user.id} />
    </OnboardingWrapper>
  )
}
