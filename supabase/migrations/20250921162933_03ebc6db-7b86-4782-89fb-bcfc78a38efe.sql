-- Create college analytics table first
CREATE TABLE IF NOT EXISTS college_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
  analytics_date DATE DEFAULT CURRENT_DATE,
  
  -- Performance Metrics
  placement_rate DECIMAL(5,2),
  state_average_placement DECIMAL(5,2),
  national_average_placement DECIMAL(5,2),
  placement_trend TEXT DEFAULT 'stable',
  
  -- Popularity Metrics
  monthly_views INTEGER DEFAULT 0,
  monthly_applications INTEGER DEFAULT 0,
  students_searched INTEGER DEFAULT 0,
  popularity_score INTEGER DEFAULT 0,
  
  -- Rankings and Comparisons
  regional_rank INTEGER,
  state_rank INTEGER,
  category_rank INTEGER,
  roi_score INTEGER DEFAULT 0,
  
  -- Financial Metrics
  average_package_trend TEXT DEFAULT 'stable',
  fee_affordability_score INTEGER DEFAULT 0,
  scholarship_utilization DECIMAL(5,2) DEFAULT 0,
  
  -- Student Metrics
  admission_competition_ratio DECIMAL(8,2),
  student_satisfaction_score DECIMAL(3,1),
  alumni_network_strength INTEGER DEFAULT 0,
  
  -- Infrastructure Metrics
  facilities_score INTEGER DEFAULT 0,
  technology_adoption_score INTEGER DEFAULT 0,
  campus_life_score INTEGER DEFAULT 0,
  
  -- Industry Metrics
  industry_partnerships INTEGER DEFAULT 0,
  research_publications INTEGER DEFAULT 0,
  innovation_score INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(college_id, analytics_date)
);

-- Enable RLS on college_analytics
ALTER TABLE college_analytics ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Public can view college analytics" ON college_analytics
  FOR SELECT USING (true);

-- Create policy for admin management
CREATE POLICY "Admins can manage college analytics" ON college_analytics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_college_analytics_college_id ON college_analytics(college_id);
CREATE INDEX IF NOT EXISTS idx_college_analytics_date ON college_analytics(analytics_date);
CREATE INDEX IF NOT EXISTS idx_colleges_ranking ON colleges(ranking_national) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_colleges_state_placement ON colleges(state, placement_percentage) WHERE is_active = true;