export interface Vendor {
  id: string
  name: string
  cuisine: string
  rating: number
  distance: number
  image: string
  lat: number
  lng: number
  isOpen: boolean
  deliveryTime: string
}

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  vendorId: string
  vendorName: string
  available: boolean
  category: string
}

export const mockVendors: Vendor[] = [
  {
    id: "1",
    name: "Campus Burgers",
    cuisine: "American",
    rating: 4.5,
    distance: 0.3,
    image: "/burger-restaurant.png",
    lat: 40.7128,
    lng: -74.006,
    isOpen: true,
    deliveryTime: "15-25 min",
  },
  {
    id: "2",
    name: "Pizza Paradise",
    cuisine: "Italian",
    rating: 4.7,
    distance: 0.5,
    image: "/bustling-pizza-restaurant.png",
    lat: 40.7138,
    lng: -74.007,
    isOpen: true,
    deliveryTime: "20-30 min",
  },
  {
    id: "3",
    name: "Sushi Express",
    cuisine: "Japanese",
    rating: 4.6,
    distance: 0.8,
    image: "/bustling-sushi-restaurant.png",
    lat: 40.7148,
    lng: -74.008,
    isOpen: true,
    deliveryTime: "25-35 min",
  },
  {
    id: "4",
    name: "Taco Fiesta",
    cuisine: "Mexican",
    rating: 4.4,
    distance: 0.4,
    image: "/vibrant-taco-restaurant.png",
    lat: 40.7118,
    lng: -74.005,
    isOpen: false,
    deliveryTime: "20-30 min",
  },
  {
    id: "5",
    name: "Green Bowl",
    cuisine: "Healthy",
    rating: 4.8,
    distance: 0.6,
    image: "/healthy-food-bowl.png",
    lat: 40.7158,
    lng: -74.009,
    isOpen: true,
    deliveryTime: "15-20 min",
  },
]

export const mockMenuItems: Record<string, MenuItem[]> = {
  "1": [
    {
      id: "m1",
      name: "Classic Burger",
      description: "Beef patty, lettuce, tomato, cheese, special sauce",
      price: 8.99,
      image: "/classic-burger.png",
      vendorId: "1",
      vendorName: "Campus Burgers",
      available: true,
      category: "Burgers",
    },
    {
      id: "m2",
      name: "Bacon Cheeseburger",
      description: "Double beef patty, bacon, cheddar cheese",
      price: 10.99,
      image: "/bacon-cheeseburger.png",
      vendorId: "1",
      vendorName: "Campus Burgers",
      available: true,
      category: "Burgers",
    },
    {
      id: "m3",
      name: "Fries",
      description: "Crispy golden fries",
      price: 3.99,
      image: "/crispy-french-fries.png",
      vendorId: "1",
      vendorName: "Campus Burgers",
      available: true,
      category: "Sides",
    },
  ],
  "2": [
    {
      id: "m4",
      name: "Margherita Pizza",
      description: "Fresh mozzarella, tomato sauce, basil",
      price: 12.99,
      image: "/margherita-pizza.png",
      vendorId: "2",
      vendorName: "Pizza Paradise",
      available: true,
      category: "Pizza",
    },
    {
      id: "m5",
      name: "Pepperoni Pizza",
      description: "Classic pepperoni with mozzarella",
      price: 14.99,
      image: "/pepperoni-pizza.png",
      vendorId: "2",
      vendorName: "Pizza Paradise",
      available: true,
      category: "Pizza",
    },
  ],
  "3": [
    {
      id: "m6",
      name: "California Roll",
      description: "Crab, avocado, cucumber",
      price: 9.99,
      image: "/california-roll.png",
      vendorId: "3",
      vendorName: "Sushi Express",
      available: true,
      category: "Rolls",
    },
    {
      id: "m7",
      name: "Salmon Nigiri",
      description: "Fresh salmon over rice",
      price: 11.99,
      image: "/salmon-nigiri.png",
      vendorId: "3",
      vendorName: "Sushi Express",
      available: true,
      category: "Nigiri",
    },
  ],
}

export interface Order {
  id: string
  vendorName: string
  items: Array<{ name: string; quantity: number; price: number }>
  total: number
  status: "received" | "preparing" | "ready" | "completed"
  createdAt: Date
  estimatedTime: string
}

export const mockOrders: Order[] = [
  {
    id: "ord1",
    vendorName: "Campus Burgers",
    items: [
      { name: "Classic Burger", quantity: 2, price: 8.99 },
      { name: "Fries", quantity: 1, price: 3.99 },
    ],
    total: 21.97,
    status: "preparing",
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
    estimatedTime: "10 min",
  },
  {
    id: "ord2",
    vendorName: "Pizza Paradise",
    items: [{ name: "Margherita Pizza", quantity: 1, price: 12.99 }],
    total: 12.99,
    status: "completed",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    estimatedTime: "Delivered",
  },
]
