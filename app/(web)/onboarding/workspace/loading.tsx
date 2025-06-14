import { CreateWorkspaceFormSkeleton } from "@/components/forms/create-workspace-form"
import { OnboardingWrapper } from "@/components/layout/onboarding-wrapper"

export default function OnboardingWorkspaceLoading() {
  return (
    <OnboardingWrapper step={2} title="Create your first Workspace">
      <CreateWorkspaceFormSkeleton />
    </OnboardingWrapper>
  )
}
