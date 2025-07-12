"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Search, MessageSquare, Star, Settings, LogOut, Users } from "lucide-react"
import type { User as UserType } from "@/lib/types"
import { ProfileTab } from "./profile-tab"
import { BrowseTab } from "./browse-tab"
import { RequestsTab } from "./requests-tab"
import { RatingsTab } from "./ratings-tab"
import { SettingsTab } from "./settings-tab"
import { MessagesTab } from "./messages-tab"

interface DashboardLayoutProps {
  user: UserType
  onUserUpdate: (user: UserType) => void
  onLogout: () => void
}

export function DashboardLayout({ user, onUserUpdate, onLogout }: DashboardLayoutProps) {
  const [activeTab, setActiveTab] = useState("browse")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SS</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">SkillSwap</h1>
            </div>

            <div className="flex items-center space-x-4">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.profilePhoto || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="text-sm">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={onLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="browse" className="flex items-center space-x-2">
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Browse</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Messages</span>
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Requests</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="ratings" className="flex items-center space-x-2">
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">Ratings</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            <BrowseTab currentUser={user} />
          </TabsContent>

          <TabsContent value="messages">
            <MessagesTab currentUser={user} />
          </TabsContent>

          <TabsContent value="requests">
            <RequestsTab currentUser={user} />
          </TabsContent>

          <TabsContent value="profile">
            <ProfileTab user={user} onUserUpdate={onUserUpdate} />
          </TabsContent>

          <TabsContent value="ratings">
            <RatingsTab currentUser={user} />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab user={user} onUserUpdate={onUserUpdate} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
