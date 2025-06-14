import { parseAsBoolean, useQueryState } from "nuqs"

export const useUpgradeModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "upgrade",
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
