"use client"

import Link from "next/link"
import { FolderKanban, Users, CalendarDays, ListTodo } from "lucide-react"
import { projects, getUser, getProjectTasks } from "@/lib/data"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function ProjectsList() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">Projects</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage and track all your team projects in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const projectTasks = getProjectTasks(project.id)
          const completedCount = projectTasks.filter((t) => t.status === "done").length
          const progressPercent = projectTasks.length > 0 ? Math.round((completedCount / projectTasks.length) * 100) : 0

          return (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                  <FolderKanban className="h-5 w-5 text-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {project.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-5">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Progress</span>
                  <span className="text-xs font-medium text-foreground">{progressPercent}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted">
                  <div
                    className="h-1.5 rounded-full bg-primary transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Meta Info */}
              <div className="mt-5 flex items-center gap-4 border-t border-border pt-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ListTodo className="h-3.5 w-3.5" />
                  {projectTasks.length} tasks
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  {project.members.length} members
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {new Date(project.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
              </div>

              {/* Members */}
              <div className="mt-4 flex -space-x-2">
                {project.members.map((memberId) => {
                  const member = getUser(memberId)
                  return (
                    <Avatar key={memberId} className="h-7 w-7 border-2 border-card">
                      <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                        {member?.initials}
                      </AvatarFallback>
                    </Avatar>
                  )
                })}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
