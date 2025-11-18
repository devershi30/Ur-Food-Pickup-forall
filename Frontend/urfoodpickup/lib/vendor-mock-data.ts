export interface VendorOrder {
  id: string
  customerName: string
  items: Array<{ name: string; quantity: number; price: number }>
  total: number
  status: "received" | "preparing" | "ready" | "completed"
  orderType: "pickup" | "delivery"
  createdAt: Date
  notes?: string
}

export interface VendorStats {
  todayOrders: number
  todayRevenue: number
  activeOrders: number
  isOpen: boolean
}

export const mockVendorOrders: VendorOrder[] = [
  // {
  //   id: "ord001",
  //   customerName: "John Doe",
  //   items: [
  //     { name: "Classic Burger", quantity: 2, price: 8.99 },
  //     { name: "Fries", quantity: 1, price: 3.99 },
  //   ],
  //   total: 21.97,
  //   status: "received",
  //   orderType: "pickup",
  //   createdAt: new Date(Date.now() - 5 * 60 * 1000),
  //   notes: "No onions please",
  // },
  // {
  //   id: "ord002",
  //   customerName: "Jane Smith",
  //   items: [{ name: "Bacon Cheeseburger", quantity: 1, price: 10.99 }],
  //   total: 10.99,
  //   status: "preparing",
  //   orderType: "delivery",
  //   createdAt: new Date(Date.now() - 15 * 60 * 1000),
  // },
  // {
  //   id: "ord003",
  //   customerName: "Mike Johnson",
  //   items: [
  //     { name: "Classic Burger", quantity: 1, price: 8.99 },
  //     { name: "Fries", quantity: 2, price: 3.99 },
  //   ],
  //   total: 16.97,
  //   status: "ready",
  //   orderType: "pickup",
  //   createdAt: new Date(Date.now() - 25 * 60 * 1000),
  // },
]

export const mockVendorStats: VendorStats = {
  todayOrders: 0,
  todayRevenue: 0.0,
  activeOrders: 0,
  isOpen: true,
}

export interface SalesData {
  date: string
  revenue: number
  orders: number
}

export const mockSalesData: SalesData[] = [
  { date: "Mon", revenue: 320, orders: 15 },
  { date: "Tue", revenue: 450, orders: 22 },
  { date: "Wed", revenue: 380, orders: 18 },
  { date: "Thu", revenue: 520, orders: 25 },
  { date: "Fri", revenue: 680, orders: 32 },
  { date: "Sat", revenue: 750, orders: 38 },
  { date: "Sun", revenue: 490, orders: 24 },
]
