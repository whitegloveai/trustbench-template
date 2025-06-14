"use client"

import { useCreateFeedbackModal } from "@/hooks/use-create-feedback-modal"
import { CreateFeedbackForm } from "@/components/forms/create-feedback-form"
import { ResponsiveModal } from "@/components/global/responsive-modal"

export function CreateFeedbackModal() {
  const { isOpen, close } = useCreateFeedbackModal()

  return (
    <ResponsiveModal
      onOpenChange={close}
      isOpen={isOpen}
      modalClassName="flex h-96 max-w-lg flex-col bg-os-background-100 md:h-fit md:min-h-72"
      mobileDrawerClassName="flex-col gap-y-8 w-full md:flex-row"
      headerTitle="Feedback"
      headerDescription="Share your feedback with us."
    >
      <CreateFeedbackForm />
    </ResponsiveModal>
  )
}
