"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ChevronRight } from "lucide-react"
import {
  type Task,
  type TaskStatus,
  type Priority,
  getProject,
  getProjectMembers,
  getTask,
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

interface TaskFormProps {
  projectId: string
  taskId?: string
}

export function TaskForm({ projectId, taskId }: TaskFormProps) {
  const router = useRouter()
  const project = getProject(projectId)
  const existingTask = taskId ? getTask(taskId) : null
  const members = getProjectMembers(projectId)
  const isEditing = !!existingTask

  const [title, setTitle] = useState(existingTask?.title || "")
  const [description, setDescription] = useState(existingTask?.description || "")
  const [status, setStatus] = useState<TaskStatus>(existingTask?.status || "todo")
  const [priority, setPriority] = useState<Priority>(existingTask?.priority || "medium")
  const [assignee, setAssignee] = useState(existingTask?.assignee || "")
  const [dueDate, setDueDate] = useState(existingTask?.dueDate || "")
  const [submitted, setSubmitted] = useState(false)

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    // In a real app this would call an API. For now, navigate back.
    router.push(`/projects/${projectId}`)
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
        <span className="font-medium text-foreground">
          {isEditing ? "Edit Task" : "Create Task"}
        </span>
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
          {isEditing ? `Edit Task: ${existingTask?.id}` : "Create New Task"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          {isEditing
            ? "Update the task details below."
            : `Add a new task to ${project.name}.`}
        </p>
      </div>

      {/* Success Message */}
      {submitted && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="text-sm font-medium text-primary">
            {isEditing ? "Task updated successfully." : "Task created successfully."}
          </p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-5">
            {/* Title */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="title" className="text-sm font-medium text-foreground">
                Title <span className="text-secondary">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Enter task title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-xl"
                required
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="description" className="text-sm font-medium text-foreground">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Describe the task in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px] rounded-xl"
                rows={5}
              />
            </div>

            {/* Two-column fields */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Status */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="status" className="text-sm font-medium text-foreground">
                  Status
                </Label>
                <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                  <SelectTrigger id="status" className="rounded-xl">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="todo">Todo</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="priority" className="text-sm font-medium text-foreground">
                  Priority
                </Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                  <SelectTrigger id="priority" className="rounded-xl">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Assignee */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="assignee" className="text-sm font-medium text-foreground">
                  Assignee
                </Label>
                <Select value={assignee} onValueChange={setAssignee}>
                  <SelectTrigger id="assignee" className="rounded-xl">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Due Date */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="dueDate" className="text-sm font-medium text-foreground">
                  Due Date
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            type="submit"
            className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={!title.trim()}
          >
            {isEditing ? "Save Changes" : "Create Task"}
          </Button>
          <Link href={`/projects/${projectId}`}>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
            >
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
