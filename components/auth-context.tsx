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

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export interface AuthUser {
  id: string
  name: string
  email: string
  initials: string
  token: string
}

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

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
            error: data.message || data.error || "Invalid email or password",
          }
        }

        const userData = data.user || data
        const authUser: AuthUser = {
          id: userData.id || userData._id || "",
          name: userData.name || userData.fullName || email.split("@")[0],
          email: userData.email || email,
          initials: getInitials(userData.name || userData.fullName || email.split("@")[0]),
          token: data.token || data.accessToken || "",
        }

        setUser(authUser)
        sessionStorage.setItem("taskflow-user", JSON.stringify(authUser))
        router.push("/")
        return { success: true }
      } catch (err) {
        console.error("Login error:", err)
        return {
          success: false,
          error: "Network error. Please check your connection and try again.",
        }
      }
    },
    [router]
  )

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
            error: data.message || data.error || "Registration failed",
          }
        }

        const userData = data.user || data
        const authUser: AuthUser = {
          id: userData.id || userData._id || "",
          name: userData.name || userData.fullName || name,
          email: userData.email || email,
          initials: getInitials(userData.name || userData.fullName || name),
          token: data.token || data.accessToken || "",
        }

        setUser(authUser)
        sessionStorage.setItem("taskflow-user", JSON.stringify(authUser))
        router.push("/")
        return { success: true }
      } catch (err) {
        console.error("Register error:", err)
        return {
          success: false,
          error: "Network error. Please check your connection and try again.",
        }
      }
    },
    [router]
  )

  const logout = useCallback(() => {
    setUser(null)
    sessionStorage.removeItem("taskflow-user")
    router.push("/login")
  }, [router])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
