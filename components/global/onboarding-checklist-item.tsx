"use client"

import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { WorkspaceType } from "@/server/db/schema-types"

import { createRoute } from "@/lib/routes"
import { cn } from "@/lib/utils"
import { useUpgradeModal } from "@/hooks/use-upgrade-modal"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Icons } from "@/components/global/icons"

type OnboardingChecklistItemProps = {
  active?: boolean
  type: "subscription" | "setup" | "first item"
}

export function OnboardingChecklistItem({ active = true, type }: OnboardingChecklistItemProps) {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as WorkspaceType["slug"]

  const { setIsOpen } = useUpgradeModal()

  const handleOnClick = () => {
    if (isSubscription) {
      setIsOpen(true)
    }
    if (isSetup) {
      return null
    }
    if (isFirstItem) {
      router.push(createRoute("new", { slug }).href)
    }
  }

  const isSubscription = type === "subscription"
  const isSetup = type === "setup"
  const isFirstItem = type === "first item"

  return (
    <Card
      className={cn("flex items-center justify-between p-6 shadow-md hover:shadow-lg", {
        "opacity-40 hover:shadow-md": !active,
      })}
    >
      <div className="flex items-center gap-x-4">
        {isSubscription ? (
          <div className="bg-primary/10 flex size-12 items-center justify-center rounded-xl">
            <Image src="/stripe-icon.svg" width={24} height={24} alt="Stripe Logo" />
          </div>
        ) : null}
        <div>
          <h3 className="text-base font-semibold">
            {isSubscription ? "Subscription required" : null}
            {isSetup ? "Setup required" : null}
            {isFirstItem ? "Add your first item" : null}
          </h3>
          <p className="text-muted-foreground text-sm">
            Estimated {isSubscription ? "2-3 minutes" : null}
            {isFirstItem ? "30 seconds" : null}
          </p>
        </div>
      </div>
      {active ? (
        <Button onClick={handleOnClick}>
          {isSubscription ? "Upgrade now" : null}
          {isSetup ? "Setup now" : null}
          {isFirstItem ? "Add now" : null}
          {isSubscription ? <Icons.sparkles /> : null}
        </Button>
      ) : (
        <div className="flex size-8 items-center justify-center rounded-full bg-green-500/10">
          <Icons.check className="size-5 text-green-500" />
        </div>
      )}
    </Card>
  )
}

export function OnboardingChecklistItemSkeleton() {
  return (
    <Card className="flex items-center justify-between p-6 shadow-md hover:shadow-lg">
      <div className="flex flex-col gap-x-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="size-8" />
    </Card>
  )
}
