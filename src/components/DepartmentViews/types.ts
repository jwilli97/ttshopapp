export interface Order {
    id: string;
    display_name: string;
    full_name: string;
    order_details: string;
    token_redemption: string;
    phone_number: string;
    payment_method: string;
    delivery_method: string;
    delivery_notes: string;
    cash_details: string;
    street_address: string;
    address_line_2: string;
    city: string;
    state: string;
    zipcode: string;
    residence_type: string;
    delivery_time_frame: string;
    total: number;
    status: "received" | "processing" | "out for delivery" | "completed" | "cancelled";
}
//  "awaiting confirmation" | "preparing your order" |

export interface SummaryCardProps {
    title: string;
    value: string | number;
    description: string;
    icon: React.ReactNode;
}
