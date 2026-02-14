import { DashboardShell } from "@/components/dashboard-shell"
import { ProjectDetail } from "@/components/project-detail"

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params

  return (
    <DashboardShell>
      <ProjectDetail projectId={projectId} />
    </DashboardShell>
  )
}
