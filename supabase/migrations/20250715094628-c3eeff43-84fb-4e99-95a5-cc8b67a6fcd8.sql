-- Insert sample data for testing
INSERT INTO public.marketing_campaigns (organization_id, name, description, campaign_type, status, budget, spent, start_date, end_date, created_by) 
SELECT id, 'Q1 Brand Awareness', 'Digital marketing campaign for brand awareness', 'digital', 'active', 50000, 15000, '2024-01-01', '2024-03-31', auth.uid()
FROM organizations LIMIT 1;

INSERT INTO public.marketing_campaigns (organization_id, name, description, campaign_type, status, budget, spent, start_date, end_date, created_by) 
SELECT id, 'Product Launch Email', 'Email campaign for new product launch', 'email', 'completed', 10000, 8500, '2024-02-01', '2024-02-28', auth.uid()
FROM organizations LIMIT 1;

INSERT INTO public.marketing_campaigns (organization_id, name, description, campaign_type, status, budget, spent, start_date, end_date, created_by) 
SELECT id, 'Social Media Push', 'Social media advertising campaign', 'social', 'active', 25000, 12000, '2024-03-01', '2024-04-30', auth.uid()
FROM organizations LIMIT 1;

-- Insert sample system metrics
INSERT INTO public.system_metrics (organization_id, metric_name, metric_value, metric_type, metadata) 
SELECT id, 'active_users', 1247, 'gauge', '{"description": "Currently active users"}'
FROM organizations LIMIT 1;

INSERT INTO public.system_metrics (organization_id, metric_name, metric_value, metric_type, metadata) 
SELECT id, 'cpu_usage', 72.5, 'gauge', '{"unit": "percentage"}'
FROM organizations LIMIT 1;

INSERT INTO public.system_metrics (organization_id, metric_name, metric_value, metric_type, metadata) 
SELECT id, 'memory_usage', 68.2, 'gauge', '{"unit": "percentage"}'
FROM organizations LIMIT 1;

INSERT INTO public.system_metrics (organization_id, metric_name, metric_value, metric_type, metadata) 
SELECT id, 'response_time', 245, 'gauge', '{"unit": "milliseconds"}'
FROM organizations LIMIT 1;

INSERT INTO public.system_metrics (organization_id, metric_name, metric_value, metric_type, metadata) 
SELECT id, 'daily_signups', 23, 'counter', '{"date": "2024-01-15"}'
FROM organizations LIMIT 1;

INSERT INTO public.system_metrics (organization_id, metric_name, metric_value, metric_type, metadata) 
SELECT id, 'job_applications', 156, 'counter', '{"period": "today"}'
FROM organizations LIMIT 1;