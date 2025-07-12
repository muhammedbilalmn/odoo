"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { Send, Search } from "lucide-react"
import type { User } from "@/lib/types"

interface Message {
  id: number
  senderId: number
  receiverId: number
  content: string
  createdAt: string
  isRead: boolean
}

interface Conversation {
  user: User
  lastMessage: Message
  unreadCount: number
}

interface MessagesTabProps {
  currentUser: User
}

export function MessagesTab({ currentUser }: MessagesTabProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.user.id)
    }
  }, [selectedConversation])

  const fetchConversations = async () => {
    try {
      const [messagesResponse, usersResponse] = await Promise.all([fetch("/api/messages"), fetch("/api/users")])

      const messagesData = await messagesResponse.json()
      const usersData = await usersResponse.json()

      if (messagesData.success && usersData.users) {
        const allMessages = messagesData.messages || []
        const allUsers = usersData.users

        // Group messages by conversation partner
        const conversationMap = new Map<number, Message[]>()

        allMessages.forEach((message: Message) => {
          const partnerId = message.senderId === currentUser.id ? message.receiverId : message.senderId
          if (!conversationMap.has(partnerId)) {
            conversationMap.set(partnerId, [])
          }
          conversationMap.get(partnerId)!.push(message)
        })

        // Create conversation objects
        const conversationList: Conversation[] = []
        conversationMap.forEach((messages, partnerId) => {
          const partner = allUsers.find((u: User) => u.id === partnerId)
          if (partner) {
            const sortedMessages = messages.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            )
            const unreadCount = messages.filter((m) => m.receiverId === currentUser.id && !m.isRead).length

            conversationList.push({
              user: partner,
              lastMessage: sortedMessages[0],
              unreadCount,
            })
          }
        })

        // Sort by last message time
        conversationList.sort(
          (a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime(),
        )

        setConversations(conversationList)
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch conversations", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMessages = async (partnerId: number) => {
    try {
      const response = await fetch(`/api/messages?conversationWith=${partnerId}`)
      const data = await response.json()

      if (data.success) {
        const sortedMessages = (data.messages || []).sort(
          (a: Message, b: Message) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        )
        setMessages(sortedMessages)
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch messages", variant: "destructive" })
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || isSending) return

    setIsSending(true)
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: selectedConversation.user.id,
          content: newMessage.trim(),
        }),
      })

      const data = await response.json()
      if (data.success) {
        setNewMessage("")
        fetchMessages(selectedConversation.user.id)
        fetchConversations() // Refresh conversations to update last message
      } else {
        toast({ title: "Error", description: data.error || "Failed to send message", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" })
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.user.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p>Loading conversations...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
      {/* Conversations List */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Messages</CardTitle>
          <CardDescription>Your conversations</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <ScrollArea className="h-[400px]">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>No conversations yet</p>
                <p className="text-sm">Start by connecting with other users!</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.user.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 border-b ${
                      selectedConversation?.user.id === conversation.user.id ? "bg-blue-50" : ""
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage
                          src={conversation.user.profilePhoto || "/placeholder.svg"}
                          alt={conversation.user.name}
                        />
                        <AvatarFallback>
                          {conversation.user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium truncate">{conversation.user.name}</h4>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="default" className="ml-2">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.lastMessage.senderId === currentUser.id ? "You: " : ""}
                          {conversation.lastMessage.content}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(conversation.lastMessage.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="md:col-span-2">
        {selectedConversation ? (
          <>
            <CardHeader className="border-b">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    src={selectedConversation.user.profilePhoto || "/placeholder.svg"}
                    alt={selectedConversation.user.name}
                  />
                  <AvatarFallback>
                    {selectedConversation.user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{selectedConversation.user.name}</CardTitle>
                  {selectedConversation.user.location && (
                    <CardDescription>{selectedConversation.user.location}</CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex flex-col h-[450px]">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === currentUser.id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.senderId === currentUser.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.senderId === currentUser.id ? "text-blue-100" : "text-gray-500"
                          }`}
                        >
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button onClick={sendMessage} disabled={!newMessage.trim() || isSending}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="p-8 text-center h-full flex items-center justify-center">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a conversation from the list to start messaging</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
