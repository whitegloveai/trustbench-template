"use client"

import { Suspense } from "react"
import Link from "next/link"
import { NotificationType, WorkspaceType } from "@/server/db/schema-types"
import { trpc } from "@/trpc/client"
import { ErrorBoundary } from "react-error-boundary"

import { createRoute } from "@/lib/routes"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NotificationsArchiveAllButton } from "@/components/buttons/notification-archive-all-button"
import { Alert } from "@/components/global/alert"
import { Icons } from "@/components/global/icons"
import { NotificationEmpty } from "@/components/notification/notification-empty"
import { NotificationItem } from "@/components/notification/notification-item"

const NOTIFICATION_MESSAGES = {
  EMPTY_INBOX: "You don't have any notifications",
  EMPTY_ARCHIVE: "No archived notifications",
  NOTIFICATION_DESC: "We'll notify you about important updates",
} as const

const TABS = {
  INBOX: "inbox",
  ARCHIVE: "archive",
} as const

type NotificationPopoverProps = {
  slug: WorkspaceType["slug"]
}

export function NotificationPopover({ slug }: NotificationPopoverProps) {
  return (
    <Suspense fallback={<NotificationPopoverSkeleton />}>
      <ErrorBoundary
        fallbackRender={({ error }) => (
          <Alert
            variant="error"
            title={error.message || "An error occurred"}
            icon="alertTriangle"
          />
        )}
      >
        <NotificationPopoverSuspense slug={slug} />
      </ErrorBoundary>
    </Suspense>
  )
}

function NotificationPopoverSuspense({ slug }: NotificationPopoverProps) {
  const [data] = trpc.notifications.getMany.useSuspenseQuery()

  const { notifications, archivedNotifications } = data

  return (
    <Popover>
      <PopoverTrigger asChild className="relative">
        <Button
          size={"icon"}
          className="text-muted-foreground relative size-8 overflow-visible rounded-full"
          variant={"ghost"}
        >
          <Icons.bell />
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 inline-flex size-1.5 items-center justify-center rounded-full bg-orange-300 dark:bg-orange-400" />
          )}
          <span className="sr-only">Notification button</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="mr-2 flex max-h-[30rem] w-[22rem] flex-col p-0"
        side="bottom"
        align="start"
      >
        <Tabs defaultValue={TABS.INBOX}>
          <TabsList className="flex h-fit justify-between bg-transparent">
            <div className="flex items-center justify-start gap-x-2">
              <TabsTrigger
                value={TABS.INBOX}
                className="data-[state=active]:border-primary cursor-pointer gap-x-2 rounded-none border-b border-transparent bg-transparent text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Inbox
                <Badge variant="outline" className="cursor-pointer px-2">
                  {notifications.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value={TABS.ARCHIVE}
                className="data-[state=active]:border-primary cursor-pointer rounded-none border-b border-transparent bg-transparent text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Archive
              </TabsTrigger>
            </div>
            <Link
              href={createRoute("settings-notifications", { slug }).href}
              className={cn(
                buttonVariants({
                  variant: "ghost",
                  size: "icon",
                  className: "text-muted-foreground hover:text-primary size-8",
                })
              )}
            >
              <Icons.settings className="size-4" />
              <span className="sr-only">Notification settings</span>
            </Link>
          </TabsList>

          <TabsContent value={TABS.INBOX} className="m-0">
            {!notifications.length ? (
              <NotificationEmpty
                title={NOTIFICATION_MESSAGES.EMPTY_INBOX}
                desc={NOTIFICATION_MESSAGES.NOTIFICATION_DESC}
              />
            ) : (
              <>
                <NotificationList notifications={notifications} />
                <NotificationsArchiveAllButton />
              </>
            )}
          </TabsContent>
          <TabsContent value={TABS.ARCHIVE} className="m-0">
            {!archivedNotifications.length ? (
              <NotificationEmpty title="No archived notifications" />
            ) : (
              <NotificationList notifications={archivedNotifications} isArchived />
            )}
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}

type NotificationListProps = {
  notifications: NotificationType[]
  isArchived?: boolean
}

function NotificationList({ notifications, isArchived = false }: NotificationListProps) {
  return (
    <ScrollArea className="h-80">
      <ul className="divide-y">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            isArchived={isArchived}
          />
        ))}
      </ul>
    </ScrollArea>
  )
}

function NotificationPopoverSkeleton() {
  return (
    <Button size="icon" variant="ghost" className="text-primary/90 size-fit rounded-md p-2">
      <Icons.bell />
      <span className="sr-only">Notification button</span>
    </Button>
  )
}
