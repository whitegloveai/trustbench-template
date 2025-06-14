"use client"

import { Suspense } from "react"
import { trpc } from "@/trpc/client"
import { useUpdateUserSettingsTRPC } from "@/trpc/hooks/users-settings"
import { zodResolver } from "@hookform/resolvers/zod"
import { ErrorBoundary } from "react-error-boundary"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { userNotificationSettingsSchema } from "@/lib/schemas"
import { Button } from "@/components/ui/button"
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Alert } from "@/components/global/alert"

export function EditNotificationsForm() {
  return (
    <Suspense fallback={<EditNotificationsFormSkeleton />}>
      <ErrorBoundary
        fallbackRender={({ error }) => (
          <Alert
            variant="error"
            title={error.message || "An error occurred"}
            icon="alertTriangle"
          />
        )}
      >
        <EditNotificationsFormSuspense />
      </ErrorBoundary>
    </Suspense>
  )
}

function EditNotificationsFormSuspense() {
  const [data] = trpc.usersSettings.getOne.useSuspenseQuery()

  const { settings, userId } = data

  const form = useForm<z.infer<typeof userNotificationSettingsSchema>>({
    resolver: zodResolver(userNotificationSettingsSchema),
    defaultValues: {
      userId,
      subscriptionEmails: settings.subscriptionEmails,
      updateEmails: settings.updateEmails,
      userSettingsId: settings.id,
    },
  })

  const { isPending, mutate } = useUpdateUserSettingsTRPC({
    onSuccess: () => form.reset(form.getValues()),
  })

  const isDirty = form.formState.isDirty

  const onSubmit = async (values: z.infer<typeof userNotificationSettingsSchema>) => {
    if (!isDirty) {
      return toast.info("No changes to update...")
    }
    mutate(values)
  }

  const isLoading = form.formState.isSubmitting || isPending

  return (
    <>
      <CardHeader>
        <CardTitle className="text-muted-foreground text-sm">
          Configure how you receive notifications.
        </CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="updateEmails"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Update emails</FormLabel>
                    <FormDescription className="w-11/12 text-[13px] md:text-sm">
                      Receive emails about your account activity like comments, mentions and
                      notifications form tasks you are assigned to.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subscriptionEmails"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Subscribe to future updates</FormLabel>
                    <FormDescription className="w-11/12 text-[13px] md:text-sm">
                      Receive emails about new features, updates and other important information
                      about.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="justify-end">
            <Button type="submit" disabled={isLoading}>
              Update
            </Button>
          </CardFooter>
        </form>
      </Form>
    </>
  )
}

function EditNotificationsFormSkeleton() {
  return (
    <>
      <CardHeader>
        <CardTitle className="text-muted-foreground text-sm">
          Configure how you receive notifications.
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-y-4">
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />

        <CardFooter className="h-24 items-end justify-end p-0">
          <Skeleton className="h-8 w-32" />
        </CardFooter>
      </CardContent>
    </>
  )
}
