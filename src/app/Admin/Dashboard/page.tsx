"use client";

import React, { useState, useEffect } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Bell, ChevronDown, Package, Plus, Search, ShoppingCart, User } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

// Define Order types
interface Order {
    id: string
    display_name: string
    order_details: string
    token_redemption: string
    payment_method: string
    delivery_method: string
    street_address: string
    zipcode: string
    status: "pending" | "in progress" | "completed" | "cancelled"
}

type SortColumn = keyof Order
type SortDirection = "asc" | "desc"

// Filler data for inventory tests
const inventory = [
    { name: "T-Shirt", quantity: 50, lowStockThreshold: 20 },
    { name: "Jeans", quantity: 30, lowStockThreshold: 15 },
    { name: "Sneakers", quantity: 25, lowStockThreshold: 10 },
    { name: "Hoodie", quantity: 40, lowStockThreshold: 20 },
    { name: "Dress", quantity: 35, lowStockThreshold: 15 },
    { name: "Socks", quantity: 100, lowStockThreshold: 50 },
]

const dailySalesData = [
    { name: "Mon", sales: 12 },
    { name: "Tue", sales: 19 },
    { name: "Wed", sales: 3 },
    { name: "Thu", sales: 5 },
    { name: "Fri", sales: 2 },
    { name: "Sat", sales: 3 },
    { name: "Sun", sales: 7 },
]

const popularItemsData = [
    { name: "T-Shirt", sales: 65 },
    { name: "Jeans", sales: 59 },
    { name: "Sneakers", sales: 80 },
    { name: "Hoodie", sales: 81 },
    { name: "Dress", sales: 56 },
]

const stockLevelsData = [
    { name: "In Stock", value: 300 },
    { name: "Low Stock", value: 50 },
    { name: "Out of Stock", value: 100 },
]

const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
        case "pending":
        return <Badge variant="secondary">{status}</Badge>
        case "in progress":
        return <Badge variant="default">{status}</Badge>
        case "completed":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-500">{status}</Badge>
        case "cancelled":
        return <Badge variant="destructive">{status}</Badge>
        default:
        return <Badge variant="default">{status}</Badge>
    }
}

export default function AdminDashboard() {
    const [orders, setOrders] = useState<Order[]>([])
    const [displayName, setDisplayName] = useState<string>('Loading...');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [sortColumn, setSortColumn] = useState<SortColumn>("id")
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [editingOrder, setEditingOrder] = useState<Order | null>(null)
    const { toast } = useToast()

    const handleSort = (column: SortColumn) => {
        if (column === sortColumn) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
        setSortColumn(column)
        setSortDirection("asc")
        }
    }

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch current admin's information
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('display_name, avatar_url')
                        .eq('user_id', user.id)
                        .single();
    
                    if (error) throw error;
                    if (data) {
                        setDisplayName(data.display_name);
                        setAvatarUrl(data.avatar_url);
                    }
                }

                // Fetch all orders without any user-specific filter
                const { data: orderData, error: orderError } = await supabase
                    .from('orders')
                    .select('*')
                    .order('created_at', { ascending: false })

                if (orderError) throw orderError
                if (orderData) {
                    setOrders(orderData)
                }
            } catch (error) {
                console.error("There was a problem fetching data:", error)
                toast({
                    variant: "destructive",
                    title: "Error fetching orders",
                    description: "There was a problem loading the orders.",
                    action: <ToastAction altText="Try again">Try again</ToastAction>,
                })
            }
        }
        fetchData()
    }, [])

    const sortedOrders = [...orders].sort((a, b) => {
        if (a[sortColumn] < b[sortColumn]) return sortDirection === "asc" ? -1 : 1
        if (a[sortColumn] > b[sortColumn]) return sortDirection === "asc" ? 1 : -1
        return 0
    })

    const filteredOrders = sortedOrders.filter(
        (order) =>
        (order.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (order.status?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    )

    const updateOrderStatus = (id: string, newStatus: Order["status"]) => {
        setOrders(orders.map((order) => (order.id === id ? { ...order, status: newStatus } : order)))
    }

    const handleEditOrder = (order: Order) => {
        setEditingOrder(order)
        setIsEditDialogOpen(true)
    }

    const handleSaveEdit = async () => {
        if (editingOrder) {
            try {
                // Update order in Supabase
                const { data, error } = await supabase
                .from('orders')
                .update({
                    display_name: editingOrder.display_name,
                    status: editingOrder.status,
                    order_details: editingOrder.order_details,
                })
                .eq('id', editingOrder.id)

                if (error) throw error

                // Update local state
                setOrders(orders.map((order) => (order.id === editingOrder.id ? editingOrder : order)))
                
                setIsEditDialogOpen(false)
                setEditingOrder(null)

                toast({
                    title: "Order updated",
                    description: "The order has been successfully updated.",
                    action: (
                        <ToastAction altText="Dismiss">Dismiss</ToastAction>
                    ),
                })
            } catch (error) {
                console.error("Error updating order:", error)
                toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description: "There was a problem updating the order.",
                    action: (
                        <ToastAction altText="Try again">Try again</ToastAction>
                    ),
                })
            }
        }
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navigation Bar */}
            <nav className="flex items-center justify-between border-b bg-white p-4 shadow-sm">
                <div className="flex items-center space-x-2">
                <Image src="/tinytreelogo.png" width={30} height={30} alt="Tiny Trees Farm Logo" />
                <span className="text-xl font-bold">Tiny Trees Farm</span>
                </div>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={avatarUrl} alt="@user" />
                        <AvatarFallback>TT</AvatarFallback>
                    </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">john@example.com</p>
                    </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuItem>Log out</DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
            </nav>

            {/* Main Content */}
            <main className="container mx-auto p-4">
                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders Today</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">25</div>
                    <p className="text-xs text-muted-foreground">+10% from yesterday</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Current Stock Levels</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">1,234</div>
                    <p className="text-xs text-muted-foreground">items in stock</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
                    <ArrowUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">$1,234.56</div>
                    <p className="text-xs text-muted-foreground">+20% from yesterday</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Deliveries</CardTitle>
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">orders to be shipped</p>
                    </CardContent>
                </Card>
                </div>

                {/* Orders and Stock Management */}
                <div className="mt-6 grid gap-6">
                {/* Orders Management */}
                <Card>
                    <CardHeader>
                    <CardTitle>Orders Management</CardTitle>
                    <CardDescription>Manage and track recent orders</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <div className="flex justify-between mb-4">
                        <Input
                        className="w-full md:w-[300px]"
                        placeholder="Search orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Select>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead onClick={() => handleSort("id")} className="cursor-pointer">
                            <div className="flex items-center text-center text-nowrap">Order ID <ArrowUpDown className="ml-2 h-4 w-4" /></div>
                            </TableHead>
                            <TableHead onClick={() => handleSort("display_name")} className="cursor-pointer">
                            <div className="flex items-center text-center text-nowrap">Customer <ArrowUpDown className="ml-2 h-4 w-4" /></div>
                            </TableHead>
                            <TableHead className="text-center">Order Details</TableHead>
                            <TableHead className="text-center">Token Redemption</TableHead>
                            <TableHead className="text-center">Payment Method</TableHead>
                            <TableHead className="text-center">Delivery Method</TableHead>
                            <TableHead className="text-center">Street Address</TableHead>
                            <TableHead className="text-center">Zipcode</TableHead>
                            <TableHead onClick={() => handleSort("status")} className="cursor-pointer">
                            <div className="flex items-center text-center text-nowrap">Status <ArrowUpDown className="ml-2 h-4 w-4" /></div>
                            </TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody className="text-center">
                        {filteredOrders.map((order) => (
                            <TableRow key={order.id}>
                            <TableCell>{order.id}</TableCell>
                            <TableCell>{order.display_name}</TableCell>
                            <TableCell>
                                {(() => {
                                try {
                                    const details = JSON.parse(order.order_details)
                                    return `${details.item}`
                                } catch (error) {
                                    return order.order_details
                                }
                                })()}
                            </TableCell>
                            <TableCell>{order.token_redemption || "None"}</TableCell>
                            <TableCell>{order.payment_method}</TableCell>
                            <TableCell>{order.delivery_method}</TableCell>
                            <TableCell>{order.street_address}</TableCell>
                            <TableCell>{order.zipcode}</TableCell>
                            <TableCell>
                                {getStatusBadge(order.status)}
                            </TableCell>
                            <TableCell>
                                <Button size="sm" className="mr-2" onClick={() => handleEditOrder(order)}>Edit</Button>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    </CardContent>
                </Card>

                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Order</DialogTitle>
                            <DialogDescription>Make changes to the order details below.</DialogDescription>
                        </DialogHeader>
                        {editingOrder && (
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">Customer</Label>
                                    <Input
                                        id="name"
                                        value={editingOrder.display_name}
                                        onChange={(e) => setEditingOrder({ ...editingOrder, display_name: e.target.value })}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="status" className="text-right">Status</Label>
                                    <Select
                                        value={editingOrder.status}
                                        onValueChange={(value) => setEditingOrder({ ...editingOrder, status: value as Order['status'] })}
                                    >
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="in progress">In Progress</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="details" className="text-right">Order Details</Label>
                                    <Textarea
                                        id="details"
                                        value={editingOrder.order_details}
                                        onChange={(e) => setEditingOrder({ ...editingOrder, order_details: e.target.value })}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="token_redemption" className="text-right">Token Redemption</Label>
                                    <Input
                                        id="token_redemption"
                                        value={editingOrder.token_redemption}
                                        onChange={(e) => setEditingOrder({ ...editingOrder, token_redemption: e.target.value })}
                                        className="col-span-3"
                                    />
                                </div>
                                {/* Add more fields as needed */}
                            </div>
                        )}
                        <DialogFooter>
                            <Button onClick={() => setIsEditDialogOpen(false)} variant="outline">Cancel</Button>
                            <Button onClick={handleSaveEdit}>Save changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Stock Management */}
                <Card>
                    <CardHeader>
                    <CardTitle>Stock Management</CardTitle>
                    <CardDescription>Monitor and update inventory levels</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <div className="mb-4">
                        <Input placeholder="Search inventory..." className="w-full" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {inventory.map((item) => (
                        <Card key={item.name}>
                            <CardHeader className="p-4">
                            <CardTitle className="text-sm">{item.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                            <div className="text-2xl font-bold">{item.quantity}</div>
                            <p className="text-xs text-muted-foreground">in stock</p>
                            {item.quantity < item.lowStockThreshold && (
                                <Badge variant="destructive" className="mt-2">
                                Low Stock
                                </Badge>
                            )}
                            <div className="mt-4 flex justify-between">
                                <Button size="sm" variant="outline">
                                <ArrowDown className="mr-1 h-4 w-4" />
                                Decrease
                                </Button>
                                <Button size="sm" variant="outline">
                                <ArrowUp className="mr-1 h-4 w-4" />
                                Increase
                                </Button>
                            </div>
                            </CardContent>
                        </Card>
                        ))}
                    </div>
                    </CardContent>
                </Card>
                </div>
            </main>
        </div>
    );
};