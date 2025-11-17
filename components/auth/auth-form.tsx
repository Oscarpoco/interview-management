"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Loader2, Mail, Lock, User, Briefcase } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { toast } from "sonner"

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")

  const { signIn, signUp, signInWithGoogle } = useAuth()

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
        result = await signIn(email, password)
      } else {
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
        toast.error("Authentication Failed", {
          description: errorMessage,
        })
      } else if (!isLogin) {
        // Show success message for signup
        setError("")
        toast.success("Account Created", {
          description: "Your account has been created successfully!",
        })
        setIsLogin(true)
        setPassword("")
        setFullName("")
      } else {
        toast.success("Welcome Back!", {
          description: "You've been signed in successfully.",
        })
      }
    } catch (err) {
      console.error("AUTH ERROR:", err)
      setError("An unexpected error occurred. Please try again.")
      toast.error("Error", {
        description: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setError("")

    try {
      const result = await signInWithGoogle()
      if (result.error) {
        setError(result.error)
        toast.error("Google Sign-In Failed", {
          description: result.error,
        })
      } else {
        toast.success("Welcome!", {
          description: "You've been signed in with Google successfully.",
        })
      }
    } catch (err) {
      console.error("GOOGLE AUTH ERROR:", err)
      setError("Failed to sign in with Google")
      toast.error("Error", {
        description: "Failed to sign in with Google. Please try again.",
      })
    } finally {
      setGoogleLoading(false)
    }
  }

  // Using Unsplash images for professional look
  const loginImage = "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=1200&fit=crop&q=80"
  const registerImage = "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=1200&fit=crop&q=80"

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-0 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Left Side - Image */}
        <div className="hidden md:block relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-purple-600/90 to-blue-600/90 z-10" />
          <Image
            src={isLogin ? loginImage : registerImage}
            alt={isLogin ? "Sign in" : "Sign up"}
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 text-white">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold mb-2">
                {isLogin ? "Welcome Back!" : "Join Us Today"}
              </h2>
              <p className="text-lg text-white/90 max-w-md">
                {isLogin
                  ? "Sign in to manage your interviews and track your career journey."
                  : "Create your account and start organizing your interview process effortlessly."}
              </p>
              <div className="flex items-center justify-center gap-2 mt-6">
                <Briefcase className="h-6 w-6" />
                <span className="text-sm font-medium">Interfy - Interview Management</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex items-center justify-center p-8 md:p-12">
          <div className="w-full max-w-md space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Interfy
              </h1>
              <p className="text-muted-foreground">
                {isLogin ? "Sign in to your account" : "Create a new account"}
              </p>
            </div>

            {/* Google Sign In Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full border-2 hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading}
            >
              {googleLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-800 px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                    className="bg-background h-11"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-background pr-10 h-11"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="text-destructive text-sm text-center bg-destructive/10 border border-destructive/20 p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 h-11"
                disabled={loading || googleLoading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </>
                ) : isLogin ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            {/* Toggle Login/Register */}
            <div className="text-center">
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
                {isLogin ? (
                  <>
                    Don't have an account?{" "}
                    <span className="text-primary font-semibold ml-1">Sign up</span>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <span className="text-primary font-semibold ml-1">Sign in</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
