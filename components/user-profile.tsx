"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2, CalendarDays, Mail, ShieldCheck, CheckCircle2, Clock, ListTodo } from "lucide-react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import { useAuth } from "@/components/auth-context"
import { getInitials } from "@/lib/utils"

// ─── types ────────────────────────────────────────────────────────────────────

interface AllocatedTask {
  _id: string
  title: string
  project: string
  status: "todo" | "in-progress" | "done"
  createdAt: string
}

interface UserProfileData {
  name: string
  email: string
  memberSince: string
  allocatedTasks: AllocatedTask[]
}

// ─── constants ────────────────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  todo: "bg-muted text-muted-foreground",
  "in-progress": "bg-accent/15 text-accent",
  done: "bg-primary/15 text-primary",
}

const statusLabels: Record<string, string> = {
  todo: "Todo",
  "in-progress": "In Progress",
  done: "Done",
}

// ─── fetcher ──────────────────────────────────────────────────────────────────

const fetchUserById = async (id: string): Promise<UserProfileData> => {
  const { data } = await api.get(`/users/${id}`)
  return data
}

// ─── component ────────────────────────────────────────────────────────────────

interface ProfileContentProps {
  id: string
}

export default function ProfileContent({ id }: ProfileContentProps) {
  const { user: authUser } = useAuth()

  const { data: profile, isLoading, isError } = useQuery<UserProfileData>({
    queryKey: ["user-profile", id],
    queryFn: () => fetchUserById(id),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className="flex justify-center py-20">
        <p className="text-sm text-muted-foreground">Failed to load profile.</p>
      </div>
    )
  }

  const memberSince = new Date(profile.memberSince).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  const tasks = profile.allocatedTasks
  const taskStats = {
    total: tasks.length,
    done: tasks.filter((t) => t.status === "done").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    todo: tasks.filter((t) => t.status === "todo").length,
  }

  const isOwnProfile = authUser?.email === profile.email

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {isOwnProfile ? "My Profile" : profile.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isOwnProfile
            ? "Your personal information and assigned tasks."
            : `Viewing ${profile.name}'s profile and assigned tasks.`}
        </p>
      </div>

      {/* Profile Card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          {/* Avatar */}
          <Avatar className="h-24 w-24 border-4 border-border shrink-0">
            <AvatarFallback className="bg-primary/10 text-3xl font-bold text-primary">
              {getInitials(profile.name)}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex flex-1 flex-col gap-3 text-center sm:text-left">
            <div>
              <h2 className="text-xl font-bold text-foreground">{profile.name}</h2>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <div className="flex items-center justify-center gap-1.5 sm:justify-start">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/10">
                  <Mail className="h-3.5 w-3.5 text-accent" />
                </div>
                <span className="text-sm text-muted-foreground">{profile.email}</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 sm:justify-start">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
                  <CalendarDays className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Member since {memberSince}</span>
              </div>
            </div>
          </div>

          {/* Task Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 w-full sm:w-auto shrink-0">
            {[
              { label: "Total", value: taskStats.total, color: "text-foreground", bg: "bg-muted", icon: ListTodo },
              { label: "Todo", value: taskStats.todo, color: "text-muted-foreground", bg: "bg-muted", icon: ListTodo },
              { label: "In Progress", value: taskStats.inProgress, color: "text-accent", bg: "bg-accent/10", icon: Clock },
              { label: "Done", value: taskStats.done, color: "text-primary", bg: "bg-primary/10", icon: CheckCircle2 },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`flex flex-col items-center justify-center rounded-xl ${stat.bg} px-4 py-3 gap-1`}
              >
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className={`text-xl font-bold ${stat.color}`}>{stat.value}</span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assigned Tasks */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Assigned Tasks</h2>

        {tasks.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
            No tasks assigned yet.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {tasks.map((task) => (
              <div
                key={task._id}
                className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                {/* Left: title + date */}
                <div className="min-w-0 flex-1">
                  <Link
  key={task._id}
  href={`/projects/${task.project}/tasks/${task._id}`}  // 👈 task.project instead of task.projectId
  className="font-medium text-foreground"
>
                  {task.title}</Link>
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarDays className="h-3 w-3" />
                    {new Date(task.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>

                {/* Right: status badge */}
                <div className="shrink-0">
                  <Badge className={`${statusColors[task.status]} border-0 text-[11px]`}>
                    {statusLabels[task.status]}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}