"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ChevronRight,
  ArrowLeft,
  CalendarDays,
  Clock,
  Loader2,
} from "lucide-react"
import { type Task, TaskStatus } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TaskComments } from "@/components/task-comments"
import api from "@/lib/api"
import { getInitials } from "@/lib/utils"

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
  const [task, setTask] = useState<Task>()
  const [status, setStatus] = useState<TaskStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const Priority= "High"
  useEffect(() => {
    const fetchTask = async () => {
      try {
        setIsLoading(true)
        const res = await api.get<Task>(
          `/projects/${projectId}/tasks/${taskId}`
        )

        setTask(res.data)
        setStatus(res.data.status)
      } catch (err) {
        console.error("Failed to fetch task")
      } finally {
        setIsLoading(false)
      }
    }

    if (projectId && taskId) {
      fetchTask()
    }
  }, [projectId, taskId])

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task) return

    try {
      setIsUpdating(true)
      setStatus(newStatus) // optimistic update

      await api.patch(
        `/projects/${projectId}/tasks/${taskId}`,
        { status: newStatus }
      )
    } catch (err) {
      console.error("Failed to update status")
      setStatus(task.status) // rollback
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center py-20">
        <p className="text-lg font-medium text-foreground">
          Task not found
        </p>
        <Link
          href={`/projects/${projectId}`}
          className="mt-2 text-sm text-primary hover:underline"
        >
          Back to project
        </Link>
      </div>
    )
  }

  const priority = priorityConfig["medium"]

  return (
    <div className="flex flex-col gap-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/">Dashboard</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/projects">Projects</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/projects/${projectId}`}>
          {task.project?.name}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">
          {task.title}
        </span>
      </nav>

      {/* Back */}
      <Link
        href={`/projects/${projectId}`}
        className="flex items-center gap-1.5 text-sm text-primary hover:underline w-fit"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to {task.project?.name}
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {task.title}
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          {task._id}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left */}
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Description
            </h2>
            <p className="text-sm text-foreground leading-relaxed">
              {task.description}
            </p>
          </div>

          <TaskComments task={task} projectId={projectId} />
        </div>

        {/* Right */}
        <div className="flex flex-col gap-4">
          {/* Status */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Status
            </h3>
            <Select
              value={status ?? undefined}
              onValueChange={(v) =>
                handleStatusChange(v as TaskStatus)
              }
              disabled={isUpdating}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">Todo</SelectItem>
                <SelectItem value="in-progress">
                  In Progress
                </SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assigned */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Assigned To
            </h3>
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback>
                  {getInitials(task.assignedTo.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">
                  {task.assignedTo.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {task.assignedTo.email}
                </p>
              </div>
            </div>
          </div>

          {/* Priority */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Priority
            </h3>
            <Badge className={`${priority.className} border-0 text-xs`}>
              {priority.label}
            </Badge>
          </div>

          {/* Dates */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Dates
            </h3>
            <div className="flex flex-col gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">
                  Created
                </p>
                <p>
                  {new Date(task.createdAt).toLocaleDateString(
                    "en-US",
                    { month: "long", day: "numeric", year: "numeric" }
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Due Date
                </p>
                <p>
                  {new Date(task.dueDate).toLocaleDateString(
                    "en-US",
                    { month: "long", day: "numeric", year: "numeric" }
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
