"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Search, MessageSquare, Star, Settings, LogOut, Shield, BarChart3, Bell, Users } from "lucide-react"

interface DashboardProps {
  user: any
  onLogout: () => void
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("profile")

  const menuItems = [
    { id: "profile", label: "My Profile", icon: User },
    { id: "browse", label: "Browse Users", icon: Search },
    { id: "requests", label: "Swap Requests", icon: MessageSquare },
    { id: "ratings", label: "My Ratings", icon: Star },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const adminItems = [
    { id: "admin-users", label: "Manage Users", icon: Shield },
    { id: "admin-skills", label: "Review Skills", icon: BarChart3 },
    { id: "admin-messages", label: "Platform Messages", icon: Bell },
    { id: "admin-reports", label: "Reports", icon: BarChart3 },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileContent user={user} />
      case "browse":
        return <BrowseContent />
      case "requests":
        return <RequestsContent user={user} />
      case "ratings":
        return <RatingsContent user={user} />
      case "settings":
        return <SettingsContent user={user} />
      case "admin-users":
        return <AdminUsersContent />
      case "admin-skills":
        return <AdminSkillsContent />
      case "admin-messages":
        return <AdminMessagesContent />
      case "admin-reports":
        return <AdminReportsContent />
      default:
        return <ProfileContent user={user} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Users className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-blue-600">SkillSwap</h1>
              </div>
              {user.role === "admin" && (
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  Admin
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={user.profile_photo || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback>
                  {user.name
                    .split(" ")
                    .map((n: string) => n[0])
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
                      onClick={() => setActiveTab(item.id)}
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
                            onClick={() => setActiveTab(item.id)}
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
          <div className="flex-1">{renderContent()}</div>
        </div>
      </div>
    </div>
  )
}

// Content Components
function ProfileContent({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={user.profile_photo || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="text-lg">
                  {user.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{user.name}</h3>
                <p className="text-gray-600">{user.email}</p>
                {user.location && <p className="text-gray-500">{user.location}</p>}
                <Badge variant={user.is_public ? "default" : "secondary"}>
                  {user.is_public ? "Public Profile" : "Private Profile"}
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Availability</h4>
              <div className="flex flex-wrap gap-2">
                {user.availability.map((slot: string) => (
                  <Badge key={slot} variant="outline">
                    {slot}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-700">Skills I Offer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">No skills added yet. Add your skills to start swapping!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-blue-700">Skills I Want</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">No skills added yet. Add skills you want to learn!</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function BrowseContent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Browse Users</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">Browse functionality coming soon...</p>
      </CardContent>
    </Card>
  )
}

function RequestsContent({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pending Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No pending requests</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accepted Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No accepted requests</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Completed Swaps</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No completed swaps yet</p>
        </CardContent>
      </Card>
    </div>
  )
}

function RatingsContent({ user }: { user: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Ratings</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">No ratings yet</p>
      </CardContent>
    </Card>
  )
}

function SettingsContent({ user }: { user: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">Settings panel coming soon...</p>
      </CardContent>
    </Card>
  )
}

function AdminUsersContent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Users</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">User management coming soon...</p>
      </CardContent>
    </Card>
  )
}

function AdminSkillsContent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Skills</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">Skill review coming soon...</p>
      </CardContent>
    </Card>
  )
}

function AdminMessagesContent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Messages</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">Platform messages coming soon...</p>
      </CardContent>
    </Card>
  )
}

function AdminReportsContent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">Reports coming soon...</p>
      </CardContent>
    </Card>
  )
}
