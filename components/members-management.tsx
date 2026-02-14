"use client"

import { useState } from "react"
import { Shield, Users } from "lucide-react"
import {
  getAllMembers,
  roleLabels,
  roleDescriptions,
  type User,
  type MemberRole,
} from "@/lib/data"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const roleBadgeStyle: Record<string, string> = {
  admin: "bg-secondary/15 text-secondary",
  manager: "bg-accent/15 text-accent",
  member: "bg-primary/15 text-primary",
  viewer: "bg-muted text-muted-foreground",
}

const allRoles: MemberRole[] = ["admin", "manager", "member", "viewer"]

export function MembersManagement() {
  const initialMembers = getAllMembers()
  const [members, setMembers] = useState<User[]>(initialMembers)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  function handleRoleChange(userId: string, newRole: MemberRole) {
    setMembers((prev) =>
      prev.map((m) => (m.id === userId ? { ...m, role: newRole } : m))
    )
    const member = members.find((m) => m.id === userId)
    if (member) {
      setSuccessMessage(
        `${member.name}'s role has been changed to ${roleLabels[newRole]}.`
      )
      setTimeout(() => setSuccessMessage(null), 3000)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
          Manage Members
        </h1>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          View all workspace members and manage their roles. Only admins can change roles.
        </p>
      </div>

      {/* Success toast */}
      {successMessage && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="text-sm font-medium text-primary">{successMessage}</p>
        </div>
      )}

      {/* Role legend */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4 text-accent" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Role Permissions
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {allRoles.map((role) => (
            <div key={role} className="flex flex-col gap-1.5 rounded-xl bg-muted/50 p-4">
              <Badge
                className={`${roleBadgeStyle[role]} border-0 text-[11px] font-medium w-fit`}
              >
                {roleLabels[role]}
              </Badge>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {roleDescriptions[role]}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Members list */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            All Members ({members.length})
          </h2>
        </div>

        {/* Table Header */}
        <div className="hidden rounded-xl bg-muted/60 px-5 py-3 md:grid md:grid-cols-[1fr_200px_200px]">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Member
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Current Role
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Change Role
          </span>
        </div>

        {/* Member Rows */}
        <div className="flex flex-col gap-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="grid grid-cols-1 items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm md:grid-cols-[1fr_200px_200px] md:px-5"
            >
              {/* Member Info */}
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                </div>
              </div>

              {/* Current Role Badge */}
              <div>
                <Badge
                  className={`${roleBadgeStyle[member.role]} border-0 text-[11px] font-medium`}
                >
                  {roleLabels[member.role]}
                </Badge>
              </div>

              {/* Role Selector */}
              <div>
                <Select
                  value={member.role}
                  onValueChange={(v) =>
                    handleRoleChange(member.id, v as MemberRole)
                  }
                >
                  <SelectTrigger className="h-9 rounded-xl text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {allRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {roleLabels[role]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
