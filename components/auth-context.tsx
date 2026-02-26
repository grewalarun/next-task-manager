"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"

const API_BASE = process.env.NEXT_PUBLIC_API_URL

/* ============================= */
/* 🔐 PERMISSION SYSTEM */
/* ============================= */

export type Permission =
  | "project.delete"
  | "project.edit"
  | "member.manage"
  | "task.create"
  | "task.update"
  | "task.delete"

type UserRole = "admin" | "manager" | "member"

/* Role → Permissions Map */
const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    "project.delete",
    "project.edit",
    "member.manage",
    "task.create",
    "task.update",
    "task.delete",
  ],
  manager: [
    "project.edit",
    "task.create",
    "task.update",
    "task.delete",
  ],
  member: [
    "task.create",
  ],
}

/* ============================= */
/* 👤 USER TYPE */
/* ============================= */

export interface AuthUser {
  id: string
  name: string
  email: string
  initials: string
  role: UserRole
  token: string
}

interface AuthContextValue {
  user: AuthUser | null
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>
  isLoading: boolean
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  hasPermission: (permission: Permission) => boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

/* ============================= */
/* 🔠 HELPER */
/* ============================= */

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

/* ============================= */
/* 🚀 PROVIDER */
/* ============================= */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  /* Load from sessionStorage */
  useEffect(() => {
    const stored = sessionStorage.getItem("taskflow-user")
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        sessionStorage.removeItem("taskflow-user")
      }
    }
    setIsLoading(false)
  }, [])

  /* Permission checker */
  const hasPermission = useCallback(
    (permission: Permission) => {
      if (!user) return false
      return rolePermissions[user.role]?.includes(permission) ?? false
    },
    [user]
  )

  /* ============================= */
  /* LOGIN */
  /* ============================= */

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        })

        const data = await res.json()

        if (!res.ok) {
          return {
            success: false,
            error: data.message || "Invalid email or password",
          }
        }

        const userData = data.user || data

        const authUser: AuthUser = {
          id: userData.id || userData._id || "",
          name: userData.name || email.split("@")[0],
          email: userData.email || email,
          role: userData.role as UserRole,
          initials: getInitials(userData.name || email.split("@")[0]),
          token: data.token || "",
        }

        setUser(authUser)
        sessionStorage.setItem("taskflow-user", JSON.stringify(authUser))
        router.push("/")

        return { success: true }
      } catch (err) {
        console.error("Login error:", err)
        return {
          success: false,
          error: "Network error. Please try again.",
        }
      }
    },
    [router]
  )

  /* ============================= */
  /* REGISTER */
  /* ============================= */

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      try {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        })

        const data = await res.json()

        if (!res.ok) {
          return {
            success: false,
            error: data.message || "Registration failed",
          }
        }

        const userData = data.user || data

        const authUser: AuthUser = {
          id: userData.id || userData._id || "",
          name: userData.name || name,
          email: userData.email || email,
          role: userData.role as UserRole,
          initials: getInitials(userData.name || name),
          token: data.token || "",
        }

        setUser(authUser)
        sessionStorage.setItem("taskflow-user", JSON.stringify(authUser))
        router.push("/")

        return { success: true }
      } catch (err) {
        console.error("Register error:", err)
        return {
          success: false,
          error: "Network error. Please try again.",
        }
      }
    },
    [router]
  )

  /* ============================= */
  /* LOGOUT */
  /* ============================= */

  const logout = useCallback(() => {
    setUser(null)
    sessionStorage.removeItem("taskflow-user")
    router.push("/login")
  }, [router])

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isLoading,
        login,
        register,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/* ============================= */
/* 🪝 HOOKS */
/* ============================= */

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

/* Clean Permission Hook */
export function usePermission(permissions: Permission[], requireAll: boolean = false) {
  const { hasPermission } = useAuth()
  if (Array.isArray(permissions)) {
    if (requireAll) {
      // AND logic → user must have all permissions
      return permissions.every((perm) => hasPermission(perm))
    } else {
      // OR logic → user must have at least one
      return permissions.some((perm) => hasPermission(perm))
    }
  }

  return hasPermission(permissions)
}
