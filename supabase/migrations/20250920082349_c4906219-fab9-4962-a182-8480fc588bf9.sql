-- TXC Backfill Process: Complete backfill for ALL users
-- Remove limit to process everyone

DO $$
DECLARE
  profile_record RECORD;
  posts_count INTEGER;
  connections_count INTEGER;
  account_age_days INTEGER;
  total_txc INTEGER;
  existing_balance INTEGER;
  processed_count INTEGER := 0;
  skipped_count INTEGER := 0;
BEGIN
  RAISE NOTICE 'Starting complete TXC backfill for ALL users...';
  
  -- Loop through ALL user profiles (removed LIMIT)
  FOR profile_record IN 
    SELECT id, email, full_name, created_at 
    FROM profiles 
    WHERE id IN (SELECT id FROM auth.users) -- Only real users
    ORDER BY created_at ASC
    -- REMOVED LIMIT - will process all users
  LOOP
    -- Check if user already has TXC balance
    SELECT COALESCE(balance, 0) INTO existing_balance
    FROM user_txc_balances 
    WHERE user_id = profile_record.id;
    
    IF existing_balance > 0 THEN
      RAISE NOTICE 'User % already has TXC balance: %, skipping...', profile_record.email, existing_balance;
      skipped_count := skipped_count + 1;
      CONTINUE;
    END IF;
    
    -- Get posts count
    SELECT COUNT(*) INTO posts_count
    FROM posts 
    WHERE user_id = profile_record.id OR author_id = profile_record.id;
    
    -- Get connections count (as requester)
    SELECT COUNT(*) INTO connections_count
    FROM connections 
    WHERE requester_id = profile_record.id AND status = 'accepted';
    
    -- Calculate account age in days
    account_age_days := EXTRACT(DAY FROM (NOW() - profile_record.created_at));
    
    -- Apply reasonable limits
    posts_count := LEAST(posts_count, 50);
    connections_count := LEAST(connections_count, 100);
    account_age_days := LEAST(account_age_days, 365);
    
    -- Calculate total TXC
    total_txc := 
      (posts_count * 150) +  -- 150 TXC per post
      (connections_count * 75) +  -- 75 TXC per connection
      500 +  -- Joining bonus
      CASE WHEN profile_record.full_name IS NOT NULL AND LENGTH(TRIM(profile_record.full_name)) > 0 THEN 300 ELSE 0 END +  -- Profile completion
      (account_age_days * 50) +  -- Daily login bonus
      ((account_age_days / 7) * 200);  -- Weekly social activity bonus
    
    -- Only process if user earned TXC
    IF total_txc > 0 THEN
      -- Insert/update TXC balance
      INSERT INTO user_txc_balances (user_id, balance, lifetime_earned)
      VALUES (profile_record.id, total_txc, total_txc)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        balance = EXCLUDED.balance,
        lifetime_earned = EXCLUDED.lifetime_earned;
      
      -- Create transaction record
      INSERT INTO txc_transactions (
        user_id, 
        transaction_type, 
        amount, 
        description
      ) VALUES (
        profile_record.id,
        'earn',
        total_txc,
        FORMAT('Historical backfill: %s posts, %s connections, %s days active', 
               posts_count, connections_count, account_age_days)
      );
      
      processed_count := processed_count + 1;
      
      RAISE NOTICE 'Awarded % TXC to % (Posts: %, Connections: %)', 
        total_txc, profile_record.email, posts_count, connections_count;
    END IF;
    
    -- Add small delay every 50 users to prevent overwhelming the database
    IF processed_count % 50 = 0 THEN
      PERFORM pg_sleep(0.1);
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Complete TXC backfill finished: % users processed, % skipped', processed_count, skipped_count;
END $$;