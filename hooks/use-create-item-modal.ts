import { parseAsBoolean, useQueryState } from "nuqs"

export const useCreateItemModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "create-item",
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
