import { Metadata } from "next"
import { HydrateClient, trpc } from "@/trpc/server"

import { ROUTES } from "@/lib/routes"
import { EditNotificationsForm } from "@/components/forms/edit-notifications-form"
import { SettingsWrapper, SettingsWrapperCard } from "@/components/layout/settings-wrapper"

export const metadata: Metadata = ROUTES["settings-notifications"].metadata
export const dynamic = "force-dynamic"
export default async function NotificationsSettingsPage() {
  void trpc.usersSettings.getOne.prefetch()

  return (
    <HydrateClient>
      <SettingsWrapper title="Notifications" description="Manage your notification settings">
        <SettingsWrapperCard>
          <EditNotificationsForm />
        </SettingsWrapperCard>
      </SettingsWrapper>
    </HydrateClient>
  )
}
