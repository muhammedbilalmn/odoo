"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Star, Award, MessageSquare } from "lucide-react"
import type { User, Rating } from "@/lib/types"

interface RatingsTabProps {
  user: User
}

export function RatingsTab({ user }: RatingsTabProps) {
  const [ratings, setRatings] = useState<Rating[]>([])
  const [averageRating, setAverageRating] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchRatings()
  }, [user.id])

  const fetchRatings = async () => {
    try {
      const response = await fetch(`/api/ratings?userId=${user.id}`)
      const data = await response.json()

      if (data.success) {
        const userRatings = data.ratings || []
        setRatings(userRatings)

        if (userRatings.length > 0) {
          const avg = userRatings.reduce((sum: number, r: Rating) => sum + r.rating, 0) / userRatings.length
          setAverageRating(avg)
        } else {
          setAverageRating(0)
        }
      } else {
        console.error("Failed to fetch ratings:", data.error)
        setRatings([])
        setAverageRating(0)
      }
    } catch (error) {
      console.error("Error fetching ratings:", error)
      toast({ title: "Error", description: "Failed to fetch ratings", variant: "destructive" })
      setRatings([])
      setAverageRating(0)
    } finally {
      setIsLoading(false)
    }
  }

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    ratings.forEach((rating) => {
      distribution[rating.rating as keyof typeof distribution]++
    })
    return distribution
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading ratings...</p>
        </CardContent>
      </Card>
    )
  }

  const distribution = getRatingDistribution()

  return (
    <div className="space-y-6">
      {/* Rating Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
            </div>
            <CardTitle className="text-3xl font-bold">{averageRating.toFixed(1)}</CardTitle>
            <CardDescription>Average Rating</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-3xl font-bold">{ratings.length}</CardTitle>
            <CardDescription>Total Reviews</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Award className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold">
              {ratings.length > 0
                ? Math.round((ratings.filter((r) => r.rating >= 4).length / ratings.length) * 100)
                : 0}
              %
            </CardTitle>
            <CardDescription>Positive Reviews</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Rating Distribution */}
      {ratings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 w-16">
                    <span className="text-sm font-medium">{stars}</span>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{
                        width: `${ratings.length > 0 ? (distribution[stars as keyof typeof distribution] / ratings.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8">{distribution[stars as keyof typeof distribution]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Reviews */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
          <CardDescription>What others are saying about your skills</CardDescription>
        </CardHeader>
        <CardContent>
          {ratings.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No reviews yet</p>
              <p className="text-sm text-gray-400 mt-1">Complete some skill swaps to start receiving reviews!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ratings.map((rating) => (
                <div key={rating.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={rating.raterPhoto || "/placeholder.svg"} alt="Reviewer" />
                        <AvatarFallback>
                          {rating.raterName
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{rating.raterName || "Anonymous User"}</span>
                          <div className="flex">{renderStars(rating.rating)}</div>
                        </div>
                        {(rating.feedback || rating.review) && (
                          <p className="text-sm text-gray-600 mt-1">{rating.feedback || rating.review}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">{new Date(rating.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{rating.rating}/5</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
