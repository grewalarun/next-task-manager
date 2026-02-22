"use client"

import { useMemo, useCallback, useState } from "react"
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
  ChevronRight,
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
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { fetchProjectDetail } from "@/lib/projects"
import { fetchTasksByProject } from "@/lib/task"

export function ProjectDetail({
  projectId,
}: {
  projectId: string
}) {
  const [statusFilter, setStatusFilter] = useState("all")
  const [isDeletingProject, setIsDeletingProject] =
    useState(false)

  const { toast } = useToast()
  const router = useRouter()
  const { isLoading: isAuthLoading } = useAuth()
  const manageProject = usePermission([
    "project.edit",
    "project.delete",
  ])
  const queryClient = useQueryClient()

  // ==============================
  // PROJECT QUERY
  // ==============================

  const {
    data: project,
    isLoading: isProjectLoading,
    isError: isProjectError,
  } = useQuery<Project>({
    queryKey: ["project", projectId],
    queryFn: () => fetchProjectDetail(projectId),
    enabled: !!projectId,
  })

  // ==============================
  // TASKS QUERY (🔥 SAFE VERSION)
  // ==============================

  const {
    data: tasksData,
    isLoading: isTasksLoading,
  } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: async () => {
      const result =
        await fetchTasksByProject(projectId)
      return Array.isArray(result) ? result : []
    },
    enabled: !!projectId,
    refetchOnMount: "always",
  })

  // 🔥 GUARANTEE ARRAY
  const tasks: Task[] = useMemo(() => {
    return Array.isArray(tasksData)
      ? tasksData
      : []
  }, [tasksData])

  // ==============================
  // DELETE TASK MUTATION (SAFE)
  // ==============================

  const { mutate: deleteTask } = useMutation({
    mutationFn: async (taskId: string) => {
      return api.delete(
        `/projects/${projectId}/tasks/${taskId}`
      )
    },

    onMutate: async (taskId: string) => {
      await queryClient.cancelQueries({
        queryKey: ["tasks", projectId],
      })

      const previousTasks =
        queryClient.getQueryData([
          "tasks",
          projectId,
        ])

      queryClient.setQueryData(
        ["tasks", projectId],
        (old: any) => {
          const safeOld = Array.isArray(old)
            ? old
            : []
          return safeOld.filter(
            (t) => t._id !== taskId
          )
        }
      )

      return { previousTasks }
    },

    onError: (err: any, _taskId, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(
          ["tasks", projectId],
          context.previousTasks
        )
      }

      toast({
        variant: "destructive",
        title: "Failed to delete task",
        description:
          err?.response?.data?.message ||
          "Something went wrong.",
      })
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks", projectId],
      })
    },

    onSuccess: () => {
      toast({
        variant: "success",
        title: "Task deleted",
      })
    },
  })

  // ==============================
  // DELETE PROJECT
  // ==============================

  const handleDeleteProject = useCallback(
    async () => {
      if (!project) return

      try {
        setIsDeletingProject(true)

        await api.delete(`/projects/${projectId}`)

        toast({
          variant: "success",
          title: "Project deleted",
        })

        router.push("/projects")
        router.refresh()
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Failed to delete project",
          description:
            err?.response?.data?.message ||
            "Something went wrong.",
        })
      } finally {
        setIsDeletingProject(false)
      }
    },
    [project, projectId, router, toast]
  )

  // ==============================
  // FILTERED TASKS (SAFE)
  // ==============================

  const filteredTasks = useMemo(() => {
    if (statusFilter === "all") return tasks
    return tasks.filter(
      (t) => t.status === statusFilter
    )
  }, [tasks, statusFilter])

  // ==============================
  // STATS (SAFE)
  // ==============================

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
        value: new Date(
          project.createdAt
        ).toLocaleDateString(),
        icon: CalendarDays,
        color: "text-accent",
      },
    ]
  }, [tasks, project])

  // ==============================
  // LOADING
  // ==============================

  if (
    isAuthLoading ||
    isProjectLoading ||
    isTasksLoading
  ) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (isProjectError || !project) {
    return (
      <div className="flex flex-col items-center py-20">
        <p className="text-lg font-medium">
          Project not found
        </p>
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
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/">Dashboard</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/projects">Projects</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/projects/${projectId}`}>
          {project?.name}
        </Link>
      </nav>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{project?.name}</h1>
          <p className="text-muted-foreground text-sm pt-4 mt-4 border-t">
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
            className="flex items-center gap-4 rounded-xl bg-card border p-4"
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
          <Button variant="outline" className="bg-purple-100">
            <UserPlus className="h-4 w-4" /> Manage Members
          </Button>
        </Link>

        <div className="ml-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] bg-card">
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
              onDeleted={deleteTask}
            />
          ))
        )}
      </div>
    </div>
  )
}