import Link from "next/link"

import { PlanTypesType } from "@/types/types"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/global/icons"

type PricingFeature = {
  name: string
  available: boolean
}

type PricingProps = {
  title: string
  previousPrice: number
  currentPrice: number
  features: PricingFeature[]
  type: PlanTypesType
}

type Props = {
  item: PricingProps
}

export function PricingCard({ item }: Props) {
  return (
    <div className="flex w-full flex-col rounded-3xl border bg-white p-8 shadow-xs dark:bg-black lg:w-1/2">
      <div className="mb-8">
        <h3 className="mb-4 text-xl font-medium">{item.title}</h3>
        <div className="mb-6 flex items-baseline gap-x-2">
          <span className="text-4xl font-semibold">${item.currentPrice}</span>
          <span className="text-lg text-muted-foreground line-through">${item.previousPrice}</span>
        </div>
      </div>

      <ul className="mb-8 flex flex-1 flex-col gap-y-4">
        {item.features.map((feature, i) => (
          <li key={i} className="flex items-center gap-x-2">
            {feature.available ? (
              <Icons.check className="size-5 text-green-500" />
            ) : (
              <Icons.x className="size-5 text-muted-foreground" />
            )}
            <span
              className={cn("text-sm", {
                "text-muted-foreground": !feature.available,
              })}
            >
              {feature.name}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-auto space-y-3">
        <Link
          href={"https://boringtemplate.com"}
          target="_blank"
          className="text-center text-lg font-semibold text-primary"
        >
          Visit boringtemplate.com
        </Link>
      </div>
    </div>
  )
}
