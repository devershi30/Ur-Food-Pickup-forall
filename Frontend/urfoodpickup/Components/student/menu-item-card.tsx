"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Image from "next/image"
import type { MenuItem } from "@/lib/mock-data"
import api from "@/lib/axios"

interface MenuItemCardProps {
  item: MenuItem
  onAdd: (item: MenuItem) => void
}

export function MenuItemCard({ item, onAdd }: MenuItemCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          <div className="relative h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden">
            <Image 
            src={`${api.defaults.baseURL}/api/v1/food-images/download/reference/${item.uid}` || "/placeholder.svg"
          } alt={item.name} fill className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-base mb-1">{item.name}</h4>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{item.description}</p>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[var(--color-primary)]">${item.price.toFixed(2)}</span>
              <Button
                size="sm"
                onClick={() => onAdd(item)}
                disabled={!item.available}
                className="bg-[var(--color-primary)] hover:bg-blue-600"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
