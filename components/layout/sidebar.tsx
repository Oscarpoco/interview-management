"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LayoutDashboard, Calendar, User, LogOut, Moon, Sun, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "DASHBOARD", href: "/dashboard", icon: LayoutDashboard },
  { name: "INTERVIEWS", href: "/interviews", icon: Calendar },
  { name: "PROFILE", href: "/profile", icon: User },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { profile, signOut } = useAuth()
  const { theme, toggleTheme, mounted } = useTheme()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <>


      {/* MOBILE OVERLAY */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-[100] md:hidden" onClick={() => setIsOpen(false)} />}

      {/* MOBILE MENU BUTTON */}
      <div className="fixed top-0 w-full flex items-center justify-between z-[90] md:hidden p-3 px-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-border/50 shadow-lg">
        <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
          Interfy
        </h1>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border border-primary/20 hover:border-primary/40 transition-all duration-200 hover:scale-105 active:scale-95"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <div className="relative w-5 h-5">
            <span
              className={cn(
                "absolute top-0 left-0 w-5 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-300",
                isOpen ? "rotate-45 top-2" : "top-0"
              )}
            />
            <span
              className={cn(
                "absolute top-2 left-0 w-5 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-300",
                isOpen ? "opacity-0" : "opacity-100"
              )}
            />
            <span
              className={cn(
                "absolute top-4 left-0 w-5 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-300",
                isOpen ? "-rotate-45 top-2" : "top-4"
              )}
            />
          </div>
        </Button>
      </div>


      {/* SIDEBAR */}
      <div
        className={cn(
          "fixed left-0 top-0 z-[110] w-64 h-full transform transition-transform duration-300 ease-in-out md:translate-x-0 md:z-50",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-border/50 shadow-2xl",
        )}
      >
        <div className="flex h-full flex-col">
          {/* HEADER */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-border/50">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Interfy
            </h1>

            <Button
              variant="ghost"
              size="sm"
              className="md:hidden hover:bg-muted rounded-lg"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* NAVIGATION */}
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-primary border border-primary/30 shadow-sm"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* USER PROFILE & ACTIONS */}
          <div className="border-t border-border/50 p-4 space-y-3">
            {/* THEME TOGGLE */}
            {mounted && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleTheme} 
                className="w-full justify-start hover:bg-muted/50"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="h-4 w-4 mr-2" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 mr-2" />
                    Dark Mode
                  </>
                )}
              </Button>
            )}

            {/* USER INFO */}
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 border border-border/50">
              <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                  {profile?.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {profile?.full_name || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {profile?.professional_title || "No title"}
                </p>
              </div>
            </div>

            {/* SIGN OUT */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
