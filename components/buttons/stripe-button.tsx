"use client"

import { ComponentProps, useState } from "react"
import { useRouter } from "next/navigation"
import { WorkspaceType } from "@/server/db/schema-types"
import { toast } from "sonner"

import { PlanTypesType } from "@/types/types"
import { stripeRedirect } from "@/lib/stripe-redirect"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/global/icons"

type StripeButtonProps = {
  type: PlanTypesType
  text?: string
  className?: string
  variant?: ComponentProps<typeof Button>["variant"]
  size?: ComponentProps<typeof Button>["size"]
  icon?: keyof typeof Icons | null
  slug: WorkspaceType["slug"]
  disabled?: boolean
  isYearly?: boolean
}

export function StripeButton({
  type,
  text = "Buy",
  variant = "default",
  className,
  slug,
  size = "default",
  icon,
  disabled,
  isYearly = false,
}: StripeButtonProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const router = useRouter()

  const createBillingSession = async () => {
    try {
      setIsLoading(true)
      const data = await stripeRedirect({ type, slug, isYearly })

      // Call router.refresh() before redirecting
      router.refresh()

      // Add a small delay to ensure refresh is triggered
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Then redirect to Stripe
      window.location.href = data
    } catch (error: any) {
      toast.error(error?.message || "An error occurred")
    } finally {
      setIsLoading(false)
      router.refresh()
    }
  }

  const Icon = icon ? Icons[icon] : null

  return (
    <Button
      variant={variant}
      className={cn("w-full", className)}
      onClick={createBillingSession}
      disabled={disabled || isLoading}
      size={size}
    >
      {text}
      {Icon && <Icon />}
    </Button>
  )
}
