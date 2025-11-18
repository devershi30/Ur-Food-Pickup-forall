"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import SockJS from "sockjs-client"
import { Client, IMessage, StompSubscription } from "@stomp/stompjs"
import { useAuth } from "./auth-context"
import api from "@/lib/axios"

interface OrderUpdate {
  orderId: string
  status: "received" | "preparing" | "ready" | "completed"
  timestamp: Date
}

interface WebSocketContextType {
  isConnected: boolean
  orderUpdates: OrderUpdate[]
  subscribeToOrder: (orderId: string, callback: (update: OrderUpdate) => void) => StompSubscription | null
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const [orderUpdates, setOrderUpdates] = useState<OrderUpdate[]>([])
  const [stompClient, setStompClient] = useState<Client | null>(null)

  useEffect(() => {
    if (!user) return

    const socket = new SockJS(api.defaults.baseURL + "/ws")
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        setIsConnected(true)
        console.log("[ur-food-delivery] WebSocket connected")

        // Subscribe to user's orders by default
        client.subscribe(`/topic/orders/${user.uid}`, (message: IMessage) => {
          const data: OrderUpdate = JSON.parse(message.body)
          console.log("[ur-food-delivery] Update received:", data)
          setOrderUpdates((prev) => [...prev, data])
        })
      },
      onDisconnect: () => {
        setIsConnected(false)
        console.log("[ur-food-delivery] WebSocket disconnected")
      },
      debug: (msg) => console.log(msg),
    })

    client.activate()
    setStompClient(client)

    return () => client.deactivate()
  }, [user])

  const subscribeToOrder = (orderId: string, callback: (update: OrderUpdate) => void): StompSubscription | null => {
    if (!stompClient || !isConnected) return null
    return stompClient.subscribe(`/topic/order/${orderId}`, (message: IMessage) => {
      const data: OrderUpdate = JSON.parse(message.body)
      callback(data)
    })
  }

  return (
    <WebSocketContext.Provider value={{ isConnected, orderUpdates, subscribeToOrder }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (!context) throw new Error("useWebSocket must be used within WebSocketProvider")
  return context
}
