export type PropertyStatus = "pending_review" | "approved" | "rejected";

export type Property = {
  id: string;
  host_id: string;
  host_email: string;
  title: string;
  description: string;
  suburb: string;
  city: string;
  province: string;
  nightly_rate: number;
  max_guests: number;
  amenities: string[];
  images: string[];
  status: PropertyStatus;
  admin_note?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type BookingStatus = "pending" | "approved" | "declined";
export type PaymentStatus = "pending" | "awaiting_payment" | "paid" | "declined";

export type BookingRequest = {
  id: string;
  property_id: string;
  traveler_name: string;
  traveler_email: string;
  traveler_phone: string;
  company_name: string;
  check_in: string;
  check_out: string;
  guests: number;
  notes?: string | null;
  total_estimate: number;
  booking_status: BookingStatus;
  payment_status: PaymentStatus;
  admin_note?: string | null;
  created_at?: string;
  updated_at?: string;

  property_title?: string;
  property_suburb?: string;
};
