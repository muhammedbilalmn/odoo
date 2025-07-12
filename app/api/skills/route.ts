import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    let skills = db.skills.findAll()

    if (userId) {
      skills = skills.filter((s) => s.userId === Number.parseInt(userId))
    }

    return NextResponse.json({ skills, success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch skills", success: false }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = auth.requireAuth()
    const skillData = await request.json()

    // Validate required fields
    if (!skillData.name || !skillData.type) {
      return NextResponse.json(
        {
          error: "Skill name and type are required",
          success: false,
        },
        { status: 400 },
      )
    }

    // Check if skill already exists for this user
    const existingSkills = db.skills.findAll()
    const duplicateSkill = existingSkills.find(
      (s) => s.userId === user.id && s.name.toLowerCase() === skillData.name.toLowerCase() && s.type === skillData.type,
    )

    if (duplicateSkill) {
      return NextResponse.json(
        {
          error: "You already have this skill in your list",
          success: false,
        },
        { status: 400 },
      )
    }

    const skill = db.skills.create({
      userId: user.id,
      name: skillData.name.trim(),
      type: skillData.type,
      description: skillData.description?.trim() || "",
      isApproved: true, // Auto-approve for now
    })

    return NextResponse.json({ skill, success: true })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create skill",
        success: false,
      },
      { status: 400 },
    )
  }
}
