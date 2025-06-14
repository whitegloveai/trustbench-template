"use client"

import { useCallback, useEffect, useRef } from "react"

type KeyModifiers = {
  metaKey?: boolean
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
}

type UseKeyPressOptions = KeyModifiers & {
  enabled?: boolean
  preventDefault?: boolean
  stopPropagation?: boolean
}

/**
 * A hook for handling keyboard shortcuts
 *
 * @param keyOrKeys - Single key or array of keys to listen for
 * @param callback - Function to call when key is pressed
 * @param options - Additional options
 */
export function useKeyPress(
  keyOrKeys: string | string[],
  callback: () => void,
  options: UseKeyPressOptions = {}
) {
  // Store callback in ref to avoid dependency changes causing effect to re-run
  const callbackRef = useRef(callback)

  // Update ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // Create stable event handler with useCallback
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const {
        metaKey: requireMetaKey = false,
        ctrlKey: requireCtrlKey = false,
        altKey: requireAltKey = false,
        shiftKey: requireShiftKey = false,
        enabled = true,
        preventDefault = true,
        stopPropagation = false,
      } = options

      // Skip if disabled
      if (!enabled) return

      // Skip for form elements and contentEditable elements
      if (
        e.target instanceof HTMLElement &&
        (e.target.isContentEditable ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement)
      ) {
        return
      }

      // Get keys to check (support both single key and key combinations)
      const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys]

      // Check if pressed key matches any target key
      const keyMatches = keys.some((k) => e.key.toLowerCase() === k.toLowerCase())

      if (!keyMatches) return

      // Check if required modifier keys are pressed
      const modifiersMatch =
        (!requireMetaKey || e.metaKey) &&
        (!requireCtrlKey || e.ctrlKey) &&
        (!requireAltKey || e.altKey) &&
        (!requireShiftKey || e.shiftKey)

      if (!modifiersMatch) return

      // Prevent default behavior if configured
      if (preventDefault) e.preventDefault()
      if (stopPropagation) e.stopPropagation()

      // Call the callback
      callbackRef.current()
    },
    [keyOrKeys, options]
  )

  // Add and remove event listener
  useEffect(() => {
    const { enabled = true } = options

    // Only add listener if enabled
    if (!enabled) return

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown, options])
}
