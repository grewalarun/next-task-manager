"use client"

import { useEffect, useState, useCallback } from "react"
import { Shield, Users } from "lucide-react"
import api from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type MemberRole = "admin" | "manager" | "member" | "viewer"

interface User {
  _id: string
  name: string
  email: string
  role: MemberRole
}

const roleLabels: Record<MemberRole, string> = {
  admin: "Admin",
  manager: "Manager",
  member: "Member",
  viewer: "Viewer",
}

const roleDescriptions: Record<MemberRole, string> = {
  admin: "Full access to manage workspace and members. Create Project and Tasks",
  manager: "Can manage projects and tasks.",
  member: "Can create task and work on assigned tasks.",
  viewer: "Can only view content.",
}

const roleBadgeStyle: Record<MemberRole, string> = {
  admin: "bg-secondary/15 text-secondary",
  manager: "bg-accent/15 text-accent",
  member: "bg-primary/15 text-primary",
  viewer: "bg-muted text-muted-foreground",
}

const allRoles: MemberRole[] = ["admin","member"]

export function MembersManagement() {
  const [members, setMembers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  const { toast } = useToast()

  /* ---------------- Fetch Users ---------------- */

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get<User[]>("/users")
        setMembers(res.data)
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Failed to fetch users",
          description:
            err?.response?.data?.message ||
            "Something went wrong while loading members.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [toast])

  /* ---------------- Change Role ---------------- */
const handleRoleChange = useCallback(
  async (userId: string, newRole: MemberRole) => {
    const previousMembers = members

    try {
      setUpdatingUserId(userId)

      // Optimistic update
      setMembers((prev) =>
        prev.map((m) =>
          m._id === userId ? { ...m, role: newRole } : m
        )
      )

      await api.patch(`users/${userId}/role`, {
        role: newRole,
        userId
      })

      const member = previousMembers.find((m) => m._id === userId)

      toast({
        variant: "success",
        title: "Role updated",
        description: `${member?.name}'s role changed to ${roleLabels[newRole]}.`,
      })
    } catch (err: any) {
      // Rollback on error
      setMembers(previousMembers)

      toast({
        variant: "destructive",
        title: "Failed to update role",
        description:
          err?.response?.data?.message ||
          "Something went wrong while updating role.",
      })
    } finally {
      setUpdatingUserId(null)
    }
  },
  [members, toast]
)

  /* ---------------- Loading State ---------------- */

  if (loading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Loading members...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Manage Members
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View all workspace members and manage their roles.
        </p>
      </div>

      {/* Role Legend */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4 text-accent" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Role Permissions
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {allRoles.map((role) => (
            <div
              key={role}
              className="flex flex-col gap-1.5 rounded-xl bg-muted/50 p-4"
            >
              <Badge
                className={`${roleBadgeStyle[role]} border-0 text-[11px] font-medium w-fit`}
              >
                {roleLabels[role]}
              </Badge>
              <p className="text-xs text-muted-foreground">
                {roleDescriptions[role]}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Members List */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            All Members ({members.length})
          </h2>
        </div>

        <div className="flex flex-col gap-2">
          {members.map((member) => (
            <div
              key={member._id}
              className="grid grid-cols-1 gap-4 rounded-xl border bg-card p-4 shadow-sm md:grid-cols-[1fr_200px_200px]"
            >
              {/* Member Info */}
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {member.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {member.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {member.email}
                  </p>
                </div>
              </div>

              {/* Current Role */}
              <Badge
                className={`${roleBadgeStyle[member.role]} border-0 text-[11px] font-medium w-fit`}
              >
                {roleLabels[member.role]}
              </Badge>

              {/* Role Select */}
              <Select
                value={member.role}
                onValueChange={(v) =>
                  handleRoleChange(member._id, v as MemberRole)
                }
                disabled={updatingUserId === member._id}
              >
                <SelectTrigger className="h-9 rounded-xl text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {roleLabels[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
