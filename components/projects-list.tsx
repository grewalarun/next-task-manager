"use client"

import Link from "next/link"
import { FolderKanban, Users, CalendarDays, ListTodo, Loader2 } from "lucide-react"
import { Project } from "@/lib/data"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useEffect, useState } from "react"
import api from "@/lib/api"
import { getInitials } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { usePermission } from "./auth-context"

export function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const manageproject = usePermission(["project.delete", "project.edit"]);
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true)
        const res = await api.get<Project[]>("/projects")
        setProjects(res.data)
      } catch (err) {
        console.error("Failed to fetch projects")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center py-20">
        <FolderKanban className="h-10 w-10 text-muted-foreground/40" />
        <p className="mt-3 text-sm text-muted-foreground">
          No projects found
        </p>
        <div className="mt-5">
        <Link href="/projects/new">
          <Button className="rounded-xl">
            <Plus className="mr-1.5 h-4 w-4" />
            Create New Project
          </Button>
        </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and track all your team projects in one place.
          </p>
        </div>
        {manageproject &&
          <Link href="/projects/new">
            <Button className="rounded-xl">
              <Plus className="mr-1.5 h-4 w-4" />
              Add Project
            </Button>
          </Link>
        }
      </div>


      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const total = project.taskStat.total ?? 0
          const completed = project.taskStat.done ?? 0
          const progressPercent =
            total > 0 ? Math.round((completed / total) * 100) : 0

          return (
            <Link
              key={project._id}
              href={`/projects/${project._id}`}
              className="group flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition hover:shadow-md"
            >
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10">
                  <FolderKanban className="h-5 w-5 text-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {project.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-5">
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium text-foreground">
                    {progressPercent}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted">
                  <div
                    className="h-1.5 rounded-full bg-primary transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Meta */}
              <div className="mt-5 flex items-center gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <ListTodo className="h-3.5 w-3.5" />
                  {total} tasks
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  {project.members.length} members
                </div>
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {new Date(project.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>

              {/* Members */}
              <div className="mt-4 flex -space-x-2">
                {project.members.slice(0, 5).map((m) => (
                  <Avatar
                    key={m._id}
                    className="h-7 w-7 border-2 border-card"
                    title={m.name}
                  >
                    <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                      {getInitials(m.name)}
                    </AvatarFallback>
                  </Avatar>
                ))}

                {project.members.length > 5 && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[10px] font-medium">
                    +{project.members.length - 5}
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
