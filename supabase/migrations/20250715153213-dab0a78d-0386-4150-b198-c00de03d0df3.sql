-- Phase 3: Advanced CRM & Analytics Enhancement
-- Add advanced CRM features and analytics

-- Add advanced analytics fields to pro_analytics
ALTER TABLE pro_analytics ADD COLUMN IF NOT EXISTS client_acquisition_cost DECIMAL(10,2) DEFAULT 0;
ALTER TABLE pro_analytics ADD COLUMN IF NOT EXISTS customer_lifetime_value DECIMAL(10,2) DEFAULT 0;
ALTER TABLE pro_analytics ADD COLUMN IF NOT EXISTS churn_rate DECIMAL(5,2) DEFAULT 0;
ALTER TABLE pro_analytics ADD COLUMN IF NOT EXISTS monthly_recurring_revenue DECIMAL(10,2) DEFAULT 0;
ALTER TABLE pro_analytics ADD COLUMN IF NOT EXISTS portfolio_views INTEGER DEFAULT 0;
ALTER TABLE pro_analytics ADD COLUMN IF NOT EXISTS service_inquiries INTEGER DEFAULT 0;

-- Create advanced lead scoring and tracking
CREATE TABLE IF NOT EXISTS pro_lead_scoring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES pro_leads(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  factors JSONB DEFAULT '{}',
  scoring_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create client communication log
CREATE TABLE IF NOT EXISTS pro_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_provider_id UUID REFERENCES pro_service_profiles(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES pro_leads(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES pro_contracts(id) ON DELETE CASCADE,
  communication_type TEXT NOT NULL CHECK (communication_type IN ('email', 'call', 'meeting', 'message', 'proposal')),
  subject TEXT,
  content TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  status TEXT DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'delivered', 'read', 'replied')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pro performance metrics
CREATE TABLE IF NOT EXISTS pro_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_provider_id UUID REFERENCES pro_service_profiles(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  metric_value DECIMAL(10,2) NOT NULL,
  metric_date DATE DEFAULT CURRENT_DATE,
  comparison_period TEXT DEFAULT 'month',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create client feedback and reviews
CREATE TABLE IF NOT EXISTS pro_client_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_provider_id UUID REFERENCES pro_service_profiles(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES pro_contracts(id) ON DELETE CASCADE,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  service_quality_rating INTEGER CHECK (service_quality_rating >= 1 AND service_quality_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  timeliness_rating INTEGER CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
  would_recommend BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true,
  response_from_provider TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service provider notes
CREATE TABLE IF NOT EXISTS pro_client_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_provider_id UUID REFERENCES pro_service_profiles(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES pro_leads(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES pro_contracts(id) ON DELETE CASCADE,
  note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general', 'meeting', 'call', 'important', 'follow_up')),
  title TEXT,
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT true,
  tags TEXT[],
  reminder_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE pro_lead_scoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE pro_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE pro_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE pro_client_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE pro_client_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pro_lead_scoring
CREATE POLICY "Service providers can manage their lead scoring"
ON pro_lead_scoring FOR ALL USING (
  lead_id IN (
    SELECT id FROM pro_leads 
    WHERE service_provider_id IN (
      SELECT id FROM pro_service_profiles WHERE user_id = auth.uid()
    )
  )
);

-- RLS Policies for pro_communications
CREATE POLICY "Service providers can manage their communications"
ON pro_communications FOR ALL USING (
  service_provider_id IN (
    SELECT id FROM pro_service_profiles WHERE user_id = auth.uid()
  )
);

-- RLS Policies for pro_performance_metrics
CREATE POLICY "Service providers can manage their performance metrics"
ON pro_performance_metrics FOR ALL USING (
  service_provider_id IN (
    SELECT id FROM pro_service_profiles WHERE user_id = auth.uid()
  )
);

-- RLS Policies for pro_client_feedback
CREATE POLICY "Service providers can view their feedback"
ON pro_client_feedback FOR SELECT USING (
  service_provider_id IN (
    SELECT id FROM pro_service_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Clients can create feedback for their contracts"
ON pro_client_feedback FOR INSERT WITH CHECK (
  client_id = auth.uid() AND
  contract_id IN (
    SELECT id FROM pro_contracts WHERE client_id = auth.uid()
  )
);

CREATE POLICY "Service providers can respond to their feedback"
ON pro_client_feedback FOR UPDATE USING (
  service_provider_id IN (
    SELECT id FROM pro_service_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Public can view public feedback"
ON pro_client_feedback FOR SELECT USING (is_public = true);

-- RLS Policies for pro_client_notes
CREATE POLICY "Service providers can manage their client notes"
ON pro_client_notes FOR ALL USING (
  service_provider_id IN (
    SELECT id FROM pro_service_profiles WHERE user_id = auth.uid()
  )
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_pro_lead_scoring_lead_id ON pro_lead_scoring(lead_id);
CREATE INDEX IF NOT EXISTS idx_pro_communications_provider_id ON pro_communications(service_provider_id);
CREATE INDEX IF NOT EXISTS idx_pro_communications_lead_id ON pro_communications(lead_id);
CREATE INDEX IF NOT EXISTS idx_pro_performance_metrics_provider_id ON pro_performance_metrics(service_provider_id);
CREATE INDEX IF NOT EXISTS idx_pro_performance_metrics_date ON pro_performance_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_pro_client_feedback_provider_id ON pro_client_feedback(service_provider_id);
CREATE INDEX IF NOT EXISTS idx_pro_client_feedback_client_id ON pro_client_feedback(client_id);
CREATE INDEX IF NOT EXISTS idx_pro_client_notes_provider_id ON pro_client_notes(service_provider_id);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pro_communications_updated_at BEFORE UPDATE ON pro_communications FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_pro_client_feedback_updated_at BEFORE UPDATE ON pro_client_feedback FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_pro_client_notes_updated_at BEFORE UPDATE ON pro_client_notes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Insert sample data for demonstration
INSERT INTO pro_performance_metrics (service_provider_id, metric_type, metric_value, metric_date) 
SELECT 
  id, 
  'revenue',
  RANDOM() * 5000 + 1000,
  CURRENT_DATE - INTERVAL '30 days' * generate_series(0, 11)
FROM pro_service_profiles
LIMIT 3;

INSERT INTO pro_performance_metrics (service_provider_id, metric_type, metric_value, metric_date) 
SELECT 
  id, 
  'client_satisfaction',
  RANDOM() * 2 + 3,
  CURRENT_DATE - INTERVAL '30 days' * generate_series(0, 11)
FROM pro_service_profiles
LIMIT 3;