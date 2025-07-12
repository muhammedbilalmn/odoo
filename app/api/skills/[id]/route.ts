import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import { auth } from "@/lib/auth"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = auth.requireAuth()
    const skillId = Number.parseInt(params.id)

    const skill = db.skills.findById(skillId)
    if (!skill) {
      return NextResponse.json({ error: "Skill not found", success: false }, { status: 404 })
    }

    // Check if user owns this skill
    if (skill.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 403 })
    }

    db.skills.delete(skillId)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to delete skill",
        success: false,
      },
      { status: 400 },
    )
  }
}
