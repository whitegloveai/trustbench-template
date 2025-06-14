import { parseAsBoolean, useQueryState } from "nuqs"

export const useCreateFeedbackModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "create-feedback",
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
  )

  const open = () => {
    setIsOpen(true)
  }
  const close = () => {
    setIsOpen(false)
  }
  return {
    open,
    close,
    isOpen,
    setIsOpen,
  }
}
