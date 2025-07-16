import React, { useState, useEffect } from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "TalentXcel helped me land a job in 2 weeks! The AI-powered job matching is incredible.",
    author: "Ayesha Khan",
    role: "Full Stack Developer",
    company: "Tech Innovators Inc.",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b60cf9f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    rating: 5
  },
  {
    quote: "The AI-powered resume builder and career map features are absolutely next level. Game changer!",
    author: "Rohan Sharma",
    role: "Product Manager",
    company: "Digital Solutions Ltd.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    rating: 5
  },
  {
    quote: "The networking opportunities and mentorship connections have been invaluable for my career growth.",
    author: "Priya Patel",
    role: "UX Designer",
    company: "Creative Agency Pro",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    rating: 5
  },
  {
    quote: "From skill assessment to job placement, TalentXcel guided me through every step of my career transition.",
    author: "Arjun Reddy",
    role: "Data Scientist",
    company: "Analytics Corp",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    rating: 5
  }
];

export const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-100"></div>
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full blur-3xl -translate-y-1/2"></div>
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-gradient-to-br from-indigo-100/30 to-pink-100/30 rounded-full blur-3xl -translate-y-1/2"></div>

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-6xl font-light text-slate-900 mb-6">
            What Our <span className="font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Community</span> Says
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light">
            Real stories from professionals who transformed their careers with TalentXcel
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative">
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 border border-slate-100 ${
                  index === currentIndex || index === (currentIndex + 1) % testimonials.length
                    ? 'opacity-100 scale-100'
                    : 'opacity-60 scale-95'
                }`}
              >
                {/* Quote Icon */}
                <div className="mb-6">
                  <Quote className="w-8 h-8 text-blue-500" />
                </div>

                {/* Quote */}
                <blockquote className="text-slate-700 text-lg font-light leading-relaxed mb-6">
                  "{testimonial.quote}"
                </blockquote>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Author */}
                <div className="flex items-center space-x-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-slate-900">{testimonial.author}</div>
                    <div className="text-sm text-slate-600">{testimonial.role}</div>
                    <div className="text-xs text-slate-500">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination dots */}
          <div className="flex justify-center mt-12 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-blue-600 scale-125'
                    : 'bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center space-x-8 bg-white rounded-2xl px-8 py-6 shadow-lg">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">4.9/5</div>
              <div className="text-sm text-slate-600">Average Rating</div>
            </div>
            <div className="w-px h-12 bg-slate-200"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">10K+</div>
              <div className="text-sm text-slate-600">Happy Users</div>
            </div>
            <div className="w-px h-12 bg-slate-200"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">98%</div>
              <div className="text-sm text-slate-600">Success Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};