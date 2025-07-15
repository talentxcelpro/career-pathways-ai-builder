-- Create pro_service_profiles table
CREATE TABLE public.pro_service_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  service_type text NOT NULL,
  title text NOT NULL,
  description text,
  price_range text,
  duration text,
  expertise_level text DEFAULT 'intermediate',
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create pro_services table
CREATE TABLE public.pro_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES public.pro_service_profiles(id) ON DELETE CASCADE,
  client_name text,
  client_email text,
  service_details jsonb DEFAULT '{}',
  status text DEFAULT 'pending',
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  amount decimal(10,2),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create pro_portfolios table
CREATE TABLE public.pro_portfolios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  project_type text,
  client_name text,
  completion_date date,
  technologies_used text[],
  project_url text,
  images jsonb DEFAULT '[]',
  is_featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pro_service_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pro_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pro_portfolios ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pro_service_profiles
CREATE POLICY "Users can manage their own service profiles" ON public.pro_service_profiles
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public can view active service profiles" ON public.pro_service_profiles
FOR SELECT USING (is_active = true);

-- RLS Policies for pro_services
CREATE POLICY "Users can manage their own services" ON public.pro_services
FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for pro_portfolios
CREATE POLICY "Users can manage their own portfolios" ON public.pro_portfolios
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public can view portfolios" ON public.pro_portfolios
FOR SELECT USING (true);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pro_service_profiles_updated_at
    BEFORE UPDATE ON public.pro_service_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pro_services_updated_at
    BEFORE UPDATE ON public.pro_services
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pro_portfolios_updated_at
    BEFORE UPDATE ON public.pro_portfolios
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();