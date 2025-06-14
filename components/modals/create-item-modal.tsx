"use client"

import { useCreateItemModal } from "@/hooks/use-create-item-modal"
import { CreateItemForm } from "@/components/forms/create-item-form"
import { ResponsiveModal } from "@/components/global/responsive-modal"

export function CreateItemModal() {
  const { isOpen, close } = useCreateItemModal()

  return (
    <ResponsiveModal
      onOpenChange={close}
      isOpen={isOpen}
      modalClassName="min-h-96 w-full overflow-hidden md:max-w-xl"
      headerTitle="Create new item"
      headerDescription="Create a new item to get started"
    >
      <CreateItemForm className="bg-os-background-100" />
    </ResponsiveModal>
  )
}
