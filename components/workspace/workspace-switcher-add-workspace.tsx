"use client"

import { UserType, WorkspaceType } from "@/server/db/schema-types"

import { KEYBOARD_SHORTCUTS } from "@/lib/shortcuts"
import { useCreateWorkspaceModal } from "@/hooks/use-create-workspace-modal"
import { useKeyPress } from "@/hooks/use-key-press"
import { DropdownMenuItem, DropdownMenuShortcut } from "@/components/ui/dropdown-menu"
import { Icons } from "@/components/global/icons"

type WorkspaceSwitcherAddWorkspaceProps = {
  currentWorkspace: {
    name: WorkspaceType["name"]
    logo: WorkspaceType["logo"]
  }
  currentUser: {
    name: UserType["name"]
    image: UserType["image"]
  }
}

export function WorkspaceSwitcherAddWorkspace({
  currentWorkspace,
  currentUser,
}: WorkspaceSwitcherAddWorkspaceProps) {
  const { open } = useCreateWorkspaceModal()

  const handleOpen = () => {
    open({
      workspaceName: currentWorkspace.name,
      userName: currentUser.name,
      userImage: currentUser.image ?? undefined,
      workspaceLogo: currentWorkspace.logo ?? undefined,
    })
  }

  useKeyPress(KEYBOARD_SHORTCUTS.ADD_WORKSPACE, handleOpen, {
    metaKey: true,
  })

  return (
    <DropdownMenuItem className="cursor-pointer" onClick={handleOpen}>
      <Icons.plus className="text-muted-foreground mr-2 size-4" />
      <span>Add workspace</span>
      <DropdownMenuShortcut className="uppercase">
        ⌘ {KEYBOARD_SHORTCUTS.ADD_WORKSPACE}
      </DropdownMenuShortcut>
    </DropdownMenuItem>
  )
}
