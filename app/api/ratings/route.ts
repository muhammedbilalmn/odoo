import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (userId) {
      const ratings = db.ratings.findByUserId(Number.parseInt(userId))

      // Enhance ratings with rater information
      const enhancedRatings = ratings.map((rating) => {
        const rater = db.users.findById(rating.raterId)
        return {
          ...rating,
          raterName: rater?.name || "Anonymous User",
          raterPhoto: rater?.profilePhoto || "",
        }
      })

      return NextResponse.json({
        success: true,
        ratings: enhancedRatings,
      })
    }

    const ratings = db.ratings.findAll()
    return NextResponse.json({
      success: true,
      ratings,
    })
  } catch (error) {
    console.error("Error fetching ratings:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch ratings",
        ratings: [],
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = auth.requireAuth()
    const ratingData = await request.json()

    // Validate required fields
    if (!ratingData.ratedUserId || !ratingData.rating || !ratingData.swapRequestId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 },
      )
    }

    // Validate rating range
    if (ratingData.rating < 1 || ratingData.rating > 5) {
      return NextResponse.json(
        {
          success: false,
          error: "Rating must be between 1 and 5",
        },
        { status: 400 },
      )
    }

    // Check if user has already rated this swap
    const existingRating = db.ratings
      .findAll()
      .find((r) => r.raterId === user.id && r.swapRequestId === ratingData.swapRequestId)

    if (existingRating) {
      return NextResponse.json(
        {
          success: false,
          error: "You have already rated this swap",
        },
        { status: 400 },
      )
    }

    // Verify the swap request exists and user was part of it
    const swapRequest = db.swapRequests.findById(ratingData.swapRequestId)
    if (!swapRequest || (swapRequest.requesterId !== user.id && swapRequest.receiverId !== user.id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid swap request",
        },
        { status: 400 },
      )
    }

    // Verify swap is completed
    if (swapRequest.status !== "completed") {
      return NextResponse.json(
        {
          success: false,
          error: "Can only rate completed swaps",
        },
        { status: 400 },
      )
    }

    const rating = db.ratings.create({
      raterId: user.id,
      ratedUserId: ratingData.ratedUserId,
      swapRequestId: ratingData.swapRequestId,
      rating: ratingData.rating,
      feedback: ratingData.feedback || ratingData.review || "",
      review: ratingData.feedback || ratingData.review || "",
      createdAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      rating,
    })
  } catch (error) {
    console.error("Error creating rating:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create rating",
      },
      { status: 400 },
    )
  }
}
