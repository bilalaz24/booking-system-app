export interface Business {
  id: string
  name: string
  phone: string
  email: string
  domain: string,
  slug: string,
  address: string,
  city: string,
  created_at: string
}

export interface AvailableSlots {
  id: string,
  business_id: string,
  day_of_week: number,
  start_time: string,
  end_time: string,
  created_at: string
}

export interface BusinessSettings {
  id: string
  business_id: string
  hero_title: string,
  hero_description: string,
  instagram_url: string,
  facebook_url: string,
  created_at: string
}

export interface BusinessUser {
  id: string
  business_id: string
  name: string
  email: string
  role: string
  auth_user_id: string
  created_at: string
}

export interface Service {
  id: string,
  created_at: string,
  name: string,
  description: string,
  price: number,
  duration_min: number,
  is_active: boolean,
  business_id: string,
  business_user_id: string
}

export interface Message {
  id: string,
  created_at: string,
  name: string,
  email: string,
  subject: string,
  message: string,
  business_id: string,
}

export interface Booking {
  id: string,
  business_id: string,
  business_user_id: string | null,
  created_at: string,
  customer_email: string | null,
  customer_name: string,
  customer_phone: string,
  date: string,
  notes: string | null,
  service_id: string,
  start_time: string,
  end_time: string,
  status: string

  service: Service
}

export interface AboutService {
  title: string;
  description: string;
}

export interface About {
    id: string,
    created_at: string,
    business_id: string,
    hero_description: string | null,
    story_title: string | null,
    story_content: string | null,
    services: AboutService[],
    why_us: string[],
    cta_title: string | null,
    cta_description: string | null
}