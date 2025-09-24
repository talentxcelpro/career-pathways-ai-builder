
// Shared types for learning components - unified with real data structure
export interface Course {
  id: string;
  title: string;
  description?: string;
  instructor_name?: string;
  level?: string;
  difficulty_level?: string; // Alias for level  
  duration?: string;
  duration_hours?: number;
  rating?: number;
  students?: number;
  enrolled_count?: number; // Alias for students
  price?: string | number;
  is_active?: boolean;
  is_free?: boolean;
  category?: string;
  subcategory?: string;
  thumbnail?: string;
  thumbnail_url?: string; // Alias for thumbnail
  skills_taught?: string[];
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  estimated_duration_weeks: number;
  course_ids?: string[];
  skills_gained: string[];
  target_role: string;
}
