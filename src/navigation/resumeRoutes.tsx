
import { NavItem } from '@/types/nav-item';
import ResumeDashboard from '@/pages/resume/ResumeDashboard';
import AppleResumeChecker from '@/pages/resume/AppleResumeChecker';
import EditResume from '@/pages/resume/EditResume';
import ResumeUpload from '@/pages/resume/ResumeUpload';
import NewResume from '@/pages/resume/NewResume';

export const resumeRoutes: NavItem[] = [
  {
    title: 'Resume Dashboard',
    to: '/resume-builder',
    page: <ResumeDashboard />,
    requiresAuth: true,
  },
  {
    title: 'Resume Checker',
    to: '/resume-builder/checker',
    page: <AppleResumeChecker />,
    requiresAuth: false, // Allow free access to checker
  },
  {
    title: 'Edit Resume',
    to: '/resume-builder/edit/:id',
    page: <EditResume />,
    requiresAuth: true,
  },
  {
    title: 'Upload Resume',
    to: '/resume-builder/upload',
    page: <ResumeUpload />,
    requiresAuth: false, // Allow free access to upload
  },
  {
    title: 'New Resume',
    to: '/resume-builder/new',
    page: <NewResume />,
    requiresAuth: true,
  },
];
