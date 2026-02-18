"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import api from "@/lib/api"
import {
  UserPlus,
  UserMinus,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"


interface ProjectRef {
  _id: string
  name: string
}

interface User {
  _id: string
  name: string
  email: string
  role: string
  projects: ProjectRef[]
}

export function ProjectMembers({ projectId }: { projectId: string }) {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  const { toast } = useToast();

  /* ---------------- Fetch Users ---------------- */

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get<User[]>("/users")
        setUsers(res.data)
      } catch (err) {
               toast({
          variant: "destructive",
          title: "Action failed",
          description: "failed to fetch users",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  /* ---------------- Split Members ---------------- */

  const { members, nonMembers } = useMemo(() => {
    const members: User[] = []
    const nonMembers: User[] = []

    users.forEach((user) => {
      const isMember = user.projects?.some(
        (p) => p._id === projectId
      )

      if (isMember) members.push(user)
      else nonMembers.push(user)
    })

    return { members, nonMembers }
  }, [users, projectId])

  /* ---------------- Add / Remove ---------------- */
const handleToggleMember = useCallback(
  async (user: User, isMember: boolean) => {
    try {
      setUpdatingUserId(user._id)

      if (isMember) {
        await api.post(
          `/projects/${projectId}/members/remove`,
          { userId: user._id }
        )
        toast({
          variant: 'success',
          title: "Member removed",
          description: `${user.name} was removed from the project.`,
        })
      } else {
        await api.post(
          `/projects/${projectId}/members/add`,
          { userId: user._id }
        )

        toast({
          variant: 'success',
          title: "Member added",
          description: `${user.name} was added to the project.`,
        })
      }

      // Optimistic UI update
      setUsers((prev) =>
        prev.map((u) => {
          if (u._id !== user._id) return u

          return {
            ...u,
            projects: isMember
              ? u.projects.filter((p) => p._id !== projectId)
              : [
                  ...u.projects,
                  { _id: projectId, name: "Current Project" },
                ],
          }
        })
      )
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        "Something went wrong. Please try again."

      toast({
        variant: "destructive",
        title: "Action failed",
        description: message,
      })
    } finally {
      setUpdatingUserId(null)
    }
  },
  [projectId, toast]
)


  /* ---------------- Loading ---------------- */

  if (isLoading) {
    return <div className="p-6">Loading users...</div>
  }

  return (
    <div className="flex flex-col gap-8">
    {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/">Dashboard</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/projects">Projects</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">{projectId}</span>
      </nav>
      {/* Current Members */}
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase">
          Current Members ({members.length})
        </h2>

        {members.map((member) => (
          <div
            key={member._id}
            className="flex items-center justify-between rounded-xl border p-4"
          >
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarFallback>
                  {member.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div>
                <p className="font-medium">{member.name}</p>
                <p className="text-sm text-muted-foreground">
                  {member.email}
                </p>
              </div>

              <Badge>{member.role}</Badge>
            </div>

            <Button
              variant="destructive"
              size="sm"
              disabled={updatingUserId === member._id}
              onClick={() => handleToggleMember(member, true)}
            >
              {updatingUserId === member._id
                ? "Removing..."
                : (
                  <>
                    <UserMinus className="mr-1 h-4 w-4" />
                    Remove
                  </>
                )}
            </Button>
          </div>
        ))}
      </div>

      {/* Available Users */}
      {nonMembers.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase">
            Available Users ({nonMembers.length})
          </h2>

          {nonMembers.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between rounded-xl border border-dashed p-4"
            >
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback>
                    {user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {user.email}
                  </p>
                </div>

                <Badge>{user.role}</Badge>
              </div>

              <Button
                size="sm"
                disabled={updatingUserId === user._id}
                onClick={() => handleToggleMember(user, false)}
              >
                {updatingUserId === user._id
                  ? "Adding..."
                  : (
                    <>
                      <UserPlus className="mr-1 h-4 w-4" />
                      Add
                    </>
                  )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
