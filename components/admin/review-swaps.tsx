"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Search, Eye, AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react"
import type { SwapRequest } from "@/lib/types"

interface EnhancedSwapRequest extends SwapRequest {
  requesterName?: string
  receiverName?: string
  offeredSkillName?: string
  wantedSkillName?: string
}

export function ReviewSwaps() {
  const [swapRequests, setSwapRequests] = useState<EnhancedSwapRequest[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchSwapRequests()
  }, [])

  const fetchSwapRequests = async () => {
    try {
      const [swapResponse, usersResponse, skillsResponse] = await Promise.all([
        fetch("/api/admin/swap-requests"),
        fetch("/api/users"),
        fetch("/api/skills"),
      ])

      const swapData = await swapResponse.json()
      const usersData = await usersResponse.json()
      const skillsData = await skillsResponse.json()

      const enhancedRequests = (swapData.requests || []).map((request: SwapRequest) => {
        const requester = usersData.users?.find((u: any) => u.id === request.requesterId)
        const receiver = usersData.users?.find((u: any) => u.id === request.receiverId)
        const offeredSkill = skillsData.skills?.find((s: any) => s.id === request.offeredSkillId)
        const wantedSkill = skillsData.skills?.find((s: any) => s.id === request.wantedSkillId)

        return {
          ...request,
          requesterName: requester?.name || "Unknown User",
          receiverName: receiver?.name || "Unknown User",
          offeredSkillName: offeredSkill?.name || "Unknown Skill",
          wantedSkillName: wantedSkill?.name || "Unknown Skill",
        }
      })

      setSwapRequests(enhancedRequests)
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch swap requests", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReviewAction = async (requestId: number, action: string) => {
    try {
      const response = await fetch("/api/admin/swap-requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      })

      const data = await response.json()
      if (data.success) {
        fetchSwapRequests()
        toast({
          title: "Success",
          description: `Swap request ${action} successfully`,
        })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to perform action", variant: "destructive" })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "accepted":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "completed":
        return <CheckCircle className="w-4 h-4 text-blue-600" />
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />
      case "cancelled":
        return <XCircle className="w-4 h-4 text-gray-600" />
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "accepted":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredRequests = swapRequests.filter((request) => {
    const matchesSearch =
      request.requesterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.receiverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.offeredSkillName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.wantedSkillName?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || request.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusCounts = () => {
    return {
      all: swapRequests.length,
      pending: swapRequests.filter((r) => r.status === "pending").length,
      accepted: swapRequests.filter((r) => r.status === "accepted").length,
      completed: swapRequests.filter((r) => r.status === "completed").length,
      rejected: swapRequests.filter((r) => r.status === "rejected").length,
      cancelled: swapRequests.filter((r) => r.status === "cancelled").length,
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p>Loading swap requests...</p>
        </CardContent>
      </Card>
    )
  }

  const statusCounts = getStatusCounts()

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Card key={status}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-sm text-gray-600 capitalize">{status}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Review Swap Requests</CardTitle>
          <CardDescription>Monitor and manage all skill swap requests</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by user names or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Swap Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <Card key={request.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex space-x-2">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src="/placeholder.svg" alt="Requester" />
                      <AvatarFallback>
                        {request.requesterName
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("") || "R"}
                      </AvatarFallback>
                    </Avatar>
                    <Avatar className="w-10 h-10">
                      <AvatarImage src="/placeholder.svg" alt="Receiver" />
                      <AvatarFallback>
                        {request.receiverName
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("") || "R"}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium">
                        {request.requesterName} → {request.receiverName}
                      </h4>
                      <Badge className={getStatusColor(request.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(request.status)}
                          <span className="capitalize">{request.status}</span>
                        </div>
                      </Badge>
                    </div>

                    <div className="text-sm space-y-1">
                      <p>
                        <span className="font-medium text-green-600">Offering:</span> {request.offeredSkillName}
                      </p>
                      <p>
                        <span className="font-medium text-blue-600">Wanting:</span> {request.wantedSkillName}
                      </p>
                      {request.message && <p className="text-gray-600 mt-2 italic">"{request.message}"</p>}
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                        <span>Created: {new Date(request.createdAt).toLocaleDateString()}</span>
                        <span>Updated: {new Date(request.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                  {request.status === "pending" && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => handleReviewAction(request.id, "approve")}>
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleReviewAction(request.id, "reject")}>
                        Reject
                      </Button>
                    </>
                  )}
                  {(request.status === "accepted" || request.status === "completed") && (
                    <Button size="sm" variant="outline" onClick={() => handleReviewAction(request.id, "flag")}>
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Flag Issue
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No swap requests found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
