import { DashboardShell } from "@/components/dashboard-shell"
import { ProjectMembers } from "@/components/project-members"

export default async function ProjectMembersPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params

  return (
    <DashboardShell>
      <ProjectMembers projectId={projectId} />
    </DashboardShell>
  )
}
