"use client"

import { useSendFeedbackTRPC } from "@/trpc/hooks/feedbacks-hooks"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { feedbackSchema } from "@/lib/schemas"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Form, FormField } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Icons } from "@/components/global/icons"

export function CreateFeedbackForm() {
  const { isPending, mutate } = useSendFeedbackTRPC()

  const form = useForm<z.infer<typeof feedbackSchema>>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      feedback: "",
    },
  })

  const onSubmit = (values: z.infer<typeof feedbackSchema>) => {
    mutate(values)
  }

  const getLetterCount = (text: string) => {
    return text.length
  }
  const isDirty = form.formState.isDirty
  const isSubmitting = form.formState.isSubmitting || isPending

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-y-4 px-4 md:px-0"
      >
        <FormField
          control={form.control}
          name="feedback"
          render={({ field }) => (
            <div className="relative">
              <Textarea
                className="h-40 max-h-48"
                placeholder="Write your feedback here..."
                maxLength={256}
                {...field}
              />
              <div className="text-muted-foreground absolute right-2 bottom-2 text-xs">
                {getLetterCount(field.value)} / 256 characters
              </div>
            </div>
          )}
        />
        <DialogFooter>
          <Button type="submit" disabled={!isDirty || isSubmitting}>
            {isSubmitting ? (
              <>
                <Icons.loader className="animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
