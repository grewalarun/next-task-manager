import { DashboardShell } from "@/components/dashboard-shell"
import { TaskForm } from "@/components/task-form"

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ projectId: string; taskId: string }>
}) {
  const { projectId, taskId } = await params

  return (
    <DashboardShell>
      <TaskForm projectId={projectId} taskId={taskId} />
    </DashboardShell>
  )
}
