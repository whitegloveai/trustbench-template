"use client"

import dynamic from "next/dynamic"

import { useCreateFeedbackModal } from "@/hooks/use-create-feedback-modal"
import { useCreateItemModal } from "@/hooks/use-create-item-modal"
import { useCreateWorkspaceModal } from "@/hooks/use-create-workspace-modal"
import { useEditProfileModal } from "@/hooks/use-edit-profile-modal"
import { useUpgradeModal } from "@/hooks/use-upgrade-modal"
import { CreateItemModal } from "@/components/modals/create-item-modal"
import { CreateWorkspaceModal } from "@/components/modals/create-workspace-modal"
import { EditProfileModal } from "@/components/modals/edit-profile-modal"

const UpgradeModal = dynamic(
  () =>
    import("@/components/modals/upgrade-modal").then((mod) => ({
      default: mod.UpgradeModal,
    })),
  {
    ssr: false,
    loading: () => null,
  }
)

const CreateFeedbackModal = dynamic(
  () =>
    import("@/components/modals/create-feedback-modal").then((mod) => ({
      default: mod.CreateFeedbackModal,
    })),
  { ssr: false, loading: () => null }
)

export function ModalProvider() {
  const { isOpen: isUpgradeModalOpen } = useUpgradeModal()
  const { isOpen: isCreateFeedbackModalOpen } = useCreateFeedbackModal()
  const { isOpen: isCreateItemModalOpen } = useCreateItemModal()
  const { isOpen: isEditProfileModalOpen } = useEditProfileModal()
  const { isOpen: isCreateWorkspaceModalOpen } = useCreateWorkspaceModal()

  return (
    <>
      {isUpgradeModalOpen ? <UpgradeModal /> : null}
      {isCreateFeedbackModalOpen ? <CreateFeedbackModal /> : null}
      {isCreateItemModalOpen ? <CreateItemModal /> : null}
      {isEditProfileModalOpen ? <EditProfileModal /> : null}
      {isCreateWorkspaceModalOpen ? <CreateWorkspaceModal /> : null}
    </>
  )
}
