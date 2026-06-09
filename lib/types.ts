export interface Service {
  id: string,
  created_at: string,
  name: string,
  description: string,
  price: number,
  duration_min: number,
  business_id: string,
  business_user_id: string
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