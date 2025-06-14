import { trpc } from "@/trpc/client"
import { toast } from "sonner"

import { GLOBAL_ERROR_MESSAGE } from "@/lib/constants"

export const useUpdateNotificationTRPC = () => {
  const utils = trpc.useUtils()

  const { mutate, isPending } = trpc.notifications.update.useMutation({
    onSuccess: (data) => {
      toast.success(data.message)
    },
    onError: (error) => {
      toast.error(error?.message || GLOBAL_ERROR_MESSAGE)
    },
    onSettled: () => {
      utils.notifications.getMany.invalidate()
    },
  })

  return { mutate, isPending }
}

export const useUpdateArchiveOneTRPC = () => {
  const utils = trpc.useUtils()

  const { mutate, isPending } = trpc.notifications.updateArchiveOne.useMutation({
    // onMutate: async (notification) => {
    //   await utils.notifications.getMany.cancel()

    //   const previousNotifications = utils.notifications.getMany.getData()

    //   utils.notifications.getMany.setData(
    //     undefined,
    //     (
    //       old = {
    //         notifications: [],
    //         archivedNotifications: [],
    //       }
    //     ) => {
    //       return {
    //         ...old,
    //         notifications: old.notifications.map((n) => {
    //           if (n.id === notification.id) {
    //             return { ...n, archived: true }
    //           }
    //           return n
    //         }),
    //       }
    //     }
    //   )

    //   return { previousNotifications }
    // },

    onSuccess: (data) => {
      toast.success(data.message)
    },
    onError: (error) => {
      toast.error(error?.message || GLOBAL_ERROR_MESSAGE)
    },
    onSettled: () => {
      utils.notifications.getMany.invalidate()
    },
  })

  return { mutate, isPending }
}

export const useUpdateArchiveManyTRPC = () => {
  const utils = trpc.useUtils()

  const { mutate, isPending } = trpc.notifications.updateArchiveMany.useMutation({
    onSuccess: (data) => {
      toast.success(data.message)
    },
    onError: (error) => {
      toast.error(error?.message || GLOBAL_ERROR_MESSAGE)
    },
    onSettled: () => {
      utils.notifications.getMany.invalidate()
    },
  })

  return { mutate, isPending }
}
