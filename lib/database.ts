import type { User, Skill, SwapRequest, Rating, AdminMessage } from "./types"

// Mock database - In production, use PostgreSQL with proper schema
let users: User[] = [
  {
    id: 1,
    email: "admin@skillswap.com",
    name: "Admin User",
    isPublic: true,
    availability: ["weekdays", "weekends"],
    role: "admin",
    isBanned: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    email: "john@example.com",
    name: "John Doe",
    location: "New York, NY",
    isPublic: true,
    availability: ["weekends", "evenings"],
    role: "user",
    isBanned: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    email: "sarah@example.com",
    name: "Sarah Chen",
    location: "San Francisco, CA",
    isPublic: true,
    availability: ["weekdays"],
    role: "user",
    isBanned: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    email: "mike@example.com",
    name: "Mike Johnson",
    location: "Austin, TX",
    isPublic: true,
    availability: ["weekends", "mornings"],
    role: "user",
    isBanned: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 5,
    email: "elena@example.com",
    name: "Elena Rodriguez",
    location: "Barcelona, Spain",
    isPublic: true,
    availability: ["evenings", "weekends"],
    role: "user",
    isBanned: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 6,
    email: "david@example.com",
    name: "David Kim",
    location: "Seoul, South Korea",
    isPublic: true,
    availability: ["weekdays", "evenings"],
    role: "user",
    isBanned: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 7,
    email: "amy@example.com",
    name: "Amy Thompson",
    location: "London, UK",
    isPublic: true,
    availability: ["weekdays", "weekends"],
    role: "user",
    isBanned: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

let skills: Skill[] = [
  // John's skills
  {
    id: 1,
    userId: 2,
    name: "React Development",
    type: "offered",
    description: "Frontend development with React and TypeScript, 5+ years experience",
    isApproved: true,
    createdAt: new Date(),
  },
  {
    id: 2,
    userId: 2,
    name: "Photography",
    type: "wanted",
    description: "Portrait and landscape photography basics",
    isApproved: true,
    createdAt: new Date(),
  },
  // Sarah's skills
  {
    id: 3,
    userId: 3,
    name: "UI/UX Design",
    type: "offered",
    description: "User interface and experience design, Figma expert",
    isApproved: true,
    createdAt: new Date(),
  },
  {
    id: 4,
    userId: 3,
    name: "Spanish Language",
    type: "wanted",
    description: "Conversational Spanish for beginners",
    isApproved: true,
    createdAt: new Date(),
  },
  // Mike's skills
  {
    id: 5,
    userId: 4,
    name: "Guitar Lessons",
    type: "offered",
    description: "Acoustic guitar for beginners and intermediate players",
    isApproved: true,
    createdAt: new Date(),
  },
  {
    id: 6,
    userId: 4,
    name: "Web Development",
    type: "wanted",
    description: "Full-stack web development with modern frameworks",
    isApproved: true,
    createdAt: new Date(),
  },
  // Elena's skills
  {
    id: 7,
    userId: 5,
    name: "Spanish Language",
    type: "offered",
    description: "Native Spanish speaker, can teach conversational and business Spanish",
    isApproved: true,
    createdAt: new Date(),
  },
  {
    id: 8,
    userId: 5,
    name: "Cooking",
    type: "offered",
    description: "Traditional Spanish and Mediterranean cuisine",
    isApproved: true,
    createdAt: new Date(),
  },
  {
    id: 9,
    userId: 5,
    name: "Digital Marketing",
    type: "wanted",
    description: "Social media marketing and SEO strategies",
    isApproved: true,
    createdAt: new Date(),
  },
  // David's skills
  {
    id: 10,
    userId: 6,
    name: "Photography",
    type: "offered",
    description: "Professional photographer specializing in portraits and events",
    isApproved: true,
    createdAt: new Date(),
  },
  {
    id: 11,
    userId: 6,
    name: "Photo Editing",
    type: "offered",
    description: "Advanced Photoshop and Lightroom techniques",
    isApproved: true,
    createdAt: new Date(),
  },
  {
    id: 12,
    userId: 6,
    name: "Korean Language",
    type: "offered",
    description: "Native Korean speaker, can teach basic to intermediate Korean",
    isApproved: true,
    createdAt: new Date(),
  },
  {
    id: 13,
    userId: 6,
    name: "Web Development",
    type: "wanted",
    description: "Modern web development with React and Node.js",
    isApproved: true,
    createdAt: new Date(),
  },
  // Amy's skills
  {
    id: 14,
    userId: 7,
    name: "Content Writing",
    type: "offered",
    description: "Professional content writer with expertise in tech and lifestyle",
    isApproved: true,
    createdAt: new Date(),
  },
  {
    id: 15,
    userId: 7,
    name: "Copywriting",
    type: "offered",
    description: "Marketing copy and email campaigns",
    isApproved: true,
    createdAt: new Date(),
  },
  {
    id: 16,
    userId: 7,
    name: "Video Editing",
    type: "wanted",
    description: "Video editing for social media and YouTube",
    isApproved: true,
    createdAt: new Date(),
  },
]

let swapRequests: SwapRequest[] = [
  {
    id: 1,
    requesterId: 2,
    receiverId: 3,
    offeredSkillId: 1,
    wantedSkillId: 3,
    status: "pending",
    message: "Hi! I would love to learn UI/UX design from you in exchange for React development lessons.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const ratings: Rating[] = [
  {
    id: 1,
    swapRequestId: 1,
    raterId: 3,
    ratedUserId: 2,
    rating: 5,
    feedback: "Excellent teacher! John explained React concepts very clearly.",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
  },
  {
    id: 2,
    swapRequestId: 2,
    raterId: 4,
    ratedUserId: 6,
    rating: 4,
    feedback: "Great photography session. David is very patient and knowledgeable.",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
  },
  {
    id: 3,
    swapRequestId: 3,
    raterId: 5,
    ratedUserId: 7,
    rating: 5,
    feedback: "Amy's writing tips were incredibly helpful for my blog!",
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
  },
]
const adminMessages: AdminMessage[] = []

export const db = {
  users: {
    findAll: () => users.filter((u) => !u.isBanned),
    findById: (id: number) => users.find((u) => u.id === id),
    findByEmail: (email: string) => users.find((u) => u.email === email),
    create: (userData: Omit<User, "id" | "createdAt" | "updatedAt">) => {
      const newUser: User = {
        ...userData,
        id: Math.max(...users.map((u) => u.id), 0) + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      users.push(newUser)
      return newUser
    },
    update: (id: number, updates: Partial<User>) => {
      const index = users.findIndex((u) => u.id === id)
      if (index !== -1) {
        users[index] = { ...users[index], ...updates, updatedAt: new Date() }
        return users[index]
      }
      return null
    },
    delete: (id: number) => {
      users = users.filter((u) => u.id !== id)
    },
  },
  skills: {
    findAll: () => skills.filter((s) => s.isApproved),
    findByUserId: (userId: number) => skills.filter((s) => s.userId === userId),
    findPending: () => skills.filter((s) => !s.isApproved),
    create: (skillData: Omit<Skill, "id" | "createdAt">) => {
      const newSkill: Skill = {
        ...skillData,
        id: Math.max(...skills.map((s) => s.id), 0) + 1,
        createdAt: new Date(),
      }
      skills.push(newSkill)
      return newSkill
    },
    update: (id: number, updates: Partial<Skill>) => {
      const index = skills.findIndex((s) => s.id === id)
      if (index !== -1) {
        skills[index] = { ...skills[index], ...updates }
        return skills[index]
      }
      return null
    },
    delete: (id: number) => {
      skills = skills.filter((s) => s.id !== id)
    },
  },
  swapRequests: {
    findAll: () => swapRequests,
    findByUserId: (userId: number) =>
      swapRequests.filter((sr) => sr.requesterId === userId || sr.receiverId === userId),
    findById: (id: number) => swapRequests.find((sr) => sr.id === id),
    create: (requestData: Omit<SwapRequest, "id" | "createdAt" | "updatedAt">) => {
      const newRequest: SwapRequest = {
        ...requestData,
        id: Math.max(...swapRequests.map((sr) => sr.id), 0) + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      swapRequests.push(newRequest)
      return newRequest
    },
    update: (id: number, updates: Partial<SwapRequest>) => {
      const index = swapRequests.findIndex((sr) => sr.id === id)
      if (index !== -1) {
        swapRequests[index] = { ...swapRequests[index], ...updates, updatedAt: new Date() }
        return swapRequests[index]
      }
      return null
    },
    delete: (id: number) => {
      swapRequests = swapRequests.filter((sr) => sr.id !== id)
    },
  },
  ratings: {
    findAll: () => ratings,
    findByUserId: (userId: number) => ratings.filter((r) => r.ratedUserId === userId),
    create: (ratingData: Omit<Rating, "id" | "createdAt">) => {
      const newRating: Rating = {
        ...ratingData,
        id: Math.max(...ratings.map((r) => r.id), 0) + 1,
        createdAt: new Date(),
      }
      ratings.push(newRating)
      return newRating
    },
  },
  adminMessages: {
    findAll: () => adminMessages.filter((m) => m.isActive),
    create: (messageData: Omit<AdminMessage, "id" | "createdAt">) => {
      const newMessage: AdminMessage = {
        ...messageData,
        id: Math.max(...adminMessages.map((m) => m.id), 0) + 1,
        createdAt: new Date(),
      }
      adminMessages.push(newMessage)
      return newMessage
    },
  },
}
