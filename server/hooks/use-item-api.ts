// import { useRouter } from "next/navigation"
// import {
//   createItemAction,
//   deleteItemAction,
//   duplicateItemAction,
// } from "@/server/actions/item-actions"
// import { useMutation, useQueryClient } from "@tanstack/react-query"
// import { toast } from "sonner"

// import { ItemWithCreatorType } from "@/types/types"
// import { ApiClient, CreateItemRequest, DeleteItemRequest } from "@/lib/api-client"
// import { GLOBAL_ERROR_MESSAGE } from "@/lib/constants"
// import { useCreateItemModal } from "@/hooks/use-create-item-modal"

// type CreateItemProps = {
//   resetForm: () => void
// }

// // Server Action
// // export const useCreateItem = ({ resetForm }: CreateItemProps) => {
// //   const router = useRouter()
// //   const { close } = useCreateItemModal()

// //   const { mutate, isPending } = useMutation({
// //     mutationFn: createItemAction,
// //     onSuccess: async (res) => {
// //       toast.success(res.message)

// //       // Batch these operations
// //       await Promise.all([
// //         resetForm(),
// //         // Add delay before closing
// //         new Promise((resolve) => setTimeout(resolve, 300)).then(close),
// //       ])
// //     },
// //     onError: (error) => {
// //       toast.error(error.message || GLOBAL_ERROR_MESSAGE)
// //     },
// //     onSettled: () => {
// //       router.refresh()
// //     },
// //   })

// //   return { isPending, server_createItem: mutate }
// // }

// // export const useDeleteItem = () => {
// //   const router = useRouter()

// //   const { mutate, isPending } = useMutation({
// //     mutationFn: deleteItemAction,
// //     onSuccess: (res) => {
// //       toast.success(res.message)
// //     },
// //     onError: (error) => {
// //       toast.error(error.message || GLOBAL_ERROR_MESSAGE)
// //     },
// //     onSettled: () => {
// //       router.refresh()
// //     },
// //   })

// //   return { isPending, server_deleteItem: mutate }
// // }

// // export const useDuplicateItem = () => {
// //   const router = useRouter()

// //   const { mutate, isPending } = useMutation({
// //     mutationFn: duplicateItemAction,
// //     onSuccess: (res) => {
// //       toast.success(res.message)
// //     },
// //     onError: (error) => {
// //       toast.error(error.message || GLOBAL_ERROR_MESSAGE)
// //     },
// //     onSettled: () => {
// //       router.refresh()
// //     },
// //   })

// //   return { isPending, server_duplicateItem: mutate }
// // }

// // API Client
// // export const useCreateItemAPI = ({ resetForm }: CreateItemProps) => {
// //   const queryClient = useQueryClient()
// //   const { close } = useCreateItemModal()

// //   const { mutate, isPending } = useMutation({
// //     mutationFn: ({ slug, values }: CreateItemRequest) => ApiClient.createItem({ slug, values }),

// //     onSuccess: async (res, { slug }) => {
// //       toast.success(res.message)

// //       // Invalidate TRPC query with proper structure
// //       await queryClient.invalidateQueries({
// //         queryKey: [["items", "getMany"], { input: { slug }, type: "query" }],
// //       })

// //       // Reset form and close modal
// //       resetForm()
// //       close()

// //       // No need to refresh the page since query invalidation will trigger a refetch
// //       // router.refresh()
// //     },

// //     onError: (error) => {
// //       toast.error(error.message || GLOBAL_ERROR_MESSAGE)
// //     },

// //     // Retry failed mutations
// //     retry: 2,
// //   })

// //   return { isPending, server_createItemAPI: mutate }
// // }

// // export const useDeleteItemAPI = () => {
// //   const router = useRouter()
// //   const queryClient = useQueryClient()

// //   const { mutate, isPending } = useMutation({
// //     mutationFn: ({ id }: DeleteItemRequest) => ApiClient.deleteItem(id),

// //     // Optimistic Updates
// //     onMutate: async ({ id }) => {
// //       // Get the current workspace slug from the cache
// //       const queryKeys = queryClient
// //         .getQueriesData<{
// //           data: ItemWithCreatorType[]
// //         }>({ queryKey: ["items"] })
// //         .map(([queryKey]) => queryKey[1])
// //       const slug = queryKeys[0] as string

// //       // Cancel outgoing refetches
// //       await queryClient.cancelQueries({ queryKey: ["items", slug] })

// //       // Snapshot previous value
// //       const previousItems = queryClient.getQueryData(["items", slug])

// //       // Optimistically remove the item
// //       queryClient.setQueryData(["items", slug], (old: { data: ItemWithCreatorType[] }) => ({
// //         data: old.data.filter((item) => item.id !== id),
// //       }))

// //       return { previousItems, slug }
// //     },

// //     onSuccess: async (res, { id }, context) => {
// //       toast.success(res.message)

// //       // Invalidate specific items query
// //       if (context?.slug) {
// //         await queryClient.invalidateQueries({
// //           queryKey: ["items", context.slug],
// //         })
// //       }
// //     },

// //     onError: (error, variables, context) => {
// //       // Rollback on error
// //       if (context?.slug) {
// //         queryClient.setQueryData(["items", context.slug], context.previousItems)
// //       }
// //       toast.error(error.message || GLOBAL_ERROR_MESSAGE)
// //     },

// //     onSettled: () => {
// //       router.refresh()
// //     },

// //     // Retry failed mutations
// //     retry: 2,
// //   })

// //   return { isPending, server_deleteItemAPI: mutate }
// // }
