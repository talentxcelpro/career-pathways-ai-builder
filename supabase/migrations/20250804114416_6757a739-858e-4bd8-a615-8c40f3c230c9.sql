-- Update email configuration to use talentxcel.in domain
UPDATE email_config_settings 
SET setting_value = 'no-reply@talentxcel.in', updated_at = now()
WHERE setting_key = 'smtp_from_address';

UPDATE email_config_settings 
SET setting_value = 'support@talentxcel.in', updated_at = now()
WHERE setting_key = 'smtp_reply_to';

UPDATE email_config_settings 
SET setting_value = 'support@talentxcel.in', updated_at = now()
WHERE setting_key = 'support_email';