// import { useRouter } from "next/navigation"
// import {
//   // createWorkspaceAction,
//   // deleteWorkspaceAction,
//   transferWorkspaceOwnership,
//   // updateWorkspaceAction,
// } from "@/server/actions/workspace-actions"
// // import { trpc } from "@/trpc/client"
// import { useMutation } from "@tanstack/react-query"
// import { toast } from "sonner"

// // import { ApiClient, CreateWorkspaceRequest } from "@/lib/api-client"
// import { GLOBAL_ERROR_MESSAGE } from "@/lib/constants"

// // import { createRoute } from "@/lib/routes"

// // Server action
// // export const useCreateWorkspace = ({ isInitial }: { isInitial: boolean }) => {
// //   const router = useRouter()

// //   const { isPending, mutate } = useMutation({
// //     mutationFn: createWorkspaceAction,
// //     onSuccess: (data) => {
// //       toast.success(data.message)
// //       router.push(
// //         isInitial
// //           ? createRoute("onboarding-collaborate").href
// //           : createRoute("dashboard", { slug: data.slug }).href
// //       )
// //     },
// //     onError: (error: any) => {
// //       toast.error(error?.message || GLOBAL_ERROR_MESSAGE, {
// //         description: error?.description,
// //       })
// //     },
// //     onSettled: () => {
// //       router.refresh()
// //     },
// //   })

// //   return { isPending, server_createWorkspace: mutate }
// // }

// type useUpdateWorkspaceProps = {
//   onSuccess: () => void
// }

// // export const useUpdateWorkspace = ({ onSuccess }: useUpdateWorkspaceProps) => {
// //   const router = useRouter()
// //   const { isPending, mutate } = useMutation({
// //     mutationFn: updateWorkspaceAction,
// //     onSuccess: (res) => {
// //       toast.success(res.message)
// //       if (res.newSlug) {
// //         router.push(createRoute("settings-workspace", { slug: res.newSlug }).href)
// //       }
// //       onSuccess()
// //     },
// //     onError: (error) => {
// //       toast.error(error.message || GLOBAL_ERROR_MESSAGE)
// //     },
// //     onSettled: () => {
// //       router.refresh()
// //     },
// //   })

// //   return {
// //     isPending,
// //     server_updateWorkspace: mutate,
// //   }
// // }

// type useDeleteWorkspaceProps = {
//   enableRedirect?: boolean
// }

// // export const useDeleteWorkspace = ({ enableRedirect = true }: useDeleteWorkspaceProps) => {
// //   const router = useRouter()
// //   const { isPending, mutate } = useMutation({
// //     mutationFn: deleteWorkspaceAction,
// //     onSuccess: (data) => {
// //       const { message, description } = data
// //       toast.success(message, {
// //         description,
// //       })
// //       if (enableRedirect) {
// //         router.push(createRoute("callback").href)
// //       }
// //     },
// //     onError: (error: any) => {
// //       toast.error(error.message || GLOBAL_ERROR_MESSAGE)
// //     },
// //     onSettled: () => {
// //       router.refresh()
// //     },
// //   })

// //   return { isPending, server_deleteWorkspace: mutate }
// // }

// export const useTransferOwnership = () => {
//   const router = useRouter()
//   const { isPending, mutate } = useMutation({
//     mutationFn: transferWorkspaceOwnership,
//     onSuccess: (data) => {
//       toast.success(data.message, {
//         description: data.description,
//       })
//     },
//     onError: (error: any) => {
//       toast.error(error.message || GLOBAL_ERROR_MESSAGE)
//     },
//     onSettled: () => {
//       router.refresh()
//     },
//   })

//   return { isPending, server_transferOwnership: mutate }
// }

// // // API  Client
// // export const useCreateWorkspaceAPI = ({ isInitial }: { isInitial: boolean }) => {
// //   const router = useRouter()

// //   const { isPending, mutate } = useMutation({
// //     mutationFn: ({ values, isInitial }: CreateWorkspaceRequest) =>
// //       ApiClient.createWorkspace({ values, isInitial }),
// //     onSuccess: (data) => {
// //       toast.success(data.message)
// //       router.push(
// //         isInitial
// //           ? createRoute("onboarding-collaborate").href
// //           : createRoute("dashboard", { slug: data.slug }).href
// //       )
// //     },
// //     onError: (error) => {
// //       toast.error(error.message || GLOBAL_ERROR_MESSAGE)
// //     },
// //     onSettled: () => {
// //       router.refresh()
// //     },
// //   })

// //   return { isPending, server_createWorkspaceAPI: mutate }
// // }

// // export const useUpdateWorkspaceAPI = ({ onSuccess }: useUpdateWorkspaceProps) => {
// //   const router = useRouter()

// //   const { isPending, mutate } = useMutation({
// //     mutationFn: ({ id, values }: UpdateWorkspaceRequest) =>
// //       ApiClient.updateWorkspace({ id, values }),
// //     onSuccess: (data) => {
// //       toast.success(data.message)
// //       if (data.newSlug) {
// //         router.push(createRoute("settings-workspace", { slug: data.newSlug }).href)
// //       }
// //       onSuccess()
// //     },
// //     onError: (error) => {
// //       toast.error(error.message || GLOBAL_ERROR_MESSAGE)
// //     },
// //     onSettled: () => {
// //       router.refresh()
// //     },
// //   })

// //   return { isPending, server_updateWorkspaceAPI: mutate }
// // }

// // export const useDeleteWorkspaceAPI = ({ enableRedirect = true }: useDeleteWorkspaceProps) => {
// //   const router = useRouter()
// //   const { isPending, mutate } = useMutation({
// //     mutationFn: ({ id }: { id: WorkspaceType["id"] }) => ApiClient.deleteWorkspace(id),
// //     onSuccess: (data) => {
// //       const { message, description, redirectUrl } = data
// //       toast.success(message, {
// //         description: enableRedirect ? description : null,
// //       })
// //       if (enableRedirect && redirectUrl) {
// //         router.push(redirectUrl)
// //       }
// //     },
// //     onError: (error) => {
// //       toast.error(error.message || GLOBAL_ERROR_MESSAGE)
// //     },
// //     onSettled: () => {
// //       router.refresh()
// //     },
// //   })

// //   return { isPending, server_deleteWorkspaceAPI: mutate }
// // }

// // TRPC
// // export const useUpdateWorkspaceTRPC = ({ onSuccess }: useUpdateWorkspaceProps) => {
// //   const utils = trpc.useUtils()

// //   const router = useRouter()
// //   const { isPending, mutate } = trpc.workspaces.update.useMutation({
// //     onSuccess: (data) => {
// //       toast.success(data.message)
// //       if (data.newSlug) {
// //         router.push(createRoute("settings-workspace", { slug: data.newSlug }).href)
// //       }
// //       onSuccess()
// //       utils.workspaces.getSwitcher.invalidate()
// //     },
// //     onError: (error) => {
// //       toast.error(error.message || GLOBAL_ERROR_MESSAGE)
// //     },
// //   })

// //   return { isPending, mutate }
// // }

// // export const useDeleteWorkspaceTRPC = ({ enableRedirect = true }: useDeleteWorkspaceProps) => {
// //   const router = useRouter()
// //   const utils = trpc.useUtils()
// //   const { isPending, mutate } = trpc.workspaces.delete.useMutation({
// //     onSuccess: (data) => {
// //       const { message, description, redirectUrl } = data
// //       toast.success(message, {
// //         description: enableRedirect ? description : null,
// //       })
// //       if (enableRedirect && redirectUrl) {
// //         router.push(redirectUrl)
// //       }
// //       utils.workspaces.getSwitcher.invalidate()
// //     },
// //     onError: (error) => {
// //       toast.error(error.message || GLOBAL_ERROR_MESSAGE)
// //     },
// //   })

// //   return { isPending, mutate }
// // }
