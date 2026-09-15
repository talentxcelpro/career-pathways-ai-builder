export interface College {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url?: string;
  cover_image_url?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  
  // College details
  established_year?: number;
  college_type?: 'government' | 'private' | 'autonomous' | 'deemed';
  affiliation?: string;
  recognition?: string[];
  ranking_national?: number;
  ranking_nirf?: number;
  accreditation_grade?: string;
  
  // Infrastructure
  campus_size_acres?: number;
  total_faculty?: number;
  total_students?: number;
  hostels_available?: boolean;
  library_books?: number;
  labs_count?: number;
  
  // Financial
  average_fees_per_year?: number;
  scholarship_available?: boolean;
  placement_percentage?: number;
  average_package?: number;
  highest_package?: number;
  
  // Status and verification
  is_verified?: boolean;
  is_active?: boolean;
  verification_status?: 'pending' | 'verified' | 'rejected';
  featured?: boolean;
  
  // AI features
  ai_summary?: string;
  ai_match_keywords?: string[];
  
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface CollegeCourse {
  id: string;
  college_id: string;
  course_name: string;
  course_code?: string;
  degree_type: 'undergraduate' | 'postgraduate' | 'diploma' | 'certificate' | 'phd';
  discipline: string;
  specialization?: string;
  duration_years: number;
  
  description?: string;
  syllabus_url?: string;
  brochure_url?: string;
  curriculum?: string[];
  learning_outcomes?: string[];
  career_prospects?: string[];
  
  eligibility_criteria?: string;
  entrance_exams?: string[];
  total_seats?: number;
  
  total_fees?: number;
  fees_per_semester?: number;
  additional_fees?: Record<string, number>;
  scholarship_available?: boolean;
  emi_available?: boolean;
  
  placement_rate?: number;
  average_salary?: number;
  top_recruiters?: string[];
  
  is_active?: boolean;
  course_mode?: 'online' | 'offline' | 'hybrid';
  
  ai_course_summary?: string;
  ai_career_alignment_score?: number;
  
  created_at: string;
  updated_at: string;
}

export interface CollegeReview {
  id: string;
  college_id: string;
  user_id: string;
  
  overall_rating: number;
  academic_rating?: number;
  infrastructure_rating?: number;
  faculty_rating?: number;
  placement_rating?: number;
  
  review_title?: string;
  review_content: string;
  course_studied?: string;
  graduation_year?: number;
  
  is_verified?: boolean;
  is_anonymous?: boolean;
  helpful_count?: number;
  
  ai_sentiment_score?: number;
  ai_sentiment_label?: 'positive' | 'negative' | 'neutral';
  ai_extracted_topics?: string[];
  
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  student_id: string;
  college_id: string;
  course_id: string;
  
  application_number?: string;
  application_status?: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'waitlisted';
  application_date?: string;
  submission_date?: string;
  
  personal_info?: Record<string, any>;
  academic_info?: Record<string, any>;
  entrance_exam_scores?: Record<string, any>;
  documents?: Record<string, string>;
  
  course_preferences?: string[];
  campus_preferences?: string[];
  
  last_updated_by?: string;
  status_history?: Record<string, any>;
  admin_notes?: string;
  
  application_deadline?: string;
  document_deadline?: string;
  fee_deadline?: string;
  
  ai_completion_score?: number;
  ai_suggestions?: string[];
  
  created_at: string;
  updated_at: string;
}

export interface SOPDraft {
  id: string;
  user_id: string;
  college_id?: string;
  course_id?: string;
  
  title: string;
  content: string;
  document_type: 'sop' | 'lor' | 'personal_statement' | 'motivation_letter';
  
  ai_generated?: boolean;
  ai_prompt?: string;
  ai_feedback?: string;
  ai_score?: number;
  ai_suggestions?: string[];
  
  version?: number;
  is_final?: boolean;
  parent_draft_id?: string;
  
  word_count?: number;
  character_count?: number;
  
  created_at: string;
  updated_at: string;
}

export interface CollegeEvent {
  id: string;
  college_id: string;
  
  event_name: string;
  event_type: 'admission' | 'webinar' | 'open_house' | 'fest' | 'seminar' | 'workshop';
  description?: string;
  
  start_date: string;
  end_date?: string;
  is_online?: boolean;
  venue?: string;
  registration_url?: string;
  
  max_participants?: number;
  current_registrations?: number;
  registration_fee?: number;
  
  poster_url?: string;
  brochure_url?: string;
  
  is_active?: boolean;
  created_by?: string;
  
  created_at: string;
  updated_at: string;
}

export interface CollegeFilters {
  search?: string;
  college_type?: string[];
  city?: string[];
  state?: string[];
  degree_type?: string[];
  discipline?: string[];
  fees_range?: [number, number];
  ranking_range?: [number, number];
  placement_range?: [number, number];
  verification_status?: string[];
  featured_only?: boolean;
}

export interface CollegeSearchParams {
  filters: CollegeFilters;
  sort_by?: 'ranking_national' | 'average_fees_per_year' | 'placement_percentage' | 'name' | 'established_year';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}