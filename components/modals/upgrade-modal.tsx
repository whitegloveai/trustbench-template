"use client"

import { useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { trpc } from "@/trpc/client"

import { PlanTypes, PlanTypesType } from "@/types/types"
import { configuration } from "@/lib/config"
import { capitalizeFirstLetter, cn, getPlanTier } from "@/lib/utils"
import { useUpgradeModal } from "@/hooks/use-upgrade-modal"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { StripeButton } from "@/components/buttons/stripe-button"
import { ActionTooltip } from "@/components/global/action-tooltip"
import { Icons } from "@/components/global/icons"
import { ResponsiveModal } from "@/components/global/responsive-modal"

export function UpgradeModal() {
  const params = useParams()
  const slug = params.slug as string
  const { isOpen, close } = useUpgradeModal()

  const { data: subscription, isLoading } = trpc.subscriptions.getSubscription.useQuery()

  // Initialize selected state with subscription.planType if available, otherwise null
  const [selected, setSelected] = useState<PlanTypesType | null>(
    () => subscription?.plan?.type || PlanTypes.FREE
  )
  const [isYearly, setIsYearly] = useState<boolean>(false)

  const selectedProduct = useMemo(
    () => configuration.stripe.products.find((product) => product.type === selected),
    [selected]
  )

  const isCurrentPlan = selected === subscription?.type

  if (isLoading) {
    return (
      <ResponsiveModal
        onOpenChange={close}
        isOpen={isOpen}
        modalClassName="min-h-96 max-w-3xl overflow-hidden p-0"
        headerTitle="Upgrade to Starter to access"
        headerDescription="Here you can read more about the benefits of upgrading to Starter."
        isHeaderHidden
      >
        <div className="flex size-full items-center justify-center">
          <Icons.loader className="size-4 animate-spin" />
        </div>
      </ResponsiveModal>
    )
  }

  if (!subscription) {
    return (
      <ResponsiveModal
        onOpenChange={close}
        isOpen={isOpen}
        modalClassName="min-h-96 max-w-3xl overflow-hidden p-0"
        headerTitle="Upgrade to Starter to access"
        isHeaderHidden
      >
        <div className="flex size-full items-center justify-center text-xl">No data</div>
      </ResponsiveModal>
    )
  }

  const getButtonText = () => {
    if (isLoading) return "Loading..."

    if (isCurrentPlan && !subscription.isSubscribed && subscription.type === PlanTypes.FREE) {
      return "Current Plan"
    }

    if (subscription.isSubscribed) {
      if (selected === subscription.type) {
        return "Manage subscription"
      }

      if (getPlanTier(selected) > getPlanTier(subscription.type)) {
        return `Upgrade to ${capitalizeFirstLetter(selected || PlanTypes.FREE)}`
      }

      return "Manage subscription"
    }

    return `Upgrade to ${capitalizeFirstLetter(selected || PlanTypes.FREE)}`
  }

  return (
    <ResponsiveModal
      onOpenChange={close}
      isOpen={isOpen}
      modalClassName="min-h-96 w-full overflow-hidden bg-os-background-100 p-0 md:max-w-3xl"
      headerTitle="Upgrade to Starter to access"
      headerDescription="Here you can read more about the benefits of upgrading to Starter."
      isHeaderHidden
    >
      <div className="grid md:grid-cols-2">
        <div className="bg-os-background-100 flex size-full flex-col gap-y-6 rounded-lg p-8 md:rounded-none">
          <div className="flex flex-col gap-y-4">
            <h1 className="text-lg font-semibold">Upgrade To Starter or Pro</h1>
            <div className="flex flex-col gap-y-2">
              <div className="flex items-center gap-x-2">
                <Icons.check className="size-4 text-green-500" />
                <p className="text-muted-foreground text-sm">Better capacity</p>
              </div>
              <div className="flex items-center gap-x-2">
                <Icons.check className="size-4 text-green-500" />
                <p className="text-muted-foreground text-sm">More functionality</p>
              </div>
            </div>
          </div>
          <Separator />
          <RadioGroup
            defaultValue={PlanTypes.FREE}
            className="flex flex-col gap-y-2"
            onValueChange={(value) => setSelected(value as PlanTypesType)}
          >
            {configuration.stripe.products.map((product) => (
              <div
                key={product.type}
                className={cn(
                  "bg-card hover:bg-accent flex cursor-pointer items-center justify-between rounded-lg border-2 p-3 px-4 transition-colors duration-300",
                  {
                    "border-emerald-500": selected === product.type,
                  }
                )}
                onClick={() => setSelected(product.type as PlanTypesType)}
              >
                <div className="flex items-center gap-x-4">
                  <RadioGroupItem
                    value={product.type}
                    id={product.type}
                    checked={selected === product.type}
                  />
                  <Label htmlFor={product.type} className="text-sm font-medium">
                    {product.name}
                  </Label>
                  {product.type === subscription?.type && (
                    <Badge
                      variant="secondary"
                      className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                    >
                      Current
                    </Badge>
                  )}
                </div>
                <div className="text-sm font-semibold">
                  ${isYearly ? product.price.yearlyAmount : product.price.amount}{" "}
                  <span className="text-muted-foreground text-sm font-normal">
                    / {isYearly ? "year" : "month"}
                  </span>
                </div>
              </div>
            ))}
          </RadioGroup>

          <div className="mt-6 flex flex-col gap-y-3">
            <Card
              className={cn("border-dashed p-4 transition-colors duration-300", {
                "border-emerald-500": isYearly,
              })}
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-y-2">
                  <h3 className="text-sm font-semibold">Enjoy 2 Free Months.</h3>
                  <p className="text-muted-foreground text-xs">
                    Opt for yearly billing and get two months free of your plan.
                  </p>
                </div>
                <Switch
                  checked={isYearly}
                  onCheckedChange={() => setIsYearly(!isYearly)}
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>
            </Card>
            <StripeButton
              slug={slug}
              type={selected || PlanTypes.FREE}
              text={getButtonText()}
              disabled={
                isLoading ||
                (selected === PlanTypes.FREE && !subscription.isSubscribed) ||
                (subscription.isSubscribed &&
                  getPlanTier(selected) < getPlanTier(subscription.type))
              }
              isYearly={isYearly}
            />
          </div>
        </div>
        <div className="bg-card hidden size-full flex-col gap-y-6 p-6 px-8 md:flex">
          <div className="mb-7 flex flex-col gap-y-4 pt-2">
            <h1 className="text-lg font-semibold">{selectedProduct?.slug}</h1>
            <p className="text-muted-foreground text-sm">{selectedProduct?.description}</p>
          </div>
          <Separator />

          <div className="flex flex-col gap-y-6">
            <div className="flex flex-col gap-y-2">
              <h3 className="mb-2 text-sm font-medium">Included Features</h3>
              {selectedProduct?.features.included.map((feature, index) => (
                <div key={index} className="flex items-center gap-x-2">
                  <Icons.check className="size-4 text-emerald-500" />
                  <div className="flex items-center gap-x-2">
                    <span className="text-sm">{feature.text}</span>
                    {feature.tooltip && (
                      <ActionTooltip label={feature.tooltip}>
                        <Icons.helpCircle className="text-muted-foreground hover:text-foreground size-4" />
                      </ActionTooltip>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {selectedProduct?.features.excluded && selectedProduct.features.excluded.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <h3 className="mb-2 text-sm font-medium">Not Included</h3>
                {selectedProduct.features.excluded.map((feature, index) => (
                  <div key={index} className="flex items-center gap-x-2">
                    <Icons.x className="text-destructive size-4" />
                    <div className="flex items-center gap-x-2">
                      <span className="text-muted-foreground text-sm">{feature.text}</span>
                      {feature.tooltip && (
                        <ActionTooltip label={feature.tooltip}>
                          <Icons.helpCircle className="text-muted-foreground hover:text-foreground size-4" />
                        </ActionTooltip>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ResponsiveModal>
  )
}
