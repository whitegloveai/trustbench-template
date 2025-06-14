import { useRouter } from "next/navigation"
import { trpc } from "@/trpc/client"
import { toast } from "sonner"

import { GLOBAL_ERROR_MESSAGE } from "@/lib/constants"
import { createRoute } from "@/lib/routes"

export const useUpdateUserSettingsTRPC = ({ onSuccess }: { onSuccess?: () => void }) => {
  const router = useRouter()

  const { mutate, isPending } = trpc.usersSettings.update.useMutation({
    onSuccess: (data) => {
      toast.success(data.message)
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(error?.message || GLOBAL_ERROR_MESSAGE)
    },
    onSettled: () => {
      router.refresh()
    },
  })

  return { mutate, isPending }
}

export const useUpdateOnboardingTRPC = () => {
  const router = useRouter()

  const { mutate, isPending } = trpc.usersSettings.updateOnboarding.useMutation({
    onSuccess: (data) => {
      toast.success(data.message, {
        description: data.description,
      })

      router.push(createRoute("callback").href)
    },
    onError: (error) => {
      toast.error(error.message)
    },
    onSettled: () => {
      router.refresh()
    },
  })

  return { mutate, isPending }
}
