export interface PropertyItem {
  id: string;
  title: string;
  location: any;
  property_images: Array<{ url: string; is_primary: boolean }>;
  backdrop: string | null;
  price: any;
  type: string | null;
  category: string | null;
  specification: any;
}

// Types
export interface BookingItem {
  id: string;
  property_id: string;
  status: string;
  created_at: string;
  property?: PropertyItem;
  agent: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
  } | null;
}

export interface Inspection extends BookingItem {
  mode: string;
  when: string | null;
  notes: string | null;
  agent_id: string;
}

export interface Rental extends BookingItem {
  payment_plan: string;
  move_in_date: string | null;
  message?: string | null;
  payment_status: string;
  price: number | null;
  agent_id: string | null;
}

export interface Reservation extends BookingItem {
  from_date: string | null;
  to_date: string | null;
  adults: number | null;
  children: number | null;
  infants?: number | null;
  nights?: number | null;
  total?: number | null;
  fee?: number | null;
  caution_deposit?: number | null;
  note?: string | null;
  agent_id: string | null;
}


