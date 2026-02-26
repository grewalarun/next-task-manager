import { DashboardShell } from "@/components/dashboard-shell"
import ProfileContent from "@/components/user-profile"



export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    
    <DashboardShell>
      <ProfileContent id={id} />
    </DashboardShell>
  )
}

