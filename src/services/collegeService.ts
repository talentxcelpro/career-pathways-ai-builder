import { supabase } from '@/integrations/supabase/client';
import { aiService } from './aiService';
import type { 
  College, 
  CollegeCourse, 
  CollegeReview, 
  Application, 
  SOPDraft,
  CollegeEvent,
  CollegeSearchParams,
  CollegeFilters 
} from '@/types/colleges';

class CollegeService {
  
  /**
   * Search and filter colleges
   */
  async searchColleges(params: CollegeSearchParams) {
    try {
      let query = supabase
        .from('colleges')
        .select(`
          *,
          college_courses(count),
          college_reviews(overall_rating)
        `)
        .eq('is_active', true);

      // Apply filters
      if (params.filters.search) {
        query = query.or(`name.ilike.%${params.filters.search}%,description.ilike.%${params.filters.search}%,ai_match_keywords.cs.{${params.filters.search}}`);
      }

      if (params.filters.college_type?.length) {
        query = query.in('college_type', params.filters.college_type);
      }

      if (params.filters.city?.length) {
        query = query.in('city', params.filters.city);
      }

      if (params.filters.state?.length) {
        query = query.in('state', params.filters.state);
      }

      if (params.filters.fees_range) {
        query = query
          .gte('average_fees_per_year', params.filters.fees_range[0])
          .lte('average_fees_per_year', params.filters.fees_range[1]);
      }

      if (params.filters.ranking_range) {
        query = query
          .gte('ranking_national', params.filters.ranking_range[0])
          .lte('ranking_national', params.filters.ranking_range[1]);
      }

      if (params.filters.placement_range) {
        query = query
          .gte('placement_percentage', params.filters.placement_range[0])
          .lte('placement_percentage', params.filters.placement_range[1]);
      }

      if (params.filters.verification_status?.length) {
        query = query.in('verification_status', params.filters.verification_status);
      }

      if (params.filters.featured_only) {
        query = query.eq('featured', true);
      }

      // Apply sorting
      if (params.sort_by) {
        query = query.order(params.sort_by, { 
          ascending: params.sort_order === 'asc' 
        });
      } else {
        // Default sorting: featured first, then by ranking
        query = query.order('featured', { ascending: false })
                    .order('ranking_national', { ascending: true });
      }

      // Apply pagination
      if (params.page && params.limit) {
        const from = (params.page - 1) * params.limit;
        const to = from + params.limit - 1;
        query = query.range(from, to);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        colleges: data as College[],
        total: data?.length || 0
      };
    } catch (error) {
      console.error('Error searching colleges:', error);
      throw error;
    }
  }

  /**
   * Get college by ID or slug
   */
  async getCollege(identifier: string) {
    try {
      let query = supabase
        .from('colleges')
        .select(`
          *,
          college_courses(*),
          college_reviews(*),
          college_events(*)
        `);

      // Check if identifier is UUID or slug
      if (identifier.includes('-') && identifier.length > 30) {
        query = query.eq('id', identifier);
      } else {
        query = query.eq('slug', identifier);
      }

      const { data, error } = await query.single();

      if (error) throw error;

      return data as College;
    } catch (error) {
      console.error('Error getting college:', error);
      throw error;
    }
  }

  /**
   * Get courses for a college
   */
  async getCollegeCourses(collegeId: string, filters?: Partial<CollegeFilters>) {
    try {
      let query = supabase
        .from('college_courses')
        .select('*')
        .eq('college_id', collegeId)
        .eq('is_active', true);

      if (filters?.degree_type?.length) {
        query = query.in('degree_type', filters.degree_type);
      }

      if (filters?.discipline?.length) {
        query = query.in('discipline', filters.discipline);
      }

      if (filters?.search) {
        query = query.or(`course_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.order('degree_type').order('course_name');

      if (error) throw error;

      return data as CollegeCourse[];
    } catch (error) {
      console.error('Error getting college courses:', error);
      throw error;
    }
  }

  /**
   * Get reviews for a college
   */
  async getCollegeReviews(collegeId: string) {
    try {
      const { data, error } = await supabase
        .from('college_reviews')
        .select(`
          *,
          profiles!college_reviews_user_id_fkey(full_name, avatar_url)
        `)
        .eq('college_id', collegeId)
        .eq('is_verified', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data as CollegeReview[];
    } catch (error) {
      console.error('Error getting college reviews:', error);
      throw error;
    }
  }

  /**
   * Submit college application
   */
  async submitApplication(applicationData: Partial<Application>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('applications')
        .insert({
          student_id: user.id,
          college_id: applicationData.college_id!,
          course_id: applicationData.course_id!,
          application_status: 'submitted',
          submission_date: new Date().toISOString(),
          personal_info: applicationData.personal_info,
          academic_info: applicationData.academic_info,
          entrance_exam_scores: applicationData.entrance_exam_scores,
          documents: applicationData.documents,
          course_preferences: applicationData.course_preferences,
          campus_preferences: applicationData.campus_preferences
        })
        .select()
        .single();

      if (error) throw error;

      return data as Application;
    } catch (error) {
      console.error('Error submitting application:', error);
      throw error;
    }
  }

  /**
   * Save SOP/LOR draft
   */
  async saveSOPDraft(sopData: Partial<SOPDraft>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('sop_drafts')
        .upsert({
          id: sopData.id,
          user_id: user.id,
          college_id: sopData.college_id,
          course_id: sopData.course_id,
          title: sopData.title!,
          content: sopData.content!,
          document_type: sopData.document_type || 'sop',
          ai_generated: sopData.ai_generated,
          ai_prompt: sopData.ai_prompt,
          ai_feedback: sopData.ai_feedback,
          ai_score: sopData.ai_score,
          ai_suggestions: sopData.ai_suggestions,
          version: sopData.version,
          is_final: sopData.is_final,
          parent_draft_id: sopData.parent_draft_id,
          word_count: sopData.content?.split(/\s+/).length || 0,
          character_count: sopData.content?.length || 0
        })
        .select()
        .single();

      if (error) throw error;

      return data as SOPDraft;
    } catch (error) {
      console.error('Error saving SOP draft:', error);
      throw error;
    }
  }

  /**
   * Track student-college interaction
   */
  async trackInteraction(collegeId: string, interactionType: string, metadata?: Record<string, any>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return; // Silent fail for unauthenticated users

      await supabase
        .from('student_college_interactions')
        .insert({
          user_id: user.id,
          college_id: collegeId,
          interaction_type: interactionType,
          metadata: metadata || {}
        });
    } catch (error) {
      console.error('Error tracking interaction:', error);
      // Don't throw error for tracking
    }
  }

  /**
   * Bookmark/Save college
   */
  async bookmarkCollege(collegeId: string, notes?: string, tags?: string[]) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('college_bookmarks')
        .upsert({
          user_id: user.id,
          college_id: collegeId,
          notes: notes || '',
          tags: tags || []
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error bookmarking college:', error);
      throw error;
    }
  }

  /**
   * Remove bookmark
   */
  async removeBookmark(collegeId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('college_bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('college_id', collegeId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing bookmark:', error);
      throw error;
    }
  }

  /**
   * Get user's bookmarked colleges
   */
  async getBookmarkedColleges() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('college_bookmarks')
        .select(`
          *,
          colleges(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error getting bookmarked colleges:', error);
      throw error;
    }
  }

  /**
   * AI-Powered College Discovery
   */
  async discoverColleges(userProfile: any, preferences: any) {
    try {
      const aiResponse = await aiService.call({
        module: 'Colleges',
        feature: 'college_discovery',
        input: {
          user_profile: JSON.stringify(userProfile),
          preferences: JSON.stringify(preferences)
        }
      });

      if (aiResponse.success && aiResponse.data) {
        return {
          recommendations: aiResponse.data.recommendations,
          explanation: aiResponse.data.explanation,
          match_scores: aiResponse.data.match_scores
        };
      }

      return null;
    } catch (error) {
      console.error('Error in AI college discovery:', error);
      return null;
    }
  }

  /**
   * AI-Powered Course Recommendations
   */
  async recommendCourses(userProfile: any, careerGoals: any, collegeId?: string) {
    try {
      const aiResponse = await aiService.call({
        module: 'Colleges',
        feature: 'course_recommender',
        input: {
          user_profile: JSON.stringify(userProfile),
          career_goals: JSON.stringify(careerGoals),
          college_id: collegeId
        }
      });

      if (aiResponse.success && aiResponse.data) {
        return {
          recommended_courses: aiResponse.data.courses,
          explanation: aiResponse.data.explanation,
          career_alignment: aiResponse.data.career_alignment
        };
      }

      return null;
    } catch (error) {
      console.error('Error in AI course recommendations:', error);
      return null;
    }
  }

  /**
   * AI-Powered College Comparison
   */
  async compareColleges(collegeIds: string[], comparisonCriteria: string[]) {
    try {
      // Get college data
      const { data: colleges, error } = await supabase
        .from('colleges')
        .select('*')
        .in('id', collegeIds);

      if (error) throw error;

      const aiResponse = await aiService.call({
        module: 'Colleges',
        feature: 'college_comparison',
        input: {
          colleges: JSON.stringify(colleges),
          criteria: JSON.stringify(comparisonCriteria)
        }
      });

      if (aiResponse.success && aiResponse.data) {
        return {
          comparison: aiResponse.data.comparison,
          summary: aiResponse.data.summary,
          recommendations: aiResponse.data.recommendations
        };
      }

      return null;
    } catch (error) {
      console.error('Error in AI college comparison:', error);
      throw error;
    }
  }

  /**
   * AI Assistant - Ask questions about colleges
   */
  async askCollegeQuestion(question: string, context?: any) {
    try {
      const aiResponse = await aiService.call({
        module: 'Colleges',
        feature: 'college_qa_assistant',
        input: {
          question: question,
          context: context ? JSON.stringify(context) : null
        }
      });

      if (aiResponse.success && aiResponse.data) {
        return {
          answer: aiResponse.data.answer,
          sources: aiResponse.data.sources,
          follow_up_questions: aiResponse.data.follow_up_questions
        };
      }

      return null;
    } catch (error) {
      console.error('Error in AI college Q&A:', error);
      return null;
    }
  }

  /**
   * AI-Generated SOP/LOR
   */
  async generateSOP(templateData: any, documentType: string = 'sop') {
    try {
      const aiResponse = await aiService.call({
        module: 'Colleges',
        feature: 'sop_lor_generator',
        input: {
          template_data: JSON.stringify(templateData),
          document_type: documentType
        }
      });

      if (aiResponse.success && aiResponse.data) {
        return {
          content: aiResponse.data.content,
          suggestions: aiResponse.data.suggestions,
          score: aiResponse.data.quality_score
        };
      }

      return null;
    } catch (error) {
      console.error('Error in AI SOP generation:', error);
      return null;
    }
  }

  /**
   * AI Review Analysis
   */
  async analyzeReviews(collegeId: string) {
    try {
      const reviews = await this.getCollegeReviews(collegeId);

      const aiResponse = await aiService.call({
        module: 'Colleges',
        feature: 'review_analysis',
        input: {
          reviews: JSON.stringify(reviews)
        }
      });

      if (aiResponse.success && aiResponse.data) {
        return {
          sentiment_summary: aiResponse.data.sentiment_summary,
          key_themes: aiResponse.data.key_themes,
          pros_cons: aiResponse.data.pros_cons,
          overall_score: aiResponse.data.overall_score
        };
      }

      return null;
    } catch (error) {
      console.error('Error in AI review analysis:', error);
      return null;
    }
  }

  /**
   * Get filter options for search
   */
  async getFilterOptions() {
    try {
      const [collegeTypes, cities, states, disciplines] = await Promise.all([
        supabase.from('colleges').select('college_type').not('college_type', 'is', null),
        supabase.from('colleges').select('city').not('city', 'is', null),
        supabase.from('colleges').select('state').not('state', 'is', null),
        supabase.from('college_courses').select('discipline').not('discipline', 'is', null)
      ]);

      return {
        college_types: [...new Set(collegeTypes.data?.map(c => c.college_type))],
        cities: [...new Set(cities.data?.map(c => c.city))],
        states: [...new Set(states.data?.map(c => c.state))],
        disciplines: [...new Set(disciplines.data?.map(c => c.discipline))]
      };
    } catch (error) {
      console.error('Error getting filter options:', error);
      return {
        college_types: [],
        cities: [],
        states: [],
        disciplines: []
      };
    }
  }
}

export const collegeService = new CollegeService();