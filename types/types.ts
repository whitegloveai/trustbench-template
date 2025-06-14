import { Metadata } from "next"
import { ItemType, MemberType, PermissionType, UserType } from "@/server/db/schema-types"

import { auth } from "@/lib/auth"
import { Icons } from "@/components/global/icons"

export type PlaceholderImageType = {
  backgroundColor?: string
  textColor?: string
  textRows?: string[]
}

export type MetadataType = Metadata & {
  href: string
  name: string
  image?: string
  disabled?: boolean
  icon?: keyof typeof Icons
  children?: MetadataType[]
}

export type PlanType = "FREE" | "STARTER" | "PRO"

export type SubscriptionPlanType = {
  name: "Free" | "Starter" | "Pro"
  description: string
  type: PlanType
  slug: string
  workspacesQuota: number
  membersQuota: number
  price: {
    amount: number
    yearlyAmount: number
    priceIds: {
      monthly: string | null
      yearly: string | null
    }
  }
  features: {
    included: {
      text: string
      tooltip: string | null
    }[]
    excluded: {
      text: string
      tooltip: string | null
    }[]
  }
}

export const PlanTypes = {
  FREE: "FREE",
  STARTER: "STARTER",
  PRO: "PRO",
} as const

export type PlanTypesType = (typeof PlanTypes)[keyof typeof PlanTypes]

export const RoleTypes = {
  OWNER: "owner",
  ADMIN: "admin",
  MEMBER: "member",
} as const

export type RoleTypesType = (typeof RoleTypes)[keyof typeof RoleTypes]

export const InvitationStatusTypes = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
} as const

export type InvitationStatusTypesType =
  (typeof InvitationStatusTypes)[keyof typeof InvitationStatusTypes]

export const NotificationTypes = {
  INFO: "info",
  WARNING: "warning",
  ERROR: "error",
  SUCCESS: "success",
  INVITATION: "invitation",
} as const

export type NotificationTypesType = (typeof NotificationTypes)[keyof typeof NotificationTypes]

export const SubscriptionStatusTypes = {
  ACTIVE: "active",
  CANCELLED: "cancelled",
  POST_DUE: "post_due",
  INACTIVE: "inactive",
  ENDED: "ended",
} as const

export type SubscriptionStatusTypesType =
  (typeof SubscriptionStatusTypes)[keyof typeof SubscriptionStatusTypes]

export type UserWithRoleType = {
  id: UserType["id"]
  name: UserType["name"]
  email: UserType["email"]
  image: UserType["image"]
  role: PermissionType["name"]
  status: MemberType["status"]
}

export type ItemWithCreatorType = ItemType & {
  creator: {
    name: UserType["name"]
    email: UserType["email"]
    image: UserType["image"]
  } | null
}

export type TagType = {
  value: string
  label: string
}

export type ConfigurationType = {
  site: {
    name: string
    description: string
    shortDescription: string
    domain: string
    logo: string

    defaultTheme: "dark" | "light"
    siteUrl: string
    openGraphImage: string
    openGraphTitle: string
    openGraphDescription: string
    contactEmail: string
    xHandle: string
    xUrl: string
    githubHandle: string
  }

  resend: {
    apiKey: string
    email: string
  }
  stripe: {
    products: SubscriptionPlanType[]
  }
}

export type sendReceiptProps = {
  email: string
  purchaseId: string
  amount: number
  productName: string
  desc: string
  purchaseDate: Date
  last4: string
  brand: string
  paymentType: string
}

// Export typed motion components

export type SessionType = typeof auth.$Infer.Session
