import { Metadata } from "next"
import { redirect, RedirectType } from "next/navigation"

import { configuration } from "@/lib/config"
import { documentTitle, placeholderImageUrl } from "@/lib/utils"
import { Icons } from "@/components/global/icons"

// Define the route names as a union type
export type RouteName =
  | "home"
  | "sign-in"
  | "sign-out"
  | "join"
  | "invite"
  | "onboarding"
  | "onboarding-workspace"
  | "onboarding-profile"
  | "onboarding-collaborate"
  | "callback"
  | "dashboard"
  | "analytics"
  | "new"
  | "items"
  | "item"
  | "settings"
  | "settings-profile"
  | "settings-billing"
  | "settings-members"
  | "settings-workspace"
  | "settings-personalization"
  | "settings-notifications"
  | "feedback"
  | "error"
  | "terms"
  | "privacy"
  | "license"
  | "settings-workspaces"
  | "playground"
  | "playground-api"
  | "playground-trpc"
  | "playground-server-actions"

export interface RouteConfigType {
  path: string
  disabled?: boolean
  name: RouteName

  metadata: Metadata

  metadataExtra: {
    image?: string
    icon?: keyof typeof Icons
    name: string
  }
}
/**
 * The routes for the application
 */
export const ROUTES: Record<RouteName, RouteConfigType> = {
  home: {
    name: "home",
    path: "/",
    metadata: {
      title: documentTitle("Home"),
      description: "Home page",
    },
    metadataExtra: {
      name: "Home",
    },
  },

  "sign-out": {
    name: "sign-out",
    path: "/sign-out",
    metadata: {
      title: documentTitle("Sign out"),
      description: "Sign out of your account",
    },
    metadataExtra: {
      name: "Sign out",
    },
  },

  "sign-in": {
    name: "sign-in",
    path: "/sign-in",
    metadata: {
      title: documentTitle("Sign in"),
      description: "Sign in to your account",
      openGraph: {
        title: documentTitle("Sign in"),
        description: "Sign in to your account",
      },
      twitter: {
        title: documentTitle("Sign in"),
        description: "Sign in to your account",
      },
    },
    metadataExtra: {
      name: "Sign in",
      icon: "user",
      image: placeholderImageUrl({}),
    },
  },

  join: {
    name: "join",
    path: "/join",
    metadata: {
      title: documentTitle("Join"),
      description: "Join or create a workspace",
      openGraph: {
        title: documentTitle("Join"),
        description: "Join or create a workspace",
      },
      twitter: {
        title: documentTitle("Join"),
        description: "Join or create a workspace",
      },
    },
    metadataExtra: {
      name: "Join",
      image: placeholderImageUrl({}),
      icon: "plus",
    },
  },

  invite: {
    name: "invite",
    path: "/invite/:token",
    metadata: {
      title: documentTitle("Invitation"),
      description: "You have been invited",
    },
    metadataExtra: {
      name: "Invite",
      image: placeholderImageUrl({}),
    },
  },

  onboarding: {
    name: "onboarding",
    path: "/onboarding",
    metadata: {
      title: documentTitle("Onboarding"),
      description: "Onboarding",
    },
    metadataExtra: {
      name: "Onboarding",
      image: placeholderImageUrl({}),
    },
  },

  "onboarding-workspace": {
    name: "onboarding-workspace",
    path: "/onboarding/workspace",
    metadata: {
      title: documentTitle("Create your first Workspace"),
      description: "Onboarding create your first Workspace",
    },
    metadataExtra: {
      name: "Onboarding Workspace",
      image: placeholderImageUrl({}),
    },
  },

  "onboarding-profile": {
    name: "onboarding-profile",
    path: "/onboarding/profile",
    metadata: {
      title: documentTitle("Initial Profile"),
      description: "Onboarding initial Profile",
    },
    metadataExtra: {
      name: "Initial Profile",
      image: placeholderImageUrl({}),
    },
  },

  "onboarding-collaborate": {
    name: "onboarding-collaborate",
    path: "/onboarding/collaborate",
    metadata: {
      title: documentTitle("Invite your first team member"),
      description: "Onboarding invite your first team member",
    },
    metadataExtra: {
      name: "Invite your first team member",
      image: placeholderImageUrl({}),
    },
  },
  analytics: {
    name: "analytics",
    path: "/:slug/analytics",
    metadata: {
      title: documentTitle("Analytics"),
      description: "Analytics page",
    },
    metadataExtra: {
      name: "Analytics",
      image: placeholderImageUrl({}),
      icon: "chart",
    },
  },

  callback: {
    name: "callback",
    path: "/callback",
    metadata: {
      title: documentTitle("Dashboard"),
      description: `Dashboard for your ${configuration.site.name} account.`,
      openGraph: {
        title: documentTitle("Callback"),
        description: "Callback page for redirecting users",
      },
      twitter: {
        title: documentTitle("Callback"),
        description: "Callback page for redirecting users",
      },
    },
    metadataExtra: {
      name: "Dashboard",
      image: placeholderImageUrl({}),
      icon: "chart",
    },
  },
  dashboard: {
    name: "dashboard",
    path: "/:slug/dashboard",
    metadata: {
      title: documentTitle("Dashboard"),
      description: "Dashboard page",
      openGraph: {
        title: documentTitle("Dashboard"),
        description: "Dashboard page",
      },
      twitter: {
        title: documentTitle("Dashboard"),
        description: "Dashboard page",
      },
    },
    metadataExtra: {
      name: "Dashboard",
      image: placeholderImageUrl({}),
      icon: "dashboard",
    },
  },
  new: {
    name: "new",
    path: "/:slug/new",
    metadata: {
      title: documentTitle("New"),
      description: "Create a new item",
      openGraph: {
        title: documentTitle("New"),
        description: "Create a new item",
      },
      twitter: {
        title: documentTitle("New"),
        description: "Create a new item",
      },
    },
    metadataExtra: {
      name: "New",
      image: placeholderImageUrl({}),
      icon: "plus",
    },
  },
  items: {
    name: "items",
    path: "/:slug/items",
    metadata: {
      title: documentTitle("Items"),
      description: "Items page",
      openGraph: {
        title: documentTitle("Items"),
        description: "Items page",
      },
      twitter: {
        title: documentTitle("Items"),
        description: "Items page",
      },
    },
    metadataExtra: {
      name: "Items",
      image: placeholderImageUrl({}),
      icon: "sparkles",
    },
  },

  item: {
    name: "item",
    path: "/:slug/items/:id",
    metadata: {
      title: documentTitle("Item"),
      description: "Item page",
    },

    metadataExtra: {
      name: "Item",
      image: placeholderImageUrl({}),
      icon: "layers",
    },
  },
  settings: {
    name: "settings",
    path: "/:slug/settings",
    metadata: {
      title: documentTitle("Settings"),
      description: "Settings page",
    },
    metadataExtra: {
      name: "Settings",
      image: placeholderImageUrl({}),
      icon: "settings",
    },
  },

  "settings-profile": {
    name: "settings-profile",
    path: "/:slug/settings/profile",
    metadata: {
      title: documentTitle("Profile Settings"),
      description: "Profile settings page",
    },
    metadataExtra: {
      name: "Profile",
      image: placeholderImageUrl({}),
      icon: "settings",
    },
  },

  "settings-billing": {
    name: "settings-billing",
    path: "/:slug/settings/billing",
    metadata: {
      title: documentTitle("Billing"),
      description: `Billing settings for your ${configuration.site.name} account.`,
    },
    metadataExtra: {
      name: "Billing",
      image: placeholderImageUrl({}),
      icon: "creditCard",
    },
  },

  "settings-members": {
    name: "settings-members",
    path: "/:slug/settings/members",
    metadata: {
      title: documentTitle("Members settings"),
      description: "Members settings",
    },
    metadataExtra: {
      name: "Members",
      image: placeholderImageUrl({}),
      icon: "users",
    },
  },

  "settings-workspace": {
    name: "settings-workspace",
    path: "/:slug/settings/workspace",
    metadata: {
      title: documentTitle("Workspace"),
      description: "General workspace",
    },
    metadataExtra: {
      name: "Workspace",
      image: placeholderImageUrl({}),
      icon: "workspace",
    },
  },

  "settings-personalization": {
    name: "settings-personalization",
    path: "/:slug/settings/personalization",
    metadata: {
      title: documentTitle("Personalization"),
      description: "Personalization settings",
    },
    metadataExtra: {
      name: "Personalization",
      image: placeholderImageUrl({}),
      icon: "brush",
    },
  },

  "settings-notifications": {
    name: "settings-notifications",
    path: "/:slug/settings/notifications",
    metadata: {
      title: documentTitle("Notifications"),
      description: "Notification settings",
    },
    metadataExtra: {
      name: "Notifications",
      image: placeholderImageUrl({}),
      icon: "bell",
    },
  },

  "settings-workspaces": {
    name: "settings-workspaces",
    path: "/:slug/settings/workspaces",
    metadata: {
      title: documentTitle("Workspaces"),
      description: "Workspaces page",
    },
    metadataExtra: {
      name: "Workspaces",
      image: placeholderImageUrl({}),
      icon: "briefcase",
    },
  },

  feedback: {
    name: "feedback",
    path: configuration.site.xUrl,
    metadata: {
      title: documentTitle("Feedback"),
      description: "Feedback page",
    },
    metadataExtra: {
      name: "Feedback",
      image: placeholderImageUrl({}),
      icon: "send",
    },
  },

  error: {
    name: "error",
    path: "/error",
    metadata: {
      title: documentTitle("Error"),
      description: "Server error",
    },
    metadataExtra: {
      name: "Error",
      image: placeholderImageUrl({}),
    },
  },

  terms: {
    name: "terms",
    path: "/terms",
    metadata: {
      title: documentTitle("Terms"),
      description: "Terms and conditions",
    },
    metadataExtra: {
      name: "Terms",
      image: placeholderImageUrl({}),
    },
  },

  privacy: {
    name: "privacy",
    path: "/privacy",
    metadata: {
      title: documentTitle("Privacy"),
      description: "Privacy policy",
    },
    metadataExtra: {
      name: "Privacy",
      image: placeholderImageUrl({}),
    },
  },

  license: {
    name: "license",
    path: "/license",
    metadata: {
      title: documentTitle("License"),
      description: "License",
    },
    metadataExtra: {
      name: "License",
      image: placeholderImageUrl({}),
    },
  },

  playground: {
    name: "playground",
    path: "/playground",
    metadata: {
      title: documentTitle("Development"),
      description: "Development page",
    },
    metadataExtra: {
      name: "Development",
    },
  },

  "playground-api": {
    name: "playground-api",
    path: "/playground/api",
    metadata: {
      title: documentTitle("Development API"),
      description: "Development API page",
    },
    metadataExtra: {
      name: "Development API",
    },
  },

  "playground-trpc": {
    name: "playground-trpc",
    path: "/playground/trpc",
    metadata: {
      title: documentTitle("Development TRPC"),
      description: "Development TRPC page",
    },
    metadataExtra: {
      name: "Development TRPC",
    },
  },

  "playground-server-actions": {
    name: "playground-server-actions",
    path: "/playground/server-actions",
    metadata: {
      title: documentTitle("Development Server Actions"),
      description: "Development Server Actions page",
    },
    metadataExtra: {
      name: "Development Server Actions",
    },
  },
} as const

// Add these types at the top of your routes file
type RouteParams = {
  home: never
  "sign-in": never
  "sign-out": never
  join: never
  invite: { token: string }
  onboarding: never
  "onboarding-workspace": never
  "onboarding-profile": never
  "onboarding-collaborate": never
  callback: never
  dashboard: { slug: string }
  analytics: { slug: string }
  new: { slug: string }
  items: { slug: string }
  item: { slug: string; id: string }
  settings: { slug: string }
  "settings-profile": { slug: string }
  "settings-billing": { slug: string }
  "settings-members": { slug: string }
  "settings-workspace": { slug: string }
  "settings-personalization": { slug: string }
  "settings-notifications": { slug: string }
  "settings-workspaces": { slug: string }
  playground: { slug: string }
  "playground-api": { slug: string }
  "playground-trpc": { slug: string }
  "playground-server-actions": { slug: string }
  feedback: { slug: string }
  error: never
  terms: never
  privacy: never
  license: never
}

/**
 * Create a route
 * @param route - The route to create
 * @param params - The parameters for the route
 * @returns
 */
export function createRoute<T extends RouteName>(route: T, params?: RouteParams[T]) {
  let path = ROUTES[route].path

  if (params) {
    if ("slug" in params) {
      path = path.replace(":slug", params.slug)
    }
    if ("id" in params) {
      path = path.replace(":id", params.id)
    }
  }

  return { href: path.startsWith("/") ? path : `/${path}` }
}

/**
 * Redirect to a route
 * @param route - The route to redirect to
 * @param params - The parameters for the route
 * @param type - The type of redirect
 * @returns
 */

export function redirectToRoute<T extends RouteName>(
  route: T,
  params?: RouteParams[T],
  type: RedirectType = RedirectType.replace
) {
  return redirect(createRoute(route, params).href, type)
}

// Add a helper function to get metadata
// export function getRouteMetadata<T extends RouteName>(
//   route: T,
//   params?: RouteParams[T] & { [key: string]: any }
// ) {
//   return ROUTES[route].metadata
// }
