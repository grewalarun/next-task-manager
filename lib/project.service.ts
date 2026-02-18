import api from "@/lib/api"
import { Project } from "@/lib/data"

export async function getProjectById(
  id: string
): Promise<Project | null> {
  try {
    const res = await api.get<Project>(`/projects/${id}`)
    return res.data
  } catch (error) {
    console.error("Failed to fetch project")
    return null
  }
}
