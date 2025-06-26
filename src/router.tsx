
import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/components/layouts/RootLayout';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { ProtectedRoute } from '@/components/routing/ProtectedRoute';
import { PublicRoute } from '@/components/routing/PublicRoute';

// Lazy load components for better performance
import { lazy } from 'react';

// Public pages
const Index = lazy(() => import('@/pages/Index'));
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'));

// Protected pages
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Profile = lazy(() => import('@/pages/Profile'));
const ProfileEdit = lazy(() => import('@/pages/profile/ProfileEdit'));
const ProfileResume = lazy(() => import('@/pages/profile/ProfileResume'));
const ProfileCoverLetter = lazy(() => import('@/pages/profile/ProfileCoverLetter'));
const ProfilePreferences = lazy(() => import('@/pages/profile/ProfilePreferences'));
const ProfileSettings = lazy(() => import('@/pages/profile/ProfileSettings'));
const ProfileMedia = lazy(() => import('@/pages/profile/ProfileMedia'));
const ProfileAnalytics = lazy(() => import('@/pages/profile/ProfileAnalytics'));
const ProfileDocuments = lazy(() => import('@/pages/profile/ProfileDocuments'));

const ResumeBuilder = lazy(() => import('@/pages/ResumeBuilder'));

// Job pages
const Jobs = lazy(() => import('@/pages/Jobs'));
const SavedJobs = lazy(() => import('@/pages/jobs/SavedJobs'));
const AppliedJobs = lazy(() => import('@/pages/jobs/AppliedJobs'));
const JobCategories = lazy(() => import('@/pages/jobs/JobCategories'));
const JobsCompanies = lazy(() => import('@/pages/jobs/Companies'));
const JobRecommendations = lazy(() => import('@/pages/jobs/Recommendations'));
const JobAlerts = lazy(() => import('@/pages/jobs/Alerts'));
const JobAnalytics = lazy(() => import('@/pages/jobs/Analytics'));
const JobPost = lazy(() => import('@/pages/jobs/JobPost'));
const JobsManage = lazy(() => import('@/pages/jobs/Manage'));
const JobDetails = lazy(() => import('@/pages/jobs/JobDetails'));
const JobApply = lazy(() => import('@/pages/jobs/JobApply'));
const SmartApply = lazy(() => import('@/pages/jobs/SmartApply'));
const JobApplicants = lazy(() => import('@/pages/jobs/JobApplicants'));
const ApplicantDetail = lazy(() => import('@/pages/jobs/ApplicantDetail'));

// Network pages
const Network = lazy(() => import('@/pages/Network'));
const People = lazy(() => import('@/pages/network/People'));
const Posts = lazy(() => import('@/pages/network/Posts'));
const Groups = lazy(() => import('@/pages/network/Groups'));
const Requests = lazy(() => import('@/pages/network/Requests'));
const Events = lazy(() => import('@/pages/network/Events'));
const Messages = lazy(() => import('@/pages/network/Messages'));
const Notifications = lazy(() => import('@/pages/network/Notifications'));
const Suggestions = lazy(() => import('@/pages/network/Suggestions'));
const UserProfile = lazy(() => import('@/pages/network/UserProfile'));
const PostDetail = lazy(() => import('@/pages/network/PostDetail'));
const GroupDetail = lazy(() => import('@/pages/network/GroupDetail'));
const EventDetail = lazy(() => import('@/pages/network/EventDetail'));
const MessageConversation = lazy(() => import('@/pages/network/MessageConversation'));

// Learning pages
const Learning = lazy(() => import('@/pages/Learning'));
const MyCourses = lazy(() => import('@/pages/learning/MyCourses'));
const LearningPaths = lazy(() => import('@/pages/learning/LearningPaths'));
const Certificates = lazy(() => import('@/pages/learning/Certificates'));
const CourseDetail = lazy(() => import('@/pages/learning/CourseDetail'));
const LearningPathDetail = lazy(() => import('@/pages/learning/LearningPathDetail'));

// Tools pages
const Tools = lazy(() => import('@/pages/Tools'));
const ToolsDashboard = lazy(() => import('@/pages/tools/ToolsDashboard'));
const ResumeCheck = lazy(() => import('@/pages/tools/ResumeCheck'));
const CoverLetter = lazy(() => import('@/pages/tools/CoverLetter'));
const SalaryAnalyzer = lazy(() => import('@/pages/tools/SalaryAnalyzer'));
const InterviewPrep = lazy(() => import('@/pages/tools/InterviewPrep'));
const AICareerAssistant = lazy(() => import('@/pages/tools/AICareerAssistant'));
const ProfileScore = lazy(() => import('@/pages/tools/ProfileScore'));
const MarketInsights = lazy(() => import('@/pages/tools/MarketInsights'));

// AI pages
const AIAssistant = lazy(() => import('@/pages/ai/AIAssistant'));
const AIOptimizer = lazy(() => import('@/pages/ai/AIOptimizer'));
const JobMatch = lazy(() => import('@/pages/ai/JobMatch'));
const MessageSuggest = lazy(() => import('@/pages/ai/MessageSuggest'));
const Pathfinder = lazy(() => import('@/pages/ai/Pathfinder'));

// Career Map pages
const CareerMap = lazy(() => import('@/pages/CareerMap'));
const Generate = lazy(() => import('@/pages/career-map/Generate'));
const AIRoadmapBuilder = lazy(() => import('@/pages/career-map/AIRoadmapBuilder'));
const MyRoadmaps = lazy(() => import('@/pages/career-map/MyRoadmaps'));
const SkillsGap = lazy(() => import('@/pages/career-map/SkillsGap'));
const CareerRecommendations = lazy(() => import('@/pages/career-map/Recommendations'));
const Comparison = lazy(() => import('@/pages/career-map/Comparison'));
const CareerSwitch = lazy(() => import('@/pages/career-map/CareerSwitch'));
const RoadmapDetail = lazy(() => import('@/pages/career-map/RoadmapDetail'));

// Marketplace pages
const Marketplace = lazy(() => import('@/pages/Marketplace'));
const PostService = lazy(() => import('@/pages/marketplace/PostService'));
const ServiceDetail = lazy(() => import('@/pages/marketplace/ServiceDetail'));

// Employer pages
const EmployerDashboard = lazy(() => import('@/pages/employer/Dashboard'));
const EmployerProfile = lazy(() => import('@/pages/employer/Profile'));

// Companies & Colleges
const Companies = lazy(() => import('@/pages/Companies'));
const CompanyDetail = lazy(() => import('@/pages/companies/CompanyDetail'));
const Colleges = lazy(() => import('@/pages/Colleges'));
const CollegeDetail = lazy(() => import('@/pages/colleges/CollegeDetail'));

// Error pages
const NotFound = lazy(() => import('@/pages/NotFound'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Index />
      },
      {
        path: 'auth',
        element: <AuthLayout />,
        children: [
          {
            path: 'login',
            element: (
              <PublicRoute>
                <Login />
              </PublicRoute>
            )
          },
          {
            path: 'register',
            element: (
              <PublicRoute>
                <Register />
              </PublicRoute>
            )
          },
          {
            path: 'forgot-password',
            element: (
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            )
          },
          {
            path: 'reset-password',
            element: (
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            )
          }
        ]
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        )
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Profile />
          },
          {
            path: 'edit',
            element: <ProfileEdit />
          },
          {
            path: 'resume',
            element: <ProfileResume />
          },
          {
            path: 'cover-letter',
            element: <ProfileCoverLetter />
          },
          {
            path: 'preferences',
            element: <ProfilePreferences />
          },
          {
            path: 'settings',
            element: <ProfileSettings />
          },
          {
            path: 'media',
            element: <ProfileMedia />
          },
          {
            path: 'analytics',
            element: <ProfileAnalytics />
          },
          {
            path: 'documents',
            element: <ProfileDocuments />
          }
        ]
      },
      {
        path: 'resume-builder',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <ResumeBuilder />
            </DashboardLayout>
          </ProtectedRoute>
        )
      },
      {
        path: 'jobs',
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Jobs />
          },
          {
            path: 'saved',
            element: <SavedJobs />
          },
          {
            path: 'applied',
            element: <AppliedJobs />
          },
          {
            path: 'categories',
            element: <JobCategories />
          },
          {
            path: 'companies',
            element: <JobsCompanies />
          },
          {
            path: 'recommendations',
            element: <JobRecommendations />
          },
          {
            path: 'alerts',
            element: <JobAlerts />
          },
          {
            path: 'analytics',
            element: <JobAnalytics />
          },
          {
            path: 'post',
            element: <JobPost />
          },
          {
            path: 'manage',
            element: <JobsManage />
          },
          {
            path: ':id',
            element: <JobDetails />
          },
          {
            path: ':id/apply',
            element: <JobApply />
          },
          {
            path: ':id/smart-apply',
            element: <SmartApply />
          },
          {
            path: ':id/applicants',
            element: <JobApplicants />
          },
          {
            path: ':jobId/applicants/:applicantId',
            element: <ApplicantDetail />
          }
        ]
      },
      {
        path: 'network',
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Network />
          },
          {
            path: 'people',
            children: [
              {
                index: true,
                element: <People />
              },
              {
                path: ':id',
                element: <UserProfile />
              }
            ]
          },
          {
            path: 'posts',
            children: [
              {
                index: true,
                element: <Posts />
              },
              {
                path: ':id',
                element: <PostDetail />
              }
            ]
          },
          {
            path: 'groups',
            children: [
              {
                index: true,
                element: <Groups />
              },
              {
                path: ':id',
                element: <GroupDetail />
              }
            ]
          },
          {
            path: 'requests',
            element: <Requests />
          },
          {
            path: 'events',
            children: [
              {
                index: true,
                element: <Events />
              },
              {
                path: ':id',
                element: <EventDetail />
              }
            ]
          },
          {
            path: 'messages',
            children: [
              {
                index: true,
                element: <Messages />
              },
              {
                path: ':id',
                element: <MessageConversation />
              }
            ]
          },
          {
            path: 'notifications',
            element: <Notifications />
          },
          {
            path: 'suggestions',
            element: <Suggestions />
          }
        ]
      },
      {
        path: 'learning',
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Learning />
          },
          {
            path: 'my-courses',
            element: <MyCourses />
          },
          {
            path: 'paths',
            children: [
              {
                index: true,
                element: <LearningPaths />
              },
              {
                path: ':id',
                element: <LearningPathDetail />
              }
            ]
          },
          {
            path: 'certificates',
            element: <Certificates />
          },
          {
            path: ':id',
            element: <CourseDetail />
          }
        ]
      },
      {
        path: 'tools',
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Tools />
          },
          {
            path: 'dashboard',
            element: <ToolsDashboard />
          },
          {
            path: 'resume-check',
            element: <ResumeCheck />
          },
          {
            path: 'cover-letter',
            element: <CoverLetter />
          },
          {
            path: 'salary-analyzer',
            element: <SalaryAnalyzer />
          },
          {
            path: 'interview-prep',
            element: <InterviewPrep />
          },
          {
            path: 'ai-assistant',
            element: <AICareerAssistant />
          },
          {
            path: 'profile-score',
            element: <ProfileScore />
          },
          {
            path: 'market-insights',
            element: <MarketInsights />
          }
        ]
      },
      {
        path: 'ai-assistant',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <AIAssistant />
            </DashboardLayout>
          </ProtectedRoute>
        )
      },
      {
        path: 'ai-optimizer',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <AIOptimizer />
            </DashboardLayout>
          </ProtectedRoute>
        )
      },
      {
        path: 'ai',
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: 'job-match',
            element: <JobMatch />
          },
          {
            path: 'message-suggest',
            element: <MessageSuggest />
          },
          {
            path: 'pathfinder',
            element: <Pathfinder />
          }
        ]
      },
      {
        path: 'career-map',
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <CareerMap />
          },
          {
            path: 'generate',
            element: <Generate />
          },
          {
            path: 'ai-roadmap-builder',
            element: <AIRoadmapBuilder />
          },
          {
            path: 'my-roadmaps',
            element: <MyRoadmaps />
          },
          {
            path: 'skills-gap',
            element: <SkillsGap />
          },
          {
            path: 'recommendations',
            element: <CareerRecommendations />
          },
          {
            path: 'comparison',
            element: <Comparison />
          },
          {
            path: 'switch',
            element: <CareerSwitch />
          },
          {
            path: ':id',
            element: <RoadmapDetail />
          }
        ]
      },
      {
        path: 'marketplace',
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Marketplace />
          },
          {
            path: 'post-service',
            element: <PostService />
          },
          {
            path: ':id',
            element: <ServiceDetail />
          }
        ]
      },
      {
        path: 'employer',
        element: (
          <ProtectedRoute requiredRoles={['employer', 'admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <EmployerDashboard />
          },
          {
            path: 'profile',
            element: <EmployerProfile />
          }
        ]
      },
      {
        path: 'companies',
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Companies />
          },
          {
            path: ':id',
            element: <CompanyDetail />
          }
        ]
      },
      {
        path: 'colleges',
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Colleges />
          },
          {
            path: ':id',
            element: <CollegeDetail />
          }
        ]
      },
      {
        path: '*',
        element: <NotFound />
      }
    ]
  }
]);
