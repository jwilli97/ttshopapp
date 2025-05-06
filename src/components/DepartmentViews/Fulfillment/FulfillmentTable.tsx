import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Order as BaseOrder } from "../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MembershipBadge } from "@/components/ui/membership-badge";

interface OrdersTableProps {
    orders: Order[];
    onEditOrder: (order: Order) => void;
}

type SortColumn = keyof Order
type SortDirection = "asc" | "desc"

// TODO: Update status to match the order statuses in the database
const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
        case "processing":
            return <Badge variant="processing">{status}</Badge>
        case "preparing":
            return <Badge variant="preparing">{status}</Badge>
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

interface Profile {
    avatar_url: string | null;
    display_name: string;
    first_name: string | null;
    last_name: string | null;
    membership_tier: string | null;
    phone_number: string | null;
    loyalty_balance: number;
    strain_preference: string | null;
    replacement_preference: string | null;
    usual_order: string | null;
    user_id: string;
}

// Extend the base Order type with profile-related fields
interface Order extends BaseOrder {
    avatar_url?: string | null;
    membership_tier?: string;
    loyalty_balance?: number;
    strain_preference?: string;
    replacement_preference?: string;
    usual_order?: string;
    delivery_time?: string;
}

// Helper function to filter orders by date range
const filterOrdersByDateRange = (orders: Order[], dateRange: 'today' | 'week' | 'month') => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (dateRange) {
        case 'today':
            return orders.filter(order => new Date(order.created_at) >= startOfToday);
        case 'week': {
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - 7);
            return orders.filter(order => new Date(order.created_at) >= startOfWeek);
        }
        case 'month': {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            return orders.filter(order => new Date(order.created_at) >= startOfMonth);
        }
        default:
            return orders;
    }
};

export function FulfillmentTable({ orders: initialOrders, onEditOrder }: OrdersTableProps) {
    const [orders, setOrders] = useState<Order[]>(initialOrders)
    const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('today')
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
                    // Fetch user profiles for all orders
                    const userIds = orderData.map((order: any) => order.user_id);
                    const { data: profilesData, error: profilesError } = await supabase
                        .from('profiles')
                        .select('*')
                        .in('user_id', userIds);

                    if (profilesError) throw profilesError;

                    // Create a map of user_id to profile data
                    const profileMap = new Map(profilesData?.map((profile: any) => [profile.user_id, profile]));

                    const allOrders = orderData.map((order: any) => {
                        const profile = profileMap.get(order.user_id);
                        return {
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
                            user_id: order.user_id as string,
                            // Add user profile fields
                            membership_tier: profile?.membership_tier as string | undefined,
                            strain_preference: profile?.strain_preference as string | undefined,
                            replacement_preference: profile?.replacement_preference as string | undefined,
                            usual_order: profile?.usual_order as string | undefined,
                            delivery_time: order.delivery_time as string | undefined,
                        };
                    });

                    // Filter orders based on date range
                    const filteredOrders = filterOrdersByDateRange(allOrders, dateRange);
                    setOrders(filteredOrders);
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
    }, [dateRange, toast])

    const handleEditOrder = async (order: Order) => {
        try {
            if (!order.user_id) {
                console.warn('No user_id found for order:', order.id);
                setEditingOrder(order);
                setIsEditDialogOpen(true);
                return;
            }

            console.log('Fetching profile for user_id:', order.user_id);

            // Fetch complete user profile data
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select(`
                    avatar_url,
                    display_name,
                    first_name,
                    last_name,
                    membership_tier,
                    phone_number,
                    loyalty_balance,
                    strain_preference,
                    replacement_preference,
                    usual_order,
                    user_id
                `)
                .eq('user_id', order.user_id)
                .single();

            if (profileError) {
                console.error('Supabase error fetching profile:', profileError.message);
                throw new Error(`Failed to fetch profile: ${profileError.message}`);
            }

            const profile = profileData as Profile;
            console.log('Profile data received:', profile);

            // Construct full name from profile data if available
            const fullName = profile ? 
                `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 
                order.full_name;

            // Merge the fetched profile data with the order data
            const updatedOrder: Order = {
                ...order,
                // User Profile Information
                avatar_url: profile?.avatar_url || null,
                display_name: profile?.display_name || order.display_name || '',
                full_name: fullName || '',
                membership_tier: profile?.membership_tier || undefined,
                phone_number: profile?.phone_number || order.phone_number || '',
                
                // Loyalty & Preferences
                loyalty_balance: profile?.loyalty_balance || 0,
                strain_preference: profile?.strain_preference || undefined,
                replacement_preference: profile?.replacement_preference || undefined,
                usual_order: profile?.usual_order || undefined,

                // Ensure we keep all original order fields
                user_id: order.user_id,
                created_at: order.created_at,
                order_details: order.order_details,
                token_redemption: order.token_redemption,
                payment_method: order.payment_method,
                delivery_method: order.delivery_method,
                delivery_notes: order.delivery_notes,
                cash_details: order.cash_details,
                street_address: order.street_address,
                address_line_2: order.address_line_2,
                city: order.city,
                state: order.state,
                zipcode: order.zipcode,
                residence_type: order.residence_type,
                delivery_time_frame: order.delivery_time_frame,
                delivery_fee: order.delivery_fee,
                total: order.total,
                status: order.status
            };

            console.log('Setting editing order with data:', updatedOrder);
            setEditingOrder(updatedOrder);
            setIsEditDialogOpen(true);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error('Error fetching user details:', errorMessage);
            
            toast({
                variant: "destructive",
                title: "Error fetching user details",
                description: "Unable to load complete profile information. Showing basic order details.",
            });
            
            setEditingOrder(order);
            setIsEditDialogOpen(true);
        }
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
            {/* Date Range Selector */}
            <div className="flex justify-end mb-4">
                <Select
                    value={dateRange}
                    onValueChange={(value) => setDateRange(value as 'today' | 'week' | 'month')}
                >
                    <SelectTrigger className="w-[180px] bg-zinc-800/50 border-zinc-700 text-zinc-100">
                        <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">Last 7 Days</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-white font-semibold">Created At</TableHead>
                        <TableHead className="text-white font-semibold">Phone Number</TableHead>
                        <TableHead className="text-white font-semibold">Display Name</TableHead>
                        <TableHead className="text-white font-semibold">Order Details & Token</TableHead>
                        <TableHead className="text-white font-semibold">Payment & Delivery</TableHead>
                        <TableHead className="text-white font-semibold">Address</TableHead>
                        <TableHead className="text-white font-semibold">Total & Fee</TableHead>
                        <TableHead className="text-white font-semibold">Status</TableHead>
                        <TableHead className="text-white font-semibold">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order) => (
                        <TableRow 
                            className="text-gray-100 cursor-pointer hover:bg-gray-800/50" 
                            key={order.id}
                        >
                            <TableCell>{formatDate(order.created_at)}</TableCell>
                            <TableCell>{order.phone_number}</TableCell>
                            <TableCell>{order.display_name}</TableCell>
                            <TableCell>
                                <div>
                                    <div>{formatOrderDetails(order.order_details)}</div>
                                    {order.token_redemption && (
                                        <div className="text-sm text-gray-400 mt-1">
                                            Token: {order.token_redemption}
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div>
                                    <div>{order.payment_method}</div>
                                    <div className="text-sm text-gray-400 mt-1">{order.delivery_method}</div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div>
                                    <div>{order.street_address}</div>
                                    {order.address_line_2 && (
                                        <div>{order.address_line_2}</div>
                                    )}
                                    <div className="text-sm text-gray-400">
                                        {order.city}, {order.state} {order.zipcode}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div>
                                    <div className="font-medium">${order.total}</div>
                                    {order.delivery_fee && (
                                        <div className="text-sm text-gray-400 mt-1">
                                            +${order.delivery_fee} delivery
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell>
                                <Button size="sm" className="mr-2" onClick={() => handleEditOrder(order)}>Edit</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="text-white max-h-[85vh] overflow-y-auto w-[95%] max-w-2xl">
                    <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </DialogClose>
                    <DialogHeader>
                        <DialogTitle>Edit Order</DialogTitle>
                        <DialogDescription className="text-white">Make changes to the order details below.</DialogDescription>
                    </DialogHeader>
                    {editingOrder && (
                        <div className="grid gap-4 py-4">
                            {/* User Info Section */}
                            <div className="border border-gray-600 rounded-lg p-4 mb-4">
                                <h3 className="font-semibold mb-3">User Details</h3>
                                <div className="space-y-6">
                                    {/* User Profile Header */}
                                    <div className="flex items-center space-x-4">
                                        <Avatar className="h-16 w-16">
                                            <AvatarImage src={editingOrder.avatar_url as string} alt={editingOrder.display_name as string} />
                                            <AvatarFallback>{editingOrder.display_name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-1">
                                            <h4 className="text-lg font-medium">{editingOrder.display_name}</h4>
                                            <p className="text-sm text-gray-400">{editingOrder.full_name}</p>
                                            {editingOrder.membership_tier && (
                                                <MembershipBadge tier={editingOrder.membership_tier} />
                                            )}
                                        </div>
                                    </div>

                                    {/* Contact Information */}
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="font-medium text-gray-400">Phone Number</p>
                                            <p>{editingOrder.phone_number || 'Not provided'}</p>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-400">Loyalty Balance</p>
                                            <p>{editingOrder.loyalty_balance || '0'} points</p>
                                        </div>
                                    </div>

                                    {/* User Preferences */}
                                    <div className="space-y-2">
                                        <h4 className="font-medium">User Preferences</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="font-medium text-gray-400">Strain Preference</p>
                                                <Badge variant="outline" className="mt-1">
                                                    {editingOrder.strain_preference ? 
                                                        editingOrder.strain_preference.charAt(0).toUpperCase() + 
                                                        editingOrder.strain_preference.slice(1) : 
                                                        'Not specified'}
                                                </Badge>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-400">Replacement Preference</p>
                                                <Badge variant="outline" className="mt-1">
                                                    {editingOrder.replacement_preference === 'similar' ? 'Similar Product' :
                                                     editingOrder.replacement_preference === 'contact' ? 'Contact Me First' :
                                                     editingOrder.replacement_preference === 'refund' ? 'No Replacement' : 
                                                     'Not specified'}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <p className="font-medium text-gray-400">Usual Order</p>
                                            <p className="mt-1 text-sm">
                                                {editingOrder.usual_order || 'No usual order set'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Info Section */}
                            <div className="border border-gray-600 rounded-lg p-4">
                                <h3 className="font-semibold mb-3">ORDER INFO</h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="created_at" className="text-right">Created At</Label>
                                        <p className="col-span-3">{formatDate(editingOrder.created_at)}</p>
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
                                                <SelectItem value="processing">Processing</SelectItem>
                                                <SelectItem value="preparing">Preparing</SelectItem>
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
                                            value={formatOrderDetails(editingOrder.order_details || '')}
                                            onChange={(e) => handleFieldChange('order_details', e.target.value)}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="token_redemption" className="text-right">Token Redemption</Label>
                                        <Input
                                            id="token_redemption"
                                            value={editingOrder.token_redemption || ''}
                                            onChange={(e) => handleFieldChange('token_redemption', e.target.value)}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="delivery_time" className="text-right">Delivery Time</Label>
                                        <Input
                                            id="delivery_time"
                                            value={editingOrder.delivery_time || ''}
                                            onChange={(e) => handleFieldChange('delivery_time', e.target.value)}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="delivery_fee" className="text-right">Delivery Fee</Label>
                                        <div className="col-span-3 relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                                            <Input
                                                id="delivery_fee"
                                                value={editingOrder.delivery_fee || ''}
                                                onChange={(e) => handleFieldChange('delivery_fee', e.target.value)}
                                                className="pl-6"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="total" className="text-right">Total</Label>
                                        <div className="col-span-3 relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                                            <Input
                                                id="total"
                                                value={editingOrder.total || ''}
                                                onChange={(e) => handleFieldChange('total', e.target.value)}
                                                className="pl-6"
                                            />
                                        </div>
                                    </div>      
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="street_address" className="text-right">Street Address</Label>
                                        <Input
                                            id="street_address"
                                            value={editingOrder.street_address || ''}
                                            onChange={(e) => handleFieldChange('street_address', e.target.value)}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="address_line_2" className="text-right">Address Line 2</Label>
                                        <Input
                                            id="address_line_2"
                                            value={editingOrder.address_line_2 || ''}
                                            onChange={(e) => handleFieldChange('address_line_2', e.target.value)}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="zipcode" className="text-right">Zipcode</Label>
                                        <Input
                                            id="zipcode"
                                            value={editingOrder.zipcode || ''}
                                            onChange={(e) => handleFieldChange('zipcode', e.target.value)}
                                            className="col-span-3"
                                        />
                                    </div>
                                </div>
                            </div>
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