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