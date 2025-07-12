import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    auth.requireAdmin()
    const requests = db.swapRequests.findAll()
    return NextResponse.json({ requests })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Access denied" }, { status: 403 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    auth.requireAdmin()
    const { requestId, action } = await request.json()

    let updatedRequest
    switch (action) {
      case "approve":
        updatedRequest = db.swapRequests.update(requestId, { status: "accepted" })
        break
      case "reject":
        updatedRequest = db.swapRequests.update(requestId, { status: "rejected" })
        break
      case "flag":
        // Add flagged status or handle flagged requests
        updatedRequest = db.swapRequests.update(requestId, { status: "flagged" })
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ success: true, request: updatedRequest })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Action failed" }, { status: 400 })
  }
}
