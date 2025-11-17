"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Shield, Lock, Users, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Rules() {
  return (
    <div className="space-y-6 animate-fadeInUp max-w-4xl mx-auto">
      <div className="hidden md:block">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
          Terms & Conditions
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Please read our terms of service and privacy policy</p>
      </div>

      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-white/30 dark:border-gray-700/30 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Terms of Service
          </CardTitle>
          <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <section>
            <h3 className="font-semibold text-foreground mb-2">1. Acceptance of Terms</h3>
            <p>
              By accessing and using Interfy, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">2. Use License</h3>
            <p>
              Permission is granted to temporarily use Interfy for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose</li>
              <li>Attempt to reverse engineer any software contained in Interfy</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">3. User Accounts</h3>
            <p>
              You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">4. Data and Privacy</h3>
            <p>
              Your data is stored securely and encrypted. We do not share your personal information with third parties without your consent, except as required by law.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">5. Prohibited Uses</h3>
            <p>You may not use Interfy:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>In any way that violates any applicable law or regulation</li>
              <li>To transmit any malicious code or viruses</li>
              <li>To impersonate or attempt to impersonate another user</li>
              <li>In any way that infringes upon the rights of others</li>
            </ul>
          </section>
        </CardContent>
      </Card>

      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-white/30 dark:border-gray-700/30 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy Policy
          </CardTitle>
          <CardDescription>How we collect, use, and protect your information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <section>
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Information We Collect
            </h3>
            <p>
              We collect information that you provide directly to us, including your name, email address, and any information you choose to include in your profile.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              How We Use Your Information
            </h3>
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Data Security
            </h3>
            <p>
              We implement appropriate security measures to protect your personal information. All data is encrypted in transit and at rest. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Your Rights
            </h3>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
            </ul>
          </section>
        </CardContent>
      </Card>

      <div className="flex justify-center pt-4">
        <Link href="/settings">
          <Button variant="outline">
            Back to Settings
          </Button>
        </Link>
      </div>
    </div>
  )
}

