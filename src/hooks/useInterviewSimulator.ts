import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface InterviewQuestion {
  id: string;
  question: string;
  type: 'behavioral' | 'technical' | 'situational';
  difficulty: 'easy' | 'medium' | 'hard';
  focus_area: string;
  follow_ups: string[];
}

export interface InterviewEvaluation {
  overall_score: number;
  detailed_scores: {
    content_quality: number;
    communication: number;
    technical_accuracy?: number;
    confidence: number;
  };
  strengths: string[];
  areas_for_improvement: string[];
  suggestions: string[];
  follow_up_question?: string;
  ideal_answer_elements?: string[];
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  evaluation?: InterviewEvaluation;
}

export interface InterviewSession {
  id: string;
  jobTitle: string;
  company: string;
  interviewType: string;
  questions: InterviewQuestion[];
  conversation: ConversationMessage[];
  currentQuestionIndex: number;
  overallScore: number;
  status: 'preparing' | 'active' | 'completed';
  startedAt: Date;
  completedAt?: Date;
}

export const useInterviewSimulator = () => {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQuestions = useCallback(async (
    jobDescription: string,
    interviewType: string,
    userProfile: any
  ): Promise<InterviewQuestion[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-interview-simulator', {
        body: {
          action: 'generate_questions',
          jobDescription,
          interviewType,
          userProfile
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate questions');
      }

      return data.data.questions;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate questions';
      setError(errorMessage);
      console.error('Error generating questions:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const evaluateAnswer = useCallback(async (
    question: string,
    answer: string,
    jobDescription: string,
    interviewType: string
  ): Promise<InterviewEvaluation | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-interview-simulator', {
        body: {
          action: 'evaluate_answer',
          currentQuestion: question,
          conversationHistory: [{ role: 'user', content: answer }],
          jobDescription,
          interviewType
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to evaluate answer');
      }

      return data.data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to evaluate answer';
      setError(errorMessage);
      console.error('Error evaluating answer:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startInterviewSession = useCallback(async (
    jobTitle: string,
    company: string,
    jobDescription: string,
    interviewType: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const userProfile = {
        experienceLevel: 'mid-level', // This could come from user profile
        targetRole: jobTitle
      };

      const questions = await generateQuestions(jobDescription, interviewType, userProfile);
      
      if (questions.length === 0) {
        throw new Error('No questions generated');
      }

      const newSession: InterviewSession = {
        id: Date.now().toString(),
        jobTitle,
        company,
        interviewType,
        questions,
        conversation: [],
        currentQuestionIndex: 0,
        overallScore: 0,
        status: 'active',
        startedAt: new Date()
      };

      setCurrentSession(newSession);
      return newSession;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start interview';
      setError(errorMessage);
      console.error('Error starting interview:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [generateQuestions]);

  const submitAnswer = useCallback(async (answer: string) => {
    if (!currentSession) return;

    setIsLoading(true);
    setError(null);

    try {
      const currentQuestion = currentSession.questions[currentSession.currentQuestionIndex];
      
      // Add user's answer to conversation
      const userMessage: ConversationMessage = {
        role: 'user',
        content: answer,
        timestamp: new Date()
      };

      // Evaluate the answer
      const evaluation = await evaluateAnswer(
        currentQuestion.question,
        answer,
        `${currentSession.jobTitle} at ${currentSession.company}`,
        currentSession.interviewType
      );

      userMessage.evaluation = evaluation || undefined;

      // Update session
      const updatedSession = {
        ...currentSession,
        conversation: [...currentSession.conversation, userMessage],
        currentQuestionIndex: Math.min(
          currentSession.currentQuestionIndex + 1,
          currentSession.questions.length - 1
        )
      };

      // Calculate overall score
      const scores = updatedSession.conversation
        .filter(msg => msg.evaluation)
        .map(msg => msg.evaluation!.overall_score);
      
      updatedSession.overallScore = scores.length > 0 
        ? scores.reduce((a, b) => a + b, 0) / scores.length 
        : 0;

      // Check if interview is complete
      if (updatedSession.currentQuestionIndex >= updatedSession.questions.length - 1) {
        updatedSession.status = 'completed';
        updatedSession.completedAt = new Date();
      }

      setCurrentSession(updatedSession);
      return evaluation;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit answer';
      setError(errorMessage);
      console.error('Error submitting answer:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, evaluateAnswer]);

  const nextQuestion = useCallback(() => {
    if (!currentSession) return null;

    const nextIndex = currentSession.currentQuestionIndex + 1;
    if (nextIndex < currentSession.questions.length) {
      setCurrentSession({
        ...currentSession,
        currentQuestionIndex: nextIndex
      });
      return currentSession.questions[nextIndex];
    }
    return null;
  }, [currentSession]);

  const getCurrentQuestion = useCallback(() => {
    if (!currentSession || currentSession.currentQuestionIndex >= currentSession.questions.length) {
      return null;
    }
    return currentSession.questions[currentSession.currentQuestionIndex];
  }, [currentSession]);

  const endSession = useCallback(() => {
    if (currentSession) {
      setCurrentSession({
        ...currentSession,
        status: 'completed',
        completedAt: new Date()
      });
    }
  }, [currentSession]);

  const resetSession = useCallback(() => {
    setCurrentSession(null);
    setError(null);
  }, []);

  return {
    currentSession,
    isLoading,
    error,
    startInterviewSession,
    submitAnswer,
    nextQuestion,
    getCurrentQuestion,
    endSession,
    resetSession
  };
};