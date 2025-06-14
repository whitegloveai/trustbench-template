"use client"

import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/global/icons"

const ONBOARDING_STEPS = [1, 2, 3] as const
type OnboardingStep = (typeof ONBOARDING_STEPS)[number]

type OnboardingWrapperProps = {
  children: React.ReactNode
  step: OnboardingStep
  title: string
  description?: string
  className?: string
  showBackButton?: boolean // Make back button configurable
  onBackClick?: () => void // Allow custom back handling
}

export function OnboardingWrapper({
  children,
  description,
  step,
  title,
  className,
  showBackButton = step >= 2,
  onBackClick,
}: OnboardingWrapperProps) {
  const router = useRouter()

  const handleNavigation = () => {
    if (onBackClick) {
      onBackClick()
      return
    }
    router.back()
  }

  return (
    <div className="flex max-w-2xl flex-col gap-y-4">
      <div className="flex items-start gap-x-2">
        {showBackButton && (
          <Button size="icon" variant="ghost" onClick={handleNavigation}>
            <Icons.chevronLeft className="text-muted-foreground" />
          </Button>
        )}
        <div>
          <ProgressIndicator currentStep={step} />
          <p className="text-xl font-semibold">{title}</p>
          {description && (
            <p className="text-muted-foreground mt-2 w-[35ch] text-sm whitespace-pre-line">
              {description}
            </p>
          )}
        </div>
      </div>
      <div
        className={cn(
          "bg-card grid h-fit max-h-[540px] min-h-[250px] w-full grid-cols-1 justify-between gap-y-4 overflow-hidden rounded-xl border p-5 md:w-[500px] md:max-w-[500px]",
          className
        )}
      >
        <div className="flex size-full flex-col gap-y-6">{children}</div>
      </div>
    </div>
  )
}

function ProgressIndicator({ currentStep }: { currentStep: OnboardingStep }) {
  return (
    <div className="mb-2 flex gap-x-2">
      {ONBOARDING_STEPS.map((step) => (
        <div
          key={step}
          className={cn(
            "dark:bg-muted h-2 w-2.5 rounded-full bg-zinc-200 transition-all",
            {
              "animate-pulse-blink w-6 bg-green-500 dark:bg-green-500":
                step === currentStep,
            }
          )}
        />
      ))}
    </div>
  )
}
