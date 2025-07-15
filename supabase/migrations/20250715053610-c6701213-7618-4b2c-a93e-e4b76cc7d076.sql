-- Create email analytics tables
CREATE TABLE public.email_delivery_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id UUID REFERENCES public.email_automation_queue(id),
  event_type TEXT NOT NULL, -- 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'
  event_data JSONB DEFAULT '{}',
  recipient_email TEXT NOT NULL,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  external_id TEXT, -- ID from email service provider
  link_url TEXT -- for click events
);

CREATE TABLE public.email_analytics_daily (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  emails_sent INTEGER DEFAULT 0,
  emails_delivered INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_clicked INTEGER DEFAULT 0,
  emails_bounced INTEGER DEFAULT 0,
  emails_failed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(date)
);

-- Enable RLS
ALTER TABLE public.email_delivery_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_analytics_daily ENABLE ROW LEVEL SECURITY;

-- RLS policies for email_delivery_events
CREATE POLICY "Admins can manage email delivery events" 
ON public.email_delivery_events 
FOR ALL 
USING (is_app_admin(auth.uid()));

-- RLS policies for email_analytics_daily  
CREATE POLICY "Admins can manage email analytics" 
ON public.email_analytics_daily 
FOR ALL 
USING (is_app_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_email_delivery_events_email_id ON public.email_delivery_events(email_id);
CREATE INDEX idx_email_delivery_events_event_type ON public.email_delivery_events(event_type);
CREATE INDEX idx_email_delivery_events_created_at ON public.email_delivery_events(created_at);
CREATE INDEX idx_email_analytics_daily_date ON public.email_analytics_daily(date);

-- Function to update daily analytics
CREATE OR REPLACE FUNCTION public.update_daily_email_analytics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.email_analytics_daily (
    date,
    emails_sent,
    emails_delivered, 
    emails_opened,
    emails_clicked,
    emails_bounced,
    emails_failed
  )
  VALUES (
    CURRENT_DATE,
    CASE WHEN NEW.event_type = 'sent' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'delivered' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'opened' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'clicked' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'bounced' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'failed' THEN 1 ELSE 0 END
  )
  ON CONFLICT (date) 
  DO UPDATE SET
    emails_sent = email_analytics_daily.emails_sent + CASE WHEN NEW.event_type = 'sent' THEN 1 ELSE 0 END,
    emails_delivered = email_analytics_daily.emails_delivered + CASE WHEN NEW.event_type = 'delivered' THEN 1 ELSE 0 END,
    emails_opened = email_analytics_daily.emails_opened + CASE WHEN NEW.event_type = 'opened' THEN 1 ELSE 0 END,
    emails_clicked = email_analytics_daily.emails_clicked + CASE WHEN NEW.event_type = 'clicked' THEN 1 ELSE 0 END,
    emails_bounced = email_analytics_daily.emails_bounced + CASE WHEN NEW.event_type = 'bounced' THEN 1 ELSE 0 END,
    emails_failed = email_analytics_daily.emails_failed + CASE WHEN NEW.event_type = 'failed' THEN 1 ELSE 0 END,
    updated_at = now();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_daily_email_analytics
  AFTER INSERT ON public.email_delivery_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_daily_email_analytics();