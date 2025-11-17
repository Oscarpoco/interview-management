"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useFirebase } from "@/hooks/use-firebase"
import type { Interview } from "@/lib/database.types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, CheckCircle, XCircle, Plus, Search, Building2, UserIcon } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface DashboardStats {
  total: number
  pending: number
  passed: number
  failed: number
  noFeedback: number
}

export function Dashboard() {
  const { user } = useAuth()
  const firebase = useFirebase()
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    pending: 0,
    passed: 0,
    failed: 0,
    noFeedback: 0,
  })
  const [pendingInterviews, setPendingInterviews] = useState<Interview[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && firebase.initialized && firebase.db) {
      const setupFirestore = async () => {
        try {
          const { collection, query, where, onSnapshot } = await import("firebase/firestore")

          const q = query(collection(firebase.db!, "interviews"), where("user_id", "==", user.uid))

          const unsubscribe = onSnapshot(
            q,
            (querySnapshot) => {
              const allInterviews: Interview[] = []
              const pending: Interview[] = []

              querySnapshot.forEach((doc) => {
                const data = doc.data()
                const interview = {
                  id: doc.id,
                  ...data,
                  created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
                  updated_at: data.updated_at?.toDate?.()?.toISOString() || data.updated_at,
                } as Interview

                allInterviews.push(interview)

                if (interview.status === "Pending") {
                  pending.push(interview)
                }
              })

              // Calculate stats
              const newStats = allInterviews.reduce(
                (acc, interview) => {
                  acc.total++
                  switch (interview.status) {
                    case "Pending":
                      acc.pending++
                      break
                    case "Passed":
                      acc.passed++
                      break
                    case "Failed":
                      acc.failed++
                      break
                    case "No Feedback":
                      acc.noFeedback++
                      break
                  }
                  return acc
                },
                { total: 0, pending: 0, passed: 0, failed: 0, noFeedback: 0 },
              )

              setStats(newStats)

              // Sort pending interviews by date
              pending.sort((a, b) => new Date(a.interview_date).getTime() - new Date(b.interview_date).getTime())
              setPendingInterviews(pending)
              setLoading(false)
            },
            (error) => {
              console.error("ERROR FETCHING DASHBOARD DATA:", error)
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
  }, [user, firebase.initialized, firebase.db])

  const filteredInterviews = pendingInterviews.filter(
    (interview) =>
      interview.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.job_position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.interviewer_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
        {/* LOADING SKELETON */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 mt-10 md:mt-0 animate-fadeInUp">
      {/* HEADER */}
      <div className="hidden md:block">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your interview statistics</p>
      </div>

      {/* STATISTICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-5 md:pt-0">
        <Card className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/20 backdrop-blur-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Interviews</p>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{stats.total}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10">
                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 via-yellow-500/5 to-transparent border-yellow-500/20 backdrop-blur-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">No Feedback</p>
                <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">{stats.noFeedback}</p>
              </div>
              <div className="p-3 rounded-xl bg-yellow-500/10">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border-green-500/20 backdrop-blur-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Passed</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">{stats.passed}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/10">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border-red-500/20 backdrop-blur-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Failed</p>
                <p className="text-3xl font-bold text-red-700 dark:text-red-300">{stats.failed}</p>
              </div>
              <div className="p-3 rounded-xl bg-red-500/10">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PENDING INTERVIEWS SECTION */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-white/30 dark:border-gray-700/30 shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-semibold">Pending Interviews</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Upcoming interviews that need your attention</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search interviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50 focus:border-primary/50"
                />
              </div>
              <Link href="/interviews?action=add">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Interview
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredInterviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-muted/50 p-6">
                  <Calendar className="h-12 w-12 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {searchTerm ? "No matches found" : "No pending interviews"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm ? "Try adjusting your search" : "All caught up! No pending interviews at the moment."}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredInterviews.map((interview, index) => (
                <div
                  key={interview.id}
                  className="p-5 rounded-xl bg-white/50 dark:bg-gray-700/50 border border-border/50 hover:bg-white/70 dark:hover:bg-gray-700/70 hover:shadow-md transition-all duration-300 animate-fadeInUp"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="font-semibold text-foreground">{interview.company_name}</h3>
                        <Badge variant="outline" className={getPriorityColor(interview.priority_level)}>
                          {interview.priority_level}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">{interview.job_position}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <UserIcon className="h-3 w-3" />
                          {interview.interviewer_name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(interview.interview_date), "MMM dd, yyyy")}
                        </div>
                      </div>
                    </div>
                    <Link href={`/interviews?edit=${interview.id}`}>
                      <Button variant="outline" size="sm" className="hover:bg-primary/10 hover:border-primary/50">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
