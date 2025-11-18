export interface AdminVendor {
  id: string
  name: string
  cuisine: string
  email: string
  phone: string
  status: "active" | "pending" | "suspended"
  joinedDate: Date
  totalOrders: number
  rating: number
}

export interface AdminUser {
  id: string
  name: string
  email: string
  role: "student" | "vendor" | "admin"
  status: "active" | "suspended"
  joinedDate: Date
  totalOrders: number
}

export interface SystemStats {
  totalUsers: number
  totalVendors: number
  totalOrders: number
  dailyRevenue: number
}

export const mockAdminVendors: AdminVendor[] = [
  {
    id: "1",
    name: "Campus Burgers",
    cuisine: "American",
    email: "contact@campusburgers.com",
    phone: "(555) 123-4567",
    status: "active",
    joinedDate: new Date("2024-01-15"),
    totalOrders: 342,
    rating: 4.5,
  },
  {
    id: "2",
    name: "Pizza Paradise",
    cuisine: "Italian",
    email: "info@pizzaparadise.com",
    phone: "(555) 234-5678",
    status: "active",
    joinedDate: new Date("2024-02-20"),
    totalOrders: 289,
    rating: 4.7,
  },
  {
    id: "3",
    name: "Sushi Express",
    cuisine: "Japanese",
    email: "hello@sushiexpress.com",
    phone: "(555) 345-6789",
    status: "active",
    joinedDate: new Date("2024-03-10"),
    totalOrders: 156,
    rating: 4.6,
  },
  {
    id: "4",
    name: "New Vendor Request",
    cuisine: "Mexican",
    email: "newvendor@example.com",
    phone: "(555) 456-7890",
    status: "pending",
    joinedDate: new Date("2024-12-01"),
    totalOrders: 0,
    rating: 0,
  },
]

export const mockAdminUsers: AdminUser[] = [
  {
    id: "u1",
    name: "John Doe",
    email: "john@example.com",
    role: "student",
    status: "active",
    joinedDate: new Date("2024-01-10"),
    totalOrders: 45,
  },
  {
    id: "u2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "student",
    status: "active",
    joinedDate: new Date("2024-02-15"),
    totalOrders: 32,
  },
  {
    id: "u3",
    name: "Mike Johnson",
    email: "mike@example.com",
    role: "student",
    status: "active",
    joinedDate: new Date("2024-03-20"),
    totalOrders: 28,
  },
  {
    id: "u4",
    name: "Sarah Williams",
    email: "sarah@example.com",
    role: "student",
    status: "suspended",
    joinedDate: new Date("2024-04-05"),
    totalOrders: 12,
  },
]

export const mockSystemStats: SystemStats = {
  totalUsers: 1247,
  totalVendors: 24,
  totalOrders: 8934,
  dailyRevenue: 12487.52,
}
