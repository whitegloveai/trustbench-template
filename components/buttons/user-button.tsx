"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { WorkspaceType } from "@/server/db/schema-types"
import { trpc } from "@/trpc/client"
import { ErrorBoundary } from "react-error-boundary"

import { signOut } from "@/lib/auth-client"
import { createRoute } from "@/lib/routes"
import { capitalizeFirstLetter } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenuAction, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { UpgradeButton } from "@/components/buttons/upgrade-button"
import { UserButtonThemeToggle } from "@/components/buttons/user-button-theme-toggle"
import { Alert } from "@/components/global/alert"
import { Icons } from "@/components/global/icons"
import { UserAvatar } from "@/components/global/user-avatar"

type UserButtonProps = {
  slug: WorkspaceType["slug"]
}

export function UserButton({ slug }: UserButtonProps) {
  return (
    <Suspense fallback={<UserButtonSkeleton />}>
      <ErrorBoundary
        fallbackRender={({ error }) => (
          <Alert
            variant="error"
            title={error.message || "An error occurred"}
            icon="alertTriangle"
          />
        )}
      >
        <UserButtonSuspense slug={slug} />
      </ErrorBoundary>
    </Suspense>
  )
}

function UserButtonSuspense({ slug }: UserButtonProps) {
  const router = useRouter()
  const [data] = trpc.subscriptions.getSubscription.useSuspenseQuery()

  const { user, type, isSubscribed } = data

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in") // redirect to login page
        },
      },
    })
    router.refresh()
  }
  return (
    <SidebarMenuItem>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            size={"lg"}
            className="ring-ring hover:bg-primary/[0.03] data-[state=open]:bg-card/80 rounded-md px-2 py-1.5 outline-hidden focus-visible:ring-2 active:scale-[.99]"
          >
            <UserAvatar user={user} size="ssm" />
            <div className="grid flex-1 text-left leading-tight">
              <div className="truncate text-sm font-medium">{user.name}</div>
              <div className="text-muted-foreground truncate text-[11px]">{user.email}</div>
            </div>
            <Icons.chevronsUpDown className="text-primary mr-0.5 ml-auto size-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mb-2 ml-1 w-[280px] space-y-1 p-2">
          <div>
            <DropdownMenuLabel className="text-primary/60 text-[13px]">
              {user.email}
            </DropdownMenuLabel>
            <DropdownMenuItem
              className="flex cursor-default items-center gap-x-2 rounded-md focus:bg-transparent"
              onClick={(e) => e.preventDefault()}
            >
              <UserAvatar user={user} size="ssm" />
              <div className="grid text-sm">
                <span>{user.name}</span>
                <span className="text-muted-foreground text-xs">{capitalizeFirstLetter(type)}</span>
              </div>
            </DropdownMenuItem>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="sr-only">My Account</DropdownMenuLabel>
          <DropdownMenuItem className="cursor-pointer" asChild>
            <Link
              href={createRoute("settings-profile", { slug }).href}
              className="flex items-center text-sm"
            >
              <Icons.userCircle className="text-muted-foreground mr-2 size-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" asChild>
            <Link
              href={createRoute("settings-billing", { slug }).href}
              className="flex items-center text-sm"
            >
              <Icons.creditCard className="text-muted-foreground mr-2 size-4" />
              Billing
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
            <Icons.logout className="text-muted-foreground mr-2 size-4" />
            Sign Out
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-primary/60 text-[13px]">Preferences</DropdownMenuLabel>
          <UserButtonThemeToggle />
          <DropdownMenuSeparator />
          <DropdownMenuItem className="mt-2 p-0">
            <UpgradeButton isSubscribed={isSubscribed} />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}

export function UserButtonSkeleton() {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        size={"lg"}
        className="bg-card ring-ring hover:bg-primary/[0.03] data-[state=open]:bg-card/80 rounded-md px-2 py-1.5 outline-hidden focus-visible:ring-2 active:scale-[.99]"
      >
        <Skeleton className="bg-primary/20 size-8 rounded-md" />
        <div className="block space-y-1 group-data-[collapsible=icon]:hidden">
          <Skeleton className="bg-primary/20 h-2 w-20" />
          <Skeleton className="bg-primary/20 h-2 w-32" />
        </div>
      </SidebarMenuButton>

      <SidebarMenuAction className="block group-data-[collapsible=icon]:hidden">
        <Icons.chevronsUpDown className="text-muted-foreground mt-1 mr-1 size-4" />
      </SidebarMenuAction>
    </SidebarMenuItem>
  )
}
