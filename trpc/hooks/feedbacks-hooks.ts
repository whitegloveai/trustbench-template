import { trpc } from "@/trpc/client"
import { toast } from "sonner"

import { useCreateFeedbackModal } from "@/hooks/use-create-feedback-modal"

export const useSendFeedbackTRPC = () => {
  const { close } = useCreateFeedbackModal()

  const { mutate, isPending } = trpc.feedbacks.create.useMutation({
    onSuccess: () => {
      toast.success("Feedback sent successfully")
      close()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  return { isPending, mutate }
}
