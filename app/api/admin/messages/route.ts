import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    auth.requireAdmin()
    const messages = db.adminMessages.findAll()
    return NextResponse.json({ messages })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Access denied" }, { status: 403 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = auth.requireAdmin()
    const messageData = await request.json()

    const message = db.adminMessages.create({
      ...messageData,
      adminId: admin.id,
      isActive: true,
    })

    return NextResponse.json({ message })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create message" },
      { status: 400 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    auth.requireAdmin()
    const { id, ...updates } = await request.json()

    // In a real implementation, you'd update the message in the database
    return NextResponse.json({ success: true, message: { id, ...updates } })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Update failed" }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    auth.requireAdmin()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Message ID required" }, { status: 400 })
    }

    // In a real implementation, you'd delete the message from the database
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Delete failed" }, { status: 400 })
  }
}
