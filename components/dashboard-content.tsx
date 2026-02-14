"use client"

import Link from "next/link"
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  ListTodo,
  ArrowRight,
  Users,
} from "lucide-react"
import { projects, tasks, users, getUser, getProjectTasks } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

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

export function DashboardContent() {
  const totalTasks = tasks.length
  const doneTasks = tasks.filter((t) => t.status === "done").length
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress").length
  const todoTasks = tasks.filter((t) => t.status === "todo").length

  const recentTasks = [...tasks]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5)

  const stats = [
    { label: "Total Tasks", value: totalTasks, icon: ListTodo, color: "text-foreground" },
    { label: "In Progress", value: inProgressTasks, icon: Clock, color: "text-accent" },
    { label: "Completed", value: doneTasks, icon: CheckCircle2, color: "text-primary" },
    { label: "Team Members", value: users.length, icon: Users, color: "text-secondary" },
  ]

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back, Alex. Here is what is happening across your projects.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Projects Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Projects</h2>
          <Link
            href="/projects"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const projectTasks = getProjectTasks(project.id)
            const completedCount = projectTasks.filter((t) => t.status === "done").length

            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                    <FolderKanban className="h-5 w-5 text-accent" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {project.members.slice(0, 3).map((memberId) => {
                      const member = getUser(memberId)
                      return (
                        <Avatar key={memberId} className="h-7 w-7 border-2 border-card">
                          <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                            {member?.initials}
                          </AvatarFallback>
                        </Avatar>
                      )
                    })}
                    {project.members.length > 3 && (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-medium text-muted-foreground">
                        +{project.members.length - 3}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {completedCount}/{projectTasks.length} done
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Recent Tasks */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Tasks</h2>
        <div className="flex flex-col gap-3">
          {recentTasks.map((task) => {
            const assignee = getUser(task.assignee)
            return (
              <Link
                key={task.id}
                href={`/projects/${task.projectId}/tasks/${task.id}`}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{task.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{task.id}</span>
                </div>
                <div className="hidden items-center gap-3 sm:flex">
                  <Badge className={`${statusColors[task.status]} border-0 text-[11px]`}>
                    {statusLabels[task.status]}
                  </Badge>
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                      {assignee?.initials}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
