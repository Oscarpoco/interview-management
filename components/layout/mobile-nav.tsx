"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Calendar, User, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "DASHBOARD", href: "/dashboard", icon: LayoutDashboard },
  { name: "INTERVIEWS", href: "/interviews", icon: Calendar },
  { name: "PROFILE", href: "/profile", icon: User },
  { name: "SETTINGS", href: "/settings", icon: Settings },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-border/50 shadow-2xl">
        <div className="grid grid-cols-4 gap-1 p-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center py-2.5 px-3 transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-primary border border-primary/30 shadow-sm"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <item.icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
