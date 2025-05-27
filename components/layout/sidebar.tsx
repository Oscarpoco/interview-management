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
      {isOpen && <div className="fixed inset-0 bg-black/50 z-50 md:hidden" onClick={() => setIsOpen(false)} />}

      {/* MOBILE MENU BUTTON */}

      <div className="fixed top-0 w-full flex items-center justify-between z-40 md:hidden p-2 px-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-white/20 dark:border-gray-700/20">
        <h1 className="text-xl uppercase font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {profile?.full_name || "USER"}
        </h1>
        <Button
          variant="ghost"
          size="sm"
          className="bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-700 rounded-md shadow-sm hover:bg-white hover:dark:bg-gray-700 transition"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>


      {/* SIDEBAR */}
      <div
        className={cn(
          "fixed left-0 top-0 z-50  w-full transform transition-transform duration-300 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-white/20 dark:border-gray-700/20",
        )}
      >
        <div className="flex h-full flex-col">
          {/* HEADER */}
          <div className="flex h-16 items-center justify-center border-b border-white/20 dark:border-gray-700/20">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Interview Manager
            </h1>

            <Button
              variant="ghost"
              size="sm"
              className="fixed top-4 right-4 z-40 md:hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg "
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-8 w-8" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* NAVIGATION */}
          <nav className="flex-1 space-y-2 p-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                      : "text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* USER PROFILE & ACTIONS */}
          <div className="border-t border-white/20 dark:border-gray-700/20 p-4 space-y-4">
            {/* THEME TOGGLE */}
            {mounted && (
              <Button variant="ghost" size="sm" onClick={toggleTheme} className="w-full justify-start">
                {theme === "dark" ? (
                  <>
                    <Sun className="h-4 w-4 mr-2" />
                    LIGHT MODE
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 mr-2" />
                    DARK MODE
                  </>
                )}
              </Button>
            )}

            {/* USER INFO */}
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-white/30 dark:bg-gray-800/30">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  {profile?.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {profile?.full_name || "USER"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {profile?.professional_title || "NO TITLE"}
                </p>
              </div>
            </div>

            {/* SIGN OUT */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              SIGN OUT
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
