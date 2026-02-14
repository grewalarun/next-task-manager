import { DashboardShell } from "@/components/dashboard-shell"
import { ProjectsList } from "@/components/projects-list"

export default function ProjectsPage() {
  return (
    <DashboardShell>
      <ProjectsList />
    </DashboardShell>
  )
}
