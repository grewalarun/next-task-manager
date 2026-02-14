"use client"

import { AuthProvider } from "@/components/auth-context"
import { RegisterForm } from "@/components/register-form"

export default function RegisterPage() {
  return (
    <AuthProvider>
      <RegisterForm />
    </AuthProvider>
  )
}
