-- Create email configuration settings table
CREATE TABLE IF NOT EXISTS email_config_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE email_config_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage email config
CREATE POLICY "Admins can manage email config" ON email_config_settings
FOR ALL USING (is_app_admin(auth.uid()));

-- Insert default email configuration
INSERT INTO email_config_settings (setting_key, setting_value, description) VALUES
('smtp_from_address', 'no-reply@savantis.com', 'Default sender email address'),
('smtp_from_name', 'TalentXcel', 'Default sender name'),
('support_email', 'support@talentxcel.in', 'Support email for replies'),
('smtp_reply_to', 'support@talentxcel.in', 'Reply-to email address'),
('company_name', 'TalentXcel', 'Company name for email templates'),
('website_url', 'https://talentxcel.in', 'Website URL for email templates')
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  updated_at = now();

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_email_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_email_config_updated_at_trigger
  BEFORE UPDATE ON email_config_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_email_config_updated_at();