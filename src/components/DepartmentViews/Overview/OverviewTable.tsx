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
            return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>
        case "in progress":
            return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">In Progress</Badge>
        case "out for delivery":
            return <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">Out for Delivery</Badge>
        case "ready for pickup":
            return <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20">Ready for Pickup</Badge>
        case "completed":
            return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Completed</Badge>
        case "cancelled":
            return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Cancelled</Badge>
        default:
            return <Badge variant="outline" className="bg-zinc-500/10 text-zinc-500 border-zinc-500/20">{status}</Badge>
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

const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    // Convert to CST by specifying the timezone
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/Chicago'
    });
};

export function OverviewTable({ orders: initialOrders, onEditOrder }: OrdersTableProps) {
    const [orders, setOrders] = useState<Order[]>(initialOrders)
    const [displayName, setDisplayName] = useState<string>('Loading...');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [sortColumn, setSortColumn] = useState<SortColumn>("id")
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [editingOrder, setEditingOrder] = useState<Order | null>(null)
    const { toast } = useToast()
    const [isUpdating, setIsUpdating] = useState(false);
    const [changedFields, setChangedFields] = useState<Set<keyof Order>>(new Set());
    
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
                        created_at: order.created_at as string,
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
                        delivery_fee: order.delivery_fee as number | null,
                        total: order.total as number,
                        status: order.status as "received" | "processing" | "out for delivery" | "completed" | "cancelled",
                        user_id: order.user_id as string
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

    const validateOrder = (order: Order) => {
        const errors: string[] = [];
        
        if (!order.status) errors.push("Status is required");
        if (!order.total) errors.push("Total is required");
        if (!order.street_address) errors.push("Street address is required");
        if (!order.zipcode) errors.push("Zipcode is required");
        
        return errors;
    }

    const handleFieldChange = (field: keyof Order, value: any) => {
        setEditingOrder(prev => prev ? {
            ...prev,
            [field]: value
        } : null);
        setChangedFields(prev => new Set(prev.add(field)));
    }

    const handleSaveEdit = async () => {
        if (editingOrder) {
            const validationErrors = validateOrder(editingOrder);
            if (validationErrors.length > 0) {
                toast({
                    variant: "destructive",
                    title: "Validation Error",
                    description: validationErrors.join(", "),
                });
                return;
            }

            setIsUpdating(true);
            const previousOrders = [...orders];

            setOrders(orders.map((order) => 
                order.id === editingOrder.id ? editingOrder : order
            ));
            setIsEditDialogOpen(false);

            try {
                const updates = Array.from(changedFields).reduce((acc, field) => ({
                    ...acc,
                    [field]: editingOrder[field]
                }), {});

                const { error } = await supabase
                    .from('orders')
                    .update(updates)
                    .eq('id', editingOrder.id);

                if (error) throw error;

                toast({
                    title: "Order updated",
                    description: "The order has been successfully updated.",
                });
            } catch (error) {
                setOrders(previousOrders);
                setIsEditDialogOpen(true);
                toast({
                    variant: "destructive",
                    title: "Update failed",
                    description: "Changes have been reverted. Please try again.",
                });
            } finally {
                setIsUpdating(false);
                setChangedFields(new Set());
            }
        }
    }

    return (
        <div className="space-y-6">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-zinc-800/50">
                            <TableHead className="text-zinc-100 font-medium">Order ID</TableHead>
                            <TableHead className="text-zinc-100 font-medium">Created At</TableHead>
                            <TableHead className="text-zinc-100 font-medium">Display Name</TableHead>
                            <TableHead className="text-zinc-100 font-medium">Order Details</TableHead>
                            <TableHead className="text-zinc-100 font-medium">Total</TableHead>
                            <TableHead className="text-zinc-100 font-medium">Delivery Fee</TableHead>
                            <TableHead className="text-zinc-100 font-medium">Payment Method</TableHead>
                            <TableHead className="text-zinc-100 font-medium">Delivery Method</TableHead>
                            <TableHead className="text-zinc-100 font-medium">Delivery Address</TableHead>
                            <TableHead className="text-zinc-100 font-medium">Zipcode</TableHead>
                            <TableHead className="text-zinc-100 font-medium">Residence Type</TableHead>
                            <TableHead className="text-zinc-100 font-medium">Delivery Time Frame</TableHead>
                            <TableHead className="text-zinc-100 font-medium">Status</TableHead>
                            <TableHead className="text-zinc-100 font-medium">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow 
                                key={order.id}
                                className="hover:bg-zinc-800/50 border-zinc-800"
                            >
                                <TableCell className="font-medium text-zinc-100">{order.id}</TableCell>
                                <TableCell className="text-zinc-300">{formatDate(order.created_at)}</TableCell>
                                <TableCell className="text-zinc-300">{order.display_name}</TableCell>
                                <TableCell className="text-zinc-300">{formatOrderDetails(order.order_details)}</TableCell>
                                <TableCell className="text-zinc-300">${order.total}</TableCell>
                                <TableCell className="text-zinc-300">{order.delivery_fee ? `$${order.delivery_fee}` : 'N/A'}</TableCell>
                                <TableCell className="text-zinc-300">{order.payment_method}</TableCell>
                                <TableCell className="text-zinc-300">{order.delivery_method}</TableCell>
                                <TableCell className="text-zinc-300">{order.street_address}</TableCell>
                                <TableCell className="text-zinc-300">{order.zipcode}</TableCell>
                                <TableCell className="text-zinc-300">{order.residence_type}</TableCell>
                                <TableCell className="text-zinc-300">{order.delivery_time_frame}</TableCell>
                                <TableCell>{getStatusBadge(order.status)}</TableCell>
                                <TableCell>
                                    <Button 
                                        size="sm" 
                                        variant="outline"
                                        className="hover:bg-zinc-700/50 hover:text-zinc-100 transition-colors"
                                        onClick={() => handleEditOrder(order)}
                                    >
                                        Edit
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="bg-zinc-900 border border-zinc-800 text-zinc-100 max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">Edit Order</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Make changes to the order details below.
                        </DialogDescription>
                    </DialogHeader>
                    {editingOrder && (
                        <div className="grid gap-6 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right text-zinc-400">Customer</Label>
                                <p className="col-span-3 text-zinc-100">{editingOrder.display_name}</p>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="full_name" className="text-right text-zinc-400">Full Name</Label>
                                <p className="col-span-3 text-zinc-100">{editingOrder.full_name}</p>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="status" className="text-right text-zinc-400">Status</Label>
                                <Select
                                    value={editingOrder.status}
                                    onValueChange={(value) => setEditingOrder({ ...editingOrder, status: value as Order['status'] })}
                                >
                                    <SelectTrigger className="col-span-3 bg-zinc-800 border-zinc-700">
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
                                <Label htmlFor="details" className="text-right text-zinc-400">Items Ordered</Label>
                                <Textarea
                                    id="details"
                                    value={formatOrderDetails(editingOrder.order_details)}
                                    onChange={(e) => setEditingOrder({ ...editingOrder, order_details: e.target.value })}
                                    className="col-span-3 bg-zinc-800 border-zinc-700 focus:ring-zinc-600"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="token_redemption" className="text-right text-zinc-400">Token Redemption</Label>
                                <Input
                                    id="token_redemption"
                                    value={editingOrder.token_redemption}
                                    onChange={(e) => setEditingOrder({ ...editingOrder, token_redemption: e.target.value })}
                                    className="col-span-3 bg-zinc-800 border-zinc-700 focus:ring-zinc-600"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="payment_method" className="text-right text-zinc-400">Delivery Address</Label>
                                <Input
                                    id="payment_method"
                                    value={editingOrder.street_address}
                                    onChange={(e) => setEditingOrder({ ...editingOrder, street_address: e.target.value })}
                                    className="col-span-3 bg-zinc-800 border-zinc-700 focus:ring-zinc-600"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="zipcode" className="text-right text-zinc-400">Zipcode</Label>
                                <Input
                                    id="zipcode"
                                    value={editingOrder.zipcode}
                                    onChange={(e) => setEditingOrder({ ...editingOrder, zipcode: e.target.value })}
                                    className="col-span-3 bg-zinc-800 border-zinc-700 focus:ring-zinc-600"
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter className="gap-2">
                        <Button 
                            onClick={() => setIsEditDialogOpen(false)} 
                            variant="outline"
                            className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-100"
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleSaveEdit}
                            className="bg-blue-600 hover:bg-blue-500 text-white"
                        >
                            Save changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}