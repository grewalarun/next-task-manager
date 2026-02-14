"use client"

import { TopNav } from "@/components/top-nav"
import { AppSidebar, MobileSidebar } from "@/components/app-sidebar"
import { SidebarProvider, useSidebar } from "@/components/sidebar-context"
import { AuthProvider, useAuth } from "@/components/auth-context"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}

function ShellInner({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar()

  return (
    <AuthGate>
      <div className="min-h-screen bg-background">
        <TopNav />
        <AppSidebar />
        <MobileSidebar />
        <main
          className={cn(
            "pt-16 transition-[padding-left] duration-200 ease-in-out",
            isOpen ? "md:pl-60" : "md:pl-[68px]"
          )}
        >
          <div className="p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </AuthGate>
  )
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <ShellInner>{children}</ShellInner>
      </SidebarProvider>
    </AuthProvider>
  )
}
