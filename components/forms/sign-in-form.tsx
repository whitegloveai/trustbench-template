"use client"

import { ComponentProps, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { RedirectType, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { signIn } from "@/lib/auth-client"
import { configuration } from "@/lib/config"
import { createRoute, redirectToRoute } from "@/lib/routes"
import { userSchema } from "@/lib/schemas"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { SignInSocialsForm } from "@/components/forms/sign-in-socials-form"
import { Icons } from "@/components/global/icons"

type SignInFormProps = ComponentProps<typeof Card> & {
  isLoggedIn: boolean
}

export function SignInForm({ className, isLoggedIn, ...props }: SignInFormProps) {
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")

  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl")
  const extraSession = searchParams.get("extraSession")

  const emailSchema = userSchema.pick({ email: true })

  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  })

  if (isLoggedIn && !extraSession) {
    return redirectToRoute("callback", undefined, RedirectType.replace)
  }

  const urlError =
    searchParams.get("error") === "OAuthAccountNotLinked"
      ? "Email already in use with different provider!"
      : ""

  const isLoading = form.formState.isSubmitting

  const onSubmit = async (values: z.infer<typeof emailSchema>) => {
    setError("")
    setSuccess("")
    try {
      const { data } = await signIn.magicLink({
        email: values.email,
        callbackURL: callbackUrl ?? createRoute("callback").href,
      })

      if (!data) {
        setError("Your sign in request failed. Please try again")
        return toast.error("Something went wrong")
      }

      form.reset()
      setSuccess("We sent you a login link. Be sure to check your spam too.")
      setError("")
      toast.success("We sent your a login link", {
        description: "Be sure to check your spam too.",
      })
    } catch (error: any) {
      setError(error?.message ?? "Your sign in request failed. Please try again")
      toast.error("Something went wrong", { description: error?.message })
    }
  }

  const errorMessage = urlError ? urlError : error

  return (
    <div className="w-full">
      <Card className={cn("mx-auto w-full md:w-[400px]", className)} {...props}>
        <CardHeader>
          <Image
            src={"/logo.svg"}
            alt={`${configuration.site.name} Logo`}
            width={45}
            height={45}
            className="mb-2"
          />
          <CardTitle className="text-lg">Sign in or sign up</CardTitle>
          <CardDescription>{configuration.site.shortDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid w-full gap-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            disabled={isLoading}
                            placeholder="Enter your email"
                            type="email"
                            required
                            className="peer ps-9"
                            id="email"
                          />

                          <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                            <Icons.mail size={16} strokeWidth={2} aria-hidden="true" />
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Icons.loader className="animate-spin" />
                      Sending link...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
                {errorMessage ? (
                  <div className="flex items-center gap-x-2 rounded-md bg-red-500/10 p-3 text-sm font-medium text-red-600">
                    <Icons.alertTriangle className="size-4" />
                    <p>{errorMessage}</p>
                  </div>
                ) : null}

                {success ? (
                  <div className="flex items-center gap-x-2 rounded-md bg-green-500/10 p-3 text-sm font-medium text-green-600 dark:bg-green-400/10 dark:text-green-500">
                    <Icons.checkCircle className="size-4" />
                    <p>{success}</p>
                  </div>
                ) : null}
              </div>
            </form>
          </Form>

          <div className="my-2 flex items-center gap-x-4">
            <Separator className="bg-border h-px flex-1" />
            <span className="text-muted-foreground text-xs font-medium">or continue with</span>
            <Separator className="bg-border h-px flex-1" />
          </div>
          <SignInSocialsForm />
        </CardContent>
      </Card>
      <div className="text-primary/60 mx-auto mt-4 max-w-[40ch] px-8 text-center text-xs">
        By signing up, you agree to our{" "}
        <Link prefetch className="underline" href={createRoute("terms").href} target="_blank">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link prefetch href={createRoute("privacy").href} className="underline" target="_blank">
          Privacy Policy
        </Link>
        .
      </div>
    </div>
  )
}
