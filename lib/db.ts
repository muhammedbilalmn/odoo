// Mock database - In production, use a real database like PostgreSQL with Prisma
interface User {
  id: string
  email: string
  name: string
  isPublic: boolean
  availability: string[]
  createdAt: Date
  updatedAt: Date
  role: string
  isBanned: boolean
  location?: string
}

interface Skill {
  id: string
  userId: string
  name: string
  type: string
  description: string
  isApproved: boolean
  createdAt: Date
}

interface SwapRequest {
  id: string
  requesterId: string
  receiverId: string
  skillId: string
  createdAt: Date
  updatedAt: Date
}

interface Rating {
  id: string
  ratedUserId: string
  rating: number
  comment: string
  createdAt: Date
}

interface AdminMessage {
  id: string
  userId: string
  message: string
  createdAt: Date
}

let users: User[] = [
  {
    id: "1",
    email: "admin@skillswap.com",
    name: "Admin User",
    isPublic: true,
    availability: ["weekends", "evenings"],
    createdAt: new Date(),
    updatedAt: new Date(),
    role: "admin",
    isBanned: false,
  },
  {
    id: "2",
    email: "john@example.com",
    name: "John Doe",
    location: "New York, NY",
    isPublic: true,
    availability: ["weekends"],
    createdAt: new Date(),
    updatedAt: new Date(),
    role: "user",
    isBanned: false,
  },
]

let skills: Skill[] = [
  {
    id: "1",
    userId: "2",
    name: "React Development",
    type: "offered",
    description: "Frontend development with React",
    isApproved: true,
    createdAt: new Date(),
  },
  {
    id: "2",
    userId: "2",
    name: "Photography",
    type: "wanted",
    description: "Portrait and landscape photography",
    isApproved: true,
    createdAt: new Date(),
  },
]

let swapRequests: SwapRequest[] = []
const ratings: Rating[] = []
const adminMessages: AdminMessage[] = []

export const db = {
  users: {
    findMany: () => users.filter((u) => !u.isBanned),
    findById: (id: string) => users.find((u) => u.id === id),
    findByEmail: (email: string) => users.find((u) => u.email === email),
    create: (user: Omit<User, "id" | "createdAt" | "updatedAt">) => {
      const newUser: User = {
        ...user,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      users.push(newUser)
      return newUser
    },
    update: (id: string, data: Partial<User>) => {
      const index = users.findIndex((u) => u.id === id)
      if (index !== -1) {
        users[index] = { ...users[index], ...data, updatedAt: new Date() }
        return users[index]
      }
      return null
    },
    delete: (id: string) => {
      users = users.filter((u) => u.id !== id)
    },
  },
  skills: {
    findMany: () => skills.filter((s) => s.isApproved),
    findByUserId: (userId: string) => skills.filter((s) => s.userId === userId && s.isApproved),
    findPending: () => skills.filter((s) => !s.isApproved),
    create: (skill: Omit<Skill, "id" | "createdAt">) => {
      const newSkill: Skill = {
        ...skill,
        id: Date.now().toString(),
        createdAt: new Date(),
      }
      skills.push(newSkill)
      return newSkill
    },
    update: (id: string, data: Partial<Skill>) => {
      const index = skills.findIndex((s) => s.id === id)
      if (index !== -1) {
        skills[index] = { ...skills[index], ...data }
        return skills[index]
      }
      return null
    },
    delete: (id: string) => {
      skills = skills.filter((s) => s.id !== id)
    },
  },
  swapRequests: {
    findMany: () => swapRequests,
    findByUserId: (userId: string) =>
      swapRequests.filter((sr) => sr.requesterId === userId || sr.receiverId === userId),
    findById: (id: string) => swapRequests.find((sr) => sr.id === id),
    create: (request: Omit<SwapRequest, "id" | "createdAt" | "updatedAt">) => {
      const newRequest: SwapRequest = {
        ...request,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      swapRequests.push(newRequest)
      return newRequest
    },
    update: (id: string, data: Partial<SwapRequest>) => {
      const index = swapRequests.findIndex((sr) => sr.id === id)
      if (index !== -1) {
        swapRequests[index] = { ...swapRequests[index], ...data, updatedAt: new Date() }
        return swapRequests[index]
      }
      return null
    },
    delete: (id: string) => {
      swapRequests = swapRequests.filter((sr) => sr.id !== id)
    },
  },
  ratings: {
    findMany: () => ratings,
    findByUserId: (userId: string) => ratings.filter((r) => r.ratedUserId === userId),
    create: (rating: Omit<Rating, "id" | "createdAt">) => {
      const newRating: Rating = {
        ...rating,
        id: Date.now().toString(),
        createdAt: new Date(),
      }
      ratings.push(newRating)
      return newRating
    },
  },
  adminMessages: {
    findMany: () => adminMessages,
    create: (message: Omit<AdminMessage, "id" | "createdAt">) => {
      const newMessage: AdminMessage = {
        ...message,
        id: Date.now().toString(),
        createdAt: new Date(),
      }
      adminMessages.push(newMessage)
      return newMessage
    },
  },
}
