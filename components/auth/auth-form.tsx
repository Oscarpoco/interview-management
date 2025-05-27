"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Loader2 } from "lucide-react"

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Basic validation
    if (!email || !password) {
      setError("Email and password are required")
      setLoading(false)
      return
    }

    if (!isLogin && !fullName.trim()) {
      setError("Full name is required for registration")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    try {
      let result
      if (isLogin) {
        console.log("Attempting login...")
        result = await signIn(email, password)
      } else {
        console.log("Attempting signup...")
        result = await signUp(email, password, fullName.trim())
      }

      if (result.error) {
        // Handle specific Firebase errors
        let errorMessage = result.error

        if (typeof result.error === "string") {
          // Clean up Firebase error messages
          if (result.error.includes("auth/user-not-found")) {
            errorMessage = "No account found with this email address"
          } else if (result.error.includes("auth/wrong-password")) {
            errorMessage = "Incorrect password"
          } else if (result.error.includes("auth/email-already-in-use")) {
            errorMessage = "An account with this email already exists"
          } else if (result.error.includes("auth/weak-password")) {
            errorMessage = "Password should be at least 6 characters"
          } else if (result.error.includes("auth/invalid-email")) {
            errorMessage = "Invalid email address"
          } else if (result.error.includes("auth/too-many-requests")) {
            errorMessage = "Too many failed attempts. Please try again later"
          }
        }

        setError(errorMessage)
      } else if (!isLogin) {
        // Show success message for signup
        setError("")
        alert("Account created successfully! You can now sign in.")
        setIsLogin(true)
        setPassword("")
        setFullName("")
      }
    } catch (err) {
      console.error("AUTH ERROR:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20 shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Interview Manager
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin ? "SIGN IN TO YOUR ACCOUNT" : "CREATE A NEW ACCOUNT"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">FULL NAME</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={!isLogin}
                  className="bg-white/50 dark:bg-gray-700/50 border-white/20 dark:border-gray-600/20"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">EMAIL</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/50 dark:bg-gray-700/50 border-white/20 dark:border-gray-600/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">PASSWORD</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/50 dark:bg-gray-700/50 border-white/20 dark:border-gray-600/20 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-2 rounded">{error}</div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLogin ? "SIGNING IN..." : "CREATING ACCOUNT..."}
                </>
              ) : isLogin ? (
                "SIGN IN"
              ) : (
                "CREATE ACCOUNT"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => {
                setIsLogin(!isLogin)
                setError("")
                setPassword("")
                setFullName("")
              }}
              className="text-sm"
            >
              {isLogin ? "DON'T HAVE AN ACCOUNT? SIGN UP" : "ALREADY HAVE AN ACCOUNT? SIGN IN"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
