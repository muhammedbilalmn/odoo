"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { DashboardLayout } from "@/components/dashboard/layout"
import { ProfileTab } from "@/components/dashboard/profile-tab"
import { BrowseTab } from "@/components/dashboard/browse-tab"
import { RequestsTab } from "@/components/dashboard/requests-tab"
import { RatingsTab } from "@/components/dashboard/ratings-tab"
import { SettingsTab } from "@/components/dashboard/settings-tab"
import { ManageUsers } from "@/components/admin/manage-users"
import { ReviewSwaps } from "@/components/admin/review-swaps"
import { PlatformMessages } from "@/components/admin/platform-messages"
import { Toaster } from "@/components/ui/toaster"
import type { User } from "@/lib/types"

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [screen, setScreen] = useState<"login" | "register">("login")
  const [activeTab, setActiveTab] = useState("profile")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in (in a real app, check session/token)
    setIsLoading(false)
  }, [])

  const handleLogin = (userData: User) => {
    setUser(userData)
    setScreen("login")
  }

  const handleRegister = (userData: User) => {
    setUser(userData)
    setScreen("login")
  }

  const handleLogout = () => {
    setUser(null)
    setScreen("login")
    setActiveTab("profile")
  }

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    if (screen === "register") {
      return (
        <>
          <RegisterForm onRegister={handleRegister} onSwitchToLogin={() => setScreen("login")} />
          <Toaster />
        </>
      )
    }
    return (
      <>
        <LoginForm onLogin={handleLogin} onSwitchToRegister={() => setScreen("register")} />
        <Toaster />
      </>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileTab user={user} onUserUpdate={handleUserUpdate} />
      case "browse":
        return <BrowseTab currentUser={user} />
      case "requests":
        return <RequestsTab user={user} />
      case "ratings":
        return <RatingsTab user={user} />
      case "settings":
        return <SettingsTab user={user} onUserUpdate={handleUserUpdate} />
      case "admin-users":
        return <ManageUsers />
      case "admin-skills":
        return <ReviewSwaps />
      case "admin-messages":
        return <PlatformMessages />
      case "admin-reports":
        return <div className="text-center py-8">Admin: Reports - Coming Soon</div>
      default:
        return <ProfileTab user={user} onUserUpdate={handleUserUpdate} />
    }
  }

  return (
    <>
      <DashboardLayout user={user} activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout}>
        {renderTabContent()}
      </DashboardLayout>
      <Toaster />
    </>
  )
}
