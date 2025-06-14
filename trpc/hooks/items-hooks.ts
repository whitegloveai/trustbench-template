import { useRouter } from "next/navigation"
import { trpc } from "@/trpc/client"
import { toast } from "sonner"

import { GLOBAL_ERROR_MESSAGE } from "@/lib/constants"
import { useCreateItemModal } from "@/hooks/use-create-item-modal"

export const useCreateItemTRPC = ({ onSuccess }: { onSuccess?: () => void }) => {
  const utils = trpc.useUtils()
  const router = useRouter()
  const { close, open } = useCreateItemModal()

  const { mutate, isPending } = trpc.items.create.useMutation({
    onSuccess: (res) => {
      toast.success(res.message, {
        action: {
          label: "Open",
          onClick: () => router.push(`/${res.slug}/items/${res.newItem.id}`),
        },
      })
      onSuccess?.()
      close()
    },
    onError: (error) => {
      toast.error(error.message || GLOBAL_ERROR_MESSAGE)
      open()
    },
    onSettled: () => {
      utils.items.getMany.invalidate()
      utils.notifications.getMany.invalidate()
    },
  })

  return { mutate, isPending }
}

export const useDeleteItemTRPC = () => {
  const utils = trpc.useUtils()

  const { mutate, isPending } = trpc.items.delete.useMutation({
    onMutate: async (item) => {
      // Cancel any outgoing refecthes
      // So they dont overwrite our optimistic update

      await utils.items.getMany.cancel()

      // Snapshot the previous value
      const previousItems = utils.items.getMany.getData()

      // Optimistically update to the new value
      utils.items.getMany.setData({ slug: item.slug }, (old = []) => {
        return old.filter((i) => i.id !== item.id)
      })

      // Return the previous value
      return { previousItems }
    },

    onSuccess: (res) => {
      toast.success(res.message)
    },
    onError: (error) => {
      toast.error(error.message || GLOBAL_ERROR_MESSAGE)
    },
    onSettled: () => {
      utils.items.getMany.invalidate()
    },
  })

  return { mutate, isPending }
}

export const useDuplicateItemTRPC = () => {
  const utils = trpc.useUtils()

  const { mutate, isPending } = trpc.items.duplicate.useMutation({
    onSuccess: (res) => {
      toast.success(res.message)
      utils.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || GLOBAL_ERROR_MESSAGE)
    },
    onSettled: () => {
      utils.items.getMany.invalidate()
    },
  })

  return { mutate, isPending }
}
