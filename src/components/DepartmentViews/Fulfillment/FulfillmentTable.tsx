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
            return <Badge variant="received">{status}</Badge>
        case "in progress":
            return <Badge variant="processing">{status}</Badge>
        case "out for delivery":
            return <Badge variant="outForDelivery">{status}</Badge>
        case "completed":
            return <Badge variant="completed">{status}</Badge>
        case "cancelled":
            return <Badge variant="cancelled">{status}</Badge>
        default:
            return <Badge variant="default">{status}</Badge>
    }
}

// Format the order details to display the item field
const formatOrderDetails = (orderDetailsString: string) => {
    try {
        const details = JSON.parse(orderDetailsString);
        return details.item; // Just return the item field
    } catch (error) {
        return orderDetailsString; // Fallback to original string if parsing fails
    }
};

export function FulfillmentTable({ orders: initialOrders, onEditOrder }: OrdersTableProps) {
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
            // Validate the order
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

            // Optimistic update
            setOrders(orders.map((order) => 
                order.id === editingOrder.id ? editingOrder : order
            ));
            setIsEditDialogOpen(false);

            try {
                // Only update changed fields
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
                // Revert changes if update fails
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
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-white font-semibold">Order ID</TableHead>
                        <TableHead className="text-white font-semibold">Display Name</TableHead>
                        <TableHead className="text-white font-semibold">Full Name</TableHead>
                        <TableHead className="text-white font-semibold">Order Details</TableHead>
                        <TableHead className="text-white font-semibold">Token Redemption</TableHead>
                        <TableHead className="text-white font-semibold">Total</TableHead>
                        <TableHead className="text-white font-semibold">Status</TableHead>
                        <TableHead className="text-white font-semibold">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order) => (
                        <TableRow className="text-gray-100" key={order.id}>
                            <TableCell>{order.id}</TableCell>
                            <TableCell>{order.display_name}</TableCell>
                            <TableCell>{order.full_name}</TableCell>
                            <TableCell>{formatOrderDetails(order.order_details)}</TableCell>
                            <TableCell>{order.token_redemption}</TableCell>
                            <TableCell>{order.total}</TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell>
                                <Button size="sm" className="mr-2" onClick={() => handleEditOrder(order)}>Edit</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="text-white">
                    <DialogHeader>
                        <DialogTitle>Edit Order</DialogTitle>
                        <DialogDescription className="text-white">Make changes to the order details below.</DialogDescription>
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
                                    onValueChange={(value) => handleFieldChange('status', value)}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="received">Received</SelectItem>
                                        <SelectItem value="processing">Processing</SelectItem>
                                        <SelectItem value="out for delivery">Out for Delivery</SelectItem>
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
                                    onChange={(e) => handleFieldChange('token_redemption', e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="total" className="text-right">Total</Label>
                                <div className="col-span-3 relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                                    <Input
                                        id="total"
                                        value={editingOrder.total}
                                        onChange={(e) => handleFieldChange('total', e.target.value)}
                                        className="pl-6"
                                    />
                                </div>
                            </div>      
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="street_address" className="text-right">Street Address</Label>
                                <Input
                                    id="street_address"
                                    value={editingOrder.street_address}
                                    onChange={(e) => handleFieldChange('street_address', e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="address_line_2" className="text-right">Address Line 2</Label>
                                <Input
                                    id="address_line_2"
                                    value={editingOrder.address_line_2}
                                    onChange={(e) => handleFieldChange('address_line_2', e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="zipcode" className="text-right">Zipcode</Label>
                                <Input
                                    id="zipcode"
                                    value={editingOrder.zipcode}
                                    onChange={(e) => handleFieldChange('zipcode', e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                            {/* Add more fields here as needed */}
                        </div>
                    )}
                    <DialogFooter>
                        <Button 
                            onClick={() => {
                                setIsEditDialogOpen(false);
                                setChangedFields(new Set());
                            }} 
                            variant="outline"
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleSaveEdit} 
                            disabled={isUpdating || changedFields.size === 0}
                        >
                            {isUpdating ? "Saving..." : "Save changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}