"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Search, Trash2, Ban, UserCheck, MapPin, Calendar } from "lucide-react"
import type { User } from "@/lib/types"

export function ManageUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch users", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserAction = async (userId: number, action: string) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      })

      const data = await response.json()
      if (data.user) {
        fetchUsers()
        toast({
          title: "Success",
          description: `User ${action === "ban" ? "banned" : action === "unban" ? "unbanned" : "deleted"} successfully`,
        })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to perform action", variant: "destructive" })
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        const response = await fetch(`/api/admin/users?userId=${userId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          fetchUsers()
          toast({ title: "Success", description: "User deleted successfully" })
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete user", variant: "destructive" })
      }
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.location && user.location.toLowerCase().includes(searchTerm.toLowerCase())),
  )

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
          <CardTitle>Manage Users ({users.length} total)</CardTitle>
          <CardDescription>View, ban, unban, or delete user accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by name, email, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.id} className={`${user.isBanned ? "border-red-200 bg-red-50" : ""}`}>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={user.profilePhoto || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback>
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{user.name}</CardTitle>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                    {user.isBanned && <Badge variant="destructive">Banned</Badge>}
                    {!user.isPublic && <Badge variant="outline">Private</Badge>}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {user.location && (
                  <div className="flex items-center space-x-1 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{user.location}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {user.availability.map((slot) => (
                    <Badge key={slot} variant="outline" className="text-xs">
                      {slot}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2 mt-4">
                {user.role !== "admin" && (
                  <>
                    {!user.isBanned ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUserAction(user.id, "ban")}
                        className="flex-1"
                      >
                        <Ban className="w-4 h-4 mr-1" />
                        Ban
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUserAction(user.id, "unban")}
                        className="flex-1"
                      >
                        <UserCheck className="w-4 h-4 mr-1" />
                        Unban
                      </Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(user.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No users found matching your search.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
