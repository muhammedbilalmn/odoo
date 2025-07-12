import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    auth.requireAdmin()
    const users = db.users.findAll()
    return NextResponse.json({ users })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Access denied" }, { status: 403 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    auth.requireAdmin()
    const { userId, action } = await request.json()

    if (action === "ban") {
      const user = db.users.update(userId, { isBanned: true })
      return NextResponse.json({ user })
    } else if (action === "unban") {
      const user = db.users.update(userId, { isBanned: false })
      return NextResponse.json({ user })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Action failed" }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    auth.requireAdmin()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    db.users.delete(Number.parseInt(userId))
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Delete failed" }, { status: 400 })
  }
}
