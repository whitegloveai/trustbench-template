"use client"

import { Suspense } from "react"
import { WorkspaceType } from "@/server/db/schema-types"
import { trpc } from "@/trpc/client"
import { format } from "date-fns"
import { ErrorBoundary } from "react-error-boundary"

import { capitalizeFirstLetter } from "@/lib/utils"
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { StripeButton } from "@/components/buttons/stripe-button"
import { UpgradeButton } from "@/components/buttons/upgrade-button"
import { Alert, AlertSkeleton } from "@/components/global/alert"
import { SettingsWrapper, SettingsWrapperCard } from "@/components/layout/settings-wrapper"

type BillingFormProps = { slug: WorkspaceType["slug"] }

export function BillingForm({ slug }: BillingFormProps) {
  return (
    <Suspense fallback={<BillingFormSkeleton />}>
      <ErrorBoundary
        fallbackRender={({ error }) => (
          <Alert
            variant="error"
            title={error.message || "An error occurred"}
            icon="alertTriangle"
          />
        )}
      >
        <BillingFormSuspense slug={slug} />
      </ErrorBoundary>
    </Suspense>
  )
}

export function BillingFormSuspense({ slug }: BillingFormProps) {
  const [data] = trpc.subscriptions.getSubscription.useSuspenseQuery()

  const { billingCycle, isSubscribed, isCanceled, stripeCurrentPeriodEnd, plan } = data

  return (
    <SettingsWrapper title="Billing" description="Manage your billing information">
      <SettingsWrapperCard>
        <div className="flex w-full flex-col">
          <CardHeader>
            <CardTitle className="text-base font-medium">Your Plan</CardTitle>
            <CardDescription className="w-full text-sm md:w-[50ch]">
              Below are the details of your current plan.
            </CardDescription>
          </CardHeader>

          <Separator className="mx-auto mb-2 data-[orientation=horizontal]:w-11/12" />
          <CardContent>
            <div className="mt-3 flex flex-col gap-y-6">
              <div className="flex flex-col gap-y-2 text-sm">
                <Alert icon="blocks" title="You are currently on the" variant="subscription">
                  <span className="ml-auto text-xs font-semibold text-green-600 dark:text-green-400">
                    {capitalizeFirstLetter(plan.type)} Plan
                  </span>
                </Alert>

                {stripeCurrentPeriodEnd ? (
                  <span className="text-muted-foreground text-xs">
                    {isSubscribed && !isCanceled ? "Renewal date" : "Subscription ends on"}
                    <strong> {format(stripeCurrentPeriodEnd, "MMMM d, yyyy")}</strong>
                  </span>
                ) : null}
              </div>

              <div className="grid gap-y-2">
                <span className="text-sm font-medium">Details</span>
                <Alert icon="creditCard" title="Current billing cycle">
                  <span className="ml-auto text-xs font-bold text-indigo-400">
                    ${" "}
                    {plan.price
                      ? `${billingCycle === "monthly" ? plan.price.amount : plan.price.amount * 10}`
                      : 0}
                    .00/{billingCycle === "monthly" ? "month" : "year"}
                  </span>
                </Alert>

                <p className="text-muted-foreground text-xs">
                  {billingCycle ? (
                    <>
                      You are being billed <span className="font-semibold">{billingCycle}</span>
                    </>
                  ) : (
                    "You are not being billed."
                  )}
                </p>
              </div>
            </div>
          </CardContent>

          {(!isSubscribed || plan.type === "STARTER") && (
            <CardFooter>
              <UpgradeButton className="w-fit" />
            </CardFooter>
          )}
        </div>
      </SettingsWrapperCard>
      {isSubscribed ? (
        <SettingsWrapperCard>
          <CardHeader>
            <CardTitle className="text-base font-medium">Manage your Billing Details</CardTitle>
            <CardDescription className="w-full text-sm md:w-[50ch]">
              Visit your Billing Portal to manage your subscriptions and billing. You can update or
              cancel your plan, or download your invoices.
            </CardDescription>
          </CardHeader>

          <CardFooter>
            <StripeButton
              type={plan.type}
              text="Visit Billing Portal"
              className="ml-auto w-fit px-3"
              slug={slug}
              icon="externalLink"
            />
          </CardFooter>
        </SettingsWrapperCard>
      ) : null}
    </SettingsWrapper>
  )
}

export function BillingFormSkeleton() {
  return (
    <>
      <SettingsWrapperCard>
        <CardHeader>
          <CardTitle className="text-base font-medium">Your Plan</CardTitle>
          <CardDescription className="w-full text-sm md:w-[50ch]">
            Below are the details of your current plan.
          </CardDescription>
        </CardHeader>
        <Separator className="mx-auto mb-2 data-[orientation=horizontal]:w-11/12" />
        <div className="mt-3 grid gap-y-4">
          <AlertSkeleton />

          <div className="grid gap-y-2">
            <span className="text-sm font-medium">Details</span>
            <AlertSkeleton />
          </div>
        </div>
        <CardFooter>
          <Skeleton className="ml-auto h-9 w-32" />
        </CardFooter>
      </SettingsWrapperCard>
      <SettingsWrapperCard>
        <CardHeader>
          <CardTitle className="text-base font-medium">Manage your Billing Details</CardTitle>
          <CardDescription className="w-full text-sm md:w-[50ch]">
            Visit your Billing Portal to manage your subscriptions and billing. You can update or
            cancel your plan, or download your invoices.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Skeleton className="ml-auto h-9 w-32" />
        </CardFooter>
      </SettingsWrapperCard>
    </>
  )
}
