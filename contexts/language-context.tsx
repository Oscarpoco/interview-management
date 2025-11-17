"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Language = "en" | "af" | "zu" | "xh" | "nso" | "st" | "tn" | "ts" | "ve" | "ss" | "nr"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  mounted: boolean
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.interviews": "Interviews",
    "nav.profile": "Profile",
    "nav.settings": "Settings",
    "nav.logout": "Logout",
    
    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.subtitle": "Overview of your interview statistics",
    "dashboard.total": "Total Interviews",
    "dashboard.pending": "Pending",
    "dashboard.passed": "Passed",
    "dashboard.failed": "Failed",
    "dashboard.noFeedback": "No Feedback",
    "dashboard.pendingInterviews": "Pending Interviews",
    "dashboard.pendingSubtitle": "Upcoming interviews that need your attention",
    "dashboard.search": "Search interviews...",
    "dashboard.addInterview": "Add Interview",
    "dashboard.noPending": "No pending interviews",
    "dashboard.allCaughtUp": "All caught up! No pending interviews at the moment. Great job staying organized!",
    
    // Interviews
    "interviews.title": "Interviews",
    "interviews.subtitle": "Manage and track all your job interviews",
    "interviews.add": "Add Interview",
    "interviews.search": "Search interviews...",
    "interviews.filter": "Filter",
    "interviews.status": "Status",
    "interviews.priority": "Priority",
    "interviews.all": "All",
    "interviews.pending": "Pending",
    "interviews.passed": "Passed",
    "interviews.failed": "Failed",
    "interviews.noFeedback": "No Feedback",
    "interviews.high": "High",
    "interviews.medium": "Medium",
    "interviews.low": "Low",
    "interviews.noInterviews": "No interviews yet",
    "interviews.getStarted": "Get started by adding your first interview to track your job search progress",
    "interviews.addFirst": "Add Your First Interview",
    "interviews.noMatches": "No matches found",
    "interviews.adjustFilters": "Try adjusting your filters to see more results",
    "interviews.edit": "Edit",
    "interviews.delete": "Delete",
    "interviews.deleteConfirm": "Are you sure?",
    "interviews.deleteDescription": "This action cannot be undone. This will permanently delete the interview from your records.",
    "interviews.cancel": "Cancel",
    "interviews.company": "Company Name",
    "interviews.position": "Job Position",
    "interviews.interviewer": "Interviewer Name",
    "interviews.date": "Interview Date",
    "interviews.addNew": "Add New Interview",
    "interviews.editInterview": "Edit Interview",
    "interviews.fillDetails": "Fill in the details to create a new interview entry.",
    "interviews.updateDetails": "Update the interview details below.",
    "interviews.save": "Save",
    
    // Profile
    "profile.title": "Profile",
    "profile.subtitle": "Manage your personal information and account settings",
    "profile.edit": "Edit Profile",
    "profile.save": "Save Changes",
    "profile.cancel": "Cancel",
    "profile.fullName": "Full Name",
    "profile.professionalTitle": "Professional Title",
    "profile.employmentStatus": "Employment Status",
    "profile.avatar": "Profile Picture",
    "profile.cover": "Cover Photo",
    "profile.changePassword": "Change Password",
    "profile.passwordEmail": "Email Address",
    "profile.sendReset": "Send Reset Link",
    "profile.deleteAccount": "Delete Account",
    "profile.deleteWarning": "This action cannot be undone. This will permanently delete your account and all associated data.",
    "profile.deleteConfirm": "Yes, delete my account",
    
    // Settings
    "settings.title": "Settings",
    "settings.subtitle": "Manage your account settings and preferences",
    "settings.general": "General",
    "settings.notifications": "Notifications",
    "settings.privacy": "Privacy",
    "settings.about": "About",
    "settings.appearance": "Appearance",
    "settings.appearanceDesc": "Customize the look and feel of the application",
    "settings.theme": "Theme",
    "settings.themeDesc": "Choose between light and dark mode",
    "settings.light": "Light",
    "settings.dark": "Dark",
    "settings.language": "Language",
    "settings.languageNote": "Note: The application interface is currently available in English only. Language selection is for future updates.",
    "settings.timezone": "Timezone",
    "settings.dataManagement": "Data Management",
    "settings.dataDesc": "Export or manage your data",
    "settings.export": "Export Data",
    "settings.exportDesc": "Download a copy of all your data",
    "settings.exportBtn": "Export",
    "settings.notificationPrefs": "Notification Preferences",
    "settings.notificationDesc": "Control how you receive notifications",
    "settings.emailNotifications": "Email Notifications",
    "settings.emailDesc": "Receive notifications via email",
    "settings.reminders": "Interview Reminders",
    "settings.remindersDesc": "Get reminded about upcoming interviews",
    "settings.privacySecurity": "Privacy & Security",
    "settings.privacyDesc": "Manage your privacy and security settings",
    "settings.accountInfo": "Account Information",
    "settings.accountDesc": "Your data is encrypted and stored securely. We never share your information with third parties.",
    "settings.email": "Email:",
    "settings.accountCreated": "Account Created:",
    "settings.privacyPolicy": "Privacy Policy",
    "settings.privacyPolicyDesc": "Read our privacy policy to understand how we handle your data.",
    "settings.viewPolicy": "View Privacy Policy",
    "settings.aboutInterfy": "About Interfy",
    "settings.aboutDesc": "Information about the application",
    "settings.version": "Version",
    "settings.build": "Build",
    "settings.production": "Production",
    "settings.features": "Features",
    "settings.terms": "Terms & Conditions",
    
    // Auth
    "auth.signIn": "Sign In",
    "auth.signUp": "Sign Up",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.fullName": "Full Name",
    "auth.createAccount": "Create Account",
    "auth.signingIn": "Signing in...",
    "auth.creating": "Creating account...",
    "auth.dontHaveAccount": "Don't have an account?",
    "auth.alreadyHaveAccount": "Already have an account?",
    "auth.signInWithGoogle": "Sign in with Google",
    "auth.acceptTerms": "I agree to the Terms and Conditions and Privacy Policy",
    
    // Common
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.close": "Close",
  },
  // Placeholder translations - all languages default to English for now
  af: {},
  zu: {},
  xh: {},
  nso: {},
  st: {},
  tn: {},
  ts: {},
  ve: {},
  ss: {},
  nr: {},
}

// Helper function to get nested translation
function getTranslation(lang: Language, key: string): string {
  const langTranslations = translations[lang] || translations.en
  return langTranslations[key] || translations.en[key] || key
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Get language from localStorage or default to English
    const savedLanguage = localStorage.getItem("language") as Language | null
    if (savedLanguage && translations[savedLanguage]) {
      setLanguageState(savedLanguage)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("language", lang)
  }

  const t = (key: string): string => {
    return getTranslation(language, key)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, mounted }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

