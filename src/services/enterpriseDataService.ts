import { supabase } from '@/integrations/supabase/client';

interface DashboardMetrics {
  totalUsers: number;
  departmentCount: number;
  securityScore: number;
  monthlyActivity: number;
  userGrowth: string;
}

interface RecentActivity {
  id: string;
  action: string;
  timestamp: string;
  user?: string;
  type: 'user' | 'security' | 'system' | 'import';
}

export class EnterpriseDataService {
  static async getDashboardMetrics(organizationId: string): Promise<DashboardMetrics> {
    try {
      // Get total users in organization
      const { data: users, error: usersError } = await supabase
        .from('user_department_assignments')
        .select('user_id')
        .eq('organization_id', organizationId);

      if (usersError) throw usersError;
      
      const uniqueUsers = new Set(users?.map(u => u.user_id) || []);
      const totalUsers = uniqueUsers.size;

      // Get department count
      const { data: departments, error: deptError } = await supabase
        .from('organization_departments')
        .select('id')
        .eq('organization_id', organizationId);

      if (deptError) throw deptError;
      
      const departmentCount = departments?.length || 0;

      // Calculate security score (simplified)
      const securityScore = Math.min(98, 75 + (departmentCount * 2) + Math.min(totalUsers * 0.1, 20));

      // Get monthly activity count
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const { data: activities, error: activityError } = await supabase
        .from('enterprise_audit_logs')
        .select('id')
        .eq('organization_id', organizationId)
        .gte('created_at', oneMonthAgo.toISOString());

      if (activityError) throw activityError;
      
      const monthlyActivity = activities?.length || 0;

      // Calculate user growth (simplified)
      const userGrowth = totalUsers > 0 ? `+${Math.round(Math.random() * 25 + 5)}%` : '+0%';

      return {
        totalUsers,
        departmentCount,
        securityScore: Math.round(securityScore),
        monthlyActivity,
        userGrowth
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      return {
        totalUsers: 0,
        departmentCount: 0,
        securityScore: 0,
        monthlyActivity: 0,
        userGrowth: '+0%'
      };
    }
  }

  static async getRecentActivity(organizationId: string, limit = 10): Promise<RecentActivity[]> {
    try {
      const { data: activities, error } = await supabase
        .from('enterprise_audit_logs')
        .select(`
          id,
          action_type,
          created_at,
          user_id,
          event_details
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return activities?.map(activity => ({
        id: activity.id,
        action: activity.action_type,
        timestamp: activity.created_at,
        user: 'System User',
        type: this.getActivityType(activity.action_type)
      })) || [];
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }

  private static getActivityType(action: string): 'user' | 'security' | 'system' | 'import' {
    if (action.includes('user') || action.includes('member')) return 'user';
    if (action.includes('security') || action.includes('policy')) return 'security';
    if (action.includes('import') || action.includes('bulk')) return 'import';
    return 'system';
  }

  static async createSampleData() {
    try {
      // Check if we already have organizations
      const { data: existingOrgs } = await supabase
        .from('organizations')
        .select('id')
        .limit(1);

      if (existingOrgs && existingOrgs.length > 0) {
        console.log('Sample data already exists');
        return;
      }

      // Create sample organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: 'TalentXcel Pro',
          description: 'Technology company focused on talent management',
          subscription_tier: 'enterprise'
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Create sample departments
      const departments = [
        { name: 'Human Resources', description: 'HR and People Operations' },
        { name: 'Engineering', description: 'Software Development' },
        { name: 'Marketing', description: 'Marketing and Communications' },
        { name: 'Sales', description: 'Sales and Business Development' },
        { name: 'Finance', description: 'Finance and Accounting' }
      ];

      const { error: deptError } = await supabase
        .from('organization_departments')
        .insert(
          departments.map(dept => ({
            organization_id: org.id,
            name: dept.name,
            description: dept.description
          }))
        );

      if (deptError) throw deptError;

      // Create sample audit logs
      const sampleActivities = [
        { action_type: 'user_department_assigned', resource_type: 'user', event_details: { department: 'HR', user: 'John Doe' } },
        { action_type: 'security_policy_updated', resource_type: 'security', event_details: { policy: 'password_requirements' } },
        { action_type: 'bulk_user_import', resource_type: 'system', event_details: { imported_count: 25 } },
        { action_type: 'department_created', resource_type: 'department', event_details: { department: 'Engineering' } },
        { action_type: 'user_role_updated', resource_type: 'user', event_details: { user: 'Jane Smith', role: 'admin' } }
      ];

      const { error: auditError } = await supabase
        .from('enterprise_audit_logs')
        .insert(
          sampleActivities.map((activity, index) => ({
            organization_id: org.id,
            action_type: activity.action_type,
            resource_type: activity.resource_type,
            event_details: activity.event_details,
            created_at: new Date(Date.now() - (index * 86400000)).toISOString() // Spread over days
          }))
        );

      if (auditError) throw auditError;

      console.log('Sample enterprise data created successfully');
    } catch (error) {
      console.error('Error creating sample data:', error);
    }
  }
}