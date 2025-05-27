"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useFirebase } from "@/hooks/use-firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Mail, Briefcase, Camera, Save, Edit, Lock, CheckCircle } from "lucide-react"

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
      alert("Profile updated successfully!")
    } catch (error: any) {
      console.error("ERROR UPDATING PROFILE:", error)
      alert(`Failed to update profile: ${error.message || "Unknown error"}`)
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
      alert("Firebase not initialized")
      return
    }

    setPasswordLoading(true)
    setPasswordSuccess(false)

    try {
      const { sendPasswordResetEmail } = await import("firebase/auth")
      await sendPasswordResetEmail(firebase.auth, passwordEmail)
      setPasswordSuccess(true)
      setPasswordEmail("")
    } catch (error: any) {
      console.error("ERROR SENDING PASSWORD RESET:", error)
      alert("Failed to send password reset email. Please try again.")
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

      console.log("Avatar updated successfully")
      alert("Avatar updated successfully!")
    } catch (error: any) {
      console.error("ERROR UPLOADING AVATAR:", error)
      alert("Failed to upload avatar. Please try again.")
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">PROFILE</h1>

      {/* PROFILE INFORMATION */}
      <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
        <CardHeader>
          <div className="flex items-center justify-between ">
            {/* <CardTitle>PROFILE INFORMATION</CardTitle> */}
            {!isEditing ? (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                EDIT
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancel} disabled={loading}>
                  CANCEL
                </Button>
                <Button variant="outline" onClick={handleSave} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "SAVING..." : "SAVE"}
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
              <Label htmlFor="full_name">FULL NAME</Label>
              {isEditing ? (
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="bg-white/50 dark:bg-gray-700/50 border-white/20 dark:border-gray-600/20"
                />
              ) : (
                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-md">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900 dark:text-white">{profile?.full_name || "NOT SET"}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="professional_title">PROFESSIONAL TITLE</Label>
              {isEditing ? (
                <Input
                  id="professional_title"
                  value={formData.professional_title}
                  onChange={(e) => setFormData({ ...formData, professional_title: e.target.value })}
                  placeholder="e.g., Software Engineer, Product Manager"
                  className="bg-white/50 dark:bg-gray-700/50 border-white/20 dark:border-gray-600/20"
                />
              ) : (
                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-md">
                  <Briefcase className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900 dark:text-white">{profile?.professional_title || "NOT SET"}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="employment_status">EMPLOYMENT STATUS</Label>
              {isEditing ? (
                <Select
                  value={formData.employment_status}
                  onValueChange={(value) => setFormData({ ...formData, employment_status: value })}
                >
                  <SelectTrigger className="bg-white/50 dark:bg-gray-700/50 border-white/20 dark:border-gray-600/20">
                    <SelectValue placeholder="SELECT STATUS" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Actively Looking">ACTIVELY LOOKING</SelectItem>
                    <SelectItem value="Open to Opportunities">OPEN TO OPPORTUNITIES</SelectItem>
                    <SelectItem value="Employed">EMPLOYED</SelectItem>
                    <SelectItem value="Not Looking">NOT LOOKING</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-md">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900 dark:text-white">{profile?.employment_status || "NOT SET"}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PASSWORD RESET */}
      <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            PASSWORD RESET
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password_email">EMAIL ADDRESS</Label>
              <Input
                id="password_email"
                type="email"
                placeholder="Enter your email to receive reset link"
                value={passwordEmail}
                onChange={(e) => setPasswordEmail(e.target.value)}
                required
                className="bg-white/50 dark:bg-gray-700/50 border-white/20 dark:border-gray-600/20"
              />
            </div>

            {passwordSuccess && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-md">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">PASSWORD RESET EMAIL SENT! CHECK YOUR INBOX.</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={passwordLoading}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
            >
              {passwordLoading ? "SENDING..." : "SEND RESET EMAIL"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
