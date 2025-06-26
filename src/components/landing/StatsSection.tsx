
import React from 'react';

export const StatsSection = () => {
  const stats = [
    { number: "10K+", label: "Active Users" },
    { number: "500+", label: "Partner Companies" },
    { number: "50K+", label: "Jobs Posted" },
    { number: "98%", label: "Success Rate" }
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="p-8 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                {stat.number}
              </div>
              <div className="text-gray-600 font-medium text-lg">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
