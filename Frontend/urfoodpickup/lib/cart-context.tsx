"use client"

import { createContext, useContext, useState, type ReactNode, useMemo } from "react"

export interface MenuItem {
  uid?: string
  id?: string
  name: string
  description: string
  price: number
  image?: string
  vendorId?: string
  vendorName?: string
  available?: boolean
  vendor:{}
}

export interface CartItem extends MenuItem {
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: MenuItem) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  total: number
  itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = (item: MenuItem) => {
    const id = item.id || item.uid
    if (!id) return // skip if no id present

    setItems(prev => {
      const existing = prev.find(i => (i.id || i.uid) === id)
      if (existing) {
        return prev.map(i =>
          (i.id || i.uid) === id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...item, id, quantity: 1 }]
    })
  }

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(i => (i.id || i.uid) !== itemId))
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId)
      return
    }
    setItems(prev =>
      prev.map(i =>
        (i.id || i.uid) === itemId ? { ...i, quantity } : i
      )
    )
  }

  const clearCart = () => setItems([])

  const total = useMemo(
    () => items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0),
    [items]
  )

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  )

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within a CartProvider")
  return ctx
}
