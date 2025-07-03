-- Insert sample pricing plans
INSERT INTO public.pricing_plans (id, name, description, price, billing_cycle, is_active, is_popular, features, limits, created_by) VALUES
  (gen_random_uuid(), 'Basic', 'Perfect for individuals starting their career journey', 0, 'monthly', true, false, 
   ARRAY['5 Job Applications', 'Basic Resume Builder', 'Job Alerts', 'Email Support'],
   '{"job_applications": 5, "resume_downloads": 3, "ai_recommendations": 10, "premium_support": false, "analytics_access": false, "api_access": false, "team_members": 1}',
   (SELECT id FROM auth.users WHERE email = 'talentxcelpro@gmail.com' LIMIT 1)),
  
  (gen_random_uuid(), 'Pro', 'Most popular plan for active job seekers', 29, 'monthly', true, true,
   ARRAY['Unlimited Applications', 'Advanced Resume Builder', 'AI Job Matching', 'Priority Support', 'Analytics Dashboard'],
   '{"job_applications": -1, "resume_downloads": -1, "ai_recommendations": -1, "premium_support": true, "analytics_access": true, "api_access": false, "team_members": 1}',
   (SELECT id FROM auth.users WHERE email = 'talentxcelpro@gmail.com' LIMIT 1)),
   
  (gen_random_uuid(), 'Enterprise', 'Complete solution for organizations and teams', 99, 'monthly', true, false,
   ARRAY['All Pro Features', 'Team Management', 'Custom Integrations', 'Dedicated Support', 'Advanced Analytics', 'API Access'],
   '{"job_applications": -1, "resume_downloads": -1, "ai_recommendations": -1, "premium_support": true, "analytics_access": true, "api_access": true, "team_members": 10}',
   (SELECT id FROM auth.users WHERE email = 'talentxcelpro@gmail.com' LIMIT 1))
ON CONFLICT (name) DO NOTHING;

-- Insert sample revenue analytics for today
INSERT INTO public.revenue_analytics (date, total_revenue, total_subscribers, total_transactions, failed_payments, new_subscribers, cancelled_subscribers, currency) VALUES
  (CURRENT_DATE, 128090, 2583, 1306, 21, 45, 12, 'USD')
ON CONFLICT (date, currency) DO UPDATE SET
  total_revenue = EXCLUDED.total_revenue,
  total_subscribers = EXCLUDED.total_subscribers,
  total_transactions = EXCLUDED.total_transactions,
  failed_payments = EXCLUDED.failed_payments,
  new_subscribers = EXCLUDED.new_subscribers,
  cancelled_subscribers = EXCLUDED.cancelled_subscribers,
  updated_at = now();

-- Insert sample plan analytics
WITH plan_ids AS (
  SELECT id, name FROM public.pricing_plans WHERE name IN ('Basic', 'Pro', 'Enterprise')
)
INSERT INTO public.plan_analytics (plan_id, plan_name, active_subscribers, total_revenue, date)
SELECT 
  p.id,
  p.name,
  CASE 
    WHEN p.name = 'Basic' THEN 1359
    WHEN p.name = 'Pro' THEN 956
    WHEN p.name = 'Enterprise' THEN 184
  END as active_subscribers,
  CASE 
    WHEN p.name = 'Basic' THEN 0
    WHEN p.name = 'Pro' THEN 27724
    WHEN p.name = 'Enterprise' THEN 18216
  END as total_revenue,
  CURRENT_DATE
FROM plan_ids p
ON CONFLICT (plan_id, date) DO UPDATE SET
  active_subscribers = EXCLUDED.active_subscribers,
  total_revenue = EXCLUDED.total_revenue,
  updated_at = now();

-- Insert some sample transactions
WITH current_user AS (
  SELECT id FROM auth.users WHERE email = 'talentxcelpro@gmail.com' LIMIT 1
),
sample_plans AS (
  SELECT id, name, price FROM public.pricing_plans WHERE name IN ('Pro', 'Enterprise')
)
INSERT INTO public.payments (user_id, amount, currency, status, payment_method, created_at, processed_at)
SELECT 
  cu.id,
  sp.price,
  'USD',
  CASE (random() * 10)::int
    WHEN 0 THEN 'failed'
    WHEN 1 THEN 'created' 
    ELSE 'captured'
  END,
  CASE (random() * 3)::int
    WHEN 0 THEN 'card'
    WHEN 1 THEN 'upi'
    ELSE 'net_banking'
  END,
  now() - (random() * interval '30 days'),
  now() - (random() * interval '30 days')
FROM current_user cu, sample_plans sp
WHERE random() < 0.3 -- Only insert some records
LIMIT 10;