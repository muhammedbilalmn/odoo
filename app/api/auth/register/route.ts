import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()
    const user = await auth.register(userData)
    return NextResponse.json({ user, success: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Registration failed" }, { status: 400 })
  }
}
