"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"
import { useFirebase } from "@/hooks/use-firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Shield, Database, Mail, Globe, Moon, Sun, Download, FileText, Info } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export function Settings() {
  const { profile, user } = useAuth()
  const { theme, toggleTheme, mounted } = useTheme()
  const firebase = useFirebase()
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    reminders: true,
  })
  const [language, setLanguage] = useState("en")
  const [timezone, setTimezone] = useState("UTC")

  const handleExportData = async () => {
    const toastId = toast.loading("Preparing your data export...", {
      description: "This may take a moment.",
    })

    try {
      if (!user) {
        throw new Error("User not authenticated")
      }

      if (!firebase.db) {
        throw new Error("Database not initialized")
      }

      const { collection, query, where, getDocs } = await import("firebase/firestore")

      // Fetch all user interviews
      const interviewsQuery = query(collection(firebase.db, "interviews"), where("user_id", "==", user.uid))
      const interviewsSnapshot = await getDocs(interviewsQuery)

      const interviews = interviewsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate?.()?.toISOString() || doc.data().created_at,
        updated_at: doc.data().updated_at?.toDate?.()?.toISOString() || doc.data().updated_at,
      }))

      // Create export data
      const exportData = {
        profile: {
          email: profile?.email,
          full_name: profile?.full_name,
          professional_title: profile?.professional_title,
          employment_status: profile?.employment_status,
          created_at: profile?.created_at,
        },
        interviews: interviews,
        export_date: new Date().toISOString(),
        total_interviews: interviews.length,
      }

      // Create and download JSON file
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `interfy-export-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success("Data Export Complete", {
        id: toastId,
        description: "Your data has been downloaded successfully.",
      })
    } catch (error: any) {
      console.error("Export error:", error)
      toast.error("Export Failed", {
        id: toastId,
        description: error.message || "Failed to export data. Please try again.",
      })
    }
  }

  return (
    <div className="space-y-6 animate-fadeInUp">
      <div className="hidden md:block">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        {/* GENERAL SETTINGS */}
        <TabsContent value="general" className="space-y-4">
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-white/30 dark:border-gray-700/30 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>Customize the look and feel of the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="theme">Theme</Label>
                  <p className="text-sm text-muted-foreground">Choose between light and dark mode</p>
                </div>
                {mounted && (
                  <Button variant="outline" onClick={toggleTheme} className="w-32">
                    {theme === "dark" ? (
                      <>
                        <Sun className="h-4 w-4 mr-2" />
                        Light
                      </>
                    ) : (
                      <>
                        <Moon className="h-4 w-4 mr-2" />
                        Dark
                      </>
                    )}
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language" className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger id="timezone" className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="EST">Eastern Time (EST)</SelectItem>
                    <SelectItem value="PST">Pacific Time (PST)</SelectItem>
                    <SelectItem value="GMT">Greenwich Mean Time (GMT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-white/30 dark:border-gray-700/30 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Management
              </CardTitle>
              <CardDescription>Export or manage your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Export Data</Label>
                  <p className="text-sm text-muted-foreground">Download a copy of all your data</p>
                </div>
                <Button variant="outline" onClick={handleExportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NOTIFICATIONS */}
        <TabsContent value="notifications" className="space-y-4">
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-white/30 dark:border-gray-700/30 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Control how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={notifications.push}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="reminders">Interview Reminders</Label>
                  <p className="text-sm text-muted-foreground">Get reminded about upcoming interviews</p>
                </div>
                <Switch
                  id="reminders"
                  checked={notifications.reminders}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, reminders: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PRIVACY */}
        <TabsContent value="privacy" className="space-y-4">
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-white/30 dark:border-gray-700/30 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
              <CardDescription>Manage your privacy and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Account Information</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Your data is encrypted and stored securely. We never share your information with third parties.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{user?.email || "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account Created:</span>
                    <span className="font-medium">
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Privacy Policy</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Read our privacy policy to understand how we handle your data.
                </p>
                <Link href="/rules">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <FileText className="h-4 w-4 mr-2" />
                    View Privacy Policy
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABOUT */}
        <TabsContent value="about" className="space-y-4">
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-white/30 dark:border-gray-700/30 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                About Interfy
              </CardTitle>
              <CardDescription>Information about the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version</span>
                  <span className="font-medium">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Build</span>
                  <span className="font-medium">Production</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2">Features</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Track and manage job interviews</li>
                  <li>• Real-time data synchronization</li>
                  <li>• Secure cloud storage</li>
                  <li>• Dark/Light theme support</li>
                  <li>• Mobile-responsive design</li>
                </ul>
              </div>

              <div className="pt-4 border-t">
                <Link href="/rules">
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Terms & Conditions
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

