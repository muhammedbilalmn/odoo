export interface User {
  id: number
  email: string
  name: string
  location?: string
  profilePhoto?: string
  isPublic: boolean
  availability: string[]
  createdAt: Date
  updatedAt: Date
  role: "user" | "admin"
  isBanned: boolean
  bio?: string
}

export interface Skill {
  id: number
  userId: number
  name: string
  type: "offered" | "wanted"
  description?: string
  isApproved: boolean
  createdAt: Date
}

export interface SwapRequest {
  id: number
  requesterId: number
  receiverId: number
  offeredSkillId: number
  wantedSkillId: number
  offeredSkillIds?: number[]
  wantedSkillIds?: number[]
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled"
  message?: string
  createdAt: Date
  updatedAt: Date
}

export interface Rating {
  id: number
  swapRequestId: number
  raterId: number
  ratedUserId: number
  rating: number
  feedback?: string
  review?: string
  createdAt: Date
  raterName?: string
  raterPhoto?: string
}

export interface AdminMessage {
  id: number
  adminId: number
  title: string
  content: string
  type: "update" | "maintenance" | "announcement"
  isActive: boolean
  createdAt: Date
}
