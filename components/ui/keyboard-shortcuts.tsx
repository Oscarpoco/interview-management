"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function KeyboardShortcuts() {
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs, textareas, or contenteditable elements
      const target = e.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        (target.closest("input") || target.closest("textarea"))
      ) {
        return
      }

      // Ctrl/Cmd + K for search (opens interviews page with focus on search)
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        router.push("/interviews")
        setTimeout(() => {
          const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement
          if (searchInput) {
            searchInput.focus()
          }
        }, 100)
        toast.info("Search", {
          description: "Use the search bar to find interviews",
        })
        return
      }

      // Ctrl/Cmd + D for dashboard
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault()
        router.push("/dashboard")
        return
      }

      // Ctrl/Cmd + I for interviews
      if ((e.ctrlKey || e.metaKey) && e.key === "i") {
        e.preventDefault()
        router.push("/interviews")
        return
      }

      // Ctrl/Cmd + P for profile
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault()
        router.push("/profile")
        return
      }

      // Ctrl/Cmd + , for settings
      if ((e.ctrlKey || e.metaKey) && e.key === ",") {
        e.preventDefault()
        router.push("/settings")
        return
      }

      // Escape to close modals/dialogs
      if (e.key === "Escape") {
        // This will be handled by individual components
        return
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [router])

  return null
}

