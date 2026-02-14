"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ChevronRight,
  ArrowLeft,
  UserPlus,
  UserMinus,
  Shield,
} from "lucide-react"
import {
  getProject,
  getProjectMembers,
  getNonProjectMembers,
  roleLabels,
  type User,
} from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const roleBadgeStyle: Record<string, string> = {
  admin: "bg-secondary/15 text-secondary",
  manager: "bg-accent/15 text-accent",
  member: "bg-primary/15 text-primary",
  viewer: "bg-muted text-muted-foreground",
}

export function ProjectMembers({ projectId }: { projectId: string }) {
  const project = getProject(projectId)
  const initialMembers = getProjectMembers(projectId)
  const initialNonMembers = getNonProjectMembers(projectId)
  const [members, setMembers] = useState<User[]>(initialMembers)
  const [nonMembers, setNonMembers] = useState<User[]>(initialNonMembers)

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-medium text-foreground">Project not found</p>
        <Link href="/projects" className="mt-2 text-sm text-primary hover:underline">
          Back to projects
        </Link>
      </div>
    )
  }

  function handleAdd(user: User) {
    setMembers((prev) => [...prev, user])
    setNonMembers((prev) => prev.filter((u) => u.id !== user.id))
  }

  function handleRemove(user: User) {
    setMembers((prev) => prev.filter((u) => u.id !== user.id))
    setNonMembers((prev) => [...prev, user])
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Breadcrumb */}
      <nav
        className="flex items-center gap-1.5 text-sm text-muted-foreground"
        aria-label="Breadcrumb"
      >
        <Link href="/" className="hover:text-foreground transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/projects" className="hover:text-foreground transition-colors">
          Projects
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/projects/${projectId}`}
          className="hover:text-foreground transition-colors"
        >
          {project.name}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">Members</span>
      </nav>

      {/* Back Link */}
      <Link
        href={`/projects/${projectId}`}
        className="flex items-center gap-1.5 text-sm text-primary hover:underline w-fit"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to {project.name}
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
          Manage Members
        </h1>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          Add or remove members from {project.name}.
        </p>
      </div>

      {/* Current Members */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Current Members ({members.length})
          </h2>
        </div>
        <div className="flex flex-col gap-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                  {member.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.email}</p>
              </div>
              <Badge className={`${roleBadgeStyle[member.role]} border-0 text-[11px] font-medium`}>
                {roleLabels[member.role]}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl text-muted-foreground hover:text-secondary hover:bg-secondary/10"
                onClick={() => handleRemove(member)}
              >
                <UserMinus className="mr-1.5 h-3.5 w-3.5" />
                Remove
              </Button>
            </div>
          ))}
          {members.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12">
              <p className="text-sm text-muted-foreground">No members in this project</p>
            </div>
          )}
        </div>
      </div>

      {/* Available to Add */}
      {nonMembers.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-accent" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Available to Add ({nonMembers.length})
            </h2>
          </div>
          <div className="flex flex-col gap-2">
            {nonMembers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-4 rounded-xl border border-dashed border-border bg-card/50 p-4"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-muted text-xs font-semibold text-muted-foreground">
                    {user.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <Badge className={`${roleBadgeStyle[user.role]} border-0 text-[11px] font-medium`}>
                  {roleLabels[user.role]}
                </Badge>
                <Button
                  size="sm"
                  className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => handleAdd(user)}
                >
                  <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                  Add
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
