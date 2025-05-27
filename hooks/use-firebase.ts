"use client"

import { useState, useEffect } from "react"
import type { FirebaseApp } from "firebase/app"
import type { Auth } from "firebase/auth"
import type { Firestore } from "firebase/firestore"
import type { FirebaseStorage } from "firebase/storage"

interface FirebaseServices {
  app: FirebaseApp | null
  auth: Auth | null
  db: Firestore | null
  storage: FirebaseStorage | null
  initialized: boolean
  error: string | null
}

export function useFirebase(): FirebaseServices {
  const [services, setServices] = useState<FirebaseServices>({
    app: null,
    auth: null,
    db: null,
    storage: null,
    initialized: false,
    error: null,
  })

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return

    const initializeFirebase = async () => {
      try {
        console.log("Starting Firebase initialization...")

        // Dynamic imports to ensure client-side only loading
        const { initializeApp, getApps, getApp } = await import("firebase/app")
        const { getAuth } = await import("firebase/auth")
        const { getFirestore } = await import("firebase/firestore")
        const { getStorage } = await import("firebase/storage")

        const firebaseConfig = {
          apiKey: "AIzaSyBk5AKIhZoeTKfAV-yOXFAiK-iQXOGuaAs",
          authDomain: "hotel-application-79f01.firebaseapp.com",
          projectId: "hotel-application-79f01",
          storageBucket: "hotel-application-79f01.appspot.com",
          messagingSenderId: "14539111292",
          appId: "1:14539111292:web:69d44f098f6be605aa82f9",
          measurementId: "G-WNZEJ3R685"
        }

        console.log("Firebase config:", { ...firebaseConfig, apiKey: "***" })

        // Initialize Firebase app
        const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
        console.log("Firebase app initialized")

        // Initialize services
        const auth = getAuth(app)
        const db = getFirestore(app)
        const storage = getStorage(app)

        console.log("Firebase services initialized")

        setServices({
          app,
          auth,
          db,
          storage,
          initialized: true,
          error: null,
        })
      } catch (error: any) {
        console.error("Firebase initialization error:", error)
        setServices({
          app: null,
          auth: null,
          db: null,
          storage: null,
          initialized: false,
          error: error.message || "Failed to initialize Firebase",
        })
      }
    }

    initializeFirebase()
  }, [])

  return services
}
