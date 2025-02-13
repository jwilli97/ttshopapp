export interface UserProfile {
    email?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    birthday?: string;
    favoriteStrain?: string;
    favoriteStrainType?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    birth_date?: string;
  }
  
  export interface DeliveryAddress {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    buildingType: 'house' | 'apartment';
    deliveryMethod: 'handoff' | 'contactless' | 'pickup';
    deliveryInstructions?: string;
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
  }
  
  export type FormStep = 
    | 'welcome'
    | 'phone_verify'
    | 'email'
    | 'verify'
    | 'profile'
    | 'personal'
    | 'address'
    | 'returning'
    | 'existing_user'
    | 'confirm';
    