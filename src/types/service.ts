
export interface Service {
  id: string;
  provider_id: string;
  title: string;
  professional_title?: string | null;
  years_experience?: string | null;
  location?: string | null;
  description: string;
  whats_included: string[];
  client_requirements?: string | null;
  delivery_time_days: number;
  price: number;
  currency: string;
  payment_methods: string[];
  contact_email: boolean;
  contact_phone: boolean;
  contact_website: boolean;
  website_url?: string | null;
  phone_number?: string | null;
  tags: string[];
  portfolio_files: string[];
  is_active: boolean;
  is_featured: boolean;
  average_rating: number;
  total_reviews: number;
  total_orders: number;
  created_at: string;
  updated_at: string;
  // New category fields
  category_id?: string | null;
  subcategory_id?: string | null;
  profile_picture_url?: string | null;
  profile_link?: string | null;
  status?: string | null;
  contact_preferences?: any;
  reviews_count?: number | null;
  portfolio_items?: any;
  // Provider details from join
  provider_name?: string | null;
  provider_avatar?: string | null;
  provider_location?: string | null;
  is_verified?: boolean | null;
  // Category details from join
  category?: ServiceCategory;
  subcategory?: ServiceCategory;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon_emoji?: string;
  description?: string;
  parent_id?: string;
  display_order: number;
  color_theme: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // For nested categories
  subcategories?: ServiceCategory[];
  parent?: ServiceCategory;
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
  // New category fields
  category_id?: string;
  subcategory_id?: string;
  profile_picture_url?: string;
  profile_link?: string;
  status?: string;
  contact_preferences?: any;
  portfolio_items?: any[];
}

export interface ServiceReview {
  id: string;
  service_id: string;
  reviewer_id: string;
  rating: number;
  review_text?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    avatar_url?: string;
  };
}
