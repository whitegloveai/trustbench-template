"use client"

import Link from "next/link"
import { NotificationType } from "@/server/db/schema-types"
import { useDeclineInvitationTRPC } from "@/trpc/hooks/invitations-hooks"
import {
  useUpdateArchiveOneTRPC,
  useUpdateNotificationTRPC,
} from "@/trpc/hooks/notifications-hooks"
import { formatDistanceToNow } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ActionTooltip } from "@/components/global/action-tooltip"
import { Icons } from "@/components/global/icons"

type NotificationItemProps = {
  notification: NotificationType
  isArchived?: boolean
}

export function NotificationItem({ isArchived, notification }: NotificationItemProps) {
  const { mutate: updateArchiveOne, isPending: isArchivingOne } = useUpdateArchiveOneTRPC()

  const { mutate: update, isPending: isUpdating } = useUpdateNotificationTRPC()

  const { mutate: declineInvitation, isPending: isDeclining } = useDeclineInvitationTRPC()

  const url = notification.link ? `${notification.link}` : ""
  const isRead = notification.read
  const isExpired = notification.expiresAt && new Date(notification.expiresAt) < new Date()
  const isAccepted = notification.type === "invitation" && notification.accepted

  const handleArchiveNotification = () => {
    updateArchiveOne({ id: notification.id, value: !isArchived })
  }

  const handleUpdateNotification = (status: boolean) => {
    update({ id: notification.id, status })
  }

  const handleDeclineInvitation = () => {
    declineInvitation({ id: notification.identifier! })
    handleUpdateNotification(true)
  }

  const isDisabled = isRead || isExpired || isArchived

  return (
    <li className="group hover:bg-muted dark:hover:bg-card flex items-start justify-between gap-x-2 p-3 transition-colors">
      <div className="flex w-10/12 items-start gap-x-2">
        <Icons.info
          className={cn("text-muted-foreground size-4 min-w-4 rounded-full", {
            "text-muted-foreground/60": isRead,
          })}
        />
        <div className="flex flex-col gap-y-2">
          {/* <span className="text-sm">{notification.title}</span> */}
          <p
            className={cn("w-[30ch] truncate text-sm font-medium", {
              "text-primary/60 font-normal": isDisabled,
            })}
          >
            {notification.message}
          </p>

          {notification.type === "invitation" && (
            <>
              {!isAccepted && !isExpired ? (
                <div className="flex items-center gap-x-2">
                  <Link
                    prefetch
                    href={isDisabled ? "#" : url}
                    target={isDisabled ? undefined : "_blank"}
                  >
                    <Button
                      size="sm"
                      className="flex h-7 w-fit items-center text-xs"
                      variant="default"
                      disabled={isUpdating || isDisabled}
                    >
                      Accept
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex h-7 w-fit items-center text-xs"
                    onClick={handleDeclineInvitation}
                    disabled={isUpdating || isDeclining || isDisabled}
                  >
                    Decline
                  </Button>
                </div>
              ) : (
                isAccepted &&
                isExpired && (
                  <Button
                    size="sm"
                    className="flex w-fit items-center text-xs"
                    disabled
                    variant="outline"
                  >
                    Invitation accepted
                  </Button>
                )
              )}
            </>
          )}

          <p
            className={cn("text-muted-foreground/70 text-xs", {
              "text-muted-foreground/50": isRead || isExpired || isArchived,
            })}
          >
            {formatDistanceToNow(notification.createdAt, {
              addSuffix: true,
            })}
          </p>
        </div>
      </div>
      <ActionTooltip label={isArchived ? "Un-archive" : "Archive notification"} delayDuration={500}>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "text-muted-foreground hover:text-primary size-7 items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100"
          )}
          onClick={handleArchiveNotification}
          disabled={isArchivingOne}
        >
          {isArchivingOne ? (
            <Icons.loader className="min-w-4 animate-spin" />
          ) : isArchived ? (
            <Icons.packageOpen className="min-w-4" />
          ) : (
            <Icons.archive className="min-w-4" />
          )}
        </Button>
      </ActionTooltip>
    </li>
  )
}
