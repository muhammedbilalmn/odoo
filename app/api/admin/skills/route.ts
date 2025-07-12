import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    auth.requireAdmin()
    const pendingSkills = db.skills.findPending()
    return NextResponse.json({ skills: pendingSkills })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Access denied" }, { status: 403 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    auth.requireAdmin()
    const { skillId, action } = await request.json()

    if (action === "approve") {
      const skill = db.skills.update(skillId, { isApproved: true })
      return NextResponse.json({ skill })
    } else if (action === "reject") {
      db.skills.delete(skillId)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Action failed" }, { status: 400 })
  }
}
