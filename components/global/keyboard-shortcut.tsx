import { KEYBOARD_SHORTCUT_DISPLAY, KeyboardShortcutType } from "@/lib/shortcuts"
import { cn } from "@/lib/utils"

type KeyboardShortcutProps = {
  className?: string
  shortcut: KeyboardShortcutType
}

export function KeyboardShortcut({ className, shortcut }: KeyboardShortcutProps) {
  // Use the display name if available, otherwise use the shortcut value directly
  const displayText =
    shortcut in KEYBOARD_SHORTCUT_DISPLAY
      ? KEYBOARD_SHORTCUT_DISPLAY[shortcut as keyof typeof KEYBOARD_SHORTCUT_DISPLAY]
      : shortcut

  return (
    <kbd
      className={cn(
        "border-primary-foreground/20 pointer-events-none hidden h-[1.1rem] items-center gap-x-1 rounded border border-b-2 bg-[#e5e5e5] px-1 text-[10px] opacity-100 select-none sm:flex dark:bg-[#262626]",
        className
      )}
    >
      <span className="text-foreground mt-0.5 font-mono font-medium uppercase">{displayText}</span>
    </kbd>
  )
}
