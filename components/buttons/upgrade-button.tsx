"use client"

import { cn } from "@/lib/utils"
import { useUpgradeModal } from "@/hooks/use-upgrade-modal"
import { Button } from "@/components/ui/button"

type UpgradeButtonProps = { className?: string; isSubscribed?: boolean }

export function UpgradeButton({ className, isSubscribed }: UpgradeButtonProps) {
  const { open } = useUpgradeModal()

  return (
    <Button
      variant={"default"}
      className={cn(
        "bg-primary hover:bg-primary/90 dark:hover:bg-primary/90 ml-auto w-full rounded-xl text-xs font-semibold hover:text-white dark:hover:text-black",
        className
      )}
      onClick={open}
    >
      {isSubscribed ? "View Subscription" : "Upgrade Plan"}
    </Button>
  )
}
