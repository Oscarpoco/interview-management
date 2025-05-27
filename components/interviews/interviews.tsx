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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Search, Edit, Trash2, Calendar, Building2, UserIcon, Briefcase } from "lucide-react"
import { format } from "date-fns"
import { useSearchParams } from "next/navigation"

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
      alert("User not authenticated or Firebase not initialized")
      return
    }

    setSaving(true)

    try {
      const { collection, addDoc, updateDoc, doc, serverTimestamp } = await import("firebase/firestore")

      console.log("Current user:", user.uid)
      console.log("Form data:", formData)

      if (editingInterview) {
        // UPDATE INTERVIEW
        const interviewRef = doc(firebase.db, "interviews", editingInterview.id)
        await updateDoc(interviewRef, {
          ...formData,
          updated_at: serverTimestamp(),
        })

        console.log("Interview updated successfully")
        alert("Interview updated successfully!")
      } else {
        // CREATE NEW INTERVIEW
        const insertData: InsertInterview = {
          ...formData,
          user_id: user.uid,
        }

        console.log("Creating interview with:", insertData)

        await addDoc(collection(firebase.db, "interviews"), {
          ...insertData,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        })

        console.log("Interview created successfully")
        alert("Interview created successfully!")
      }

      resetForm()
      setIsDialogOpen(false)
    } catch (error: any) {
      console.error("ERROR SAVING INTERVIEW:", error)
      alert(`Failed to save interview: ${error.message || "Unknown error"}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("ARE YOU SURE YOU WANT TO DELETE THIS INTERVIEW?")) return

    if (!firebase.initialized || !firebase.db) {
      alert("Firebase not initialized")
      return
    }

    try {
      const { deleteDoc, doc } = await import("firebase/firestore")

      console.log("Deleting interview:", id)
      await deleteDoc(doc(firebase.db, "interviews", id))
      console.log("Interview deleted successfully")
      alert("Interview deleted successfully!")
    } catch (error: any) {
      console.error("ERROR DELETING INTERVIEW:", error)
      alert("Failed to delete interview. Please try again.")
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
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">INTERVIEWS</h1>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              ADD INTERVIEW
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingInterview ? "EDIT INTERVIEW" : "ADD NEW INTERVIEW"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">COMPANY NAME</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="job_position">JOB POSITION</Label>
                <Input
                  id="job_position"
                  value={formData.job_position}
                  onChange={(e) => setFormData({ ...formData, job_position: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interviewer_name">INTERVIEWER NAME</Label>
                <Input
                  id="interviewer_name"
                  value={formData.interviewer_name}
                  onChange={(e) => setFormData({ ...formData, interviewer_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interview_date">INTERVIEW DATE</Label>
                <Input
                  id="interview_date"
                  type="date"
                  value={formData.interview_date}
                  onChange={(e) => setFormData({ ...formData, interview_date: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>PRIORITY</Label>
                  <Select
                    value={formData.priority_level}
                    onValueChange={(value: "High" | "Medium" | "Low") =>
                      setFormData({ ...formData, priority_level: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">HIGH</SelectItem>
                      <SelectItem value="Medium">MEDIUM</SelectItem>
                      <SelectItem value="Low">LOW</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>STATUS</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "Pending" | "Passed" | "Failed" | "No Feedback") =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">PENDING</SelectItem>
                      <SelectItem value="Passed">PASSED</SelectItem>
                      <SelectItem value="Failed">FAILED</SelectItem>
                      <SelectItem value="No Feedback">NO FEEDBACK</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1" disabled={saving}>
                  {saving ? "SAVING..." : editingInterview ? "UPDATE" : "CREATE"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
                  CANCEL
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* FILTERS */}
      <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="SEARCH INTERVIEWS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/50 dark:bg-gray-700/50 border-white/20 dark:border-gray-600/20"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="STATUS" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ALL STATUS</SelectItem>
                <SelectItem value="Pending">PENDING</SelectItem>
                <SelectItem value="Passed">PASSED</SelectItem>
                <SelectItem value="Failed">FAILED</SelectItem>
                <SelectItem value="No Feedback">NO FEEDBACK</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="PRIORITY" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ALL PRIORITY</SelectItem>
                <SelectItem value="High">HIGH</SelectItem>
                <SelectItem value="Medium">MEDIUM</SelectItem>
                <SelectItem value="Low">LOW</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* INTERVIEWS LIST */}
      <div className="grid gap-4">
        {filteredInterviews.length === 0 ? (
          <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                  ? "NO INTERVIEWS MATCH YOUR FILTERS"
                  : "NO INTERVIEWS YET"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredInterviews.map((interview) => (
            <Card
              key={interview.id}
              className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-white/20 dark:border-gray-700/20 hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all duration-200"
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-gray-500" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {interview.company_name}
                        </h3>
                      </div>
                      <Badge className={getPriorityColor(interview.priority_level)}>{interview.priority_level}</Badge>
                      <Badge className={getStatusColor(interview.status)}>{interview.status}</Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-gray-500" />
                      <p className="text-gray-700 dark:text-gray-300 font-medium">{interview.job_position}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-gray-500 dark:text-gray-400">
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

                  <div className="flex gap-2">
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
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(interview.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
