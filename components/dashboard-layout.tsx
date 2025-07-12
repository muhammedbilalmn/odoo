"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, Search, MessageSquare, Star, Settings, LogOut, Shield, BarChart3, Bell } from "lucide-react"
import type { User } from "@/lib/types"

interface DashboardLayoutProps {
  user: User
  children: React.ReactNode
  activeTab: string
  onTabChange: (tab: string) => void
  onLogout: () => void
}

export function DashboardLayout({ user, children, activeTab, onTabChange, onLogout }: DashboardLayoutProps) {
  const menuItems = [
    { id: "profile", label: "My Profile", icon: Users },
    { id: "browse", label: "Browse Users", icon: Search },
    { id: "requests", label: "Swap Requests", icon: MessageSquare },
    { id: "ratings", label: "My Ratings", icon: Star },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const adminItems = [
    { id: "admin-users", label: "Manage Users", icon: Shield },
    { id: "admin-skills", label: "Review Skills", icon: BarChart3 },
    { id: "admin-messages", label: "Platform Messages", icon: Bell },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-indigo-600">SkillSwap</h1>
              {user.role === "admin" && (
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  Admin
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={user.profilePhoto || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback>
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={onLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Button
                      key={item.id}
                      variant={activeTab === item.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => onTabChange(item.id)}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Button>
                  )
                })}

                {user.role === "admin" && (
                  <>
                    <div className="border-t pt-4 mt-4">
                      <p className="text-sm font-medium text-gray-500 mb-2">Admin Panel</p>
                      {adminItems.map((item) => {
                        const Icon = item.icon
                        return (
                          <Button
                            key={item.id}
                            variant={activeTab === item.id ? "default" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => onTabChange(item.id)}
                          >
                            <Icon className="w-4 h-4 mr-2" />
                            {item.label}
                          </Button>
                        )
                      })}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  )
}
