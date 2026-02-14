"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ListTodo,
  Users,
  CalendarDays,
  Plus,
  UserPlus,
  ChevronRight,
} from "lucide-react"
import { getProject, getProjectTasks, getUser, type TaskStatus } from "@/lib/data"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TaskRow } from "@/components/task-row"

export function ProjectDetail({ projectId }: { projectId: string }) {
  const project = getProject(projectId)
  const allTasks = getProjectTasks(projectId)
  const [statusFilter, setStatusFilter] = useState<string>("all")

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

  const filteredTasks =
    statusFilter === "all"
      ? allTasks
      : allTasks.filter((t) => t.status === statusFilter)

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
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/projects" className="hover:text-foreground transition-colors">
          Projects
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">{project.name}</span>
      </nav>

      {/* Project Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
          {project.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          {project.description}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Link href={`/projects/${projectId}/tasks/new`}>
          <Button className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Create Task
          </Button>
        </Link>
        <Link href={`/projects/${projectId}/members`}>
          <Button
            variant="outline"
            className="rounded-xl border-secondary/40 text-secondary hover:bg-secondary/10 hover:text-secondary"
          >
            <UserPlus className="h-4 w-4" />
            Manage Members
          </Button>
        </Link>
        <div className="ml-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[160px] rounded-xl text-sm">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="todo">Todo</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Task List */}
      <div className="flex flex-col gap-2">
        {/* Table Header */}
        <div className="hidden rounded-xl bg-muted/60 px-5 py-3 md:grid md:grid-cols-[1fr_160px_120px_100px]">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Task
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Assigned To
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Status
          </span>
          <span className="text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Actions
          </span>
        </div>

        {/* Task Rows */}
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
            <ListTodo className="h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm font-medium text-muted-foreground">No tasks found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {statusFilter !== "all" ? "Try changing the status filter" : "Create a new task to get started"}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))
        )}
      </div>
    </div>
  )
}
