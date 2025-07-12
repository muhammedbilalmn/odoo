import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    const user = await auth.login(email, password)
    return NextResponse.json({ user, success: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Login failed" }, { status: 401 })
  }
}
