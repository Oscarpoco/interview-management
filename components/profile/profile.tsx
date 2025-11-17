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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { User, Mail, Briefcase, Camera, Save, Edit, Lock, CheckCircle, Loader2, Image as ImageIcon, Trash2 } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

export function Profile() {
  const { profile, updateProfile, user, deleteAccount } = useAuth()
  const firebase = useFirebase()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [coverLoading, setCoverLoading] = useState(false)
  const [passwordEmail, setPasswordEmail] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    professional_title: profile?.professional_title || "",
    employment_status: profile?.employment_status || "",
  })

  const handleSave = async () => {
    setLoading(true)
    const toastId = toast.loading("Saving profile...", {
      description: "Please wait while we update your information.",
    })
    try {
      const { error } = await updateProfile(formData)
      if (error) throw error
      setIsEditing(false)
      toast.success("Profile Updated", {
        id: toastId,
        description: "Your profile has been updated successfully.",
      })
    } catch (error: any) {
      console.error("ERROR UPDATING PROFILE:", error)
      toast.error("Failed to Update Profile", {
        id: toastId,
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
    const toastId = toast.loading("Sending reset email...", {
      description: "Please wait.",
    })

    try {
      const { sendPasswordResetEmail } = await import("firebase/auth")
      await sendPasswordResetEmail(firebase.auth, passwordEmail)
      setPasswordSuccess(true)
      setPasswordEmail("")
      toast.success("Password Reset Email Sent", {
        id: toastId,
        description: "Please check your inbox for the password reset link.",
      })
    } catch (error: any) {
      console.error("ERROR SENDING PASSWORD RESET:", error)
      toast.error("Failed to Send Reset Email", {
        id: toastId,
        description: "An error occurred. Please try again.",
      })
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user || !firebase.initialized || !firebase.storage) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File Too Large", {
        description: "Please select an image smaller than 5MB.",
      })
      return
    }

    setAvatarLoading(true)
    const toastId = toast.loading("Uploading avatar...", {
      description: "Please wait while we upload your profile picture.",
    })

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
        id: toastId,
        description: "Your profile picture has been updated successfully.",
      })
    } catch (error: any) {
      console.error("ERROR UPLOADING AVATAR:", error)
      toast.error("Failed to Upload Avatar", {
        id: toastId,
        description: "An error occurred while uploading. Please try again.",
      })
    } finally {
      setAvatarLoading(false)
    }
  }

  const handleCoverPhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user || !firebase.initialized || !firebase.storage) return

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File Too Large", {
        description: "Please select an image smaller than 10MB.",
      })
      return
    }

    setCoverLoading(true)
    const toastId = toast.loading("Uploading cover photo...", {
      description: "Please wait while we upload your cover photo.",
    })

    try {
      const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage")

      // Create a unique filename
      const fileExt = file.name.split(".").pop()
      const fileName = `covers/${user.uid}-${Date.now()}.${fileExt}`

      // Upload file to Firebase Storage
      const storageRef = ref(firebase.storage, fileName)
      const snapshot = await uploadBytes(storageRef, file)

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref)

      // Update profile with new cover photo URL
      const { error } = await updateProfile({
        cover_photo_url: downloadURL,
      })

      if (error) {
        throw error
      }

      toast.success("Cover Photo Updated", {
        id: toastId,
        description: "Your cover photo has been updated successfully.",
      })
    } catch (error: any) {
      console.error("ERROR UPLOADING COVER PHOTO:", error)
      toast.error("Failed to Upload Cover Photo", {
        id: toastId,
        description: "An error occurred while uploading. Please try again.",
      })
    } finally {
      setCoverLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleteLoading(true)
    const toastId = toast.loading("Deleting account...", {
      description: "This may take a moment. Please don't close this window.",
    })

    try {
      if (deleteAccount) {
        await deleteAccount()
        toast.success("Account Deleted", {
          id: toastId,
          description: "Your account has been permanently deleted.",
        })
      } else {
        throw new Error("Delete account function not available")
      }
    } catch (error: any) {
      console.error("ERROR DELETING ACCOUNT:", error)
      toast.error("Failed to Delete Account", {
        id: toastId,
        description: error.message || "An error occurred. Please try again.",
      })
    } finally {
      setDeleteLoading(false)
      setDeleteDialogOpen(false)
    }
  }

  if (!firebase.initialized) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
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

      {/* COVER PHOTO SECTION */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-white/30 dark:border-gray-700/30 shadow-lg overflow-hidden">
        <div className="relative h-48 md:h-64 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600">
          {profile?.cover_photo_url ? (
            <Image
              src={profile.cover_photo_url}
              alt="Cover photo"
              fill
              className="object-cover"
              unoptimized
            />
          ) : null}
          <div className="absolute inset-0 bg-black/20" />
          <label className="absolute bottom-4 right-4 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2 cursor-pointer transition-all duration-200 flex items-center gap-2 shadow-lg">
            {coverLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Uploading...</span>
              </>
            ) : (
              <>
                <ImageIcon className="h-4 w-4" />
                <span className="text-sm">{profile?.cover_photo_url ? "Change Cover" : "Add Cover Photo"}</span>
              </>
            )}
            <input type="file" accept="image/*" onChange={handleCoverPhotoUpload} className="hidden" disabled={coverLoading} />
          </label>
        </div>
        <CardContent className="p-6 -mt-16 md:-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="relative">
              <Avatar className="h-24 w-24 md:h-32 md:w-32 ring-4 ring-background shadow-xl">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-2xl md:text-3xl">
                  {profile?.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 bg-primary hover:bg-primary/90 text-white rounded-full p-2 cursor-pointer transition-all duration-200 shadow-lg hover:scale-110">
                {avatarLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Camera className="h-5 w-5" />
                )}
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={avatarLoading} />
              </label>
            </div>
            <div className="flex-1 pt-16 md:pt-20">
              <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-1">
                {profile?.full_name || "No name set"}
              </h3>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
              {profile?.professional_title && (
                <p className="text-sm text-muted-foreground mt-1">{profile.professional_title}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PROFILE INFORMATION */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-white/30 dark:border-gray-700/30 shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information and preferences</CardDescription>
            </div>
            {!isEditing ? (
              <Button variant="outline" onClick={() => setIsEditing(true)} className="hover:bg-primary/10 hover:border-primary/50 w-full md:w-auto">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <Button variant="outline" onClick={handleCancel} disabled={loading} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
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
              className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
            >
              {passwordLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Email"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* DELETE ACCOUNT */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-white/30 dark:border-gray-700/30 shadow-lg border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Delete Account
          </CardTitle>
          <CardDescription>Permanently delete your account and all associated data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Once you delete your account, there is no going back. Please be certain. All your interviews, profile data, and uploaded images will be permanently deleted.
          </p>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            className="w-full"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete My Account
          </Button>
        </CardContent>
      </Card>

      {/* DELETE CONFIRMATION DIALOG */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers. This includes:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All your interview records</li>
                <li>Your profile information</li>
                <li>All uploaded images (avatar and cover photo)</li>
                <li>Account settings and preferences</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Yes, delete my account"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
