export interface UserProfile {
    id?: string;
    user_id?: string;
    email?: string;
    phone_number?: string;
    first_name?: string;
    last_name?: string;
    display_name?: string;
    avatar_url?: string;
    birthday?: string;
    created_at?: string;
    updated_at?: string;
}

export interface DeliveryAddress {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    buildingType?: string;
    deliveryMethod?: 'handoff' | 'dropoff' | 'pickup' | 'contactless';
    deliveryInstructions?: string;
    instructions?: string;
}

export type FormStep = 
    | 'welcome'
    | 'phone_verify'
    | 'returning'
    | 'new'
    | 'profile'
    | 'address'
    | 'preferences'
    | 'complete'
    | 'email'
    | 'verify'
    | 'personal'
    | 'existing_user';
    