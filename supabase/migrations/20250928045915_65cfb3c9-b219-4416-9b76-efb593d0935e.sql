-- Create TXC leaderboard view with correct columns
CREATE OR REPLACE VIEW txc_leaderboard AS
SELECT 
  ROW_NUMBER() OVER (ORDER BY utb.total_earned DESC, utb.txc_balance DESC) as rank,
  utb.user_id,
  p.full_name,
  utb.txc_balance as current_txc,
  utb.total_earned as lifetime_txc,
  p.title as job_title,
  p.location,
  p.profile_picture_url,
  utb.updated_at as last_activity
FROM user_txc_balances utb
LEFT JOIN profiles p ON utb.user_id = p.id
WHERE utb.total_earned > 0
ORDER BY rank;