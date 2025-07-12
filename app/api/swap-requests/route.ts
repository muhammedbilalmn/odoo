import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const user = auth.requireAuth()
    const requests = db.swapRequests.findByUserId(user.id)
    return NextResponse.json({ requests })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch requests" },
      { status: 400 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = auth.requireAuth()
    const requestData = await request.json()

    const swapRequest = db.swapRequests.create({
      ...requestData,
      requesterId: user.id,
      status: "pending",
    })

    return NextResponse.json({ request: swapRequest })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create request" },
      { status: 400 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = auth.requireAuth()
    const { id, status } = await request.json()

    const swapRequest = db.swapRequests.findById(id)
    if (!swapRequest || (swapRequest.receiverId !== user.id && swapRequest.requesterId !== user.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const updatedRequest = db.swapRequests.update(id, { status })
    return NextResponse.json({ request: updatedRequest })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update request" },
      { status: 400 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = auth.requireAuth()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Request ID required" }, { status: 400 })
    }

    const swapRequest = db.swapRequests.findById(Number.parseInt(id))
    if (!swapRequest || swapRequest.requesterId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    db.swapRequests.delete(Number.parseInt(id))
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete request" },
      { status: 400 },
    )
  }
}
