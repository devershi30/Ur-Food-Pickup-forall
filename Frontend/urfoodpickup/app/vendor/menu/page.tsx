"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2, Download, Upload, Loader2, AlertCircle } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/axios"

interface MenuItem {
  uid: string
  name: string
  description: string
  price: number
  category: string
  available: boolean
  createdOn: string
  imageUrl?: string
}

interface Menu {
  uid: string
  title: string
  menuFoodList: MenuItem[]
  createdOn: string
}


const axiosInstance = api;


export default function VendorMenuPage() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [selectedMenuId, setSelectedMenuId] = useState<string>("")
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false)
  const [isEditingItem, setIsEditingItem] = useState<MenuItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
  })
  const [newMenuTitle, setNewMenuTitle] = useState("")

  useEffect(() => {
    fetchMenus()
  }, [])

  useEffect(() => {
    if (selectedMenuId && menus.length > 0) {
      const menu = menus.find((m) => m.uid === selectedMenuId)
      setSelectedMenu(menu || null)
    }
  }, [selectedMenuId, menus])

  const fetchMenus = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const { data } = await axiosInstance.get("/api/v1/menu/myMenus")

      setMenus(data)

      if (data.length > 0 && !selectedMenuId) {
        setSelectedMenuId(data[0].uid)
      }
    } catch (err) {
      const errorMsg = axios.isAxiosError(err) ? err.response?.data?.message || err.message : "Failed to load menus"
      setError(errorMsg)
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateMenu = async () => {
    if (!newMenuTitle.trim()) {
      toast({
        title: "Error",
        description: "Menu title is required",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)
      await axiosInstance.post("/api/v1/menu/createMenu", { title: newMenuTitle })

      setNewMenuTitle("")
      setIsMenuDialogOpen(false)
      await fetchMenus()
      toast({
        title: "Success",
        description: "Menu created successfully",
      })
    } catch (err) {
      const errorMsg = axios.isAxiosError(err) ? err.response?.data?.message || err.message : "Failed to create menu"
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveItem = async () => {
    if (!selectedMenuId || !formData.name || !formData.price || !formData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)
      const itemData = {
        name: formData.name,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        category: formData.category,
        available: true,
      }

      if (isEditingItem) {
        await axiosInstance.put(`/api/v1/menu/updateFood/${isEditingItem.uid}`, itemData)
      } else {
        await axiosInstance.post(`/api/v1/menu/addFoodToMenu/${selectedMenuId}`, itemData)
      }

      setFormData({ name: "", description: "", price: "", category: "" })
      setIsEditingItem(null)
      setIsDialogOpen(false)
      await fetchMenus()

      toast({
        title: "Success",
        description: isEditingItem ? "Item updated successfully" : "Item added successfully",
      })
    } catch (err) {
      const errorMsg = axios.isAxiosError(err) ? err.response?.data?.message || err.message : "Failed to save item"
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      await axiosInstance.put(`/api/v1/menu/updateFood/${item.uid}`, {
        ...item,
        available: !item.available,
      })

      await fetchMenus()
      toast({
        title: "Success",
        description: `Item is now ${!item.available ? "available" : "unavailable"}`,
      })
    } catch (err) {
      const errorMsg = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : "Failed to update availability"
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      })
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      await axiosInstance.delete(`/api/v1/menu/deleteFood/${itemId}`)

      await fetchMenus()
      toast({
        title: "Success",
        description: "Menu item deleted successfully",
      })
    } catch (err) {
      const errorMsg = axios.isAxiosError(err) ? err.response?.data?.message || err.message : "Failed to delete item"
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      })
    }
  }

  const handleEditItem = (item: MenuItem) => {
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
    })
    setIsEditingItem(item)
    setIsDialogOpen(true)
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, itemId: string) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploadingItemId(itemId)

      const formDataObj = new FormData()
      formDataObj.append("file", file)

      var response = await axiosInstance.post(`/api/v1/food-images/upload/${itemId}`, formDataObj, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      console.log(response)

      await fetchMenus()
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      })
    } catch (err) {
      const errorMsg = axios.isAxiosError(err) ? err.response?.data?.message || err.message : "Failed to upload image"
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      })
    } finally {
      setUploadingItemId(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDownloadImage = async (itemId: string) => {
    try {
      const { data } = await axiosInstance.get(`/api/v1/food-images/download/reference/${itemId}`, {
        responseType: "blob",
      })

      const url = window.URL.createObjectURL(data)
      const a = document.createElement("a")
      a.href = url
      a.download = `food-image-${itemId}.jpg`
      a.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: "Image downloaded successfully",
      })
    } catch (err) {
      const errorMsg = axios.isAxiosError(err) ? err.response?.data?.message || err.message : "Failed to download image"
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      })
    }
  }

  const handleDeleteImage = async (itemId: string) => {
    try {
      await axiosInstance.delete(`/api/v1/food-images/reference/${itemId}`)

      await fetchMenus()
      toast({
        title: "Success",
        description: "Image deleted successfully",
      })
    } catch (err) {
      const errorMsg = axios.isAxiosError(err) ? err.response?.data?.message || err.message : "Failed to delete image"
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      })
    }
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setFormData({ name: "", description: "", price: "", category: "" })
      setIsEditingItem(null)
    }
    setIsDialogOpen(open)
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-secondary)]" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Menu Management</h1>
          <p className="text-muted-foreground">
            {selectedMenu ? `${selectedMenu.menuFoodList.length} items in ${selectedMenu.title}` : "No menu selected"}
          </p>
        </div>
        <div className="flex gap-3">
          <Dialog open={isMenuDialogOpen} onOpenChange={setIsMenuDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[var(--color-secondary)] hover:bg-green-600">
                <Plus className="h-4 w-4 mr-2" />
                New Menu
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Menu</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="menuTitle">Menu Title</Label>
                  <Input
                    id="menuTitle"
                    placeholder="e.g., Breakfast Menu"
                    value={newMenuTitle}
                    onChange={(e) => setNewMenuTitle(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleCreateMenu}
                  disabled={isSaving}
                  className="w-full bg-[var(--color-secondary)] hover:bg-green-600"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Create Menu
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {selectedMenuId && (
            <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <Button className="bg-[var(--color-secondary)] hover:bg-green-600">
                  <Plus className="h-4 w-4 mr-2" />
                  {isEditingItem ? "Edit Item" : "Add Item"}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{isEditingItem ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Item Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Classic Burger"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your item..."
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price ($) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Input
                        id="category"
                        placeholder="e.g., Burgers"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleSaveItem}
                    disabled={isSaving}
                    className="w-full bg-[var(--color-secondary)] hover:bg-green-600"
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    {isEditingItem ? "Update Item" : "Add Item"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {menus.length > 0 && (
        <div className="mb-6">
          <Label htmlFor="menuSelect">Select Menu</Label>
          <Select value={selectedMenuId} onValueChange={setSelectedMenuId}>
            <SelectTrigger id="menuSelect" className="w-full md:w-64">
              <SelectValue placeholder="Choose a menu" />
            </SelectTrigger>
            <SelectContent>
              {menus.map((menu) => (
                <SelectItem key={menu.uid} value={menu.uid}>
                  {menu.title} ({menu.menuFoodList.length} items)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {selectedMenu && selectedMenu.menuFoodList.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedMenu.menuFoodList.map((item) => (
            <Card key={item.uid} className="overflow-hidden">
              <div className="relative h-48 w-full bg-gray-100 group">
                <Image
                  src={
                    item?.uid
                      ? `${api.defaults.baseURL}/api/v1/food-images/download/reference/${item.uid}`
                      : "/placeholder.svg?height=200&width=300&query=food+item"
                  }
                  alt={item.name}
                  fill
                  className="object-cover"
                />
                {!item.available && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white font-semibold">Unavailable</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    className="bg-white text-black hover:bg-gray-200"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingItemId === item.uid}
                  >
                    {uploadingItemId === item.uid ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    className="bg-white text-black hover:bg-gray-200"
                    onClick={() => handleDownloadImage(item.uid)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, item.uid)}
                />
              </div>

              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-[var(--color-secondary)]">${item.price.toFixed(2)}</span>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`available-${item.uid}`} className="text-sm">
                      Available
                    </Label>
                    <Switch
                      id={`available-${item.uid}`}
                      checked={item.available}
                      onCheckedChange={() => handleToggleAvailability(item)}
                    />
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <span className="inline-block bg-gray-100 px-3 py-1 rounded-full">{item.category}</span>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => handleEditItem(item)}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-destructive hover:text-destructive bg-transparent"
                    onClick={() => handleDeleteItem(item.uid)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : selectedMenuId ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">No items in this menu yet</p>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button className="bg-[var(--color-secondary)] hover:bg-green-600">
                <Plus className="h-4 w-4 mr-2" />
                Add First Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Menu Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Classic Burger"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your item..."
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Input
                      id="category"
                      placeholder="e.g., Burgers"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleSaveItem}
                  disabled={isSaving}
                  className="w-full bg-[var(--color-secondary)] hover:bg-green-600"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Add Item
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No menus created yet. Create one to get started!</p>
        </Card>
      )}
    </div>
  )
}
