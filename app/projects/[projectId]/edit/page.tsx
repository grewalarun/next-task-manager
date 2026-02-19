import { DashboardShell } from "@/components/dashboard-shell"
import ProjectForm from "@/components/project-form"

interface PageProps {
  params: Promise<{ projectId: string }>
}

export default async function EditProjectPage({ params }: PageProps) {
  const { projectId } = await params

  return (
    <DashboardShell>
      <ProjectForm projectId={projectId} />
    </DashboardShell>
  )
}
