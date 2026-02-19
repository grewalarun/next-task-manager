"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

interface ProjectFormProps {
  projectId?: string
}

type Status = "idle" | "loading" | "submitting" | "error"

export default function ProjectForm({ projectId }: ProjectFormProps) {
  const router = useRouter()
  const { toast } = useToast()

  const isEditMode = Boolean(projectId)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<Status>("idle")
console.log(projectId);
  /* ===============================
     FETCH PROJECT (EDIT MODE)
  =============================== */

  useEffect(() => {
    if (!isEditMode) return

    const controller = new AbortController()

    const fetchProject = async () => {
      try {
        setStatus("loading")

        const res = await api.get(`/projects/${projectId}`, {
          signal: controller.signal,
        })

        setName(res.data.name || "")
        setDescription(res.data.description || "")
        setStatus("idle")
      } catch (err: any) {
        if (err.name === "CanceledError") return

        toast({
          variant: "destructive",
          title: "Failed to load project",
          description:
            err?.response?.data?.message ||
            "Could not fetch project details.",
        })

        setStatus("error")
      }
    }

    fetchProject()

    return () => controller.abort()
  }, [isEditMode, projectId, toast])

  /* ===============================
     SUBMIT
  =============================== */

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Project title required",
        description: "Please enter a project title.",
      })
      return
    }

    try {
      setStatus("submitting")

      if (isEditMode) {
        await api.patch(`/projects/${projectId}/`, {
          name,
          description,
        })

        toast({
          title: "Project updated",
          description: "Project updated successfully.",
        })
      } else {
        await api.post("/projects", {
          name,
          description,
        })

        toast({
          title: "Project created",
          description: "Project created successfully.",
        })
      }

      router.push("/projects")
      router.refresh()
    } catch (err: any) {
      if (err?.response?.status === 403) {
        toast({
          variant: "destructive",
          title: "Not allowed",
          description:
            err?.response?.data?.message ||
            "You are not authorised.",
        })
        return
      }

      toast({
        variant: "destructive",
        title: isEditMode
          ? "Failed to update project"
          : "Failed to create project",
        description:
          err?.response?.data?.message ||
          "Something went wrong.",
      })
    } finally {
      setStatus("idle")
    }
  }

  /* ===============================
     LOADING STATE (EDIT FETCH)
  =============================== */

  if (status === "loading") {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  /* ===============================
     FORM UI
  =============================== */

  return (
    <div className="mx-auto max-w-xl space-y-6 py-10">
      <div>
        <h1 className="text-2xl font-bold">
          {isEditMode ? "Edit Project" : "Create New Project"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isEditMode
            ? "Update project details below."
            : "Enter project details below."}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Project Title</label>
          <Input
            placeholder="Enter project title"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Description</label>
          <Textarea
            placeholder="Enter project description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1"
          />
        </div>

        <Button
          className="w-full rounded-xl"
          onClick={handleSubmit}
          disabled={status === "submitting"}
        >
          {status === "submitting"
            ? isEditMode
              ? "Updating..."
              : "Creating..."
            : isEditMode
            ? "Update Project"
            : "Create Project"}
        </Button>
      </div>
    </div>
  )
}
