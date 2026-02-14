"use client"

import { BarChart3, CheckCircle2, Clock, ListTodo } from "lucide-react"
import { tasks, projects } from "@/lib/data"

export function ReportsContent() {
  const totalTasks = tasks.length
  const done = tasks.filter((t) => t.status === "done").length
  const inProgress = tasks.filter((t) => t.status === "in-progress").length
  const todo = tasks.filter((t) => t.status === "todo").length

  const completionRate = Math.round((done / totalTasks) * 100)

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of task progress and team productivity.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <BarChart3 className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{completionRate}%</p>
              <p className="text-xs text-muted-foreground">Completion Rate</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
              <ListTodo className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{todo}</p>
              <p className="text-xs text-muted-foreground">Todo</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <Clock className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{inProgress}</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{done}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Breakdown */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Project Breakdown</h2>
        <div className="flex flex-col gap-4">
          {projects.map((project) => {
            const projectTasks = tasks.filter((t) => t.projectId === project.id)
            const projectDone = projectTasks.filter((t) => t.status === "done").length
            const projectProgress = projectTasks.length > 0
              ? Math.round((projectDone / projectTasks.length) * 100)
              : 0

            return (
              <div
                key={project.id}
                className="rounded-xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-foreground">{project.name}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {projectDone} of {projectTasks.length} tasks completed
                    </p>
                  </div>
                  <span className="text-sm font-bold text-foreground">{projectProgress}%</span>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{ width: `${projectProgress}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
