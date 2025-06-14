export const KEYBOARD_SHORTCUTS = {
  ADD_WORKSPACE: "a",
  TOGGLE_SIDEBAR: "b",

  CREATE_ITEM: "t",
  DUPLICATE_ITEM: "D",

  DELETE_INVITATION: "D",

  ESCAPE: "Escape",
  COMMAND_KEY: "⌘",
  CONTROL_KEY: "ctrl",
} as const

// Display names for keyboard shortcuts in the UI
export const KEYBOARD_SHORTCUT_DISPLAY = {
  [KEYBOARD_SHORTCUTS.ESCAPE]: "ESC",
  [KEYBOARD_SHORTCUTS.COMMAND_KEY]: "⌘",
  [KEYBOARD_SHORTCUTS.CONTROL_KEY]: "ctrl",
} as const

export type KeyboardShortcutType = (typeof KEYBOARD_SHORTCUTS)[keyof typeof KEYBOARD_SHORTCUTS]
