"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Bell, Shield, Globe, Mail, Smartphone } from "lucide-react"
import type { User as UserType } from "@/lib/types"

interface SettingsTabProps {
  user: UserType
  onUserUpdate: (user: UserType) => void
}

export function SettingsTab({ user, onUserUpdate }: SettingsTabProps) {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    profileVisibility: user.isPublic ? "public" : "private",
    showLocation: true,
    showAvailability: true,
    autoAcceptRequests: false,
    language: "en",
    timezone: "UTC",
    bio: "",
    website: "",
    socialLinks: {
      linkedin: "",
      twitter: "",
      github: "",
    },
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      // In a real app, you'd save these settings to the database
      toast({ title: "Success", description: "Settings saved successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        // In a real app, you'd call the delete account API
        toast({ title: "Account deleted", description: "Your account has been deleted successfully" })
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete account", variant: "destructive" })
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <CardTitle>Profile Settings</CardTitle>
          </div>
          <CardDescription>Manage your profile information and visibility</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={settings.bio}
                onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
                placeholder="Tell others about yourself..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={settings.website}
                onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Profile Visibility</Label>
            <Select
              value={settings.profileVisibility}
              onValueChange={(value) => setSettings({ ...settings, profileVisibility: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public - Anyone can see my profile</SelectItem>
                <SelectItem value="private">Private - Only I can see my profile</SelectItem>
                <SelectItem value="members">Members Only - Only registered users can see my profile</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Show Location</Label>
                <p className="text-sm text-gray-500">Display your location on your profile</p>
              </div>
              <Switch
                checked={settings.showLocation}
                onCheckedChange={(checked) => setSettings({ ...settings, showLocation: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Show Availability</Label>
                <p className="text-sm text-gray-500">Display your availability schedule</p>
              </div>
              <Switch
                checked={settings.showAvailability}
                onCheckedChange={(checked) => setSettings({ ...settings, showAvailability: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <CardTitle>Notification Settings</CardTitle>
          </div>
          <CardDescription>Choose how you want to be notified</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Smartphone className="w-5 h-5 text-gray-500" />
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-gray-500">Receive push notifications on your device</p>
                </div>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-accept Requests</Label>
                <p className="text-sm text-gray-500">Automatically accept skill swap requests</p>
              </div>
              <Switch
                checked={settings.autoAcceptRequests}
                onCheckedChange={(checked) => setSettings({ ...settings, autoAcceptRequests: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5" />
            <CardTitle>Social Links</CardTitle>
          </div>
          <CardDescription>Connect your social media profiles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={settings.socialLinks.linkedin}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialLinks: { ...settings.socialLinks, linkedin: e.target.value },
                  })
                }
                placeholder="linkedin.com/in/username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                value={settings.socialLinks.twitter}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialLinks: { ...settings.socialLinks, twitter: e.target.value },
                  })
                }
                placeholder="twitter.com/username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github">GitHub</Label>
              <Input
                id="github"
                value={settings.socialLinks.github}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialLinks: { ...settings.socialLinks, github: e.target.value },
                  })
                }
                placeholder="github.com/username"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={settings.language}
                onValueChange={(value) => setSettings({ ...settings, language: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="ko">Korean</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select
                value={settings.timezone}
                onValueChange={(value) => setSettings({ ...settings, timezone: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="EST">Eastern Time</SelectItem>
                  <SelectItem value="PST">Pacific Time</SelectItem>
                  <SelectItem value="CET">Central European Time</SelectItem>
                  <SelectItem value="JST">Japan Standard Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button onClick={handleSaveSettings} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Settings"}
        </Button>

        <Card className="border-red-200">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-red-600" />
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
