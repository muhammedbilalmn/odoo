"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Plus } from "lucide-react"
import type { User, Skill } from "@/lib/types"

interface ProfileTabProps {
  user: User
  onUserUpdate: (user: User) => void
}

export function ProfileTab({ user, onUserUpdate }: ProfileTabProps) {
  const [profile, setProfile] = useState(user)
  const [skills, setSkills] = useState<Skill[]>([])
  const [newSkill, setNewSkill] = useState({ name: "", type: "offered" as "offered" | "wanted", description: "" })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const availabilityOptions = [
    { id: "weekdays", label: "Weekdays" },
    { id: "weekends", label: "Weekends" },
    { id: "evenings", label: "Evenings" },
    { id: "mornings", label: "Mornings" },
  ]

  useEffect(() => {
    fetchSkills()
  }, [])

  const fetchSkills = async () => {
    try {
      const response = await fetch(`/api/skills?userId=${user.id}`)
      const data = await response.json()
      setSkills(data.skills || [])
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch skills", variant: "destructive" })
    }
  }

  const handleProfileUpdate = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      })

      const data = await response.json()
      if (data.user) {
        onUserUpdate(data.user)
        toast({ title: "Success", description: "Profile updated successfully" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSkill = async () => {
    if (!newSkill.name.trim()) return

    try {
      const response = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSkill),
      })

      const data = await response.json()
      if (data.skill) {
        setNewSkill({ name: "", type: "offered", description: "" })
        fetchSkills()
        toast({
          title: "Skill added",
          description: "Your skill is pending admin approval",
        })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to add skill", variant: "destructive" })
    }
  }

  const handleAvailabilityChange = (optionId: string, checked: boolean) => {
    const newAvailability = checked
      ? [...profile.availability, optionId]
      : profile.availability.filter((a) => a !== optionId)

    setProfile({ ...profile, availability: newAvailability })
  }

  const offeredSkills = skills.filter((s) => s.type === "offered")
  const wantedSkills = skills.filter((s) => s.type === "wanted")

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                value={profile.location || ""}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                placeholder="City, Country"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="public-profile"
              checked={profile.isPublic}
              onCheckedChange={(checked) => setProfile({ ...profile, isPublic: checked })}
            />
            <Label htmlFor="public-profile">Make my profile public</Label>
          </div>

          <div className="space-y-2">
            <Label>Availability</Label>
            <div className="grid grid-cols-2 gap-2">
              {availabilityOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.id}
                    checked={profile.availability.includes(option.id)}
                    onCheckedChange={(checked) => handleAvailabilityChange(option.id, checked as boolean)}
                  />
                  <Label htmlFor={option.id}>{option.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handleProfileUpdate} disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Profile"}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-700">Skills I Can Teach</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              {offeredSkills.map((skill) => (
                <div key={skill.id} className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <div>
                    <span className="font-medium">{skill.name}</span>
                    {skill.description && <p className="text-sm text-gray-600">{skill.description}</p>}
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {skill.isApproved ? "Approved" : "Pending"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-blue-700">Skills I Want to Learn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              {wantedSkills.map((skill) => (
                <div key={skill.id} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                  <div>
                    <span className="font-medium">{skill.name}</span>
                    {skill.description && <p className="text-sm text-gray-600">{skill.description}</p>}
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {skill.isApproved ? "Approved" : "Pending"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Skill</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="skill-name">Skill Name</Label>
              <Input
                id="skill-name"
                value={newSkill.name}
                onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                placeholder="e.g., React Development"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skill-type">Type</Label>
              <select
                id="skill-type"
                value={newSkill.type}
                onChange={(e) => setNewSkill({ ...newSkill, type: e.target.value as "offered" | "wanted" })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="offered">I can teach this</option>
                <option value="wanted">I want to learn this</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="skill-description">Description (Optional)</Label>
            <Textarea
              id="skill-description"
              value={newSkill.description}
              onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
              placeholder="Brief description of your experience or what you want to learn"
            />
          </div>
          <Button onClick={handleAddSkill}>
            <Plus className="w-4 h-4 mr-2" />
            Add Skill
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
