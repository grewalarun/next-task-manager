import { DashboardShell } from "@/components/dashboard-shell"
import { TaskDetail } from "@/components/task-detail"

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; taskId: string }>
}) {
  const { projectId, taskId } = await params

  return (
    <DashboardShell>
      <TaskDetail projectId={projectId} taskId={taskId} />
    </DashboardShell>
  )
}
