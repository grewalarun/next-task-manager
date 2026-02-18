import { DashboardShell } from "@/components/dashboard-shell"
import ProjectForm from "@/components/project-form"

export default async function CreateProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params

  return (
    <DashboardShell>
      <ProjectForm  />
    </DashboardShell>
  )
}
