"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  ChevronRight,
  ArrowLeft,
  Loader2,
  Pencil,
  Trash2,
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
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { TaskComments } from "@/components/task-comments"
import api from "@/lib/api"
import { getInitials } from "@/lib/utils"
import { Button } from "./ui/button"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { fetchTasksDetail } from "@/lib/task"
import { useQuery } from "@tanstack/react-query"

const priorityConfig: Record<
  string,
  { label: string; className: string }
> = {
  low: {
    label: "Low",
    className: "bg-muted text-muted-foreground",
  },
  medium: {
    label: "Medium",
    className: "bg-primary/15 text-primary",
  },
  high: {
    label: "High",
    className: "bg-accent/15 text-accent",
  },
  urgent: {
    label: "Urgent",
    className: "bg-secondary/15 text-secondary",
  },
}

export function TaskDetail({
  projectId,
  taskId,
}: {
  projectId: string
  taskId: string
}) {
  const [status, setStatus] =
    useState<TaskStatus | null>(null)
  const [isUpdating, setIsUpdating] =
    useState(false)
  const [deleting, setDeleting] =
    useState(false)

  const { toast } = useToast()
  const router = useRouter()

  // ✅ FIXED QUERY KEY (VERY IMPORTANT)
  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["task", projectId, taskId], // 🔥 unique key
    queryFn: async () => {
      const result =
        await fetchTasksDetail(
          projectId,
          taskId
        )
      return result ?? null
    },
    enabled: !!projectId && !!taskId,
    refetchOnMount: "always",
  })

  // ✅ Guarantee object
  const task: Task | null =
    data && typeof data === "object"
      ? data
      : null

  // Sync status when task loads
  useEffect(() => {
    if (task?.status) {
      setStatus(task.status)
    }
  }, [task])

  const handleStatusChange = async (
    newStatus: TaskStatus
  ) => {
    if (!task) return

    try {
      setIsUpdating(true)
      setStatus(newStatus)

      await api.patch(
        `/projects/${projectId}/tasks/${taskId}`,
        { status: newStatus }
      )
    } catch (err) {
      setStatus(task.status)
      toast({
        variant: "destructive",
        title: "Failed to update status",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteTask = useCallback(
    async () => {
      try {
        setDeleting(true)

        await api.delete(
          `/projects/${projectId}/tasks/${taskId}`
        )

        toast({
          variant: "success",
          title: "Task deleted",
        })

        router.push(
          `/projects/${projectId}`
        )
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Failed to delete task",
          description:
            err?.response?.data?.message ||
            "Something went wrong.",
        })
      } finally {
        setDeleting(false)
      }
    },
    [projectId, taskId, router, toast]
  )

  // ======================
  // Loading / Error
  // ======================

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (isError || !task) {
    return (
      <div className="flex flex-col items-center py-20">
        <p className="text-lg font-medium">
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

  // ✅ Safe priority
  const priority =
    priorityConfig[task.priority] ??
    priorityConfig["low"]

  return (
    <div className="flex flex-col gap-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/">Dashboard</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/projects">Projects</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/projects/${projectId}`}>
          {task.project?.name ?? "Project"}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">
          {task.title ?? "Untitled Task"}
        </span>
      </nav>

      {/* Back */}
      <Link
        href={`/projects/${projectId}`}
        className="flex items-center gap-1.5 text-sm text-primary hover:underline w-fit"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to{" "}
        {task.project?.name ?? "Project"}
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {task.title}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {task._id}
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/projects/${projectId}/tasks/${task._id}/edit`}
          >
            <Button>
              <Pencil className="mr-1.5 h-4 w-4" />
              Edit
            </Button>
          </Link>


          <AlertDialog>
            <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            disabled={deleting}
            onClick={handleDeleteTask}
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            {deleting ? "Deleting..." : "Delete"}
          </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Delete Task?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete{" "}
                  <span className="font-medium">{task.title}</span>.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting}>
                  Cancel
                </AlertDialogCancel>

                <AlertDialogAction
                  onClick={handleDeleteTask}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

        </div>
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
              {getInitials(
                task.assignedTo?.name ?? ""
              )}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">
              {task.assignedTo?.name ??
                "Unassigned"}
            </p>
            <p className="text-xs text-muted-foreground">
                  {task.assignedTo.email}
                </p>
              </div>
            </div>
          </div>


          {/* Assigned */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Created By
            </h3>
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback>
                  {getInitials(`${task.createdBy?.name}`)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">
                  {task.createdBy?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {task.createdBy?.email}
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
