"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useFirebase } from "@/hooks/use-firebase"
import type { Interview, InsertInterview } from "@/lib/database.types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Plus, Search, Edit, Trash2, Calendar, Building2, UserIcon, Briefcase, Filter } from "lucide-react"
import { format } from "date-fns"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"

export function Interviews() {
  const { user, profile } = useAuth()
  const firebase = useFirebase()
  const searchParams = useSearchParams()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [filteredInterviews, setFilteredInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [interviewToDelete, setInterviewToDelete] = useState<string | null>(null)

  // FORM STATE
  const [formData, setFormData] = useState({
    company_name: "",
    interview_date: "",
    interviewer_name: "",
    job_position: "",
    priority_level: "Medium" as "High" | "Medium" | "Low",
    status: "Pending" as "Pending" | "Passed" | "Failed" | "No Feedback",
  })

  useEffect(() => {
    if (user && profile && firebase.initialized && firebase.db) {
      const setupFirestore = async () => {
        try {
          const { collection, query, where, orderBy, onSnapshot } = await import("firebase/firestore")

          const q = query(
            collection(firebase.db!, "interviews"),
            where("user_id", "==", user.uid),
            orderBy("interview_date", "desc"),
          )

          const unsubscribe = onSnapshot(
            q,
            (querySnapshot) => {
              const interviewsData: Interview[] = []
              querySnapshot.forEach((doc) => {
                const data = doc.data()
                interviewsData.push({
                  id: doc.id,
                  ...data,
                  // Convert Firestore timestamps to ISO strings
                  created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
                  updated_at: data.updated_at?.toDate?.()?.toISOString() || data.updated_at,
                } as Interview)
              })
              console.log("Fetched interviews:", interviewsData)
              setInterviews(interviewsData)
              setLoading(false)
            },
            (error) => {
              console.error("Error fetching interviews:", error)
              setLoading(false)
            },
          )

          return unsubscribe
        } catch (error) {
          console.error("Error setting up Firestore:", error)
          setLoading(false)
        }
      }

      let unsubscribe: (() => void) | undefined

      setupFirestore().then((unsub) => {
        unsubscribe = unsub
      })

      return () => {
        if (unsubscribe) {
          unsubscribe()
        }
      }
    }
  }, [user, profile, firebase.initialized, firebase.db])

  useEffect(() => {
    // CHECK URL PARAMS FOR ACTIONS
    const action = searchParams.get("action")
    const editId = searchParams.get("edit")

    if (action === "add") {
      setIsDialogOpen(true)
    } else if (editId) {
      const interview = interviews.find((i) => i.id === editId)
      if (interview) {
        setEditingInterview(interview)
        setFormData({
          company_name: interview.company_name,
          interview_date: interview.interview_date.split("T")[0],
          interviewer_name: interview.interviewer_name,
          job_position: interview.job_position,
          priority_level: interview.priority_level,
          status: interview.status,
        })
        setIsDialogOpen(true)
      }
    }
  }, [searchParams, interviews])

  useEffect(() => {
    // FILTER INTERVIEWS
    let filtered = interviews

    if (searchTerm) {
      filtered = filtered.filter(
        (interview) =>
          interview.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          interview.job_position.toLowerCase().includes(searchTerm.toLowerCase()) ||
          interview.interviewer_name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((interview) => interview.status === statusFilter)
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((interview) => interview.priority_level === priorityFilter)
    }

    setFilteredInterviews(filtered)
  }, [interviews, searchTerm, statusFilter, priorityFilter])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !profile || !firebase.initialized || !firebase.db) {
      toast.error("Authentication Error", {
        description: "User not authenticated or Firebase not initialized",
      })
      return
    }

    setSaving(true)
    const toastId = toast.loading(
      editingInterview ? "Updating interview..." : "Creating interview...",
      {
        description: "Please wait while we save your changes.",
      }
    )

    try {
      const { collection, addDoc, updateDoc, doc, serverTimestamp } = await import("firebase/firestore")

      if (editingInterview) {
        // UPDATE INTERVIEW
        const interviewRef = doc(firebase.db, "interviews", editingInterview.id)
        await updateDoc(interviewRef, {
          ...formData,
          updated_at: serverTimestamp(),
        })

        toast.success("Interview Updated", {
          id: toastId,
          description: "Your interview has been updated successfully.",
        })
      } else {
        // CREATE NEW INTERVIEW
        const insertData: InsertInterview = {
          ...formData,
          user_id: user.uid,
        }

        await addDoc(collection(firebase.db, "interviews"), {
          ...insertData,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        })

        toast.success("Interview Created", {
          id: toastId,
          description: "Your new interview has been added successfully.",
        })
      }

      resetForm()
      setIsDialogOpen(false)
    } catch (error: any) {
      console.error("ERROR SAVING INTERVIEW:", error)
      toast.error("Failed to Save Interview", {
        id: toastId,
        description: error.message || "An unexpected error occurred. Please try again.",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setInterviewToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!interviewToDelete || !firebase.initialized || !firebase.db) {
      toast.error("Error", {
        description: "Firebase not initialized or interview ID missing",
      })
      return
    }

    const toastId = toast.loading("Deleting interview...", {
      description: "Please wait.",
    })

    try {
      const { deleteDoc, doc } = await import("firebase/firestore")

      await deleteDoc(doc(firebase.db, "interviews", interviewToDelete))
      toast.success("Interview Deleted", {
        id: toastId,
        description: "The interview has been removed successfully.",
      })
      setDeleteDialogOpen(false)
      setInterviewToDelete(null)
    } catch (error: any) {
      console.error("ERROR DELETING INTERVIEW:", error)
      toast.error("Failed to Delete", {
        id: toastId,
        description: "An error occurred while deleting the interview. Please try again.",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      company_name: "",
      interview_date: "",
      interviewer_name: "",
      job_position: "",
      priority_level: "Medium",
      status: "Pending",
    })
    setEditingInterview(null)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30"
      case "Medium":
        return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30"
      case "Low":
        return "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/30"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Passed":
        return "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30"
      case "Failed":
        return "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30"
      case "No Feedback":
        return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30"
      case "Pending":
        return "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30"
      default:
        return "bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/30"
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="hidden md:block">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Interviews
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and track all your job interviews</p>
        </div>
        <div className="w-full md:w-auto">
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) resetForm()
            }}
          >
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200">
                <Plus className="h-4 w-4 mr-2" />
                Add Interview
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-md z-[99999]">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {editingInterview ? "Edit Interview" : "Add New Interview"}
              </DialogTitle>
              <DialogDescription>
                {editingInterview ? "Update the interview details below." : "Fill in the details to create a new interview entry."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  required
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="job_position">Job Position</Label>
                <Input
                  id="job_position"
                  value={formData.job_position}
                  onChange={(e) => setFormData({ ...formData, job_position: e.target.value })}
                  required
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interviewer_name">Interviewer Name</Label>
                <Input
                  id="interviewer_name"
                  value={formData.interviewer_name}
                  onChange={(e) => setFormData({ ...formData, interviewer_name: e.target.value })}
                  required
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interview_date">Interview Date</Label>
                <Input
                  id="interview_date"
                  type="date"
                  value={formData.interview_date}
                  onChange={(e) => setFormData({ ...formData, interview_date: e.target.value })}
                  required
                  className="bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={formData.priority_level}
                    onValueChange={(value: "High" | "Medium" | "Low") =>
                      setFormData({ ...formData, priority_level: value })
                    }
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "Pending" | "Passed" | "Failed" | "No Feedback") =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Passed">Passed</SelectItem>
                      <SelectItem value="Failed">Failed</SelectItem>
                      <SelectItem value="No Feedback">No Feedback</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" disabled={saving}>
                  {saving ? "Saving..." : editingInterview ? "Update" : "Create"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* FILTERS */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-white/30 dark:border-gray-700/30 shadow-lg">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Filters</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search interviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50 border-border/50 focus:border-primary/50"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-background/50">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Passed">Passed</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
                <SelectItem value="No Feedback">No Feedback</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-background/50">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* INTERVIEWS LIST */}
      <div className="grid gap-4">
        {filteredInterviews.length === 0 ? (
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-white/30 dark:border-gray-700/30 shadow-lg">
            <CardContent className="p-8 md:p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-6 border border-primary/20">
                  <Calendar className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-semibold mb-2">
                    {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                      ? "No matches found"
                      : "No interviews yet"}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                      ? "Try adjusting your filters to see more results"
                      : "Get started by adding your first interview to track your job search progress"}
                  </p>
                  {!searchTerm && statusFilter === "all" && priorityFilter === "all" && (
                    <div className="mt-4">
                      <Button
                        onClick={() => setIsDialogOpen(true)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Interview
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredInterviews.map((interview, index) => (
            <Card
              key={interview.id}
              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-white/30 dark:border-gray-700/30 shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300 animate-fadeInUp"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {interview.company_name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={getPriorityColor(interview.priority_level)}>
                          {interview.priority_level}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(interview.status)}>
                          {interview.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <p className="text-foreground font-medium">{interview.job_position}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4" />
                        <span>{interview.interviewer_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(interview.interview_date), "MMM dd, yyyy")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 lg:flex-col">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingInterview(interview)
                        setFormData({
                          company_name: interview.company_name,
                          interview_date: interview.interview_date.split("T")[0],
                          interviewer_name: interview.interviewer_name,
                          job_position: interview.job_position,
                          priority_level: interview.priority_level,
                          status: interview.status,
                        })
                        setIsDialogOpen(true)
                      }}
                      className="hover:bg-primary/10 hover:border-primary/50"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(interview.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* DELETE CONFIRMATION DIALOG */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the interview from your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setInterviewToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
