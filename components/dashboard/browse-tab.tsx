"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Search, MessageCircle, Star, MapPin, Send } from "lucide-react"
import type { User, Skill } from "@/lib/types"
import { UserProfileModal } from "./user-profile-modal"

interface BrowseTabProps {
  currentUser: User
}

interface Message {
  id: number
  senderId: number
  receiverId: number
  content: string
  createdAt: Date
  isRead: boolean
}

export function BrowseTab({ currentUser }: BrowseTabProps) {
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false)
  const [messageContent, setMessageContent] = useState("")
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users")
      const data = await response.json()
      if (data.users) {
        // Filter out current user and get their skills
        const filteredUsers = data.users.filter((u: User) => u.id !== currentUser.id)

        // Fetch skills for each user
        const usersWithSkills = await Promise.all(
          filteredUsers.map(async (user: User) => {
            try {
              const skillsResponse = await fetch(`/api/skills?userId=${user.id}`)
              const skillsData = await skillsResponse.json()
              return {
                ...user,
                skills: skillsData.skills || [],
              }
            } catch {
              return { ...user, skills: [] }
            }
          }),
        )

        setUsers(usersWithSkills)
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch users", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !selectedUser) return

    setIsSendingMessage(true)
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: selectedUser.id,
          content: messageContent.trim(),
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast({ title: "Message sent!", description: "Your message has been sent successfully." })
        setMessageContent("")
        setIsMessageModalOpen(false)
      } else {
        toast({ title: "Error", description: data.error || "Failed to send message", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" })
    } finally {
      setIsSendingMessage(false)
    }
  }

  const handleConnect = (user: User) => {
    setSelectedUser(user)
    setIsMessageModalOpen(true)
  }

  const handleViewProfile = (user: User) => {
    setSelectedUser(user)
    setIsProfileModalOpen(true)
  }

  const filteredUsers = users.filter((user: any) => {
    const nameMatch = user.name.toLowerCase().includes(searchTerm.toLowerCase())
    const locationMatch = user.location && user.location.toLowerCase().includes(searchTerm.toLowerCase())
    const skillMatch =
      user.skills && user.skills.some((skill: Skill) => skill.name.toLowerCase().includes(searchTerm.toLowerCase()))
    return nameMatch || locationMatch || skillMatch
  })

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p>Loading users...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Browse Users</CardTitle>
          <CardDescription>Find people to swap skills with</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by name, location, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user: any) => {
          const offeredSkills = user.skills?.filter((s: Skill) => s.type === "offered") || []
          const wantedSkills = user.skills?.filter((s: Skill) => s.type === "wanted") || []

          return (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={user.profilePhoto || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback>
                      {user.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>4.8 (12 reviews)</span>
                    </div>
                    {user.location && (
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span>{user.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Skills Preview */}
                  <div className="space-y-2">
                    {offeredSkills.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-green-700 mb-1">Can teach:</h4>
                        <div className="flex flex-wrap gap-1">
                          {offeredSkills.slice(0, 3).map((skill: Skill) => (
                            <Badge key={skill.id} variant="outline" className="text-xs bg-green-50 text-green-700">
                              {skill.name}
                            </Badge>
                          ))}
                          {offeredSkills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{offeredSkills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {wantedSkills.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-blue-700 mb-1">Wants to learn:</h4>
                        <div className="flex flex-wrap gap-1">
                          {wantedSkills.slice(0, 3).map((skill: Skill) => (
                            <Badge key={skill.id} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                              {skill.name}
                            </Badge>
                          ))}
                          {wantedSkills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{wantedSkills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Available</h4>
                    <div className="flex flex-wrap gap-1">
                      {user.availability.map((slot: string) => (
                        <Badge key={slot} variant="outline" className="text-xs">
                          {slot}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2 mt-4">
                    <Button className="flex-1" size="sm" onClick={() => handleConnect(user)}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Connect
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleViewProfile(user)}>
                      View Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No users found matching your search.</p>
          </CardContent>
        </Card>
      )}

      {/* Message Modal */}
      <Dialog open={isMessageModalOpen} onOpenChange={setIsMessageModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
            <DialogDescription>Send a message to {selectedUser?.name} to start a conversation</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={selectedUser?.profilePhoto || "/placeholder.svg"} alt={selectedUser?.name} />
                <AvatarFallback>
                  {selectedUser?.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{selectedUser?.name}</h3>
                {selectedUser?.location && <p className="text-sm text-gray-500">{selectedUser.location}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Hi! I'd like to connect and potentially swap skills with you..."
                rows={4}
              />
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleSendMessage}
                disabled={!messageContent.trim() || isSendingMessage}
                className="flex-1"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSendingMessage ? "Sending..." : "Send Message"}
              </Button>
              <Button variant="outline" onClick={() => setIsMessageModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <UserProfileModal
        user={selectedUser}
        currentUser={currentUser}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  )
}
