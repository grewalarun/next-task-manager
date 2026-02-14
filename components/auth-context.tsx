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

interface AuthUser {
  id: string
  name: string
  email: string
  initials: string
}

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const DEMO_ACCOUNTS = [
  { id: "u1", name: "Alex Morgan", email: "alex@taskflow.io", password: "password123", initials: "AM" },
  { id: "u2", name: "Sam Chen", email: "sam@taskflow.io", password: "password123", initials: "SC" },
  { id: "u3", name: "Jordan Lee", email: "jordan@taskflow.io", password: "password123", initials: "JL" },
  { id: "u4", name: "Riley Kim", email: "riley@taskflow.io", password: "password123", initials: "RK" },
  { id: "u5", name: "Taylor Swift", email: "taylor@taskflow.io", password: "password123", initials: "TS" },
]

let registeredAccounts: typeof DEMO_ACCOUNTS = [...DEMO_ACCOUNTS]

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
      await new Promise((r) => setTimeout(r, 800))
      const account = registeredAccounts.find(
        (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
      )
      if (!account) {
        return { success: false, error: "Invalid email or password" }
      }
      const authUser: AuthUser = {
        id: account.id,
        name: account.name,
        email: account.email,
        initials: account.initials,
      }
      setUser(authUser)
      sessionStorage.setItem("taskflow-user", JSON.stringify(authUser))
      router.push("/")
      return { success: true }
    },
    [router]
  )

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      await new Promise((r) => setTimeout(r, 800))
      const existing = registeredAccounts.find(
        (a) => a.email.toLowerCase() === email.toLowerCase()
      )
      if (existing) {
        return { success: false, error: "An account with this email already exists" }
      }
      const newAccount = {
        id: `u${Date.now()}`,
        name,
        email,
        password,
        initials: getInitials(name),
      }
      registeredAccounts.push(newAccount)
      const authUser: AuthUser = {
        id: newAccount.id,
        name: newAccount.name,
        email: newAccount.email,
        initials: newAccount.initials,
      }
      setUser(authUser)
      sessionStorage.setItem("taskflow-user", JSON.stringify(authUser))
      router.push("/")
      return { success: true }
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
