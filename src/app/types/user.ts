export interface UserData {
  user_id: string
  email: string
  first_name: string
  last_name: string
  display_name: string
  phone_number: string
  avatar_url: string
  membership_tier: string
  residence_type: string
  street_address: string
  address_line_2?: string
  city: string
  state: string
  zipcode: string
  strain_preference?: string
  replacement_preference?: string
  delivery_method?: string
  delivery_notes?: string
  usual_order?: string
  usual_total?: number
}

interface AccountInfoProps {
  userData: UserData | null  // Make it explicit that userData might be null
}