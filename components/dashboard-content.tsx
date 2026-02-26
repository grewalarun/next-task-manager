"use client"

import Link from "next/link"
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  ListTodo,
  ArrowRight,
  Users,
  Loader2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Project, Task } from "@/lib/data"
import { getInitials } from "@/lib/utils"

import { useQueries, useQuery } from "@tanstack/react-query";
import { fetchProjects } from "@/lib/projects";
import { fetchTasks } from "@/lib/task"


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

// const { data: projects = [], isLoading, error, isError } = useQuery<Project[]>({
//   queryKey: ["projects"],
//   queryFn: fetchProjects,
// });

// const { data: tasks = [] } = useQuery<Task[]>({
//   queryKey: ["tasks"],
//   queryFn: fetchTasks,
// });


const results = useQueries({
  queries: [
    {
      queryKey: ["projects"],
      queryFn: fetchProjects,
    },
    {
      queryKey: ["tasks"],
      queryFn: fetchTasks,
    },
  ],
}) as [
  { data: Project[] | undefined; isLoading: boolean },
  { data: Task[] | undefined; isLoading: boolean }
];;

const projects = results[0].data ?? [];
const tasks = results[1].data ?? [];

const isLoading = results.some((query) => query.isLoading);


  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  // Aggregate task stats
  const totalTasks = projects.reduce((sum, p) => sum + (p.taskStat?.total || 0), 0)
  const doneTasks = projects.reduce((sum, p) => sum + (p.taskStat?.done || 0), 0)
  const inProgressTasks = projects.reduce((sum, p) => sum + (p.taskStat?.["in-progress"] || 0), 0)
  const todoTasks = projects.reduce((sum, p) => sum + (p.taskStat?.todo || 0), 0)

  // Aggregate unique members
  const uniqueMemberIds = new Set(projects.flatMap(p => p.members.map(m => m._id)))
  const totalMembers = uniqueMemberIds.size

  const stats = [
    { label: "Total Tasks", value: totalTasks, icon: ListTodo, color: "text-foreground" },
    { label: "In Progress", value: inProgressTasks, icon: Clock, color: "text-accent" },
    { label: "Completed", value: doneTasks, icon: CheckCircle2, color: "text-primary" },
    { label: "Team Members", value: totalMembers, icon: Users, color: "text-secondary" },
  ]

  const user = JSON.parse(sessionStorage.getItem("taskflow-user") || "{}")

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back, {user.name || "User"}. Here's an overview of your projects.
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
          {projects.map((project) => (
            <Link
              key={project._id}
              href={`/projects/${project._id}`}
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
                  {project.members.slice(0, 3).map((m) => (
                    <Avatar key={m._id} className="h-7 w-7 border-2 border-card" title={m.name}>
                      <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                       <Link href={`/user/${m._id}`}> {getInitials(m.name)}</Link>
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {project.members.length > 3 && (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-medium text-muted-foreground">
                      +{project.members.length - 3}
                    </div>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {project.taskStat.done}/{project.taskStat.total} done
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Tasks  */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Tasks</h2>
        <div className="flex flex-col gap-3">
          {tasks.slice(0, 4).map((task) => (
            <Link
              key={task._id}
              href={`/projects/${task.project}/tasks/${task._id}`}
              className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="min-w-0 w-[90%]">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{task.title}</span>
                </div>
                <span className="text-xs text-muted-foreground line-clamp-1">{task.description}</span>
              </div>
              <div className="hidden items-center gap-3 sm:flex">
                <Badge className={`${statusColors[task.status]} border-0 text-[11px]`}>
                  {statusLabels[task.status]}
                </Badge>
                <Avatar className="h-7 w-7" title={task.assignedTo?.name || "Unassigned"}>
                  <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                    <Link href={`/user/${task?.assignedTo?._id}`}>{getInitials(task.assignedTo?.name || "NA")}</Link>
                  </AvatarFallback>
                </Avatar>
              </div>
            </Link>
          ))}
        </div>
      </div>
     
    </div>
  )
}
