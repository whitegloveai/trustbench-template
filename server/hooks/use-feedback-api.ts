// import { useRouter } from "next/navigation"
// // import { sendFeedback } from "@/server/actions/feedback-actions"
// import { useMutation } from "@tanstack/react-query"
// import { toast } from "sonner"

// import { ApiClient } from "@/lib/api-client"
// import { useFeedbackModal } from "@/hooks/use-feedback-modal"

// // export const useSendFeedback = () => {
// //   const router = useRouter()
// //   const { close } = useFeedbackModal()

// //   const { mutate, isPending } = useMutation({
// //     mutationFn: sendFeedback,
// //     onSuccess: (res) => {
// //       toast.success(res.message, {
// //         description: res.description,
// //       })
// //       close()
// //     },
// //     onError: (error: any) => {
// //       toast.error(error.message)
// //     },
// //     onSettled: () => {
// //       router.refresh()
// //     },
// //   })

// //   return { isPending, server_sendFeedback: mutate }
// // }

// // API Client
// export const useSendFeedbackApi = () => {
//   const router = useRouter()

//   const { mutate, isPending } = useMutation({
//     mutationFn: ({ feedback }: { feedback: string }) => ApiClient.sendFeedback({ feedback }),
//     onSuccess: (res) => {
//       toast.success(res.message, {
//         description: res.description,
//       })
//       close()
//     },
//     onError: (error: any) => {
//       toast.error(error.message)
//     },
//     onSettled: () => {
//       router.refresh()
//     },
//   })

//   return { isPending, server_sendFeedback: mutate }
// }
