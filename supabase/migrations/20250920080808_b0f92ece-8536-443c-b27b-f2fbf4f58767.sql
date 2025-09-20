-- TXC Backfill Process: Calculate and award TXC to all users based on historical activity

-- Step 1: Create a comprehensive backfill for all users
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
  RAISE NOTICE 'Starting TXC backfill for all users...';
  
  -- Loop through all user profiles
  FOR profile_record IN 
    SELECT id, email, full_name, created_at 
    FROM profiles 
    ORDER BY created_at ASC
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
    posts_count := LEAST(posts_count, 5000);
    connections_count := LEAST(connections_count, 1000);
    account_age_days := LEAST(account_age_days, 365);
    
    -- Calculate total TXC
    total_txc := 
      (posts_count * 150) +  -- 150 TXC per post
      (connections_count * 75) +  -- 75 TXC per connection
      500 +  -- Joining bonus
      CASE WHEN profile_record.full_name IS NOT NULL AND LENGTH(TRIM(profile_record.full_name)) > 0 THEN 300 ELSE 0 END +  -- Profile completion
      (account_age_days * 50) +  -- Daily login bonus (reduced)
      ((account_age_days / 7) * 200);  -- Weekly social activity bonus (reduced)
    
    -- Only process if user earned TXC
    IF total_txc > 0 THEN
      -- Insert/update TXC balance
      INSERT INTO user_txc_balances (user_id, balance)
      VALUES (profile_record.id, total_txc)
      ON CONFLICT (user_id) 
      DO UPDATE SET balance = EXCLUDED.balance;
      
      -- Create transaction record
      INSERT INTO txc_transactions (
        user_id, 
        transaction_type, 
        amount, 
        description
      ) VALUES (
        profile_record.id,
        'mining',
        total_txc,
        FORMAT('Historical backfill: %s posts, %s connections, %s days active', 
               posts_count, connections_count, account_age_days)
      );
      
      processed_count := processed_count + 1;
      
      RAISE NOTICE 'Awarded % TXC to % (Posts: %, Connections: %)', 
        total_txc, profile_record.email, posts_count, connections_count;
    END IF;
    
    -- Commit every 50 users to avoid long transactions
    IF processed_count % 50 = 0 THEN
      COMMIT;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'TXC backfill completed: % users processed, % skipped', processed_count, skipped_count;
END $$;