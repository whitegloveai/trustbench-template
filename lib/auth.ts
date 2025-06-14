import {
  GITHUB_CLIENT_ID_ENV,
  GITHUB_CLIENT_SECRET_ENV,
  GOOGLE_CLIENT_ID_ENV,
  GOOGLE_CLIENT_SECRET_ENV,
  RESEND_EMAIL_ENV,
} from "@/env"
import { db } from "@/server/db/config/database"
import { account, sessions, users, verification } from "@/server/db/schemas"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { createAuthMiddleware, magicLink, multiSession } from "better-auth/plugins"
import { eq } from "drizzle-orm"

import { configuration } from "@/lib/config"
import { resend } from "@/lib/resend"
import { MagicLinkMail } from "@/components/mail/magic-link-mail"

export const auth = betterAuth({
  appName: "Boring Template",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: account,
      verification: verification,
    },
  }),
  socialProviders: {
    google: {
      clientId: GOOGLE_CLIENT_ID_ENV,
      clientSecret: GOOGLE_CLIENT_SECRET_ENV,
    },
    github: {
      clientId: GITHUB_CLIENT_ID_ENV,
      clientSecret: GITHUB_CLIENT_SECRET_ENV,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "email-password"],
    },
  },

  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path.includes("/sign-in/social")) {
        const newSession = ctx.context.newSession
        if (newSession) {
          await db
            .update(users)
            .set({ lastLoggedIn: new Date() })
            .where(eq(users.id, newSession.user.id))
        }
      }

      if (ctx.path.includes("/sign-in/verify")) {
        const newSession = ctx.context.newSession
        if (newSession) {
          await db
            .update(users)
            .set({ lastLoggedIn: new Date() })
            .where(eq(users.id, newSession.user.id))
        }
      }
    }),
  },

  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        const result = await resend.emails.send({
          from: RESEND_EMAIL_ENV,
          to: email,
          subject: `Magic Login Link from ${configuration.site.name}!`,
          react: MagicLinkMail({
            email: email,
            magicLinkMail: url,
          }),
        })
        if (result.error) {
          throw new Error(result.error?.message)
        }
      },
    }),
    nextCookies(),
    multiSession(),
  ],
})
