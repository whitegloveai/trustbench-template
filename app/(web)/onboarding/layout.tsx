import { ReactNode } from "react"
import { Metadata } from "next"
import Link from "next/link"

import { configuration } from "@/lib/config"
import { documentTitle } from "@/lib/utils"
import { SignOutButton } from "@/components/buttons/sign-out-button"

export const metadata: Metadata = {
  title: documentTitle("Onboarding"),
  description: "Onboarding",
}

type OnboardingLayoutProps = {
  children: ReactNode
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <div className="flex max-h-screen min-h-screen w-full flex-col justify-between gap-y-8 text-clip 2xl:gap-y-0">
      <div className="flex w-full items-center justify-center py-4">
        <span className="text-2xl font-semibold">{configuration.site.name}</span>
      </div>
      <div className="mx-auto flex h-full max-w-xl flex-col justify-between md:max-w-3xl lg:max-w-5xl">
        <main className="flex h-full items-center justify-center">{children}</main>
      </div>
      <div className="text-muted-foreground flex w-full items-center justify-center py-6 text-xs">
        <ul className="flex items-center gap-x-4">
          <li>
            © {new Date().getFullYear()} {configuration.site.name}
          </li>
          <li>
            <Link prefetch href={"/privacy"} className="underline">
              <span>Privacy Policy</span>
            </Link>
          </li>
          <li>
            <Link prefetch href={"/support"} className="underline">
              <span>Support</span>
            </Link>
          </li>
          <li className="underline">
            <SignOutButton variant={"ghost"} className="size-fit p-0 text-xs underline" />
          </li>
        </ul>
      </div>
    </div>
  )
}
