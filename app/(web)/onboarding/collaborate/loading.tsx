import { Separator } from "@/components/ui/separator"
import { CreateInvitationsFormSkeleton } from "@/components/forms/create-invitations-form"
import { OnboardingWrapper } from "@/components/layout/onboarding-wrapper"

export default function CollaborateLoading() {
  return (
    <OnboardingWrapper step={3} title="Add collaborators">
      <div>
        <h3 className="text-base font-semibold">Invite others</h3>
        <p className="text-muted-foreground text-sm">
          Invite your team members to collaborate on this Site with you.
        </p>
      </div>
      <Separator />
      <CreateInvitationsFormSkeleton />
    </OnboardingWrapper>
  )
}
