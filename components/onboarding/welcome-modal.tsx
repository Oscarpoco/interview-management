"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Briefcase, CheckCircle2, Calendar, BarChart3, Sparkles } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export function WelcomeModal() {
  const { profile, updateProfile } = useAuth()
  const [open, setOpen] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Show modal if user hasn't accepted terms or completed onboarding
    if (profile && (!profile.terms_accepted || !profile.onboarding_completed)) {
      setOpen(true)
    }
  }, [profile])

  const handleAcceptTerms = async () => {
    if (!termsAccepted) {
      toast.error("Please accept the terms and conditions", {
        description: "You must accept the terms to continue.",
      })
      return
    }

    setLoading(true)
    const toastId = toast.loading("Saving your preferences...", {
      description: "Please wait.",
    })

    try {
      await updateProfile({
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString(),
        onboarding_completed: true,
      })
      toast.success("Welcome to Interfy!", {
        id: toastId,
        description: "You're all set. Let's get started!",
      })
      setOpen(false)
    } catch (error: any) {
      toast.error("Error", {
        id: toastId,
        description: "Failed to save preferences. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!profile) return null

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto z-[99999]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Welcome to Interfy!</DialogTitle>
              <DialogDescription>Let's get you started</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Features Overview */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20">
              <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2" />
              <h3 className="font-semibold mb-1">Track Interviews</h3>
              <p className="text-sm text-muted-foreground">
                Organize and manage all your job interviews in one place
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
              <BarChart3 className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-2" />
              <h3 className="font-semibold mb-1">Analytics Dashboard</h3>
              <p className="text-sm text-muted-foreground">
                View statistics and insights about your interview progress
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400 mb-2" />
              <h3 className="font-semibold mb-1">Status Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Keep track of interview outcomes and feedback
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-500/10 to-transparent border border-yellow-500/20">
              <Sparkles className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mb-2" />
              <h3 className="font-semibold mb-1">Smart Features</h3>
              <p className="text-sm text-muted-foreground">
                Real-time sync, dark mode, and mobile-friendly design
              </p>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                className="mt-1"
              />
              <div className="flex-1 space-y-1">
                <Label htmlFor="terms" className="text-sm font-medium leading-none cursor-pointer">
                  I accept the Terms and Conditions
                </Label>
                <p className="text-xs text-muted-foreground">
                  By continuing, you agree to our{" "}
                  <Link href="/rules" className="text-primary hover:underline" target="_blank">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/rules" className="text-primary hover:underline" target="_blank">
                    Privacy Policy
                  </Link>
                  . You must be at least 18 years old to use this service.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleAcceptTerms}
              disabled={!termsAccepted || loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? "Saving..." : "Get Started"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                // User must accept terms to continue
                if (!termsAccepted) {
                  toast.error("Terms Required", {
                    description: "You must accept the terms and conditions to continue.",
                  })
                }
              }}
              className="sm:w-auto"
            >
              <Link href="/rules" target="_blank" className="w-full">
                Read Full Terms
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

