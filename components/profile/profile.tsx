"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useFirebase } from "@/hooks/use-firebase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Mail, Briefcase, Camera, Save, Edit, Lock, CheckCircle } from "lucide-react"
import { toast } from "sonner"

export function Profile() {
  const { profile, updateProfile, user } = useAuth()
  const firebase = useFirebase()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [passwordEmail, setPasswordEmail] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    professional_title: profile?.professional_title || "",
    employment_status: profile?.employment_status || "",
  })

  const handleSave = async () => {
    setLoading(true)
    try {
      const { error } = await updateProfile(formData)
      if (error) throw error
      setIsEditing(false)
      toast.success("Profile Updated", {
        description: "Your profile has been updated successfully.",
      })
    } catch (error: any) {
      console.error("ERROR UPDATING PROFILE:", error)
      toast.error("Failed to Update Profile", {
        description: error.message || "An unexpected error occurred. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || "",
      professional_title: profile?.professional_title || "",
      employment_status: profile?.employment_status || "",
    })
    setIsEditing(false)
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firebase.initialized || !firebase.auth) {
      toast.error("Error", {
        description: "Firebase not initialized",
      })
      return
    }

    setPasswordLoading(true)
    setPasswordSuccess(false)

    try {
      const { sendPasswordResetEmail } = await import("firebase/auth")
      await sendPasswordResetEmail(firebase.auth, passwordEmail)
      setPasswordSuccess(true)
      setPasswordEmail("")
      toast.success("Password Reset Email Sent", {
        description: "Please check your inbox for the password reset link.",
      })
    } catch (error: any) {
      console.error("ERROR SENDING PASSWORD RESET:", error)
      toast.error("Failed to Send Reset Email", {
        description: "An error occurred. Please try again.",
      })
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user || !firebase.initialized || !firebase.storage) return

    setLoading(true)
    try {
      const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage")

      // Create a unique filename
      const fileExt = file.name.split(".").pop()
      const fileName = `avatars/${user.uid}-${Date.now()}.${fileExt}`

      // Upload file to Firebase Storage
      const storageRef = ref(firebase.storage, fileName)
      const snapshot = await uploadBytes(storageRef, file)

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref)

      // Update profile with new avatar URL
      const { error } = await updateProfile({
        avatar_url: downloadURL,
      })

      if (error) {
        throw error
      }

      toast.success("Avatar Updated", {
        description: "Your profile picture has been updated successfully.",
      })
    } catch (error: any) {
      console.error("ERROR UPLOADING AVATAR:", error)
      toast.error("Failed to Upload Avatar", {
        description: "An error occurred while uploading. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!firebase.initialized) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Initializing Firebase...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeInUp">
      <div className="hidden md:block">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
          Profile
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account settings and preferences</p>
      </div>

      {/* PROFILE INFORMATION */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-white/30 dark:border-gray-700/30 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information and preferences</CardDescription>
            </div>
            {!isEditing ? (
              <Button variant="outline" onClick={() => setIsEditing(true)} className="hover:bg-primary/10 hover:border-primary/50">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancel} disabled={loading}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={loading} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* AVATAR SECTION */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl">
                  {profile?.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-1 cursor-pointer transition-colors">
                <Camera className="h-6 w-6" />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {profile?.full_name || "NO NAME SET"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{profile?.email}</p>
            </div>
          </div>

          {/* FORM FIELDS */}
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              {isEditing ? (
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="bg-background"
                />
              ) : (
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{profile?.full_name || "Not set"}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="professional_title">Professional Title</Label>
              {isEditing ? (
                <Input
                  id="professional_title"
                  value={formData.professional_title}
                  onChange={(e) => setFormData({ ...formData, professional_title: e.target.value })}
                  placeholder="e.g., Software Engineer, Product Manager"
                  className="bg-background"
                />
              ) : (
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{profile?.professional_title || "Not set"}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="employment_status">Employment Status</Label>
              {isEditing ? (
                <Select
                  value={formData.employment_status}
                  onValueChange={(value) => setFormData({ ...formData, employment_status: value })}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Actively Looking">Actively Looking</SelectItem>
                    <SelectItem value="Open to Opportunities">Open to Opportunities</SelectItem>
                    <SelectItem value="Employed">Employed</SelectItem>
                    <SelectItem value="Not Looking">Not Looking</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{profile?.employment_status || "Not set"}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PASSWORD RESET */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-white/30 dark:border-gray-700/30 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Password Reset
          </CardTitle>
          <CardDescription>Request a password reset link to be sent to your email</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password_email">Email Address</Label>
              <Input
                id="password_email"
                type="email"
                placeholder="Enter your email to receive reset link"
                value={passwordEmail}
                onChange={(e) => setPasswordEmail(e.target.value)}
                required
                className="bg-background"
              />
            </div>

            {passwordSuccess && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-md border border-green-200 dark:border-green-800">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Password reset email sent! Check your inbox.</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={passwordLoading}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
            >
              {passwordLoading ? "Sending..." : "Send Reset Email"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
