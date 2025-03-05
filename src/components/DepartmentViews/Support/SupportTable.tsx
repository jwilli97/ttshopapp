import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Order } from "../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";


interface OrdersTableProps {
    orders: Order[];
    onEditOrder: (order: Order) => void;
}

type SortColumn = keyof Order
type SortDirection = "asc" | "desc"

// TODO: Update status to match the order statuses in the database
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

// Format the order details to display the item field
const formatOrderDetails = (orderDetailsString: string) => {
    try {
        const details = JSON.parse(orderDetailsString);
        return details.item || "No item specified"; // Just return the item field
    } catch (error) {
        return orderDetailsString; // Fallback to original string if parsing fails
    }
};

export function SupportTable({ orders: initialOrders, onEditOrder }: OrdersTableProps) {
    const [orders, setOrders] = useState<Order[]>(initialOrders)
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
                        .select('display_name, avatar_url, first_name, last_name')
                        .eq('user_id', user.id)
                        .single();
    
                    if (error) throw error;
                    if (data) {
                        setDisplayName(data.display_name as string);
                        setAvatarUrl(data.avatar_url as string);
                    }
                }

                // Fetch all orders without any user-specific filter
                const { data: orderData, error: orderError } = await supabase
                    .from('orders')
                    .select('*')
                    .order('created_at', { ascending: false })

                if (orderError) throw orderError
                if (orderData) {
                    setOrders(orderData.map((order: any) => ({
                        id: order.id as string,
                        display_name: order.display_name as string,
                        full_name: order.full_name as string,
                        order_details: order.order_details as string,
                        token_redemption: order.token_redemption as string,
                        phone_number: order.phone_number as string,
                        payment_method: order.payment_method as string,
                        delivery_method: order.delivery_method as string,
                        delivery_notes: order.delivery_notes as string,
                        cash_details: order.cash_details as string,
                        street_address: order.street_address as string,
                        address_line_2: order.address_line_2 as string,
                        city: order.city as string,
                        state: order.state as string,
                        zipcode: order.zipcode as string,
                        residence_type: order.residence_type as string,
                        delivery_time_frame: order.delivery_time_frame as string,
                        total: order.total as number,
                        status: order.status as "received" | "processing" | "out for delivery" | "completed" | "cancelled"
                    })));
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
    }, [toast])

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
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Display Name</TableHead>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Phone Number</TableHead>
                        <TableHead>Order Details</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Delivery Method</TableHead>
                        <TableHead>Delivery Address</TableHead>
                        <TableHead>Zipcode</TableHead>
                        <TableHead>Residence Type</TableHead>
                        <TableHead>Delivery Time Frame</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell>{order.id}</TableCell>
                            <TableCell>{order.display_name}</TableCell>
                            <TableCell>{order.full_name}</TableCell>
                            <TableCell>{order.phone_number}</TableCell>
                            <TableCell>{formatOrderDetails(order.order_details)}</TableCell>
                            <TableCell>{order.payment_method}</TableCell>
                            <TableCell>{order.delivery_method}</TableCell>
                            <TableCell>{order.street_address}</TableCell>
                            <TableCell>{order.zipcode}</TableCell>
                            <TableCell>{order.residence_type}</TableCell>
                            <TableCell>{order.delivery_time_frame}</TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell>
                                <Button size="sm" className="mr-2" onClick={() => handleEditOrder(order)}>Edit</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

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
                                <p>{editingOrder.display_name}</p>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="full_name" className="text-right">Full Name</Label>
                                <p>{editingOrder.full_name}</p>
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
                                <Label htmlFor="details" className="text-right">Items Ordered</Label>
                                <Textarea
                                    id="details"
                                    value={formatOrderDetails(editingOrder.order_details)}
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
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="payment_method" className="text-right">Delivery Address</Label>
                                <Input
                                    id="payment_method"
                                    value={editingOrder.street_address}
                                    onChange={(e) => setEditingOrder({ ...editingOrder, street_address: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="zipcode" className="text-right">Zipcode</Label>
                                <Input
                                    id="zipcode"
                                    value={editingOrder.zipcode}
                                    onChange={(e) => setEditingOrder({ ...editingOrder, zipcode: e.target.value })}
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
        </div>
    );
}