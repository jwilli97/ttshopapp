import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Order } from "../types";
import { Button } from "@/components/ui/button";

interface DispatchTableProps {
    orders: Order[];
    onEditOrder: (order: Order) => void;
}

export function DispatchTable({ orders, onEditOrder }: DispatchTableProps) {
    const exportToCSV = () => {
        const headers = [
            'Order ID', 'Unit/Customer Name', 'Street Address', 'Address Line 2',
            'City', 'State', 'Zip', 'Country', 'EAT', 'LAT', 'Time at Stop',
            'Driver Notes', 'Size', 'Recipient Name', 'Type of Stop', 'Order',
            'Proof of Delivery', 'Email Address', 'Phone Number', 'ID',
            'Package Count', 'Products', 'Seller Website', 'Driver'
        ];

        const csvRows = [
            headers,
            ...orders.map(order => [
                order.id,
                order.full_name,
                order.street_address,
                order.address_line_2,
                order.city,
                'TX', //state
                order.zipcode,
                'United States', //country
                '', //eat
                '', //lat
                '5 minutes',
                order.delivery_notes || '', //change if needed
                'NA',
                order.full_name,
                'Delivery',
                'Auto',
                '', //proof
                '', //email
                order.phone_number || '', //phone
                '', // id
                '', //package count
                '', //products
                '', //seller website
                '' //driver
            ])
        ];

        const csvString = csvRows
            .map(row => row.map(cell => `"${cell || ''}"`).join(','))
            .join('\n');

        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'dispatch_orders.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            <Button className="mb-4 float-right" onClick={exportToCSV}>
                Export to CSV
            </Button>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Unit/Customer Name</TableHead>
                        <TableHead>Street Address</TableHead>
                        <TableHead>Address Line 2</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>State</TableHead>
                        <TableHead>Zip</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>EAT</TableHead>
                        <TableHead>LAT</TableHead>
                        <TableHead>Time at Stop (5 min)</TableHead>
                        <TableHead>Driver Notes</TableHead>
                        <TableHead>Size (N/A)</TableHead>
                        <TableHead>Recipient Name</TableHead>
                        <TableHead>Type of Stop (delivery)</TableHead>
                        <TableHead>Order (auto)</TableHead>
                        <TableHead>Proof of Delivery (required)</TableHead>
                        <TableHead>Email Address</TableHead>
                        <TableHead>Phone Number</TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>Package Count</TableHead>
                        <TableHead>Products</TableHead>
                        <TableHead>Seller Website</TableHead>
                        <TableHead>Driver</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell>{order.id}</TableCell>
                            <TableCell>{order.full_name}</TableCell>
                            <TableCell>{order.street_address}</TableCell>
                            <TableCell>{order.address_line_2}</TableCell>
                            <TableCell>{order.city}</TableCell>
                            <TableCell>TX</TableCell>
                            <TableCell>{order.zipcode}</TableCell>
                            <TableCell>United States</TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell>5 minutes</TableCell>
                            <TableCell></TableCell>
                            <TableCell>NA</TableCell>
                            <TableCell>{order.full_name}</TableCell>
                            <TableCell>Delivery</TableCell>
                            <TableCell>Auto</TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell>{order.phone_number}</TableCell>
                            <TableCell>{order.id}</TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}