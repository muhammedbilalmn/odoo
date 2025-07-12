"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Plus, Send, Edit, Trash2, Bell, AlertTriangle, Info } from "lucide-react"
import type { AdminMessage } from "@/lib/types"

export function PlatformMessages() {
  const [messages, setMessages] = useState<AdminMessage[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingMessage, setEditingMessage] = useState<AdminMessage | null>(null)
  const [messageForm, setMessageForm] = useState({
    title: "",
    content: "",
    type: "announcement" as "announcement" | "update" | "maintenance",
  })
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/admin/messages")
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch messages", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateMessage = async () => {
    if (!messageForm.title.trim() || !messageForm.content.trim()) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" })
      return
    }

    try {
      const response = await fetch("/api/admin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageForm),
      })

      const data = await response.json()
      if (data.message) {
        fetchMessages()
        setShowCreateForm(false)
        setMessageForm({ title: "", content: "", type: "announcement" })
        toast({ title: "Success", description: "Message created successfully" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to create message", variant: "destructive" })
    }
  }

  const handleUpdateMessage = async () => {
    if (!editingMessage || !messageForm.title.trim() || !messageForm.content.trim()) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" })
      return
    }

    try {
      const response = await fetch("/api/admin/messages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingMessage.id, ...messageForm }),
      })

      const data = await response.json()
      if (data.message) {
        fetchMessages()
        setEditingMessage(null)
        setMessageForm({ title: "", content: "", type: "announcement" })
        toast({ title: "Success", description: "Message updated successfully" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update message", variant: "destructive" })
    }
  }

  const handleDeleteMessage = async (messageId: number) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        const response = await fetch(`/api/admin/messages?id=${messageId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          fetchMessages()
          toast({ title: "Success", description: "Message deleted successfully" })
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete message", variant: "destructive" })
      }
    }
  }

  const handleToggleActive = async (messageId: number, isActive: boolean) => {
    try {
      const response = await fetch("/api/admin/messages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: messageId, isActive: !isActive }),
      })

      const data = await response.json()
      if (data.message) {
        fetchMessages()
        toast({
          title: "Success",
          description: `Message ${!isActive ? "activated" : "deactivated"} successfully`,
        })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update message", variant: "destructive" })
    }
  }

  const startEdit = (message: AdminMessage) => {
    setEditingMessage(message)
    setMessageForm({
      title: message.title,
      content: message.content,
      type: message.type,
    })
    setShowCreateForm(true)
  }

  const cancelEdit = () => {
    setEditingMessage(null)
    setShowCreateForm(false)
    setMessageForm({ title: "", content: "", type: "announcement" })
  }

  const getMessageIcon = (type: string) => {
    switch (type) {
      case "announcement":
        return <Bell className="w-4 h-4" />
      case "maintenance":
        return <AlertTriangle className="w-4 h-4" />
      case "update":
        return <Info className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getMessageColor = (type: string) => {
    switch (type) {
      case "announcement":
        return "bg-blue-100 text-blue-800"
      case "maintenance":
        return "bg-red-100 text-red-800"
      case "update":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p>Loading messages...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Platform Messages ({messages.length})</CardTitle>
              <CardDescription>Create and manage announcements for all users</CardDescription>
            </div>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Message
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingMessage ? "Edit Message" : "Create New Message"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={messageForm.title}
                  onChange={(e) => setMessageForm({ ...messageForm, title: e.target.value })}
                  placeholder="Message title..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={messageForm.type}
                  onValueChange={(value: "announcement" | "update" | "maintenance") =>
                    setMessageForm({ ...messageForm, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="update">Platform Update</SelectItem>
                    <SelectItem value="maintenance">Maintenance Notice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={messageForm.content}
                onChange={(e) => setMessageForm({ ...messageForm, content: e.target.value })}
                placeholder="Message content..."
                rows={4}
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={editingMessage ? handleUpdateMessage : handleCreateMessage}>
                <Send className="w-4 h-4 mr-2" />
                {editingMessage ? "Update Message" : "Create Message"}
              </Button>
              <Button variant="outline" onClick={cancelEdit}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Messages List */}
      <div className="space-y-4">
        {messages.map((message) => (
          <Card key={message.id} className={!message.isActive ? "opacity-60" : ""}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-lg">{message.title}</h4>
                    <Badge className={getMessageColor(message.type)}>
                      <div className="flex items-center space-x-1">
                        {getMessageIcon(message.type)}
                        <span className="capitalize">{message.type}</span>
                      </div>
                    </Badge>
                    <Badge variant={message.isActive ? "default" : "secondary"}>
                      {message.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-3">{message.content}</p>
                  <p className="text-xs text-gray-500">Created: {new Date(message.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <Button size="sm" variant="outline" onClick={() => startEdit(message)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleToggleActive(message.id, message.isActive)}>
                    {message.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteMessage(message.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {messages.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No platform messages yet</p>
            <p className="text-sm text-gray-400 mt-1">Create your first message to communicate with users</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
