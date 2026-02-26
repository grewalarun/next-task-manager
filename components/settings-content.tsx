"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { AuthUser, useAuth } from "./auth-context"
import api from "@/lib/api" // adjust path to your axios instance
import { useToast } from "@/hooks/use-toast"

export function SettingsContent() {
  const { toast } = useToast()
  const [loading, setIsLoading] = useState(true)
  const {user, setUser} = useAuth()

  // Profile state
  const [fullName, setFullName] = useState("")
  const [savingProfile, setSavingProfile] = useState(false)

  // Password state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem("taskflow-user")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setUser(parsed)
        setFullName(parsed.name ?? "")
      } catch {
        sessionStorage.removeItem("taskflow-user")
      }
    }
    setIsLoading(false)
  }, [])

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      toast({
        variant: "destructive",
        title: "Full name is required.",
      })
      return
    }

    try {
      setSavingProfile(true)

      const { data } = await api.patch("/users/profile", { name: fullName.trim() })

      const updatedUser = { ...user, ...data }
      setUser(updatedUser)
      sessionStorage.setItem("taskflow-user", JSON.stringify(updatedUser))

      toast({
        variant:"success",
        title: "Profile updated",
        description: "Your name has been updated successfully.",
      })
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed to update profile",
        description: err?.response?.data?.message ?? "Something went wrong. Please try again.",
      })
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        variant: "destructive",
        title: "All password fields are required.",
      })
      return
    }

    if (newPassword.length < 8) {
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "New password must be at least 8 characters.",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords do not match",
        description: "New password and confirmation must match.",
      })
      return
    }

    if (currentPassword === newPassword) {
      toast({
        variant: "destructive",
        title: "Same password",
        description: "New password must differ from your current password.",
      })
      return
    }

    try {
      setSavingPassword(true)

      await api.patch("/users/password", { currentPassword, newPassword })

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

      toast({
        variant:"success",
        title: "Password changed",
        description: "Your password has been updated successfully.",
      })
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed to change password",
        description: err?.response?.data?.message ?? "Something went wrong. Please try again.",
      })
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    !loading && (
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
                {user?.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Full Name
                  </label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="rounded-xl"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Email
                  </label>
                  <Input
                    value={user?.email ?? ""}
                    disabled
                    className="rounded-xl opacity-60 cursor-not-allowed"
                  />
                </div>
              </div>
              <div>
                <Button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {savingProfile ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Section */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Change Password
          </h2>
          <div className="flex flex-col gap-4 max-w-md">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Current Password
              </label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="rounded-xl"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                New Password
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="rounded-xl"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Confirm New Password
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="rounded-xl"
                placeholder="••••••••"
              />
            </div>
            <div>
              <Button
                onClick={handleChangePassword}
                disabled={savingPassword}
                className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {savingPassword ? "Updating…" : "Change Password"}
              </Button>
            </div>
          </div>
        </div>

        {/* Workspace Section */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm opacity-30">
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
        <div className="rounded-xl border border-secondary/30 bg-card p-6 shadow-sm opacity-30">
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
  )
}