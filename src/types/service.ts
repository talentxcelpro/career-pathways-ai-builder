
export interface Service {
  id: string;
  provider_id: string;
  title: string;
  professional_title: string;
  years_experience: string;
  location: string;
  description: string;
  whats_included: string[];
  client_requirements: string;
  delivery_time_days: number;
  price: number;
  currency: string;
  payment_methods: string[];
  contact_email: boolean;
  contact_phone: boolean;
  contact_website: boolean;
  website_url?: string;
  phone_number?: string;
  tags: string[];
  portfolio_files: string[];
  is_active: boolean;
  is_featured: boolean;
  average_rating: number;
  total_reviews: number;
  total_orders: number;
  created_at: string;
  updated_at: string;
  // Provider details from join
  provider_name: string;
  provider_avatar?: string;
  provider_location?: string;
  is_verified?: boolean;
}

export interface ServiceFormData {
  title: string;
  professional_title: string;
  years_experience: string;
  location: string;
  description: string;
  whats_included: string[];
  client_requirements: string;
  delivery_time_days: number;
  price: number;
  currency: string;
  payment_methods: string[];
  contact_email: boolean;
  contact_phone: boolean;
  contact_website: boolean;
  website_url: string;
  phone_number: string;
  tags: string[];
  portfolio_files: string[];
}

export interface ServiceReview {
  id: string;
  service_id: string;
  reviewer_id: string;
  rating: number;
  review_text: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    avatar_url?: string;
  };
}
