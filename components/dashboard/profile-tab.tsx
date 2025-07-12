"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Plus, Upload, X, Trash2, Star } from "lucide-react"
import type { User, Skill, Rating } from "@/lib/types"

interface ProfileTabProps {
  user: User
  onUserUpdate: (user: User) => void
}

export function ProfileTab({ user, onUserUpdate }: ProfileTabProps) {
  const [profile, setProfile] = useState(user)
  const [skills, setSkills] = useState<Skill[]>([])
  const [ratings, setRatings] = useState<Rating[]>([])
  const [averageRating, setAverageRating] = useState<number>(0)
  const [newSkill, setNewSkill] = useState({ name: "", type: "offered" as "offered" | "wanted", description: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null)
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>(user.profilePhoto || "")
  const { toast } = useToast()

  const availabilityOptions = [
    { id: "weekdays", label: "Weekdays" },
    { id: "weekends", label: "Weekends" },
    { id: "evenings", label: "Evenings" },
    { id: "mornings", label: "Mornings" },
  ]

  useEffect(() => {
    fetchSkills()
    fetchRatings()
  }, [user.id])

  const fetchSkills = async () => {
    try {
      const response = await fetch(`/api/skills?userId=${user.id}`)
      const data = await response.json()
      if (data.success) {
        setSkills(data.skills || [])
      }
    } catch (error) {
      console.error("Error fetching skills:", error)
      toast({ title: "Error", description: "Failed to fetch skills", variant: "destructive" })
    }
  }

  const fetchRatings = async () => {
    try {
      const response = await fetch(`/api/ratings?userId=${user.id}`)
      const data = await response.json()

      if (data.success && data.ratings) {
        setRatings(data.ratings)

        // Calculate average rating
        if (data.ratings.length > 0) {
          const avg = data.ratings.reduce((sum: number, rating: Rating) => sum + rating.rating, 0) / data.ratings.length
          setAverageRating(Math.round(avg * 10) / 10)
        } else {
          setAverageRating(0)
        }
      } else {
        setRatings([])
        setAverageRating(0)
      }
    } catch (error) {
      console.error("Error fetching ratings:", error)
      setRatings([])
      setAverageRating(0)
    }
  }

  const handleProfileUpdate = async () => {
    setIsLoading(true)
    try {
      let profilePhotoUrl = profile.profilePhoto

      // If there's a new profile photo, convert to base64
      if (profilePhotoFile) {
        const reader = new FileReader()
        profilePhotoUrl = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(profilePhotoFile)
        })
      }

      const response = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profile,
          profilePhoto: profilePhotoUrl,
        }),
      })

      const data = await response.json()
      if (data.user) {
        onUserUpdate(data.user)
        setProfile(data.user)
        setProfilePhotoFile(null)
        toast({ title: "Success", description: "Profile updated successfully" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSkill = async () => {
    if (!newSkill.name.trim()) {
      toast({ title: "Error", description: "Please enter a skill name", variant: "destructive" })
      return
    }

    try {
      const response = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newSkill,
          userId: user.id,
        }),
      })

      const data = await response.json()
      if (data.success && data.skill) {
        setNewSkill({ name: "", type: "offered", description: "" })
        fetchSkills()
        toast({
          title: "Skill added",
          description: "Your skill has been added successfully",
        })
      } else {
        toast({ title: "Error", description: data.error || "Failed to add skill", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to add skill", variant: "destructive" })
    }
  }

  const handleDeleteSkill = async (skillId: number) => {
    try {
      const response = await fetch(`/api/skills/${skillId}`, {
        method: "DELETE",
      })

      const data = await response.json()
      if (data.success) {
        fetchSkills()
        toast({ title: "Success", description: "Skill deleted successfully" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete skill", variant: "destructive" })
    }
  }

  const handleAvailabilityChange = (optionId: string, checked: boolean) => {
    const newAvailability = checked
      ? [...profile.availability, optionId]
      : profile.availability.filter((a) => a !== optionId)

    setProfile({ ...profile, availability: newAvailability })
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast({ title: "Error", description: "File size must be less than 5MB", variant: "destructive" })
        return
      }

      setProfilePhotoFile(file)
      const reader = new FileReader()
      reader.onload = () => {
        setProfilePhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = () => {
    setProfilePhotoFile(null)
    setProfilePhotoPreview("")
    setProfile({ ...profile, profilePhoto: "" })
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  const offeredSkills = skills.filter((s) => s.type === "offered")
  const wantedSkills = skills.filter((s) => s.type === "wanted")

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profilePhotoPreview || "/placeholder.svg"} alt={profile.name} />
                <AvatarFallback className="text-lg">
                  {profile.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2">
                <input
                  type="file"
                  id="profile-photo-upload"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="rounded-full w-8 h-8 p-0 bg-transparent"
                  onClick={() => document.getElementById("profile-photo-upload")?.click()}
                >
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{profile.name}</h3>
              <p className="text-gray-600">{profile.email}</p>
              {profile.location && <p className="text-gray-500">{profile.location}</p>}

              {/* Rating Display */}
              {averageRating > 0 && (
                <div className="flex items-center space-x-2 mt-2">
                  <div className="flex">{renderStars(Math.round(averageRating))}</div>
                  <span className="text-sm text-gray-600">
                    {averageRating} ({ratings.length} review{ratings.length !== 1 ? "s" : ""})
                  </span>
                </div>
              )}

              {profilePhotoPreview && (
                <Button type="button" variant="outline" size="sm" onClick={removePhoto} className="mt-2 bg-transparent">
                  <X className="w-4 h-4 mr-2" />
                  Remove Photo
                </Button>
              )}
            </div>
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="bio">Bio (Optional)</Label>
            <Textarea
              id="bio"
              value={profile.bio || ""}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Tell others about yourself..."
              rows={3}
            />
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

      {/* Reviews Section */}
      {ratings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Reviews & Ratings</CardTitle>
            <CardDescription>What others are saying about your skills</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
                  <div className="flex justify-center">{renderStars(Math.round(averageRating))}</div>
                  <div className="text-sm text-gray-500">{ratings.length} reviews</div>
                </div>
              </div>

              <div className="space-y-3">
                {ratings.map((rating) => (
                  <div key={rating.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={rating.raterPhoto || "/placeholder.svg"} alt={rating.raterName} />
                          <AvatarFallback>
                            {rating.raterName
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("") || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{rating.raterName || "Anonymous User"}</p>
                          <div className="flex items-center space-x-2">
                            <div className="flex">{renderStars(rating.rating)}</div>
                            <span className="text-sm text-gray-500">
                              {new Date(rating.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {(rating.feedback || rating.review) && (
                      <p className="mt-2 text-gray-700">{rating.feedback || rating.review}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skills Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-700">Skills I Can Teach ({offeredSkills.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {offeredSkills.length === 0 ? (
                <p className="text-gray-500 text-sm">No skills added yet</p>
              ) : (
                offeredSkills.map((skill) => (
                  <div key={skill.id} className="p-3 bg-green-50 rounded-lg border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-green-800">{skill.name}</h4>
                        {skill.description && <p className="text-sm text-green-600 mt-1">{skill.description}</p>}
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        <Badge variant={skill.isApproved ? "default" : "secondary"}>
                          {skill.isApproved ? "Approved" : "Pending"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSkill(skill.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-blue-700">Skills I Want to Learn ({wantedSkills.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {wantedSkills.length === 0 ? (
                <p className="text-gray-500 text-sm">No skills added yet</p>
              ) : (
                wantedSkills.map((skill) => (
                  <div key={skill.id} className="p-3 bg-blue-50 rounded-lg border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-blue-800">{skill.name}</h4>
                        {skill.description && <p className="text-sm text-blue-600 mt-1">{skill.description}</p>}
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        <Badge variant={skill.isApproved ? "default" : "secondary"}>
                          {skill.isApproved ? "Approved" : "Pending"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSkill(skill.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Skill */}
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
                placeholder="e.g., React Development, Guitar Playing, Cooking"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skill-type">Type</Label>
              <select
                id="skill-type"
                value={newSkill.type}
                onChange={(e) => setNewSkill({ ...newSkill, type: e.target.value as "offered" | "wanted" })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              placeholder="Brief description of your experience level or what specifically you want to learn"
              rows={3}
            />
          </div>
          <Button onClick={handleAddSkill} disabled={!newSkill.name.trim()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Skill
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
