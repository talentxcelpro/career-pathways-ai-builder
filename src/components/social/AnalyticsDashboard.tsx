import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Eye, Heart, MessageSquare, Share2, Calendar, Sparkles, BarChart3, Activity } from 'lucide-react';
import { useCareerAnalyticsCommandCenter } from '@/hooks/useAnalyticsDashboard';

export const CareerAnalyticsCommandCenter: React.FC = () => {
  const { CareerAnalytics, isLoading } = useCareerAnalyticsCommandCenter();

  if (isLoading) {
    return (
      <div className="space-y-6 edge-to-edge">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse rounded-[32px] border-slate-100 h-32 bg-white/50 shadow-sm">
              <CardContent className="p-8">
                <div className="h-4 bg-slate-100 rounded-full w-1/2 mb-4"></div>
                <div className="h-8 bg-slate-100 rounded-full w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 edge-to-edge">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-[32px] border-slate-200 bg-white shadow-xl hover:shadow-2xl transition-all border group">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                <Eye className="h-6 w-6" />
              </div>
              <Badge className="bg-emerald-50 text-emerald-600 border-0 font-apple-heavy text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-lg">
                High Visibility
              </Badge>
            </div>
            <div>
              <p className="text-[10px] font-apple-heavy text-slate-400 uppercase tracking-widest mb-1">Impact Reach</p>
              <p className="text-3xl font-apple-heavy text-slate-950 tracking-tighter">{CareerAnalytics.totalViews.toLocaleString()}</p>
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp className="h-4 w-4 text-emerald-500 mr-2" />
              <span className="text-sm font-apple-heavy text-emerald-500">+{CareerAnalytics.viewsGrowth}%</span>
              <span className="text-xs font-apple-bold text-slate-400 ml-2 uppercase tracking-widest">Growth Index</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[40px] border-slate-200 bg-white shadow-xl hover:shadow-2xl transition-all border group">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-sm group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6" />
              </div>
              <Badge className="bg-purple-50 text-purple-600 border-0 font-apple-heavy text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-lg">
                Ecosystem
              </Badge>
            </div>
            <div>
              <p className="text-[10px] font-apple-heavy text-slate-400 uppercase tracking-widest mb-1">Followers</p>
              <p className="text-3xl font-apple-heavy text-slate-950 tracking-tighter">{CareerAnalytics.totalFollowers.toLocaleString()}</p>
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp className="h-4 w-4 text-emerald-500 mr-2" />
              <span className="text-sm font-apple-heavy text-emerald-500">+{CareerAnalytics.followersGrowth}%</span>
              <span className="text-xs font-apple-bold text-slate-400 ml-2 uppercase tracking-widest">Network Velocity</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[40px] border-slate-200 bg-white shadow-xl hover:shadow-2xl transition-all border group">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 shadow-sm group-hover:scale-110 transition-transform">
                <Activity className="h-6 w-6" />
              </div>
              <Badge className="bg-rose-50 text-rose-600 border-0 font-apple-heavy text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-lg">
                Intensity
              </Badge>
            </div>
            <div>
              <p className="text-[10px] font-apple-heavy text-slate-400 uppercase tracking-widest mb-1">Engagement Rate</p>
              <p className="text-3xl font-apple-heavy text-slate-950 tracking-tighter">{CareerAnalytics.engagementRate}%</p>
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp className="h-4 w-4 text-emerald-500 mr-2" />
              <span className="text-sm font-apple-heavy text-emerald-500">+{CareerAnalytics.engagementGrowth}%</span>
              <span className="text-xs font-apple-bold text-slate-400 ml-2 uppercase tracking-widest">Interaction Pulse</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[40px] border-slate-200 bg-white shadow-xl hover:shadow-2xl transition-all border group">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm group-hover:scale-110 transition-transform">
                <Sparkles className="h-6 w-6" />
              </div>
              <Badge className="bg-amber-50 text-amber-600 border-0 font-apple-heavy text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-lg">
                Influence
              </Badge>
            </div>
            <div>
              <p className="text-[10px] font-apple-heavy text-slate-400 uppercase tracking-widest mb-1">Broadcasts</p>
              <p className="text-3xl font-apple-heavy text-slate-950 tracking-tighter">{CareerAnalytics.totalPosts}</p>
            </div>
            <div className="flex items-center mt-4">
              <Calendar className="h-4 w-4 text-slate-400 mr-2" />
              <span className="text-xs font-apple-heavy text-slate-500 uppercase tracking-widest">
                {CareerAnalytics.avgPostsPerWeek} / Week Average
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Content */}
      <Card className="rounded-[48px] border-slate-200 bg-white shadow-2xl overflow-hidden border">
        <CardHeader className="bg-slate-50 border-b border-slate-100 p-8">
          <CardTitle className="flex items-center gap-3 text-xl font-apple-heavy text-slate-950 tracking-tight">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            Performance Content Index
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-4">
            {CareerAnalytics.topPosts.map((post, index) => (
              <div key={post.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-50 rounded-[28px] border border-slate-100 hover:border-blue-200 transition-all group">
                <div className="flex items-center gap-6 mb-4 md:mb-0">
                  <div className="h-10 w-10 rounded-xl bg-slate-950 text-white flex items-center justify-center font-apple-heavy text-xs shadow-lg">
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-apple-heavy text-slate-950 truncate max-w-md group-hover:text-blue-600 transition-colors">{post.title}</h3>
                    <p className="text-xs font-apple-bold text-slate-400 uppercase tracking-widest mt-1">
                      Published {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-8 text-[11px] font-apple-heavy text-slate-500 uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-500" />
                    <span>{post.views} REACH</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-rose-500" />
                    <span>{post.likes} LIKES</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-amber-500" />
                    <span>{post.comments} DISCUSSIONS</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ecosystem Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-[40px] border-slate-200 bg-white shadow-xl border">
          <CardHeader className="p-8 border-b border-slate-50">
            <CardTitle className="text-lg font-apple-heavy tracking-tight">Ecosystem Demographics</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              {CareerAnalytics.audienceDemographics.map((demo) => (
                <div key={demo.category} className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-apple-heavy uppercase tracking-widest text-slate-500">
                    <span>{demo.category}</span>
                    <span>{demo.percentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${demo.percentage}%` }}
                      className="bg-slate-950 h-full rounded-full"
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[40px] border-slate-200 bg-white shadow-xl border">
          <CardHeader className="p-8 border-b border-slate-50">
            <CardTitle className="text-lg font-apple-heavy tracking-tight">Peak Ecosystem Synchronization</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-3">
              {CareerAnalytics.peakHours.map((hour) => (
                <div key={hour.time} className="flex items-center gap-4">
                  <span className="text-[10px] font-apple-heavy text-slate-400 w-16 uppercase">{hour.time}</span>
                  <div className="flex-1 flex items-center gap-4">
                    <div className="flex-1 bg-slate-50 rounded-full h-2 shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${hour.activity}%` }}
                        className="bg-blue-600 h-full rounded-full shadow-lg shadow-blue-500/20"
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                    </div>
                    <span className="text-[10px] font-apple-heavy text-blue-600">{hour.activity}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
