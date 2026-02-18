"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ChevronRight } from "lucide-react"
import {
  type Task,
  type TaskStatus,
  type Priority,
  getProject,
  getProjectMembers,
  Project,
} from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import api from "@/lib/api"
import { getProjectById } from "@/lib/project.service"
import { useToast } from "@/hooks/use-toast"

interface TaskFormProps {
  projectId: string
  taskId?: string
}

interface TaskFormState {
  title: string
  description: string
  status: TaskStatus
  priority: Priority
  assignedTo: string
  dueDate: string
}

export function TaskForm({ projectId, taskId }: TaskFormProps) {
  const router = useRouter()
  const [project, setProject] = useState<Project | null>()
  const isEditing = Boolean(taskId)
  const [isLoading, setIsLoading] = useState(isEditing)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast();

  const [form, setForm] = useState<TaskFormState>({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    assignedTo: "",
    dueDate: "",
  })

  /* ---------------------- */
  /* Handle input changes   */
  /* ---------------------- */
  const updateField = useCallback(
    <K extends keyof TaskFormState>(key: K, value: TaskFormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  /* ---------------------- */
  /* Get Project by ProjectID  */
  /* ---------------------- */

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await getProjectById(projectId)
        setProject(data)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProject()
  }, [projectId])


  /* ---------------------- */
  /* Fetch task if editing  */
  /* ---------------------- */
  useEffect(() => {
    if (!taskId) return

    const controller = new AbortController()

    const fetchTask = async () => {
      try {
        setIsLoading(true)

        const res = await api.get<Task>(
          `/projects/${projectId}/tasks/${taskId}`,
          { signal: controller.signal }
        )

        const task = res.data

        setForm({
          title: task.title || "",
          description: task.description || "",
          status: task.status || "todo",
          priority: task.priority || "medium",
          assignedTo: task.assignedTo?._id || "",
          dueDate: task.dueDate
            ? new Date(task.dueDate).toISOString().split("T")[0]
            : "",
        })
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Failed to fetch task")
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchTask()
    return () => controller.abort()
  }, [projectId, taskId])

  /* ---------------------- */
  /* Submit Handler         */
  /* ---------------------- */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!form.title.trim()) return

      try {
        setIsSubmitting(true)

        const payload = {
          ...form,
          project: project?._id,
          createdBy: project?.members[0]._id

        }

        if (isEditing) {
          await api.patch(
            `/projects/${projectId}/tasks/${taskId}`,
            payload
          )
        } else {
          await api.post(
            `/projects/${projectId}/tasks`,
            payload
          )
        }
        toast({
          variant: "success",
          title: "Action Success",
          description: "Project updated successfully",
        })
        router.push(`/projects/${projectId}`)
        router.refresh()
      } catch (err) {
               toast({
          variant: "destructive",
          title: "Action failed",
          description: "Failed to submit task",
        })
      
      } finally {
        setIsSubmitting(false)
      }
    },
    [form, isEditing, projectId, taskId, router]
  )

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-medium text-foreground">
          Project not found
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/">Dashboard</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/projects">Projects</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/projects/${projectId}`}>{project.name}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">
          {isEditing ? "Edit Task" : "Create Task"}
        </span>
      </nav>

      {/* Back */}
      <Link
        href={`/projects/${projectId}`}
        className="flex items-center gap-1.5 text-sm text-primary hover:underline w-fit"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to {project.name}
      </Link>

      {/* Loading */}
      {isLoading ? (
        <div className="rounded-xl border p-6 animate-pulse">
          Loading task...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col gap-5">

            {/* Title */}
            <div className="flex flex-col gap-2">
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <Label>Description</Label>
              <Textarea
                rows={5}
                value={form.description}
                onChange={(e) =>
                  updateField("description", e.target.value)
                }
              />
            </div>

            {/* Grid Fields */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              {/* Status */}
              <div className="flex flex-col gap-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    updateField("status", v as TaskStatus)
                  }
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

              {/* Priority */}
              <div className="flex flex-col gap-2">
                <Label>Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) =>
                    updateField("priority", v as Priority)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Assignee */}
              <div className="flex flex-col gap-2">
                <Label>Assignee</Label>
                <Select
                  value={form.assignedTo}
                  onValueChange={(v) =>
                    updateField("assignedTo", v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {project.members.map((m) => (
                      <SelectItem key={m._id} value={m._id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Due Date */}
              <div className="flex flex-col gap-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    updateField("dueDate", e.target.value)
                  }
                />
              </div>

            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={!form.title.trim() || isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Create Task"}
            </Button>

            <Link href={`/projects/${projectId}`}>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}
