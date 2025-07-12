"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Check, X, Trash2, Clock, CheckCircle, Star, MessageSquare } from "lucide-react"
import type { User, SwapRequest } from "@/lib/types"

interface RequestsTabProps {
  user: User
}

interface EnhancedSwapRequest extends SwapRequest {
  requesterName?: string
  receiverName?: string
  offeredSkillName?: string
  wantedSkillName?: string
  offeredSkillNames?: string[]
  wantedSkillNames?: string[]
  requesterPhoto?: string
  receiverPhoto?: string
}

export function RequestsTab({ user }: RequestsTabProps) {
  const [requests, setRequests] = useState<EnhancedSwapRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [ratingModalOpen, setRatingModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<EnhancedSwapRequest | null>(null)
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [isSubmittingRating, setIsSubmittingRating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchRequests()
  }, [user.id])

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/swap-requests")
      const data = await response.json()

      if (data.requests) {
        // Enhance requests with user and skill names
        const enhancedRequests = await Promise.all(
          data.requests.map(async (request: SwapRequest) => {
            try {
              const [usersResponse, skillsResponse] = await Promise.all([fetch("/api/users"), fetch("/api/skills")])

              const usersData = await usersResponse.json()
              const skillsData = await skillsResponse.json()

              const requester = usersData.users?.find((u: User) => u.id === request.requesterId)
              const receiver = usersData.users?.find((u: User) => u.id === request.receiverId)

              // Handle both single skill ID and array of skill IDs
              const offeredSkillIds = Array.isArray(request.offeredSkillIds)
                ? request.offeredSkillIds
                : [request.offeredSkillId].filter(Boolean)

              const wantedSkillIds = Array.isArray(request.wantedSkillIds)
                ? request.wantedSkillIds
                : [request.wantedSkillId].filter(Boolean)

              const offeredSkillNames = offeredSkillIds.map((id) => {
                const skill = skillsData.skills?.find((s: any) => s.id === id)
                return skill?.name || "Unknown Skill"
              })

              const wantedSkillNames = wantedSkillIds.map((id) => {
                const skill = skillsData.skills?.find((s: any) => s.id === id)
                return skill?.name || "Unknown Skill"
              })

              return {
                ...request,
                requesterName: requester?.name || "Unknown User",
                receiverName: receiver?.name || "Unknown User",
                requesterPhoto: requester?.profilePhoto,
                receiverPhoto: receiver?.profilePhoto,
                offeredSkillName: offeredSkillNames[0] || "Unknown Skill",
                wantedSkillName: wantedSkillNames[0] || "Unknown Skill",
                offeredSkillNames,
                wantedSkillNames,
              }
            } catch (error) {
              console.error("Error enhancing request:", error)
              return {
                ...request,
                requesterName: "Unknown User",
                receiverName: "Unknown User",
                offeredSkillName: "Unknown Skill",
                wantedSkillName: "Unknown Skill",
                offeredSkillNames: ["Unknown Skill"],
                wantedSkillNames: ["Unknown Skill"],
              }
            }
          }),
        )

        setRequests(enhancedRequests)
      } else {
        setRequests([])
      }
    } catch (error) {
      console.error("Error fetching requests:", error)
      toast({ title: "Error", description: "Failed to fetch requests", variant: "destructive" })
      setRequests([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestAction = async (requestId: number, status: string) => {
    try {
      const response = await fetch("/api/swap-requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: requestId, status }),
      })

      const data = await response.json()
      if (data.request) {
        await fetchRequests()
        toast({
          title: "Success",
          description: `Request ${status} successfully`,
        })
      } else {
        toast({ title: "Error", description: data.error || "Failed to update request", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update request", variant: "destructive" })
    }
  }

  const handleDeleteRequest = async (requestId: number) => {
    try {
      const response = await fetch(`/api/swap-requests?id=${requestId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchRequests()
        toast({ title: "Success", description: "Request deleted successfully" })
      } else {
        const data = await response.json()
        toast({ title: "Error", description: data.error || "Failed to delete request", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete request", variant: "destructive" })
    }
  }

  const handleRateExperience = (request: EnhancedSwapRequest) => {
    setSelectedRequest(request)
    setRatingModalOpen(true)
    setRating(0)
    setFeedback("")
  }

  const submitRating = async () => {
    if (!selectedRequest || rating === 0) {
      toast({ title: "Error", description: "Please select a rating", variant: "destructive" })
      return
    }

    setIsSubmittingRating(true)
    try {
      // Determine who to rate (the other person in the swap)
      const ratedUserId =
        selectedRequest.requesterId === user.id ? selectedRequest.receiverId : selectedRequest.requesterId

      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ratedUserId,
          swapRequestId: selectedRequest.id,
          rating,
          feedback: feedback.trim() || undefined,
          review: feedback.trim() || undefined,
        }),
      })

      const data = await response.json()
      if (data.success && data.rating) {
        toast({ title: "Success", description: "Rating submitted successfully" })
        setRatingModalOpen(false)
        await fetchRequests()
      } else {
        toast({ title: "Error", description: data.error || "Failed to submit rating", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit rating", variant: "destructive" })
    } finally {
      setIsSubmittingRating(false)
    }
  }

  const renderStars = (currentRating: number, interactive = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${interactive ? "cursor-pointer" : ""} ${
          i < currentRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        } ${interactive ? "hover:text-yellow-400" : ""}`}
        onClick={interactive ? () => setRating(i + 1) : undefined}
      />
    ))
  }

  const pendingRequests = requests.filter((r) => r.status === "pending")
  const acceptedRequests = requests.filter((r) => r.status === "accepted")
  const completedRequests = requests.filter((r) => r.status === "completed")

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading requests...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <CardTitle>Pending Requests ({pendingRequests.length})</CardTitle>
          </div>
          <CardDescription>Requests waiting for your response</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No pending requests</p>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="p-4 border rounded-lg bg-yellow-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <Avatar>
                        <AvatarImage
                          src={request.requesterId === user.id ? request.receiverPhoto : request.requesterPhoto}
                          alt="User"
                        />
                        <AvatarFallback>
                          {(request.requesterId === user.id ? request.receiverName : request.requesterName)
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium">
                            {request.requesterId === user.id ? request.receiverName : request.requesterName}
                          </h4>
                          <Badge variant="outline">
                            {request.requesterId === user.id ? "Sent by you" : "Received"}
                          </Badge>
                        </div>
                        <div className="text-sm space-y-1">
                          <p>
                            <span className="font-medium text-green-600">Offering:</span>{" "}
                            {request.offeredSkillNames?.join(", ") || request.offeredSkillName}
                          </p>
                          <p>
                            <span className="font-medium text-blue-600">Wants:</span>{" "}
                            {request.wantedSkillNames?.join(", ") || request.wantedSkillName}
                          </p>
                          {request.message && <p className="text-gray-600 mt-2">{request.message}</p>}
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      {request.receiverId === user.id ? (
                        <>
                          <Button size="sm" onClick={() => handleRequestAction(request.id, "accepted")}>
                            <Check className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRequestAction(request.id, "rejected")}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => handleDeleteRequest(request.id)}>
                          <Trash2 className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Accepted Requests */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <CardTitle>Active Swaps ({acceptedRequests.length})</CardTitle>
          </div>
          <CardDescription>Skill swaps in progress</CardDescription>
        </CardHeader>
        <CardContent>
          {acceptedRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No active swaps</p>
          ) : (
            <div className="space-y-4">
              {acceptedRequests.map((request) => (
                <div key={request.id} className="p-4 border rounded-lg bg-green-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <Avatar>
                        <AvatarImage
                          src={request.requesterId === user.id ? request.receiverPhoto : request.requesterPhoto}
                          alt="User"
                        />
                        <AvatarFallback>
                          {(request.requesterId === user.id ? request.receiverName : request.requesterName)
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium">
                            {request.requesterId === user.id ? request.receiverName : request.requesterName}
                          </h4>
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        </div>
                        <div className="text-sm space-y-1">
                          <p>
                            <span className="font-medium text-green-600">Teaching:</span>{" "}
                            {request.offeredSkillNames?.join(", ") || request.offeredSkillName}
                          </p>
                          <p>
                            <span className="font-medium text-blue-600">Learning:</span>{" "}
                            {request.wantedSkillNames?.join(", ") || request.wantedSkillName}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Started: {new Date(request.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button size="sm" onClick={() => handleRequestAction(request.id, "completed")}>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Mark Complete
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Message
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Swaps */}
      <Card>
        <CardHeader>
          <CardTitle>Completed Swaps ({completedRequests.length})</CardTitle>
          <CardDescription>Your successful skill exchanges</CardDescription>
        </CardHeader>
        <CardContent>
          {completedRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No completed swaps yet</p>
          ) : (
            <div className="space-y-4">
              {completedRequests.map((request) => (
                <div key={request.id} className="p-4 border rounded-lg bg-blue-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <Avatar>
                        <AvatarImage
                          src={request.requesterId === user.id ? request.receiverPhoto : request.requesterPhoto}
                          alt="User"
                        />
                        <AvatarFallback>
                          {(request.requesterId === user.id ? request.receiverName : request.requesterName)
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium">
                            {request.requesterId === user.id ? request.receiverName : request.requesterName}
                          </h4>
                          <Badge variant="default">Completed</Badge>
                        </div>
                        <div className="text-sm space-y-1">
                          <p>
                            <span className="font-medium text-green-600">Taught:</span>{" "}
                            {request.offeredSkillNames?.join(", ") || request.offeredSkillName}
                          </p>
                          <p>
                            <span className="font-medium text-blue-600">Learned:</span>{" "}
                            {request.wantedSkillNames?.join(", ") || request.wantedSkillName}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Completed: {new Date(request.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button size="sm" variant="outline" onClick={() => handleRateExperience(request)}>
                        <Star className="w-4 h-4 mr-1" />
                        Rate Experience
                      </Button>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rating Modal */}
      <Dialog open={ratingModalOpen} onOpenChange={setRatingModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rate Your Experience</DialogTitle>
            <DialogDescription>
              How was your skill swap with{" "}
              {selectedRequest?.requesterId === user.id
                ? selectedRequest?.receiverName
                : selectedRequest?.requesterName}
              ?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex space-x-1 justify-center">{renderStars(rating, true)}</div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback (Optional)</Label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your experience with this skill swap..."
                rows={3}
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={submitRating} disabled={rating === 0 || isSubmittingRating} className="flex-1">
                {isSubmittingRating ? "Submitting..." : "Submit Rating"}
              </Button>
              <Button variant="outline" onClick={() => setRatingModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
