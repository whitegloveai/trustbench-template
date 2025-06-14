import { PlanTypesType } from "@/types/types"
import { configuration } from "@/lib/config"
import { PricingCard } from "@/components/landing/pricing-card"

type PricingFeature = {
  name: string
  available: boolean
}

type PricingProps = {
  title: string
  previousPrice: number
  currentPrice: number
  type: PlanTypesType
  features: PricingFeature[]
}

const items: PricingProps[] = [
  {
    title: "Just the Template",
    previousPrice: 199,
    currentPrice: configuration.stripe.products[1].price.amount,
    type: "STARTER",
    features: [
      { name: "Next.js 15 App Router", available: true },
      { name: "TypeScript & Tailwind CSS", available: true },
      { name: "Authentication System", available: true },
      { name: "Database Integration", available: true },
      { name: "Landing Page", available: true },
      { name: "Dashboard Layout", available: true },
      { name: "Workspace System", available: true },
      { name: "Lifetime updates", available: false },
      { name: "Team Management", available: false },
      { name: "One-on-one support", available: false },
    ],
  },
  {
    title: "Template And More",
    previousPrice: 249,
    currentPrice: configuration.stripe.products[2].price.amount,
    type: "PRO",
    features: [
      { name: "Next.js 15 App Router", available: true },
      { name: "TypeScript & Tailwind CSS", available: true },
      { name: "Authentication System", available: true },
      { name: "Database Integration", available: true },
      { name: "Landing Page", available: true },
      { name: "Dashboard Layout", available: true },
      { name: "Workspace System", available: true },
      { name: "Lifetime updates", available: true },
      { name: "Team Management", available: true },
      { name: "One-on-one support", available: true },
    ],
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-5xl overflow-hidden px-8 py-24 pb-0">
      <div className="mb-10 flex w-full flex-col text-center">
        <p className="mb-8 font-medium text-orange-500">Pricing</p>
        <h2 className="mx-auto mb-8 max-w-2xl text-3xl font-semibold tracking-tight lg:text-5xl">
          Launch your SaaS faster with a production-ready template
        </h2>
      </div>
      <div className="relative flex flex-col items-center gap-x-4 lg:flex-row lg:items-stretch">
        {items.map((item, i) => (
          <PricingCard key={i} item={item} />
        ))}
      </div>
    </section>
  )
}
