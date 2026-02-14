"use client"

import { useState } from "react"
import Link from "next/link"
import { AuthProvider } from "@/components/auth-context"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  )
}
