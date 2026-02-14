import { DashboardShell } from "@/components/dashboard-shell"
import { TaskForm } from "@/components/task-form"

export default async function CreateTaskPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params

  return (
    <DashboardShell>
      <TaskForm projectId={projectId} />
    </DashboardShell>
  )
}
