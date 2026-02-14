import { DashboardShell } from "@/components/dashboard-shell"
import { MembersManagement } from "@/components/members-management"

export default function MembersPage() {
  return (
    <DashboardShell>
      <MembersManagement />
    </DashboardShell>
  )
}
