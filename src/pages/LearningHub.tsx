import React from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { updateMetaTags } from "@/utils/metaTags";
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';

export default function LearningHub() {
  const { displayName, streakDays } = useCurrentUserProfile();
  
  React.useEffect(() => {
    updateMetaTags({
      title: 'Learning Hub | TalentXcel',
      description: 'Your comprehensive learning platform with courses, paths, and employment bridge features.'
    });
  }, []);

  const friendlyName = React.useMemo(() => {
    if (!displayName) return 'TalentXcel Pro';
    if (displayName.includes('@')) {
      const base = displayName.split('@')[0].replace(/[._-]+/g, ' ').trim();
      return base ? base.replace(/\b\w/g, c => c.toUpperCase()) : 'TalentXcel Pro';
    }
    return displayName;
  }, [displayName]);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4 shadow-sm">
        <h1 className="text-xl font-bold text-blue-600">TalentXcel</h1>
        <nav className="space-x-6 hidden md:block">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <Link to="/learning/courses" className="hover:text-blue-600">Courses</Link>
          <Link to="/learning/paths" className="hover:text-blue-600">Learning Paths</Link>
          <Link to="/learning/certificates" className="hover:text-blue-600">Certificates</Link>
          <a href="#" className="hover:text-blue-600">Community</a>
        </nav>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Profile
        </button>
      </header>

      {/* Hero Section */}
      <section className="px-8 py-16 text-center">
        <h2 className="text-3xl font-bold">Welcome back, {friendlyName}!</h2>
        <p className="mt-4 text-gray-600">
          Continue your journey to master new skills and advance your career.
        </p>
        <div className="mt-6 space-x-4">
          <Link to="/learning/courses">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700">
              Start Learning Now
            </button>
          </Link>
          <Link to="/learning/courses">
            <button className="border border-gray-300 px-6 py-3 rounded-md hover:border-blue-600">
              Explore All Courses
            </button>
          </Link>
        </div>
      </section>

      {/* Streak Section */}
      <section className="px-8 py-6 bg-gray-50 text-center">
        <p className="text-gray-600">🔥 You're on a <b>{streakDays}-day streak</b></p>
        <p className="text-sm text-gray-500">Complete today's lesson to grow your streak!</p>
        <div className="w-full bg-gray-200 h-2 rounded mt-3">
          <div className="bg-blue-600 h-2 rounded" style={{ width: `${Math.min((streakDays / 30) * 100, 100)}%` }}></div>
        </div>
      </section>

      {/* Quick Access */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 py-12 text-center">
        <div className="p-6 border rounded-lg shadow hover:shadow-md">
          <h3 className="text-lg font-semibold">📚 My Courses</h3>
          <Link to="/learning/my-courses">
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Resume</button>
          </Link>
        </div>
        <div className="p-6 border rounded-lg shadow hover:shadow-md">
          <h3 className="text-lg font-semibold">🛤️ Learning Paths</h3>
          <Link to="/learning/paths">
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Browse</button>
          </Link>
        </div>
        <div className="p-6 border rounded-lg shadow hover:shadow-md">
          <h3 className="text-lg font-semibold">🎓 Certificates</h3>
          <Link to="/learning/certificates">
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">View</button>
          </Link>
        </div>
      </section>

      {/* Learning Paths */}
      <section className="px-8 py-12 bg-gray-50 text-center">
        <h2 className="text-2xl font-bold">Choose a path. Advance your future.</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="p-6 border rounded-lg shadow hover:shadow-md">
            <h3 className="font-semibold">📊 Data Science Career Path</h3>
            <Link to="/learning/paths">
              <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Start Path</button>
            </Link>
          </div>
          <div className="p-6 border rounded-lg shadow hover:shadow-md">
            <h3 className="font-semibold">🤖 AI & Machine Learning</h3>
            <Link to="/learning/paths">
              <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Browse</button>
            </Link>
          </div>
          <div className="p-6 border rounded-lg shadow hover:shadow-md">
            <h3 className="font-semibold">📈 Business & Leadership</h3>
            <Link to="/learning/paths">
              <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Start Path</button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why TalentXcel */}
      <section className="px-8 py-12 text-center">
        <h2 className="text-2xl font-bold">Why learn with TalentXcel?</h2>
        <ul className="mt-6 space-y-3 text-gray-600">
          <li>✅ AI-powered career matching</li>
          <li>✅ Earn industry-recognized certificates</li>
          <li>✅ Learn at your own pace</li>
          <li>✅ Job-ready skills for the future</li>
        </ul>
        <div className="mt-6 p-4 border rounded-md bg-gray-50 max-w-lg mx-auto">
          <p className="italic">"TalentXcel helped me land my dream job in 3 months!"</p>
          <p className="mt-2 font-semibold">— Ananya, Data Analyst</p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 py-12 text-center bg-blue-600 text-white">
        <h2 className="text-2xl font-bold">Your career transformation starts today.</h2>
        <Link to="/learning/courses">
          <button className="mt-6 bg-white text-blue-600 px-6 py-3 rounded-md hover:bg-gray-100">
            Start Learning for Free
          </button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="px-8 py-6 text-center text-gray-500 text-sm border-t mt-8">
        © 2025 TalentXcel · About · Careers · Help · Terms · Privacy
      </footer>
    </div>
  );
}