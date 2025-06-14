"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

import { KEYBOARD_SHORTCUTS } from "@/lib/shortcuts"
import { cn } from "@/lib/utils"
import { useKeyPress } from "@/hooks/use-key-press"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/global/icons"
import { KeyboardShortcut } from "@/components/global/keyboard-shortcut"

type NavBackButtonProps = {
  slug: string
}

export function NavBackButton({ slug }: NavBackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    router.push(`/${slug}/dashboard`)
  }

  useKeyPress(KEYBOARD_SHORTCUTS.ESCAPE, handleBack)

  return (
    <Link
      href={`/${slug}/dashboard`}
      prefetch
      className={cn(
        buttonVariants({ variant: "ghost", className: "text-primary/90 justify-start" })
      )}
    >
      <Icons.arrowLeft className="size-4" />
      <span>Back to dashboard</span>

      <KeyboardShortcut shortcut={KEYBOARD_SHORTCUTS.ESCAPE} className="ml-auto" />
    </Link>
  )
}
