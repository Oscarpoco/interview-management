"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "firebase/auth"
import type { Profile } from "@/lib/database.types"
import { useFirebase } from "@/hooks/use-firebase"

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  initialized: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const firebase = useFirebase()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!firebase.initialized || !firebase.auth || !firebase.db) {
      return
    }

    const setupAuth = async () => {
      try {
        const { onAuthStateChanged } = await import("firebase/auth")

        console.log("Setting up auth state listener...")

        const unsubscribe = onAuthStateChanged(firebase.auth!, async (user) => {
          console.log("Auth state changed:", user?.uid || "no user")
          setUser(user)

          if (user) {
            await fetchOrCreateProfile(user)
          } else {
            setProfile(null)
            setLoading(false)
          }
        })

        return unsubscribe
      } catch (error) {
        console.error("Error setting up auth:", error)
        setLoading(false)
      }
    }

    let unsubscribe: (() => void) | undefined

    setupAuth().then((unsub) => {
      unsubscribe = unsub
    })

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [firebase.initialized, firebase.auth, firebase.db])

  const fetchOrCreateProfile = async (user: User) => {
    if (!firebase.db) return

    try {
      console.log("Fetching profile for user:", user.uid)
      const { doc, getDoc, setDoc, serverTimestamp } = await import("firebase/firestore")

      const profileRef = doc(firebase.db, "profiles", user.uid)
      const profileSnap = await getDoc(profileRef)

      if (profileSnap.exists()) {
        console.log("Profile found:", profileSnap.data())
        const profileData = profileSnap.data()
        setProfile({
          id: profileSnap.id,
          ...profileData,
          // Convert Firestore timestamps to strings
          created_at: profileData.created_at?.toDate?.()?.toISOString() || profileData.created_at,
          updated_at: profileData.updated_at?.toDate?.()?.toISOString() || profileData.updated_at,
        } as Profile)
      } else {
        // Create new profile
        console.log("Profile not found, creating new profile...")
        const newProfile = {
          email: user.email!,
          full_name: user.displayName || "",
          professional_title: null,
          employment_status: null,
          avatar_url: user.photoURL || null,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        }

        await setDoc(profileRef, newProfile)

        console.log("Profile created successfully")
        setProfile({
          id: user.uid,
          email: user.email!,
          full_name: user.displayName || "",
          professional_title: null,
          employment_status: null,
          avatar_url: user.photoURL || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error("ERROR IN fetchOrCreateProfile:", error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!firebase.initialized || !firebase.auth) {
      return { error: "Firebase not initialized" }
    }

    try {
      const { signInWithEmailAndPassword } = await import("firebase/auth")
      console.log("Attempting to sign in...")
      await signInWithEmailAndPassword(firebase.auth, email, password)
      return { error: null }
    } catch (error: any) {
      console.error("SIGNIN ERROR:", error)
      return { error: error.message || "Failed to sign in" }
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!firebase.initialized || !firebase.auth) {
      return { error: "Firebase not initialized" }
    }

    try {
      const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth")
      console.log("Attempting to sign up...")
      const { user } = await createUserWithEmailAndPassword(firebase.auth, email, password)

      // Update the user's display name
      await updateProfile(user, {
        displayName: fullName,
      })

      return { error: null }
    } catch (error: any) {
      console.error("SIGNUP ERROR:", error)
      return { error: error.message || "Failed to create account" }
    }
  }

  const signOut = async () => {
    if (!firebase.initialized || !firebase.auth) return

    try {
      const { signOut: firebaseSignOut } = await import("firebase/auth")
      await firebaseSignOut(firebase.auth)
    } catch (error) {
      console.error("SIGNOUT ERROR:", error)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !firebase.initialized || !firebase.db) {
      return { error: new Error("NO USER OR FIREBASE NOT INITIALIZED") }
    }

    try {
      const { doc, updateDoc, serverTimestamp } = await import("firebase/firestore")

      const profileRef = doc(firebase.db, "profiles", user.uid)
      const updateData = {
        ...updates,
        updated_at: serverTimestamp(),
      }

      console.log("Updating profile with:", updateData)

      await updateDoc(profileRef, updateData)

      // Update local state
      const updatedProfile = {
        ...profile!,
        ...updates,
        updated_at: new Date().toISOString(),
      }
      setProfile(updatedProfile)

      console.log("Profile updated successfully")
      return { error: null }
    } catch (error: any) {
      console.error("UPDATE PROFILE ERROR:", error)
      return { error: error.message || "Failed to update profile" }
    }
  }

  const value = {
    user,
    profile,
    loading,
    initialized: firebase.initialized,
    error: firebase.error,
    signIn,
    signUp,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
