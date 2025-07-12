import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = auth.requireAuth()
    const { searchParams } = new URL(request.url)
    const conversationWith = searchParams.get("conversationWith")

    let messages = db.messages?.findAll() || []

    if (conversationWith) {
      const otherUserId = Number.parseInt(conversationWith)
      messages = messages.filter(
        (m: any) =>
          (m.senderId === user.id && m.receiverId === otherUserId) ||
          (m.senderId === otherUserId && m.receiverId === user.id),
      )
    } else {
      // Get all messages for the user
      messages = messages.filter((m: any) => m.senderId === user.id || m.receiverId === user.id)
    }

    return NextResponse.json({ messages, success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch messages", success: false }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = auth.requireAuth()
    const { receiverId, content } = await request.json()

    if (!receiverId || !content?.trim()) {
      return NextResponse.json(
        {
          error: "Receiver ID and message content are required",
          success: false,
        },
        { status: 400 },
      )
    }

    // Check if receiver exists
    const receiver = db.users.findById(receiverId)
    if (!receiver) {
      return NextResponse.json({ error: "Receiver not found", success: false }, { status: 404 })
    }

    // Initialize messages table if it doesn't exist
    if (!db.messages) {
      db.messages = {
        data: [],
        nextId: 1,
        findAll: () => db.messages.data,
        findById: (id: number) => db.messages.data.find((item: any) => item.id === id),
        create: (data: any) => {
          const item = { ...data, id: db.messages.nextId++, createdAt: new Date() }
          db.messages.data.push(item)
          return item
        },
        update: (id: number, data: any) => {
          const index = db.messages.data.findIndex((item: any) => item.id === id)
          if (index !== -1) {
            db.messages.data[index] = { ...db.messages.data[index], ...data, updatedAt: new Date() }
            return db.messages.data[index]
          }
          return null
        },
        delete: (id: number) => {
          const index = db.messages.data.findIndex((item: any) => item.id === id)
          if (index !== -1) {
            return db.messages.data.splice(index, 1)[0]
          }
          return null
        },
      }
    }

    const message = db.messages.create({
      senderId: user.id,
      receiverId,
      content: content.trim(),
      isRead: false,
    })

    return NextResponse.json({ message, success: true })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to send message",
        success: false,
      },
      { status: 400 },
    )
  }
}
