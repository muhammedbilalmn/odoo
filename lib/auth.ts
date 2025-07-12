import { db } from "./database"
import type { User } from "./types"

// Simple session management
let currentUser: User | null = null

export const auth = {
  getCurrentUser: () => currentUser,

  login: async (email: string, password: string) => {
    // Simple auth - In production, use proper password hashing
    const user = db.users.findByEmail(email)
    if (user && !user.isBanned) {
      currentUser = user
      return user
    }
    throw new Error("Invalid credentials or user is banned")
  },

  register: async (userData: { email: string; name: string; password: string; location?: string }) => {
    const existingUser = db.users.findByEmail(userData.email)
    if (existingUser) {
      throw new Error("User already exists")
    }

    const newUser = db.users.create({
      email: userData.email,
      name: userData.name,
      location: userData.location,
      isPublic: true,
      availability: [],
      role: "user",
      isBanned: false,
    })

    currentUser = newUser
    return newUser
  },

  logout: () => {
    currentUser = null
  },

  requireAuth: () => {
    if (!currentUser) {
      throw new Error("Authentication required")
    }
    return currentUser
  },

  requireAdmin: () => {
    const user = auth.requireAuth()
    if (user.role !== "admin") {
      throw new Error("Admin access required")
    }
    return user
  },
}
