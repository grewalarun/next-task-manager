"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ChevronRight, Loader2, Sparkles, PenLine } from "lucide-react"
import {
  type Task,
  type TaskStatus,
  type Priority,
  type Project,
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
import { useToast } from "@/hooks/use-toast"
import { fetchTasksDetail } from "@/lib/task"
import { useQuery } from "@tanstack/react-query"
import { fetchProjectDetail } from "@/lib/projects"
import axios from "axios"

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

// ─── Description mode type ───────────────────────────────────────────────────
type DescriptionMode = "manual" | "ai"

export function TaskForm({ projectId, taskId }: TaskFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const isEditing = Boolean(taskId)

  const [isSubmitting, setIsSubmitting] = useState(false)

  // ─── NEW: description mode & AI prompt state ────────────────────────────
  const [descriptionMode, setDescriptionMode] = useState<DescriptionMode>("manual")
  const [aiPrompt, setAiPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const [form, setForm] = useState<TaskFormState>({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    assignedTo: "",
    dueDate: "",
  })

  /* =========================
     FETCH PROJECT
  ========================== */

  const {
    data: project,
    isLoading: isProjectLoading,
  } = useQuery<Project>({
    queryKey: ["project", projectId],
    queryFn: () => fetchProjectDetail(projectId),
    enabled: !!projectId,
  })

  /* =========================
     FETCH TASK (EDIT MODE)
  ========================== */

  const {
    data: task,
    isLoading: isTaskLoading,
  } = useQuery<Task>({
    queryKey: ["task", projectId, taskId],
    queryFn: () => fetchTasksDetail(projectId, taskId!),
    enabled: !!projectId && !!taskId,
  })

  /* =========================
     SET FORM WHEN TASK LOADS
  ========================== */

  useEffect(() => {
    if (isEditing && task) {
      setForm({
        title: task.title ?? "",
        description: task.description ?? "",
        status: task.status ?? "todo",
        priority: task.priority ?? "medium",
        assignedTo: task.assignedTo?._id ?? "",
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().split("T")[0]
          : "",
      })
    }
  }, [isEditing, task])

  /* =========================
     HANDLE FIELD UPDATE
  ========================== */

  const updateField = useCallback(
    <K extends keyof TaskFormState>(
      key: K,
      value: TaskFormState[K]
    ) => {
      setForm((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  /* =========================
     NEW: GENERATE AI DESCRIPTION
  ========================== */

  const handleGenerateDescription = async () => {
    if (!aiPrompt.trim()) return

    try {
      setIsGenerating(true)

      // The endpoint should accept { prompt } and return { description }.
      const response = await axios.post<{ description: string }>(
        "/api/generate",
        {
          prompt: aiPrompt,
          // Pass extra context so the AI can write a more relevant description
          taskTitle: form.title,
          projectName: project?.name,
        }
      )

      const generated = response.data?.description

      if (!generated) throw new Error("No description returned")

      // ── Fill the description field ───────────────────────────────────────
      updateField("description", generated)

      // ── Switch to manual mode so the user can review / edit the result ──
      setDescriptionMode("manual")

      toast({
        variant:"success",
        title: "Description generated",
        description: "AI description has been filled in. Feel free to edit it.",
      })
    } catch {
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: "Could not generate description. Please try again.",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  /* =========================
     HANDLE SUBMIT
  ========================== */

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    if (!form.title.trim()) return

    try {
      setIsSubmitting(true)

      const payload = {
        ...form,
        project: project?._id,
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
        title: "Success",
        description: isEditing
          ? "Task updated successfully"
          : "Task created successfully",
      })

      router.push(`/projects/${projectId}`)
      router.refresh()
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit task",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  /* =========================
     LOADING STATE
  ========================== */

  if (isProjectLoading || (isEditing && isTaskLoading)) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-medium text-foreground">
          Project not found
        </p>
      </div>
    )
  }

  /* =========================
     UI
  ========================== */

  return (
    <div className="flex flex-col gap-8">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/projects">Projects</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/projects/${projectId}`}>
          {project.name}
        </Link>
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
        Back to {project?.name}
      </Link>

      {/* Loading */}
      {isTaskLoading ? (
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
                onChange={(e) =>
                  updateField("title", e.target.value)
                }
                required
              />
            </div>

            {/* ── Description section ────────────────────────────────────── */}
            <div className="flex flex-col gap-3">

              {/* Mode toggle label row */}
              <div className="flex items-center justify-between">
                <Label>Description</Label>

                {/* Toggle buttons */}
                <div className="flex items-center rounded-lg border overflow-hidden text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setDescriptionMode("manual")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${
                      descriptionMode === "manual"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <PenLine className="h-3.5 w-3.5" />
                    Write manually
                  </button>
                  <button
                    type="button"
                    onClick={() => setDescriptionMode("ai")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${
                      descriptionMode === "ai"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Generate with AI
                  </button>
                </div>
              </div>

              {/* Manual mode: plain textarea */}
              {descriptionMode === "manual" && (
                <Textarea
                  rows={5}
                  placeholder="Enter task description..."
                  value={form.description}
                  onChange={(e) =>
                    updateField("description", e.target.value)
                  }
                />
              )}

              {/* AI mode: prompt input + generate button + preview */}
              {descriptionMode === "ai" && (
                <div className="flex flex-col gap-3 rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4">

                  {/* Prompt label + input */}
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Describe what this task is about in a few words
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder='e.g. "Fix login bug on Safari mobile"'
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleGenerateDescription()
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={handleGenerateDescription}
                        disabled={!aiPrompt.trim() || isGenerating}
                        className="shrink-0"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                            Generating…
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-1.5" />
                            Generate
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Preview of already-generated description (if any) */}
                  {form.description && (
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Generated description preview
                      </Label>
                      <div className="rounded-md border bg-background px-3 py-2 text-sm text-foreground whitespace-pre-wrap">
                        {form.description}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Switch to <strong>Write manually</strong> to edit the generated text.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* ── End description section ────────────────────────────────── */}

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
                  key={`priority-${form.priority}`}
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
                  </SelectContent>
                </Select>
              </div>

              {/* Assignee */}
              <div className="flex flex-col gap-2">
                <Label>Assignee</Label>
                <Select
                  key={`assignee-${form.assignedTo}`}
                  value={form.assignedTo}
                  onValueChange={(v) =>
                    updateField("assignedTo", v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {project?.members?.map((m) => (
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