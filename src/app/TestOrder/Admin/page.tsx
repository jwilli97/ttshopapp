"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Search, ArrowUpDown } from "lucide-react"

interface Order {
  id: number
  customer: string
  order: string
  phone: string
  address: string
  status: "Pending" | "In Progress" | "Delivered"
}

// Simulated order data
const initialOrders: Order[] = [
  { id: 1, customer: "John Doe", order: "Pizza", phone: "123-456-7890", address: "123 Main St", status: "Pending" },
  { id: 2, customer: "Jane Smith", order: "Burger", phone: "098-765-4321", address: "456 Elm St", status: "In Progress" },
  { id: 3, customer: "Bob Johnson", order: "Salad", phone: "555-555-5555", address: "789 Oak St", status: "Delivered" },
]

type SortColumn = keyof Order
type SortDirection = "asc" | "desc"

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [sortColumn, setSortColumn] = useState<SortColumn>("id")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  useEffect(() => {
    // Simulating API call to fetch orders
    // In a real application, you would fetch data from your backend here
    setOrders(initialOrders)
  }, [])

  const handleSort = (column: SortColumn) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const sortedOrders = [...orders].sort((a, b) => {
    if (a[sortColumn] < b[sortColumn]) return sortDirection === "asc" ? -1 : 1
    if (a[sortColumn] > b[sortColumn]) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  const filteredOrders = sortedOrders.filter(
    (order) =>
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.status.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const updateOrderStatus = (id: number, newStatus: Order["status"]) => {
    setOrders(orders.map((order) => (order.id === id ? { ...order, status: newStatus } : order)))
  }

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "Pending":
        return <Badge variant="secondary">{status}</Badge>
      case "In Progress":
        return <Badge variant="default">{status}</Badge>
      case "Delivered":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-500">{status}</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Order Management</h1>
      <div className="flex justify-between mb-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => handleSort("id")} className="cursor-pointer">
              ID <ArrowUpDown className="ml-2 h-4 w-4 inline" />
            </TableHead>
            <TableHead onClick={() => handleSort("customer")} className="cursor-pointer">
              Customer <ArrowUpDown className="ml-2 h-4 w-4 inline" />
            </TableHead>
            <TableHead onClick={() => handleSort("order")} className="cursor-pointer">
              Order <ArrowUpDown className="ml-2 h-4 w-4 inline" />
            </TableHead>
            <TableHead onClick={() => handleSort("status")} className="cursor-pointer">
              Status <ArrowUpDown className="ml-2 h-4 w-4 inline" />
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.id}</TableCell>
              <TableCell>{order.customer}</TableCell>
              <TableCell>{order.order}</TableCell>
              <TableCell>{getStatusBadge(order.status)}</TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Order Details</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="customer" className="text-right">
                          Customer
                        </Label>
                        <Input id="customer" value={order.customer} className="col-span-3" readOnly />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="order" className="text-right">
                          Order
                        </Label>
                        <Input id="order" value={order.order} className="col-span-3" readOnly />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="phone" className="text-right">
                          Phone
                        </Label>
                        <Input id="phone" value={order.phone} className="col-span-3" readOnly />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="address" className="text-right">
                          Address
                        </Label>
                        <Input id="address" value={order.address} className="col-span-3" readOnly />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">
                          Status
                        </Label>
                        <Select
                          onValueChange={(value) => updateOrderStatus(order.id, value as Order["status"])}
                          defaultValue={order.status}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Delivered">Delivered</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}