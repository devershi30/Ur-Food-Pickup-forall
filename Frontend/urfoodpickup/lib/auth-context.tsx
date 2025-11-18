"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/axios"

export type UserRole = "student" | "vendor" | "admin"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  phone?: string
  address?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, role: UserRole) => Promise<void>
  register: (username: string, email: string, password: string, confirmPassword: string, name: string, role: UserRole) => Promise<void>
  logout: () => void
  isLoading: boolean
  refresh: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      setIsLoading(false)
      return
    }

    api
      .get("/api/v1/auth/checkUser")
      .then((res) => {
        setUser(res.data)
        localStorage.setItem("user", JSON.stringify(res.data))
      })
      .catch((err) => {
        console.error("Token invalid or expired:", err)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      })
      .finally(() => setIsLoading(false))
  }, [])

  const refresh = ()=>{
    const token = localStorage.getItem("token")
    if (!token) {
      setIsLoading(false)
      return
    }

    api
      .get("/api/v1/auth/checkUser")
      .then((res) => {
        setUser(res.data)
        localStorage.setItem("user", JSON.stringify(res.data))
      })
      .catch((err) => {
        console.error("Token invalid or expired:", err)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      })
      .finally(() => setIsLoading(false))
  }

  const login = async (username: string, password: string) => {
    const res = await api.post("/api/v1/auth/login", { username, password })
    const token = res.data.authorization?.replace("Bearer ", "")
    localStorage.setItem("token", token)

    const userRes = await api.get("/api/v1/auth/checkUser")
    const userData = userRes.data
    setUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))

    console.log(userData.role)
    const rolePath = userData.role?.replace("ROLE_", "").toLowerCase() || "dashboard"
    router.push(`/${rolePath}`)
  }

  const loginV = async (username: string, password: string) => {
    const res = await api.post("/api/v1/auth/login", { username, password })
    const token = res.data.authorization?.replace("Bearer ", "")
    localStorage.setItem("token", token)

    const userRes = await api.get("/api/v1/auth/checkUser")
    const userData = userRes.data
    setUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))

    console.log(userData.role)
    // const rolePath = userData.role?.replace("ROLE_", "").toLowerCase() || "dashboard"
    // router.push(`/${rolePath}`)
    router.push("/vendor/apply")
  }

  const register = async (username: string, email: string, password: string, confirmPassword: string, name: string,role: string) => {
    if(role=="vendor")
      await api.post("/api/v1/auth/registerVendor", { username, email, password, confirmPassword, name })
    else
      await api.post("/api/v1/auth/register", { username, email, password, confirmPassword, name })
    if(role=="vendor")
      await loginV(username,password);
    else
      await login(username, password)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading,refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
