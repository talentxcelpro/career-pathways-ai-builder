-- TalentXcel Platform Core Tables

-- Enhanced users table (extending existing profiles)
CREATE TABLE IF NOT EXISTS talentxcel_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    member_id TEXT UNIQUE DEFAULT ('TXL' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 6))),
    tagline TEXT,
    website TEXT,
    profile_completion INT DEFAULT 0,
    career_readiness_score INT DEFAULT 0,
    market_competitiveness_score INT DEFAULT 0,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(profile_id)
);

-- Career Passport core table
CREATE TABLE IF NOT EXISTS career_passport (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    resumes_created INT DEFAULT 0,
    jobs_applied INT DEFAULT 0,
    certifications INT DEFAULT 0,
    tests_completed INT DEFAULT 0,
    network_connections INT DEFAULT 0,
    skills_verified INT DEFAULT 0,
    milestones JSONB DEFAULT '{}',
    achievements JSONB DEFAULT '{}',
    journey JSONB DEFAULT '{}',
    completion_percentage INT DEFAULT 0,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Public Profile sharing
CREATE TABLE IF NOT EXISTS public_profiles (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    public_url_slug TEXT UNIQUE,
    qr_code_data TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    view_count INT DEFAULT 0,
    shared_count INT DEFAULT 0,
    last_viewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Module progress tracking
CREATE TABLE IF NOT EXISTS module_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    module_name TEXT NOT NULL,
    completion_percentage INT DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT now(),
    time_spent_minutes INT DEFAULT 0,
    achievements_unlocked TEXT[] DEFAULT '{}',
    current_step TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, module_name)
);

-- Platform analytics
CREATE TABLE IF NOT EXISTS platform_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    module_name TEXT,
    event_data JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
    session_id TEXT,
    ip_address INET,
    user_agent TEXT
);

-- Module configurations
CREATE TABLE IF NOT EXISTS platform_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    icon_emoji TEXT,
    route_path TEXT,
    is_enabled BOOLEAN DEFAULT TRUE,
    requires_auth BOOLEAN DEFAULT TRUE,
    is_premium BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Platform notifications
CREATE TABLE IF NOT EXISTS platform_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    module_name TEXT,
    action_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE talentxcel_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_passport ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own talentxcel data"
ON talentxcel_users FOR ALL USING (profile_id = auth.uid());

CREATE POLICY "Users can manage their own career passport"
ON career_passport FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own public profile"
ON public_profiles FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Public profiles are viewable by everyone"
ON public_profiles FOR SELECT USING (is_active = true);

CREATE POLICY "Users can manage their own module progress"
ON module_progress FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own analytics"
ON platform_analytics FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Everyone can view enabled modules"
ON platform_modules FOR SELECT USING (is_enabled = true);

CREATE POLICY "Admins can manage modules"
ON platform_modules FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('super_admin', 'admin')
        AND is_active = true
    )
);

CREATE POLICY "Users can view their own notifications"
ON platform_notifications FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
ON platform_notifications FOR UPDATE USING (user_id = auth.uid());

-- Insert default modules
INSERT INTO platform_modules (module_name, display_name, description, icon_emoji, route_path, sort_order, is_premium) VALUES
('passport', 'Career Passport', 'Your comprehensive career profile and progress tracking', '🛡️', '/passport', 1, false),
('network', 'Professional Network', 'Connect with professionals and build your network', '🌐', '/network', 2, false),
('jobs', 'Job Search', 'Find and apply for your dream job', '💼', '/jobs', 3, false),
('employer', 'Employer Dashboard', 'Manage job postings and recruit talent', '🏢', '/employer', 4, true),
('companies', 'Company Profiles', 'Explore companies and their culture', '🏭', '/companies', 5, false),
('resume', 'Resume Builder', 'Create professional resumes with AI assistance', '📄', '/resume', 6, false),
('tools', 'Career Tools', 'Professional tools and utilities', '🔧', '/tools', 7, false),
('services', 'Professional Services', 'Get expert career guidance and services', '🎯', '/services', 8, true),
('learning', 'Learning Paths', 'Enhance your skills with curated learning content', '📚', '/learning', 9, false),
('colleges', 'College Network', 'Connect with educational institutions', '🎓', '/colleges', 10, false),
('career-map', 'Career Roadmap', 'Plan your career journey with AI insights', '🗺️', '/career-map', 11, true);

-- Create indexes for performance
CREATE INDEX idx_career_passport_user_id ON career_passport(user_id);
CREATE INDEX idx_module_progress_user_module ON module_progress(user_id, module_name);
CREATE INDEX idx_platform_analytics_user_timestamp ON platform_analytics(user_id, timestamp);
CREATE INDEX idx_platform_notifications_user_read ON platform_notifications(user_id, is_read);
CREATE INDEX idx_public_profiles_slug ON public_profiles(public_url_slug);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_talentxcel_users_updated_at BEFORE UPDATE ON talentxcel_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_career_passport_updated_at BEFORE UPDATE ON career_passport FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_public_profiles_updated_at BEFORE UPDATE ON public_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_module_progress_updated_at BEFORE UPDATE ON module_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();