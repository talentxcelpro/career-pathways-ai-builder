-- Add missing columns to courses table if they don't exist
DO $$ 
BEGIN
  -- Add missing columns to courses table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'created_by') THEN
    ALTER TABLE public.courses ADD COLUMN created_by UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Create pricing_plans table only if it doesn't exist
CREATE TABLE IF NOT EXISTS public.pricing_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annually', 'weekly', 'lifetime')),
  is_active BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  features TEXT[],
  limits JSONB DEFAULT '{}'::jsonb,
  stripe_price_id TEXT,
  trial_days INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on pricing_plans only if it's not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c 
    JOIN pg_namespace n ON n.oid = c.relnamespace 
    WHERE c.relname = 'pricing_plans' AND n.nspname = 'public' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policies for pricing plans (with IF NOT EXISTS equivalent)
DO $$
BEGIN
  -- Check if policy exists before creating
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'pricing_plans' AND policyname = 'Anyone can view active pricing plans'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can view active pricing plans" ON public.pricing_plans
      FOR SELECT USING (is_active = true)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'pricing_plans' AND policyname = 'Admins can manage pricing plans'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can manage pricing plans" ON public.pricing_plans
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.user_roles 
          WHERE user_id = auth.uid() 
          AND role IN (''super_admin'', ''admin'')
          AND is_active = true
        )
      )';
  END IF;
END $$;

-- Create indexes for pricing plans
CREATE INDEX IF NOT EXISTS idx_pricing_plans_active ON public.pricing_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_pricing_plans_billing_cycle ON public.pricing_plans(billing_cycle);

-- Create trigger for pricing plans updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_pricing_plans_updated_at'
  ) THEN
    EXECUTE 'CREATE TRIGGER update_pricing_plans_updated_at
      BEFORE UPDATE ON public.pricing_plans
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column()';
  END IF;
END $$;