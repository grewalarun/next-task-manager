"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ListTodo,
  Users,
  CalendarDays,
  Plus,
  UserPlus,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { Project, Task } from "@/lib/data"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TaskRow } from "@/components/task-row"
import api from "@/lib/api"

export function ProjectDetail({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null>(null)
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        const [projectRes, tasksRes] = await Promise.all([
          api.get<Project>(`/projects/${projectId}`),
          api.get<Task[]>(`/projects/${projectId}/tasks`),
        ])

        setProject(projectRes.data)
        setAllTasks(tasksRes.data)
      } catch (err) {
        console.error("Failed to fetch project data")
      } finally {
        setIsLoading(false)
      }
    }

    if (projectId) {
      fetchData()
    }
  }, [projectId])

  // ✅ Memoized filtering
  const filteredTasks = useMemo(() => {
    if (statusFilter === "all") return allTasks
    return allTasks.filter((t) => t.status === statusFilter)
  }, [allTasks, statusFilter])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

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

  const stats = [
    {
      label: "Total Tasks",
      value: allTasks.length,
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

  return (
    <div className="flex flex-col gap-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/">Dashboard</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/projects">Projects</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">{project.name}</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {project.description}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter + Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Link href={`/projects/${projectId}/tasks/new`}>
          <Button>
            <Plus className="h-4 w-4" />
            Create Task
          </Button>
        </Link>

        <Link href={`/projects/${projectId}/members`}>
          <Button variant="outline">
            <UserPlus className="h-4 w-4" />
            Manage Members
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
          <div className="flex flex-col items-center py-16">
            <ListTodo className="h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">
              No tasks found
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskRow key={task._id} task={task} project={projectId} />
          ))
        )}
      </div>
    </div>
  )
}
