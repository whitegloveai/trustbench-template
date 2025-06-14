import { db } from "@/server/db/config/database"
import { PermissionType, UserType, WorkspaceType } from "@/server/db/schema-types"
import { permissions, rolePermissions, roles, workspaceMembers } from "@/server/db/schemas"
import { and, eq, inArray, sql } from "drizzle-orm"

import { RoleTypesType } from "@/types/types"

type DefaultPermissionsType = {
  name: PermissionType["name"]
  description: string
}

type DefaultRolesType = {
  name: RoleTypesType
  description: string
  permissions: PermissionType["name"][]
}

export async function getIsUserMember({
  userId,
  workspaceId,
}: {
  userId: UserType["id"]
  workspaceId: WorkspaceType["id"]
}) {
  const [isMember] = await db
    .select({
      status: workspaceMembers.status,
    })
    .from(workspaceMembers)
    .where(and(eq(workspaceMembers.userId, userId), eq(workspaceMembers.workspaceId, workspaceId)))

  return isMember.status === "active" ? true : false
}

export async function hasPermission({
  userId,
  workspaceId,
  permissionName,
}: {
  userId: UserType["id"]
  workspaceId: WorkspaceType["id"]
  permissionName: PermissionType["name"]
}): Promise<boolean> {
  // Direct SQL query to check for the specific permission
  const result = await db
    .select({ exists: sql`count(*)` })
    .from(workspaceMembers)
    .innerJoin(roles, eq(workspaceMembers.roleId, roles.id))
    .innerJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(
      and(
        eq(workspaceMembers.userId, userId),
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(permissions.name, permissionName)
      )
    )
    .limit(1)

  return result.length > 0 && Number(result[0].exists) > 0
}

// Helper for checking multiple permissions
export async function hasPermissions(
  userId: string,
  workspaceId: string,
  permissionNames: string[]
): Promise<boolean> {
  if (permissionNames.length === 0) return true

  const result = await db
    .select({ name: permissions.name })
    .from(workspaceMembers)
    .innerJoin(roles, eq(workspaceMembers.roleId, roles.id))
    .innerJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(
      and(
        eq(workspaceMembers.userId, userId),
        eq(workspaceMembers.workspaceId, workspaceId),
        inArray(permissions.name, permissionNames)
      )
    )

  const foundPermissions = new Set(result.map((r) => r.name))
  return permissionNames.every((name) => foundPermissions.has(name))
}

export const PERMISSIONS = {
  VIEW_ITEMS: "view:items",
  CREATE_ITEMS: "create:items",
  UPDATE_ITEMS: "update:items",
  DELETE_ITEMS: "delete:items",
  VIEW_MEMBERS: "view:members",
  CREATE_MEMBERS: "create:members",
  UPDATE_MEMBERS: "update:members",
  DELETE_MEMBERS: "delete:members",
  MANAGE_MEMBERS: "manage:members",
  INVITE_MEMBERS: "invite:members",
  REMOVE_MEMBERS: "remove:members",
  MANAGE_ROLES: "manage:roles",
  MANAGE_WORKSPACE: "manage:workspace",
  DELETE_WORKSPACE: "delete:workspace",
  TRANSFER_OWNERSHIP: "transfer:ownership",
} as const

const defaultPermissions: DefaultPermissionsType[] = [
  { name: PERMISSIONS.VIEW_MEMBERS, description: "Can view members" },
  { name: PERMISSIONS.CREATE_MEMBERS, description: "Can create members" },
  { name: PERMISSIONS.UPDATE_MEMBERS, description: "Can update members" },
  { name: PERMISSIONS.DELETE_MEMBERS, description: "Can delete members" },
  { name: PERMISSIONS.MANAGE_MEMBERS, description: "Can manage members" },
  { name: PERMISSIONS.INVITE_MEMBERS, description: "Can invite members" },
  { name: PERMISSIONS.REMOVE_MEMBERS, description: "Can remove members" },
  { name: PERMISSIONS.MANAGE_ROLES, description: "Can manage roles" },
  { name: PERMISSIONS.MANAGE_WORKSPACE, description: "Can manage workspace" },
  { name: PERMISSIONS.DELETE_WORKSPACE, description: "Can delete workspace" },
  { name: PERMISSIONS.TRANSFER_OWNERSHIP, description: "Can transfer workspace ownership" },
  { name: PERMISSIONS.VIEW_ITEMS, description: "Can view items" },
  { name: PERMISSIONS.CREATE_ITEMS, description: "Can create items" },
  { name: PERMISSIONS.UPDATE_ITEMS, description: "Can update items" },
  { name: PERMISSIONS.DELETE_ITEMS, description: "Can delete items" },
]

const defaultRoles: DefaultRolesType[] = [
  {
    name: "owner",
    description: "Workspace owner",
    permissions: ["*"],
  },
  {
    name: "admin",
    description: "Workspace administrator",
    permissions: ["view:members", "create:members", "update:members", "delete:members"],
  },
  {
    name: "member",
    description: "Regular member",
    permissions: ["view:members"],
  },
]

// For seed.ts to create initial data
export async function initializeRBAC() {
  try {
    // Insert permissions one by one to handle conflicts
    for (const permission of defaultPermissions) {
      await db
        .insert(permissions)
        .values({
          id: crypto.randomUUID(),
          ...permission,
        })
        .onConflictDoUpdate({
          target: permissions.name,
          set: {
            description: permission.description,
          },
        })
    }

    // Get all inserted permissions
    const insertedPermissions = await db.select().from(permissions)
    const permissionsMap = new Map(insertedPermissions.map((p) => [p.name, p.id]))

    // Insert roles one by one
    for (const role of defaultRoles) {
      const [insertedRole] = await db
        .insert(roles)
        .values({
          id: crypto.randomUUID(),
          name: role.name,
          description: role.description,
        })
        .onConflictDoUpdate({
          target: roles.name,
          set: {
            description: role.description,
          },
        })
        .returning()

      if (insertedRole) {
        // Delete existing role permissions
        await db.delete(rolePermissions).where(eq(rolePermissions.roleId, insertedRole.id))

        // If role has all permissions
        if (role.permissions.includes("*")) {
          // Insert all permissions for this role
          await db.insert(rolePermissions).values(
            insertedPermissions.map((permission) => ({
              roleId: insertedRole.id,
              permissionId: permission.id,
            }))
          )
        } else {
          // Insert specific permissions for the role
          const rolePermissionValues = role.permissions
            .map((permissionName) => {
              const permissionId = permissionsMap.get(permissionName)
              if (permissionId) {
                return {
                  roleId: insertedRole.id,
                  permissionId,
                }
              }
              return null
            })
            .filter((v): v is { roleId: string; permissionId: string } => v !== null)

          if (rolePermissionValues.length > 0) {
            await db.insert(rolePermissions).values(rolePermissionValues)
          }
        }
      }
    }

    // eslint-disable-next-line no-console
    console.log("RBAC initialization completed successfully")
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error initializing RBAC:", error)
    throw error
  }
}
