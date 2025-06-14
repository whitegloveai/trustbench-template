"use client"

import { useSearchParams } from "next/navigation"
import { UserType } from "@/server/db/schema-types"
import { useCreateUserTRPC } from "@/trpc/hooks/users-hooks"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { userSchema } from "@/lib/schemas"
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
import { Switch } from "@/components/ui/switch"
import { Icons } from "@/components/global/icons"
import { ImageUpload, ImageUploadSkeleton } from "@/components/global/image-upload"
import { OnboardingWrapper } from "@/components/layout/onboarding-wrapper"

type CreateProfileFormProps = {
  user: Pick<UserType, "id" | "name" | "email" | "image">
}

export function CreateProfileForm({ user }: CreateProfileFormProps) {
  const searchParams = useSearchParams()
  const isFromInvitation = searchParams.get("from") === "invitation"

  const { isPending, mutate } = useCreateUserTRPC({ isFromInvitation })

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      image: user.image ?? undefined,
      name: user.name ?? undefined,
      lastName: undefined,
      email: user.email ?? "",
      id: user.id,
    },
  })

  const onSubmit = async (values: z.infer<typeof userSchema>) => {
    mutate({ values, isFromInvitation })
  }

  const isLoading = form.formState.isSubmitting || isPending

  return (
    <OnboardingWrapper step={1} title="Your initial profile">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Image</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value)
                    }}
                    disabled={false}
                    showActions={true}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-card ring-offset-background dark:bg-background"
                        placeholder="Jon"
                        disabled={isLoading}
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name (optional)</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-card ring-offset-background dark:bg-background"
                        placeholder="Doe"
                        disabled={isLoading}
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-card ring-offset-background dark:bg-background"
                        disabled
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs">Subscribe to product update emails</span>
                  <p className="text-muted-foreground text-[11px]">
                    Get the latest updates about features and product updates.
                  </p>
                </div>
                <Switch id="news" />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Icons.loader className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </OnboardingWrapper>
  )
}

export function CreateProfileFormSkeleton() {
  return (
    <OnboardingWrapper step={1} title="Your initial profile">
      <div className="space-y-8">
        <ImageUploadSkeleton />

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
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs">Subscribe to product update emails</span>
                <p className="text-muted-foreground text-[11px]">
                  Get the latest updates about features and product updates.
                </p>
              </div>
              <Switch id="news" />
            </div>

            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </OnboardingWrapper>
  )
}
