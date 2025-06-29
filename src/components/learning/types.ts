
// Shared types for learning components
export interface Course {
  id: string;
  title: string;
  description: string;
  instructor_name: string;
  difficulty_level: string;
  duration_hours: number;
  rating: number;
  enrolled_count: number;
  price: number;
  is_free: boolean;
  skills_taught: string[];
  category: string;
  thumbnail_url?: string;
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
