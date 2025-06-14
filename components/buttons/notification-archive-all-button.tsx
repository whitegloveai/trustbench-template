"use client"

import { useUpdateArchiveManyTRPC } from "@/trpc/hooks/notifications-hooks"

import { Button } from "@/components/ui/button"
import { Icons } from "@/components/global/icons"

export function NotificationsArchiveAllButton() {
  const { mutate: updateArchiveMany, isPending: isUpdatingArchiveMany } = useUpdateArchiveManyTRPC()

  return (
    <Button
      className="border-border w-full rounded-none border-t"
      variant="ghost"
      onClick={() => updateArchiveMany()}
      disabled={isUpdatingArchiveMany}
    >
      {isUpdatingArchiveMany ? <Icons.loader className="animate-spin" /> : null}
      Archive all
    </Button>
  )
}
