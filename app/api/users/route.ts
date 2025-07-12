import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const skill = searchParams.get("skill")

    let users = db.users.findAll().filter((u) => u.isPublic)

    if (skill) {
      const userSkills = db.skills.findAll()
      const userIds = userSkills.filter((s) => s.name.toLowerCase().includes(skill.toLowerCase())).map((s) => s.userId)
      users = users.filter((u) => userIds.includes(u.id))
    }

    return NextResponse.json({ users })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = auth.requireAuth()
    const updates = await request.json()

    const updatedUser = db.users.update(user.id, updates)
    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Update failed" }, { status: 400 })
  }
}
