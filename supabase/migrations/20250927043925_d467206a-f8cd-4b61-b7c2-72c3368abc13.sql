-- Phase 1: Critical RLS Policies - Smart Creation (Only if not exists)
-- This addresses missing RLS policies systematically while avoiding conflicts

-- ==============================================
-- UTILITY FUNCTION TO CREATE POLICIES SAFELY
-- ==============================================

-- Create policies only if they don't exist
DO $policy_creation$ 
DECLARE
    policy_record RECORD;
    table_record RECORD;
BEGIN
    -- Loop through all tables that have RLS enabled but might be missing policies
    FOR table_record IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN (
            SELECT tablename 
            FROM pg_tables t
            WHERE schemaname = 'public'
            AND EXISTS (
                SELECT 1 FROM pg_class c 
                JOIN pg_namespace n ON c.relnamespace = n.oid 
                WHERE c.relname = t.tablename 
                AND n.nspname = 'public' 
                AND c.relrowsecurity = true
            )
        )
    LOOP
        RAISE NOTICE 'Processing table: %', table_record.tablename;
        
        -- Handle specific tables with custom policies
        CASE table_record.tablename
            
            -- A/B Testing Tables
            WHEN 'ab_tests' THEN
                PERFORM 1 WHERE NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ab_tests' AND policyname = 'Admins can manage A/B tests - enhanced');
                IF FOUND THEN
                    EXECUTE 'CREATE POLICY "Admins can manage A/B tests - enhanced" ON public.ab_tests FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN (''super_admin'', ''admin'') AND ur.is_active = true))';
                END IF;
            
            -- Ad Campaigns
            WHEN 'ad_campaigns' THEN
                PERFORM 1 WHERE NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ad_campaigns' AND policyname = 'Admins can manage ad campaigns');
                IF FOUND THEN
                    EXECUTE 'CREATE POLICY "Admins can manage ad campaigns" ON public.ad_campaigns FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN (''super_admin'', ''admin'') AND ur.is_active = true))';
                END IF;
            
            -- Admin Content Flags
            WHEN 'admin_content_flags' THEN
                PERFORM 1 WHERE NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'admin_content_flags' AND policyname = 'Public can view content flags');
                IF FOUND THEN
                    EXECUTE 'CREATE POLICY "Public can view content flags" ON public.admin_content_flags FOR SELECT USING (true)';
                END IF;
                
                PERFORM 1 WHERE NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'admin_content_flags' AND policyname = 'Admins can manage content flags');
                IF FOUND THEN
                    EXECUTE 'CREATE POLICY "Admins can manage content flags" ON public.admin_content_flags FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN (''super_admin'', ''admin'') AND ur.is_active = true))';
                END IF;
            
            -- Admin Prompts  
            WHEN 'admin_prompts' THEN
                PERFORM 1 WHERE NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'admin_prompts' AND policyname = 'Admins can manage prompts');
                IF FOUND THEN
                    EXECUTE 'CREATE POLICY "Admins can manage prompts" ON public.admin_prompts FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN (''super_admin'', ''admin'') AND ur.is_active = true))';
                END IF;
            
            -- Admin Tool Configs
            WHEN 'admin_tool_configs' THEN
                PERFORM 1 WHERE NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'admin_tool_configs' AND policyname = 'Admins can manage tool configs');
                IF FOUND THEN
                    EXECUTE 'CREATE POLICY "Admins can manage tool configs" ON public.admin_tool_configs FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN (''super_admin'', ''admin'') AND ur.is_active = true))';
                END IF;
            
            -- Agent Events
            WHEN 'agent_events' THEN
                PERFORM 1 WHERE NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'agent_events' AND policyname = 'System can insert agent events');
                IF FOUND THEN
                    EXECUTE 'CREATE POLICY "System can insert agent events" ON public.agent_events FOR INSERT WITH CHECK (true)';
                END IF;
                
                PERFORM 1 WHERE NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'agent_events' AND policyname = 'Admins can view agent events');
                IF FOUND THEN
                    EXECUTE 'CREATE POLICY "Admins can view agent events" ON public.agent_events FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN (''super_admin'', ''admin'') AND ur.is_active = true))';
                END IF;
            
            -- Agent Logs
            WHEN 'agent_logs' THEN
                PERFORM 1 WHERE NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'agent_logs' AND policyname = 'System can insert agent logs');
                IF FOUND THEN
                    EXECUTE 'CREATE POLICY "System can insert agent logs" ON public.agent_logs FOR INSERT WITH CHECK (true)';
                END IF;
                
                PERFORM 1 WHERE NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'agent_logs' AND policyname = 'Admins can view agent logs');
                IF FOUND THEN
                    EXECUTE 'CREATE POLICY "Admins can view agent logs" ON public.agent_logs FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN (''super_admin'', ''admin'') AND ur.is_active = true))';
                END IF;
            
            -- Agent Metrics
            WHEN 'agent_metrics' THEN
                PERFORM 1 WHERE NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'agent_metrics' AND policyname = 'System can insert agent metrics');
                IF FOUND THEN
                    EXECUTE 'CREATE POLICY "System can insert agent metrics" ON public.agent_metrics FOR INSERT WITH CHECK (true)';
                END IF;
                
                PERFORM 1 WHERE NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'agent_metrics' AND policyname = 'Admins can view agent metrics');
                IF FOUND THEN
                    EXECUTE 'CREATE POLICY "Admins can view agent metrics" ON public.agent_metrics FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN (''super_admin'', ''admin'') AND ur.is_active = true))';
                END IF;
            
            -- Agent Tasks
            WHEN 'agent_tasks' THEN
                PERFORM 1 WHERE NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'agent_tasks' AND policyname = 'System can insert agent tasks');
                IF FOUND THEN
                    EXECUTE 'CREATE POLICY "System can insert agent tasks" ON public.agent_tasks FOR INSERT WITH CHECK (true)';
                END IF;
                
                PERFORM 1 WHERE NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'agent_tasks' AND policyname = 'System can update agent tasks');
                IF FOUND THEN
                    EXECUTE 'CREATE POLICY "System can update agent tasks" ON public.agent_tasks FOR UPDATE USING (true)';
                END IF;
                
                PERFORM 1 WHERE NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'agent_tasks' AND policyname = 'Admins can view agent tasks');
                IF FOUND THEN
                    EXECUTE 'CREATE POLICY "Admins can view agent tasks" ON public.agent_tasks FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN (''super_admin'', ''admin'') AND ur.is_active = true))';
                END IF;
            
            -- Agent Tools
            WHEN 'agent_tools' THEN
                PERFORM 1 WHERE NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'agent_tools' AND policyname = 'System can manage agent tools');
                IF FOUND THEN
                    EXECUTE 'CREATE POLICY "System can manage agent tools" ON public.agent_tools FOR INSERT WITH CHECK (true)';
                END IF;
                
                PERFORM 1 WHERE NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'agent_tools' AND policyname = 'Admins can manage agent tools');
                IF FOUND THEN
                    EXECUTE 'CREATE POLICY "Admins can manage agent tools" ON public.agent_tools FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN (''super_admin'', ''admin'') AND ur.is_active = true))';
                END IF;
            
            -- Agents
            WHEN 'agents' THEN
                PERFORM 1 WHERE NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'agents' AND policyname = 'Everyone can view active agents');
                IF FOUND THEN
                    EXECUTE 'CREATE POLICY "Everyone can view active agents" ON public.agents FOR SELECT USING (status = ''active'')';
                END IF;
                
                PERFORM 1 WHERE NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'agents' AND policyname = 'Admins can manage agents');
                IF FOUND THEN
                    EXECUTE 'CREATE POLICY "Admins can manage agents" ON public.agents FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN (''super_admin'', ''admin'') AND ur.is_active = true))';
                END IF;
            
            -- AI Admin Inputs
            WHEN 'ai_admin_inputs' THEN
                PERFORM 1 WHERE NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_admin_inputs' AND policyname = 'Anyone can view active admin inputs');
                IF FOUND THEN
                    EXECUTE 'CREATE POLICY "Anyone can view active admin inputs" ON public.ai_admin_inputs FOR SELECT USING (is_active = true)';
                END IF;
                
                PERFORM 1 WHERE NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_admin_inputs' AND policyname = 'Admins can manage AI admin inputs');
                IF FOUND THEN
                    EXECUTE 'CREATE POLICY "Admins can manage AI admin inputs" ON public.ai_admin_inputs FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN (''super_admin'', ''admin'') AND ur.is_active = true))';
                END IF;
            
            -- AI Agents
            WHEN 'ai_agents' THEN
                PERFORM 1 WHERE NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_agents' AND policyname = 'Everyone can view active AI agents');
                IF FOUND THEN
                    EXECUTE 'CREATE POLICY "Everyone can view active AI agents" ON public.ai_agents FOR SELECT USING (status = ''active'')';
                END IF;
                
                PERFORM 1 WHERE NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_agents' AND policyname = 'Admins can manage AI agents');
                IF FOUND THEN
                    EXECUTE 'CREATE POLICY "Admins can manage AI agents" ON public.ai_agents FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN (''super_admin'', ''admin'') AND ur.is_active = true))';
                END IF;
            
            -- AI Bots
            WHEN 'ai_bots' THEN
                PERFORM 1 WHERE NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_bots' AND policyname = 'Anyone can view active AI bots');
                IF FOUND THEN
                    EXECUTE 'CREATE POLICY "Anyone can view active AI bots" ON public.ai_bots FOR SELECT USING (is_active = true)';
                END IF;
                
                PERFORM 1 WHERE NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_bots' AND policyname = 'Admins can manage AI bots');
                IF FOUND THEN
                    EXECUTE 'CREATE POLICY "Admins can manage AI bots" ON public.ai_bots FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN (''super_admin'', ''admin'') AND ur.is_active = true))';
                END IF;
            
            -- AI Career Insights
            WHEN 'ai_career_insights' THEN
                PERFORM 1 WHERE NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_career_insights' AND policyname = 'Users can view their own career insights');
                IF FOUND THEN
                    EXECUTE 'CREATE POLICY "Users can view their own career insights" ON public.ai_career_insights FOR ALL USING (auth.uid() = user_id)';
                END IF;
            
            -- AI Cover Letters Enhanced
            WHEN 'ai_cover_letters_enhanced' THEN
                PERFORM 1 WHERE NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_cover_letters_enhanced' AND policyname = 'Users can manage their enhanced cover letters');
                IF FOUND THEN
                    EXECUTE 'CREATE POLICY "Users can manage their enhanced cover letters" ON public.ai_cover_letters_enhanced FOR ALL USING (auth.uid() = user_id)';
                END IF;
            
            -- AI Datasets
            WHEN 'ai_datasets' THEN
                PERFORM 1 WHERE NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_datasets' AND policyname = 'Admins can manage AI datasets');
                IF FOUND THEN
                    EXECUTE 'CREATE POLICY "Admins can manage AI datasets" ON public.ai_datasets FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN (''super_admin'', ''admin'') AND ur.is_active = true))';
                END IF;
            
            -- AI Deployments
            WHEN 'ai_deployments' THEN
                PERFORM 1 WHERE NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_deployments' AND policyname = 'Everyone can view live AI deployments');
                IF FOUND THEN
                    EXECUTE 'CREATE POLICY "Everyone can view live AI deployments" ON public.ai_deployments FOR SELECT USING (is_live = true)';
                END IF;
                
                PERFORM 1 WHERE NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_deployments' AND policyname = 'Admins can manage AI deployments');
                IF FOUND THEN
                    EXECUTE 'CREATE POLICY "Admins can manage AI deployments" ON public.ai_deployments FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN (''super_admin'', ''admin'') AND ur.is_active = true))';
                END IF;
            
            -- AI Drafts
            WHEN 'ai_drafts' THEN
                PERFORM 1 WHERE NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_drafts' AND policyname = 'Admins can manage ai drafts');
                IF FOUND THEN
                    EXECUTE 'CREATE POLICY "Admins can manage ai drafts" ON public.ai_drafts FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN (''super_admin'', ''admin'') AND ur.is_active = true))';
                END IF;
            
            -- AI Features Status
            WHEN 'ai_features_status' THEN
                PERFORM 1 WHERE NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_features_status' AND policyname = 'Users can view AI features status');
                IF FOUND THEN
                    EXECUTE 'CREATE POLICY "Users can view AI features status" ON public.ai_features_status FOR SELECT USING (true)';
                END IF;
                
                PERFORM 1 WHERE NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_features_status' AND policyname = 'Admins can manage AI features status');
                IF FOUND THEN
                    EXECUTE 'CREATE POLICY "Admins can manage AI features status" ON public.ai_features_status FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN (''super_admin'', ''admin'') AND ur.is_active = true))';
                END IF;
            
            -- AI Feedback
            WHEN 'ai_feedback' THEN
                PERFORM 1 WHERE NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_feedback' AND policyname = 'Users can manage their own AI feedback');
                IF FOUND THEN
                    EXECUTE 'CREATE POLICY "Users can manage their own AI feedback" ON public.ai_feedback FOR ALL USING (auth.uid() = user_id)';
                END IF;
            
            -- AI Feedback System
            WHEN 'ai_feedback_system' THEN
                PERFORM 1 WHERE NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_feedback_system' AND policyname = 'Users can manage their own feedback');
                IF FOUND THEN
                    EXECUTE 'CREATE POLICY "Users can manage their own feedback" ON public.ai_feedback_system FOR ALL USING (auth.uid() = user_id)';
                END IF;
                
                PERFORM 1 WHERE NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_feedback_system' AND policyname = 'Admins can view all feedback');
                IF FOUND THEN
                    EXECUTE 'CREATE POLICY "Admins can view all feedback" ON public.ai_feedback_system FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN (''super_admin'', ''admin'') AND ur.is_active = true))';
                END IF;
            
            ELSE
                -- For any other table, create basic policies if none exist
                RAISE NOTICE 'Creating basic policies for table: %', table_record.tablename;
                
                -- Check if table has user_id column for user-scoped policies
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_schema = 'public' 
                    AND table_name = table_record.tablename 
                    AND column_name = 'user_id'
                ) THEN
                    -- User-scoped table
                    PERFORM 1 WHERE NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = table_record.tablename AND policyname = 'Users can manage their own data');
                    IF FOUND THEN
                        EXECUTE format('CREATE POLICY "Users can manage their own data" ON public.%I FOR ALL USING (auth.uid() = user_id)', table_record.tablename);
                    END IF;
                ELSE
                    -- Check if table looks like an admin table
                    IF table_record.tablename LIKE 'admin_%' OR table_record.tablename LIKE 'agent_%' OR table_record.tablename LIKE 'ai_%' THEN
                        PERFORM 1 WHERE NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = table_record.tablename AND policyname = 'System can manage data');
                        IF FOUND THEN
                            EXECUTE format('CREATE POLICY "System can manage data" ON public.%I FOR ALL USING (true)', table_record.tablename);
                        END IF;
                    ELSE
                        -- General table - allow read access
                        PERFORM 1 WHERE NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = table_record.tablename AND policyname = 'Public read access');
                        IF FOUND THEN
                            EXECUTE format('CREATE POLICY "Public read access" ON public.%I FOR SELECT USING (true)', table_record.tablename);
                        END IF;
                    END IF;
                END IF;
        END CASE;
    END LOOP;
    
    RAISE NOTICE 'Completed policy creation for all tables';
END
$policy_creation$;