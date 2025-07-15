-- Phase 4: Skills Development & Learning Hub

-- Create learning paths table
CREATE TABLE public.learning_paths (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_role TEXT,
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_duration_hours INTEGER NOT NULL DEFAULT 0,
  skills_covered TEXT[] NOT NULL DEFAULT '{}',
  ai_generated BOOLEAN NOT NULL DEFAULT false,
  completion_percentage INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create skill assessments table
CREATE TABLE public.skill_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  skill_name TEXT NOT NULL,
  skill_category TEXT NOT NULL,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('quiz', 'practical', 'ai_interview', 'peer_review')),
  questions JSONB NOT NULL DEFAULT '[]',
  user_answers JSONB DEFAULT '{}',
  score INTEGER,
  max_score INTEGER NOT NULL DEFAULT 100,
  passed BOOLEAN DEFAULT false,
  certificate_earned BOOLEAN DEFAULT false,
  time_taken_minutes INTEGER,
  assessment_data JSONB DEFAULT '{}',
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create learning progress table
CREATE TABLE public.learning_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  learning_path_id UUID REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  current_step INTEGER NOT NULL DEFAULT 1,
  total_steps INTEGER NOT NULL,
  step_details JSONB NOT NULL DEFAULT '{}',
  time_spent_minutes INTEGER NOT NULL DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_steps TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create services table for marketplace
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  service_type TEXT NOT NULL CHECK (service_type IN ('consultation', 'review', 'training', 'coaching', 'design')),
  price_type TEXT NOT NULL CHECK (price_type IN ('fixed', 'hourly', 'package')),
  base_price DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  delivery_time_days INTEGER NOT NULL DEFAULT 7,
  skills_offered TEXT[] NOT NULL DEFAULT '{}',
  portfolio_items JSONB DEFAULT '[]',
  rating DECIMAL(2,1) DEFAULT 0.0,
  reviews_count INTEGER DEFAULT 0,
  orders_completed INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  requirements TEXT,
  what_included TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service orders table
CREATE TABLE public.service_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  client_id UUID NOT NULL,
  provider_id UUID NOT NULL,
  order_details JSONB NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'disputed')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  delivery_date DATE,
  requirements_met BOOLEAN DEFAULT false,
  client_feedback TEXT,
  provider_notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create skill recommendations table
CREATE TABLE public.skill_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recommended_skill TEXT NOT NULL,
  skill_category TEXT NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL,
  reasoning TEXT,
  based_on_data JSONB NOT NULL DEFAULT '{}',
  priority_level TEXT NOT NULL CHECK (priority_level IN ('high', 'medium', 'low')),
  is_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for learning_paths
CREATE POLICY "Users can manage their own learning paths" 
ON public.learning_paths 
FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for skill_assessments  
CREATE POLICY "Users can manage their own skill assessments" 
ON public.skill_assessments 
FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for learning_progress
CREATE POLICY "Users can manage their own learning progress" 
ON public.learning_progress 
FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for services
CREATE POLICY "Anyone can view active services" 
ON public.services 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Providers can manage their own services" 
ON public.services 
FOR ALL 
USING (auth.uid() = provider_id);

-- RLS Policies for service_orders
CREATE POLICY "Clients and providers can view their orders" 
ON public.service_orders 
FOR SELECT 
USING (auth.uid() = client_id OR auth.uid() = provider_id);

CREATE POLICY "Clients can create orders" 
ON public.service_orders 
FOR INSERT 
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients and providers can update their orders" 
ON public.service_orders 
FOR UPDATE 
USING (auth.uid() = client_id OR auth.uid() = provider_id);

-- RLS Policies for skill_recommendations
CREATE POLICY "Users can view their own skill recommendations" 
ON public.skill_recommendations 
FOR ALL 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_learning_paths_user_id ON public.learning_paths(user_id);
CREATE INDEX idx_skill_assessments_user_id ON public.skill_assessments(user_id);
CREATE INDEX idx_skill_assessments_skill ON public.skill_assessments(skill_name);
CREATE INDEX idx_learning_progress_user_id ON public.learning_progress(user_id);
CREATE INDEX idx_learning_progress_path_id ON public.learning_progress(learning_path_id);
CREATE INDEX idx_services_category ON public.services(category);
CREATE INDEX idx_services_provider ON public.services(provider_id);
CREATE INDEX idx_services_active ON public.services(is_active);
CREATE INDEX idx_service_orders_client ON public.service_orders(client_id);
CREATE INDEX idx_service_orders_provider ON public.service_orders(provider_id);
CREATE INDEX idx_service_orders_service ON public.service_orders(service_id);
CREATE INDEX idx_skill_recommendations_user ON public.skill_recommendations(user_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_learning_paths_updated_at
  BEFORE UPDATE ON public.learning_paths
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learning_progress_updated_at
  BEFORE UPDATE ON public.learning_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_orders_updated_at
  BEFORE UPDATE ON public.service_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();