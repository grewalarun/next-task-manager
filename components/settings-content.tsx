"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function SettingsContent() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account and workspace preferences.
        </p>
      </div>

      {/* Profile Section */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Profile
        </h2>
        <div className="flex items-start gap-6">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
              AM
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Full Name
                </label>
                <Input defaultValue="Alex Morgan" className="rounded-xl" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Email
                </label>
                <Input defaultValue="alex@taskflow.io" className="rounded-xl" />
              </div>
            </div>
            <div>
              <Button className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Section */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Workspace
        </h2>
        <div className="flex flex-col gap-4">
          <div className="max-w-md">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Workspace Name
            </label>
            <Input defaultValue="TaskFlow Team" className="rounded-xl" />
          </div>
          <div>
            <Button className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
              Update Workspace
            </Button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-secondary/30 bg-card p-6 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-secondary">
          Danger Zone
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Once you delete your workspace, there is no going back.
        </p>
        <Button
          variant="outline"
          className="rounded-xl border-secondary/40 text-secondary hover:bg-secondary/10 hover:text-secondary"
        >
          Delete Workspace
        </Button>
      </div>
    </div>
  )
}
