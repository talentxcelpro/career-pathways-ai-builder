import React from 'react';
import { Link } from "react-router-dom";
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
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Header / Hero Section */}
      <section className="text-center py-10 px-4">
        <h1 className="text-3xl font-bold">Welcome back, {friendlyName}!</h1>
        <p className="mt-2 text-gray-600">
          Continue your journey to master new skills and advance your career.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Link to="/learning/courses">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
              Start Learning Now
            </button>
          </Link>
          <Link to="/learning/courses">
            <button className="border border-gray-300 px-6 py-2 rounded-md hover:bg-gray-100">
              Explore All Courses
            </button>
          </Link>
        </div>
        <div className="mt-6 flex justify-center">
          <img 
            src="https://cdn-icons-png.flaticon.com/512/201/201818.png" 
            alt="Learning Illustration" 
            className="w-40 h-40" 
          />
        </div>
      </section>

      {/* Progress / Streak Section */}
      <section className="max-w-3xl mx-auto bg-gray-50 p-6 rounded-lg shadow-sm">
        <p className="text-orange-500 mb-2">🔥 You're on a {streakDays}-day streak</p>
        <div className="w-full bg-gray-200 h-2 rounded-full">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min((streakDays / 30) * 100, 20)}%` }}></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Complete today's lesson to grow your streak!
        </p>
      </section>

      {/* Quick Access */}
      <section className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        <div className="p-6 border rounded-lg shadow-sm text-center hover:shadow-md">
          <div className="text-3xl mb-2">📚</div>
          <h3 className="font-semibold">My Courses</h3>
          <Link to="/learning/my-courses">
            <button className="mt-3 bg-gray-100 px-4 py-2 rounded hover:bg-gray-200">Resume</button>
          </Link>
        </div>
        <div className="p-6 border rounded-lg shadow-sm text-center hover:shadow-md">
          <div className="text-3xl mb-2">🛤️</div>
          <h3 className="font-semibold">Learning Paths</h3>
          <Link to="/learning/paths">
            <button className="mt-3 bg-gray-100 px-4 py-2 rounded hover:bg-gray-200">Browse</button>
          </Link>
        </div>
        <div className="p-6 border rounded-lg shadow-sm text-center hover:shadow-md">
          <div className="text-3xl mb-2">🎓</div>
          <h3 className="font-semibold">Certificates</h3>
          <Link to="/learning/certificates">
            <button className="mt-3 bg-gray-100 px-4 py-2 rounded hover:bg-gray-200">View</button>
          </Link>
        </div>
      </section>

      {/* New Pipeline Features */}
      <section className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">
        <div className="p-6 border rounded-lg shadow-sm text-center hover:shadow-md">
          <div className="text-3xl mb-2">🔗</div>
          <h3 className="font-semibold">Pipeline Dashboard</h3>
          <Link to="/learning/pipeline">
            <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Access</button>
          </Link>
        </div>
        <div className="p-6 border rounded-lg shadow-sm text-center hover:shadow-md">
          <div className="text-3xl mb-2">🧠</div>
          <h3 className="font-semibold">Smart Learning</h3>
          <Link to="/learning/system">
            <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Explore</button>
          </Link>
        </div>
        <div className="p-6 border rounded-lg shadow-sm text-center hover:shadow-md">
          <div className="text-3xl mb-2">🏢</div>
          <h3 className="font-semibold">Company Portal</h3>
          <Link to="/learning/company-portal">
            <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Enter</button>
          </Link>
        </div>
        <div className="p-6 border rounded-lg shadow-sm text-center hover:shadow-md">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="font-semibold">Advanced Analytics</h3>
          <Link to="/learning/analytics-advanced">
            <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">View Data</button>
          </Link>
        </div>
      </section>

      {/* Learning Paths */}
      <section className="max-w-5xl mx-auto mt-14 text-center">
        <h2 className="text-2xl font-bold">Choose a path. Advance your future.</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="border rounded-lg p-6 shadow-sm hover:shadow-md">
            <img src="https://cdn-icons-png.flaticon.com/512/2910/2910768.png" className="w-16 mx-auto mb-3" />
            <h3 className="font-semibold">Data Science Career Path</h3>
            <Link to="/learning/paths">
              <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Start Path</button>
            </Link>
          </div>
          <div className="border rounded-lg p-6 shadow-sm hover:shadow-md">
            <img src="https://cdn-icons-png.flaticon.com/512/1048/1048948.png" className="w-16 mx-auto mb-3" />
            <h3 className="font-semibold">AI & Machine Learning</h3>
            <Link to="/learning/paths">
              <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Browse</button>
            </Link>
          </div>
          <div className="border rounded-lg p-6 shadow-sm hover:shadow-md">
            <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" className="w-16 mx-auto mb-3" />
            <h3 className="font-semibold">Business & Leadership</h3>
            <Link to="/learning/paths">
              <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Start Path</button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why TalentXcel */}
      <section className="max-w-4xl mx-auto mt-16">
        <h2 className="text-2xl font-bold text-center">Why learn with TalentXcel?</h2>
        <ul className="mt-6 space-y-3 text-gray-700">
          <li>✅ AI-powered career matching</li>
          <li>✅ Earn industry-recognized certificates</li>
          <li>✅ Learn at your own pace</li>
          <li>✅ Job-ready skills for the future</li>
        </ul>
        <div className="mt-6 bg-gray-50 p-4 rounded-lg shadow-sm flex items-center gap-3">
          <img src="https://cdn-icons-png.flaticon.com/512/219/219986.png" className="w-12 h-12 rounded-full" />
          <p>
            <span className="italic">"TalentXcel helped me land my dream job in 3 months!"</span><br />
            <span className="text-sm text-gray-500">– Ananya, Data Analyst</span>
          </p>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="mt-12 text-center bg-blue-600 text-white py-10">
        <h2 className="text-2xl font-bold">Your career transformation starts today.</h2>
        <Link to="/learning/courses">
          <button className="mt-6 bg-white text-blue-600 px-6 py-2 rounded-md hover:bg-gray-100">
            Start Learning for Free
          </button>
        </Link>
      </section>
    </div>
  );
}