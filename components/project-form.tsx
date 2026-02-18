"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function NewProjectPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  /* ---------------- Submit ---------------- */

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Project name required",
        description: "Please enter a project name.",
      })
      return
    }

    try {
      setLoading(true)

      await api.post("/projects", {
        name,
        description,
      })

      toast({
        title: "Project created",
        description: "Project has been created successfully.",
      })

      router.push("/projects")
    } catch (err: any) {
      // 🔥 If backend returns 403
      if (err?.response?.status === 403) {
        toast({
          variant: "destructive",
          title: "Not allowed",
          description:
            err?.response?.data?.message ||
            "You are not authorised to create a project.",
        })
        return
      }

      toast({
        variant: "destructive",
        title: "Failed to create project",
        description:
          err?.response?.data?.message ||
          "Something went wrong. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- Form ---------------- */

  return (
    <div className="mx-auto max-w-xl space-y-6 py-10">
      <div>
        <h1 className="text-2xl font-bold">Create New Project</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter project details below.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Project Name</label>
          <Input
            placeholder="Enter project name"
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
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Project"}
        </Button>
      </div>
    </div>
  )
}
