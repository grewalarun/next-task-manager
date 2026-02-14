"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ChevronRight,
  ArrowLeft,
  CalendarDays,
  Clock,
  Send,
} from "lucide-react"
import { getTask, getProject, getUser } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { TaskComments } from "@/components/task-comments"

const statusConfig: Record<string, { label: string; className: string }> = {
  todo: { label: "Todo", className: "bg-muted text-muted-foreground" },
  "in-progress": { label: "In Progress", className: "bg-accent/15 text-accent" },
  done: { label: "Done", className: "bg-primary/15 text-primary" },
}

const priorityConfig: Record<string, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-muted text-muted-foreground" },
  medium: { label: "Medium", className: "bg-primary/15 text-primary" },
  high: { label: "High", className: "bg-accent/15 text-accent" },
  urgent: { label: "Urgent", className: "bg-secondary/15 text-secondary" },
}

export function TaskDetail({
  projectId,
  taskId,
}: {
  projectId: string
  taskId: string
}) {
  const task = getTask(taskId)
  const project = getProject(projectId)
  const assignee = task ? getUser(task.assignee) : null
  const [status, setStatus] = useState(task?.status || "todo")

  if (!task || !project) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-medium text-foreground">Task not found</p>
        <Link
          href={`/projects/${projectId}`}
          className="mt-2 text-sm text-primary hover:underline"
        >
          Back to project
        </Link>
      </div>
    )
  }

  const priority = priorityConfig[task.priority]

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
        <span className="font-medium text-foreground">{task.id}</span>
      </nav>

      {/* Back Link */}
      <Link
        href={`/projects/${projectId}`}
        className="flex items-center gap-1.5 text-sm text-primary hover:underline w-fit"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to {project.name}
      </Link>

      {/* Task Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
          {task.title}
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">{task.id}</p>
      </div>

      {/* Task Meta Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left Column - Description and Comments */}
        <div className="flex flex-col gap-6">
          {/* Description */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Description
            </h2>
            <p className="text-sm text-foreground leading-relaxed">
              {task.description}
            </p>
          </div>

          {/* Comments Section */}
          <TaskComments task={task} />
        </div>

        {/* Right Column - Details Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Status */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Status
            </h3>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="rounded-xl focus:ring-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="todo">Todo</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assigned To */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Assigned To
            </h3>
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                  {assignee?.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {assignee?.name}
                </p>
                <p className="text-xs text-muted-foreground">{assignee?.email}</p>
              </div>
            </div>
          </div>

          {/* Priority */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Priority
            </h3>
            <Badge className={`${priority.className} border-0 text-xs font-medium`}>
              {priority.label}
            </Badge>
          </div>

          {/* Dates */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Dates
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(task.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Due Date</p>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(task.dueDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
