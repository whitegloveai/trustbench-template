"use client"

import { useCallback, useState } from "react"
import { useSearchParams } from "next/navigation"
import { UserType } from "@/server/db/schema-types"
import { useCreateBulkInvitationTRPC } from "@/trpc/hooks/invitations-hooks"
import { useUpdateOnboardingTRPC } from "@/trpc/hooks/users-settings"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { bulkInvitationSchema } from "@/lib/schemas"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Icons } from "@/components/global/icons"

type CreateInvitationsFormProps = {
  userId: UserType["id"]
}

export function CreateInvitationsForm({ userId }: CreateInvitationsFormProps) {
  const [inviteEmails, setInviteEmails] = useState<number>(1)
  const params = useSearchParams()

  const workspaceId = params.get("workspaceId") as string

  const form = useForm<z.infer<typeof bulkInvitationSchema>>({
    resolver: zodResolver(bulkInvitationSchema),
    defaultValues: {
      emails: Array(1).fill(""),
    },
  })

  const { mutate: updateOnboarding, isPending: isUpdatingOnboarding } = useUpdateOnboardingTRPC()

  const handleSkip = () => {
    updateOnboarding({ onboardingStep: "completed", userId })
    form.reset()
  }

  const { mutate, isPending: isCreatingInvitations } = useCreateBulkInvitationTRPC({
    onSuccess: () => {
      form.reset()
      handleSkip()
    },
  })

  const handleInvite = useCallback(() => {
    if (inviteEmails < 4) {
      setInviteEmails((prev) => prev + 1)
      // Add a new empty email field to the form
      const currentEmails = form.getValues().emails
      form.setValue("emails", [...currentEmails, ""])
    }
  }, [inviteEmails, form])

  const isFormDisabled = isUpdatingOnboarding || isCreatingInvitations

  const handleAddEmailField = useCallback(() => {
    handleInvite()
  }, [handleInvite])

  const handleRemoveEmailField = useCallback(
    (index: number) => {
      if (inviteEmails > 1) {
        setInviteEmails((prev) => prev - 1)
        // Remove the email field at the specified index
        const currentEmails = form.getValues().emails
        form.setValue(
          "emails",
          currentEmails.filter((_, i) => i !== index)
        )
      }
    },
    [inviteEmails, form]
  )

  const onSubmit = async (values: z.infer<typeof bulkInvitationSchema>) => {
    const validEmails = values.emails.filter((email) => email.length > 0)
    mutate({ emails: validEmails, workspaceId: workspaceId })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col gap-y-6">
        <div className="space-y-2">
          {Array.from({ length: inviteEmails }, (_, index) => (
            <FormField
              key={index} // Use index as key for simplicity, consider using unique IDs for production
              control={form.control}
              name={`emails.${index}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Email {index + 1}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="example@email.com"
                        disabled={isFormDisabled}
                        type="email"
                        id={`email${index + 1}`} // Ensure unique ID for each field
                        {...field}
                      />

                      {inviteEmails > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveEmailField(index)}
                          className="absolute top-1 right-0 mt-2 mr-2"
                        >
                          <Icons.minus className="size-4" />
                        </button>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}

          {inviteEmails < 4 ? (
            <Button
              size="sm"
              type="button"
              className="text-muted-foreground w-full"
              variant="ghost"
              onClick={handleAddEmailField}
            >
              <Icons.plus />
              Add another email
            </Button>
          ) : null}
        </div>
        <div className="mt-auto space-y-2">
          <Button type="submit" size="sm" className="w-full" disabled={isFormDisabled}>
            {isCreatingInvitations ? (
              <>
                <Icons.loader className="animate-spin" />
                Finishing up...
              </>
            ) : (
              "Next"
            )}
          </Button>
          <Button
            onClick={handleSkip}
            type="button"
            className="w-full font-normal"
            size="sm"
            variant="ghost"
            disabled={isUpdatingOnboarding}
          >
            {isUpdatingOnboarding ? (
              <>
                <Icons.loader className="animate-spin" />
                Skipping...
              </>
            ) : (
              "Skip"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export function CreateInvitationsFormSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>

        <Separator />

        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}
