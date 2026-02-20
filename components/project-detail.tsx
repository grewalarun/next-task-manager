"use client"

import {
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react"
import Link from "next/link"
import {
  ListTodo,
  Users,
  CalendarDays,
  Plus,
  UserPlus,
  Loader2,
  Trash,
  Pencil,
} from "lucide-react"

import { Project, Task } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
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
import { TaskRow } from "@/components/task-row"
import api from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useAuth, usePermission } from "./auth-context"


type Status = "idle" | "loading" | "success" | "error"



export function ProjectDetail({ projectId }: { projectId: string }) {


  const [status, setStatus] = useState<Status>("idle")
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [statusFilter, setStatusFilter] = useState("all")
  const [isDeletingProject, setIsDeletingProject] = useState(false)

  const { toast } = useToast()
  const router = useRouter()
  const { isLoading: isAuthLoading } = useAuth()
  const manageProject = usePermission(["project.edit", "project.delete"])

  // ==============================
  // DATA FETCH
  // ==============================

  useEffect(() => {
    if (!projectId) return

    const controller = new AbortController()

    const fetchData = async () => {
      try {
        setStatus("loading")

        const [projectRes, tasksRes] = await Promise.all([
          api.get<Project>(`/projects/${projectId}`, {
            signal: controller.signal,
          }),
          api.get<Task[]>(`/projects/${projectId}/tasks`, {
            signal: controller.signal,
          }),
        ])

        setProject(projectRes.data)
        setTasks(tasksRes.data)
        setStatus("success")
      } catch (err: any) {
        if (err.name === "CanceledError") return

        if (err.response?.status === 404) {
          setStatus("error")   // Not found
        } else {
          setStatus("error")   // Server error
        }
      }
    }

    fetchData()

    return () => controller.abort()
  }, [projectId])

  // ==============================
  // MEMOIZED VALUES
  // ==============================

  const filteredTasks = useMemo(() => {
    if (statusFilter === "all") return tasks
    return tasks.filter((t) => t.status === statusFilter)
  }, [tasks, statusFilter])

  const stats = useMemo(() => {
    if (!project) return []

    return [
      {
        label: "Total Tasks",
        value: tasks.length,
        icon: ListTodo,
        color: "text-accent",
      },
      {
        label: "Members",
        value: project.members.length,
        icon: Users,
        color: "text-secondary",
      },
      {
        label: "Created",
        value: new Date(project.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        icon: CalendarDays,
        color: "text-accent",
      },
    ]
  }, [tasks.length, project])

  // ==============================
  // HANDLERS
  // ==============================

  const handleDeleteProject = useCallback(async () => {
    if (!project) return

    try {
      setIsDeletingProject(true)

      await api.delete(`/projects/${projectId}`)

      toast({
        variant: "success",
        title: "Project deleted",
        description: "The project has been removed successfully.",
      })

      router.push("/projects")
      router.refresh()
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed to delete project",
        description:
          err?.response?.data?.message ||
          "Something went wrong. Please try again.",
      })
    } finally {
      setIsDeletingProject(false)
    }
  }, [project, projectId, router, toast])

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      const previous = tasks

      // Optimistic update
      setTasks((prev) => prev.filter((t) => t._id !== taskId))

      try {
        await api.delete(`/projects/${projectId}/tasks/${taskId}`)

        toast({
          variant: "success",
          title: "Task deleted",
          description: "The task has been removed successfully.",
        })
      } catch (err: any) {
        setTasks(previous) // rollback

        toast({
          variant: "destructive",
          title: "Failed to delete task",
          description:
            err?.response?.data?.message ||
            "Something went wrong. Please try again.",
        })
      }
    },
    [tasks, projectId, toast]
  )

  // ==============================
  // LOADING STATES
  // ==============================

  if (isAuthLoading || status === "loading" || status === "idle") {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center py-20">
        <p className="text-lg font-medium">Project not found</p>
        <Link
          href="/projects"
          className="mt-2 text-sm text-primary hover:underline"
        >
          Back to projects
        </Link>
      </div>
    )
  }

  // ==============================
  // RENDER
  // ==============================

  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{project?.name}</h1>
          <p className="text-muted-foreground">
            {project?.description}
          </p>
        </div>

        {manageProject && (
          <div className="flex gap-2">
            <Link href={`/projects/${projectId}/edit`}>
              <Button>
                <Pencil className="mr-1.5 h-4 w-4" />
                Edit
              </Button>
            </Link>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={isDeletingProject}
                >
                  <Trash className="mr-1.5 h-4 w-4" />
                  {isDeletingProject ? "Deleting..." : "Delete"}
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Delete Project?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteProject}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-xl border p-4"
          >
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
            <div>
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter + Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Link href={`/projects/${projectId}/tasks/new`}>
          <Button>
            <Plus className="h-4 w-4" /> Create Task
          </Button>
        </Link>

        <Link href={`/projects/${projectId}/members`}>
          <Button variant="outline">
            <UserPlus className="h-4 w-4" /> Manage Members
          </Button>
        </Link>

        <div className="ml-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="todo">Todo</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tasks */}
      <div className="flex flex-col gap-2">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            No tasks found
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskRow
              key={task._id}
              task={task}
              project={projectId}
              onDeleted={handleDeleteTask}
            />
          ))
        )}
      </div>
    </div>
  )
}
