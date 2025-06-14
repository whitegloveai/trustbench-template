import { ReactNode } from "react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

type BaseUsageBannerProps = {
  children: ReactNode
  className?: string
}

type UsageBannerWithLabel = BaseUsageBannerProps & {
  usageLabel: string
  cta?: never
}

type UsageBannerWithCTA = BaseUsageBannerProps & {
  usageLabel?: never
  cta: ReactNode
}

type UsageBannerProps = UsageBannerWithLabel | UsageBannerWithCTA

export function UsageBanner({ children, usageLabel, className, cta }: UsageBannerProps) {
  return (
    <div
      className={cn(
        "bg-os-background-100 flex items-center justify-between rounded-md border border-dashed px-4 py-2",
        className
      )}
    >
      {children}

      {cta ? (
        cta
      ) : (
        <Badge variant="subscription" className="cursor-text rounded-sm">
          {usageLabel}
        </Badge>
      )}
    </div>
  )
}

type UsageBannerSkeletonProps = {
  className?: string
}

export function UsageBannerSkeleton({ className }: UsageBannerSkeletonProps) {
  return (
    <div
      className={cn(
        "bg-os-background-100 flex items-center justify-between rounded-md border border-dashed px-4 py-4",
        className
      )}
    >
      <div className="flex items-center gap-x-2 text-xs font-semibold">
        <Skeleton className="h-2 w-72" />
      </div>

      <Skeleton className="h-5 w-32" />
    </div>
  )
}
