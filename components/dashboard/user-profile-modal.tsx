"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Star, MapPin, Clock, MessageCircle, ArrowRightLeft, Search, X } from "lucide-react"
import type { User, Skill } from "@/lib/types"

interface UserProfileModalProps {
  user: User | null
  currentUser: User
  isOpen: boolean
  onClose: () => void
}

export function UserProfileModal({ user, currentUser, isOpen, onClose }: UserProfileModalProps) {
  const [userSkills, setUserSkills] = useState<Skill[]>([])
  const [currentUserSkills, setCurrentUserSkills] = useState<Skill[]>([])
  const [userRating, setUserRating] = useState<number>(0)
  const [reviewCount, setReviewCount] = useState<number>(0)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [skillSearchTerm, setSkillSearchTerm] = useState("")
  const [requestForm, setRequestForm] = useState({
    offeredSkillIds: [] as number[],
    wantedSkillIds: [] as number[],
    message: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    if (user && isOpen) {
      fetchUserData()
    }
  }, [user, isOpen])

  const fetchUserData = async () => {
    if (!user) return

    try {
      // Fetch user's skills
      const skillsResponse = await fetch(`/api/skills?userId=${user.id}`)
      const skillsData = await skillsResponse.json()

      if (skillsData.success) {
        setUserSkills(skillsData.skills || [])
      }

      // Fetch current user's skills
      const currentUserSkillsResponse = await fetch(`/api/skills?userId=${currentUser.id}`)
      const currentUserSkillsData = await currentUserSkillsResponse.json()

      if (currentUserSkillsData.success) {
        setCurrentUserSkills(currentUserSkillsData.skills || [])
      }

      // Fetch user's ratings
      const ratingsResponse = await fetch(`/api/ratings?userId=${user.id}`)
      const ratingsData = await ratingsResponse.json()

      if (ratingsData.success) {
        const ratings = ratingsData.ratings || []
        if (ratings.length > 0) {
          const avgRating = ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length
          setUserRating(avgRating)
          setReviewCount(ratings.length)
        } else {
          setUserRating(0)
          setReviewCount(0)
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      toast({ title: "Error", description: "Failed to fetch user data", variant: "destructive" })
    }
  }

  const handleSendRequest = async () => {
    if (
      requestForm.offeredSkillIds.length === 0 ||
      requestForm.wantedSkillIds.length === 0 ||
      !requestForm.message.trim()
    ) {
      toast({ title: "Error", description: "Please select skills and add a message", variant: "destructive" })
      return
    }

    if (requestForm.offeredSkillIds.length > 3 || requestForm.wantedSkillIds.length > 3) {
      toast({
        title: "Error",
        description: "You can select maximum 3 skills for each category",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/swap-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: user?.id,
          offeredSkillIds: requestForm.offeredSkillIds,
          wantedSkillIds: requestForm.wantedSkillIds,
          // For backward compatibility, also send single IDs
          offeredSkillId: requestForm.offeredSkillIds[0],
          wantedSkillId: requestForm.wantedSkillIds[0],
          message: requestForm.message,
        }),
      })

      const data = await response.json()
      if (data.request) {
        toast({ title: "Success!", description: "Your swap request has been sent successfully." })
        setShowRequestForm(false)
        setRequestForm({ offeredSkillIds: [], wantedSkillIds: [], message: "" })
        onClose()
      } else {
        toast({ title: "Error", description: data.error || "Failed to send request", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to send request", variant: "destructive" })
    }
  }

  const handleSkillToggle = (skillId: number, type: "offered" | "wanted") => {
    if (type === "offered") {
      const newOffered = requestForm.offeredSkillIds.includes(skillId)
        ? requestForm.offeredSkillIds.filter((id) => id !== skillId)
        : [...requestForm.offeredSkillIds, skillId]

      if (newOffered.length <= 3) {
        setRequestForm({ ...requestForm, offeredSkillIds: newOffered })
      } else {
        toast({ title: "Limit reached", description: "You can select maximum 3 skills to offer" })
      }
    } else {
      const newWanted = requestForm.wantedSkillIds.includes(skillId)
        ? requestForm.wantedSkillIds.filter((id) => id !== skillId)
        : [...requestForm.wantedSkillIds, skillId]

      if (newWanted.length <= 3) {
        setRequestForm({ ...requestForm, wantedSkillIds: newWanted })
      } else {
        toast({ title: "Limit reached", description: "You can select maximum 3 skills to learn" })
      }
    }
  }

  if (!user) return null

  const offeredSkills = userSkills.filter((s) => s.type === "offered")
  const wantedSkills = userSkills.filter((s) => s.type === "wanted")
  const myOfferedSkills = currentUserSkills.filter((s) => s.type === "offered")

  const filteredOfferedSkills = myOfferedSkills.filter((skill) =>
    skill.name.toLowerCase().includes(skillSearchTerm.toLowerCase()),
  )
  const filteredWantedSkills = offeredSkills.filter((skill) =>
    skill.name.toLowerCase().includes(skillSearchTerm.toLowerCase()),
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
          <DialogDescription>View profile details and request a skill swap</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user.profilePhoto || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback className="text-lg">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold">{user.name}</h3>
                  {user.location && (
                    <div className="flex items-center space-x-1 text-gray-600 mt-1">
                      <MapPin className="w-4 h-4" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  {user.bio && <p className="text-gray-600 mt-2">{user.bio}</p>}
                  <div className="flex items-center space-x-1 mt-2">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{userRating > 0 ? userRating.toFixed(1) : "No ratings yet"}</span>
                    {reviewCount > 0 && <span className="text-gray-500">({reviewCount} reviews)</span>}
                  </div>
                  <div className="flex items-center space-x-1 mt-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Available: </span>
                    <div className="flex flex-wrap gap-1">
                      {user.availability.map((slot) => (
                        <Badge key={slot} variant="outline" className="text-xs">
                          {slot}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-700">Skills They Can Teach ({offeredSkills.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {offeredSkills.length === 0 ? (
                    <p className="text-gray-500 text-sm">No skills offered yet</p>
                  ) : (
                    offeredSkills.map((skill) => (
                      <div key={skill.id} className="p-3 bg-green-50 rounded-lg border">
                        <h4 className="font-medium text-green-800">{skill.name}</h4>
                        {skill.description && <p className="text-sm text-green-600 mt-1">{skill.description}</p>}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-blue-700">Skills They Want to Learn ({wantedSkills.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {wantedSkills.length === 0 ? (
                    <p className="text-gray-500 text-sm">No skills wanted yet</p>
                  ) : (
                    wantedSkills.map((skill) => (
                      <div key={skill.id} className="p-3 bg-blue-50 rounded-lg border">
                        <h4 className="font-medium text-blue-800">{skill.name}</h4>
                        {skill.description && <p className="text-sm text-blue-600 mt-1">{skill.description}</p>}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Request Skill Swap */}
          {!showRequestForm ? (
            <div className="flex justify-center">
              <Button onClick={() => setShowRequestForm(true)} className="w-full max-w-md">
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                Request Skill Swap
              </Button>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Request a Skill Swap</CardTitle>
                <CardDescription>Choose up to 3 skills you'll teach and 3 skills you want to learn</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search Skills */}
                <div className="space-y-2">
                  <Label>Search Skills</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search for skills..."
                      value={skillSearchTerm}
                      onChange={(e) => setSkillSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Skills I Will Teach */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-green-700 font-medium">
                        I will teach: ({requestForm.offeredSkillIds.length}/3)
                      </Label>
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-3">
                      {filteredOfferedSkills.length === 0 ? (
                        <p className="text-gray-500 text-sm">
                          {myOfferedSkills.length === 0
                            ? "You haven't added any skills you can teach yet. Go to your profile to add skills."
                            : "No matching skills found"}
                        </p>
                      ) : (
                        filteredOfferedSkills.map((skill) => (
                          <div key={skill.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`offered-${skill.id}`}
                              checked={requestForm.offeredSkillIds.includes(skill.id)}
                              onCheckedChange={() => handleSkillToggle(skill.id, "offered")}
                            />
                            <Label htmlFor={`offered-${skill.id}`} className="text-sm flex-1">
                              {skill.name}
                            </Label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Skills I Want to Learn */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-blue-700 font-medium">
                        I want to learn: ({requestForm.wantedSkillIds.length}/3)
                      </Label>
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-3">
                      {filteredWantedSkills.length === 0 ? (
                        <p className="text-gray-500 text-sm">
                          {offeredSkills.length === 0
                            ? "This user hasn't added any skills they can teach yet."
                            : "No matching skills found"}
                        </p>
                      ) : (
                        filteredWantedSkills.map((skill) => (
                          <div key={skill.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`wanted-${skill.id}`}
                              checked={requestForm.wantedSkillIds.includes(skill.id)}
                              onCheckedChange={() => handleSkillToggle(skill.id, "wanted")}
                            />
                            <Label htmlFor={`wanted-${skill.id}`} className="text-sm flex-1">
                              {skill.name}
                            </Label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Selected Skills Preview */}
                {(requestForm.offeredSkillIds.length > 0 || requestForm.wantedSkillIds.length > 0) && (
                  <div className="space-y-3">
                    <Label>Selected Skills:</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-green-700 mb-2">Teaching:</p>
                        <div className="flex flex-wrap gap-1">
                          {requestForm.offeredSkillIds.map((skillId) => {
                            const skill = myOfferedSkills.find((s) => s.id === skillId)
                            return skill ? (
                              <Badge key={skillId} variant="secondary" className="bg-green-100 text-green-800">
                                {skill.name}
                                <X
                                  className="w-3 h-3 ml-1 cursor-pointer"
                                  onClick={() => handleSkillToggle(skillId, "offered")}
                                />
                              </Badge>
                            ) : null
                          })}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-700 mb-2">Learning:</p>
                        <div className="flex flex-wrap gap-1">
                          {requestForm.wantedSkillIds.map((skillId) => {
                            const skill = offeredSkills.find((s) => s.id === skillId)
                            return skill ? (
                              <Badge key={skillId} variant="secondary" className="bg-blue-100 text-blue-800">
                                {skill.name}
                                <X
                                  className="w-3 h-3 ml-1 cursor-pointer"
                                  onClick={() => handleSkillToggle(skillId, "wanted")}
                                />
                              </Badge>
                            ) : null
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="message">Message:</Label>
                  <Textarea
                    id="message"
                    value={requestForm.message}
                    onChange={(e) => setRequestForm({ ...requestForm, message: e.target.value })}
                    placeholder="Introduce yourself and explain why you'd like to swap skills..."
                    rows={4}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button onClick={handleSendRequest} className="flex-1">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Send Request
                  </Button>
                  <Button variant="outline" onClick={() => setShowRequestForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
