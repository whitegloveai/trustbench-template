import { NEXT_PUBLIC_APP_URL_ENV, RESEND_API_KEY_ENV, RESEND_EMAIL_ENV } from "@/env"

import { ConfigurationType } from "@/types/types"

export const configuration: ConfigurationType = {
  site: {
    name: "Boring",
    description: "Build your SaaS in minutes, not months.",
    shortDescription: "Build your SaaS in minutes, not months.",
    domain: "app.boringtemplate.com",
    siteUrl: NEXT_PUBLIC_APP_URL_ENV,
    defaultTheme: "light",
    logo: "https://res.cloudinary.com/dowiygzq3/image/upload/v1734969150/logo_1_zmqhlu.png",
    openGraphImage: "https://app.boringtemplate.com/open-graph.png",
    openGraphTitle: "Boring - Create, Launch and grow your SaaS in no time",
    openGraphDescription:
      "A modern, lightweight NextJs 15 template with built-in authentication, payments, and team management. Start building your SaaS in minutes, not months.",
    contactEmail: "kevinminh.ng@gmail.com",
    xHandle: "boringtemplate",
    xUrl: "https://x.com/kewinversi",
    githubHandle: "boringtemplate",
  },

  resend: {
    apiKey: RESEND_API_KEY_ENV,
    email: RESEND_EMAIL_ENV,
  },

  stripe: {
    products: [
      {
        name: "Free",
        description: "Free, forever.",
        slug: "Free",
        type: "FREE" as const,
        workspacesQuota: 6,
        membersQuota: 3,
        price: {
          amount: 0,
          yearlyAmount: 0,
          priceIds: {
            monthly: null,
            yearly: null,
          },
        },
        features: {
          included: [
            {
              text: "Access to transactions",
              tooltip: null,
            },
            {
              text: "Integrations",
              tooltip: null,
            },
            {
              text: "Basic reporting and analytics",
              tooltip: null,
            },

            {
              text: "2 Included team members",
              tooltip: "Then $29 per user per month",
            },
          ],
          excluded: [
            {
              text: "1 TB of cloud storage",
              tooltip: null,
            },
            {
              text: "Unlimited agencies",
              tooltip: null,
            },
            {
              text: "Advanced tracking",
              tooltip: null,
            },
            {
              text: "Fully white labelled",
              tooltip: null,
            },
            {
              text: "Premium dedicated support",
              tooltip: "Get a dedicated slack channel with us to get fast and custom support",
            },
          ],
        },
      },
      {
        name: "Starter",
        description: "For small teams and startups.",
        slug: "Starter",
        type: "STARTER",
        workspacesQuota: 5,
        membersQuota: 2,
        price: {
          amount: 9,
          yearlyAmount: 90,
          priceIds: {
            monthly: process.env.STRIPE_STARTER_PRICE_ID_MONTHLY!,
            yearly: process.env.STRIPE_STARTER_PRICE_ID_YEARLY!,
          },
        },
        features: {
          included: [
            {
              text: "Unlimited agencies",
              tooltip: null,
            },
            {
              text: "Access to transactions",
              tooltip: null,
            },
            {
              text: "Integrations",
              tooltip: null,
            },
            {
              text: "Basic reporting and analytics",
              tooltip: null,
            },
            {
              text: "1 TB of cloud storage",
              tooltip: null,
            },
            {
              text: "2 Included team members",
              tooltip: "Then $29 per user per month",
            },
          ],
          excluded: [
            {
              text: "Advanced tracking",
              tooltip: null,
            },
            {
              text: "Fully white labelled",
              tooltip: null,
            },
            {
              text: "Premium dedicated support",
              tooltip: "Get a dedicated slack channel with us to get fast and custom support",
            },
          ],
        },
      },
      {
        name: "Pro",
        description: "For growing teams and businesses.",
        slug: "Professional",
        type: "PRO",
        workspacesQuota: 35,
        membersQuota: 10,
        price: {
          amount: 19,
          yearlyAmount: 190,
          priceIds: {
            monthly: process.env.STRIPE_PRO_PRICE_ID_MONTHLY!,
            yearly: process.env.STRIPE_PRO_PRICE_ID_YEARLY!,
          },
        },
        features: {
          included: [
            // Include all Starter features
            {
              text: "Unlimited agencies",
              tooltip: null,
            },
            {
              text: "Access to transactions",
              tooltip: null,
            },
            {
              text: "Integrations",
              tooltip: null,
            },
            {
              text: "Basic reporting and analytics",
              tooltip: null,
            },
            {
              text: "1 TB of cloud storage",
              tooltip: null,
            },
            {
              text: "2 Included team members",
              tooltip: "Then $29 per user per month",
            },
            // Pro-specific features
            {
              text: "Advanced tracking",
              tooltip: null,
            },
            {
              text: "Fully white labelled",
              tooltip: null,
            },
            {
              text: "Premium dedicated support",
              tooltip: "Get a dedicated slack channel with us to get fast and custom support",
            },
          ],
          excluded: [], // Pro has no excluded features
        },
      },
    ],
  },
}
