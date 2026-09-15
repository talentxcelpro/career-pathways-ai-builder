import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Target, TrendingUp, Calculator, MapPin, BookOpen, Zap, Sparkles, Shield, Rocket, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const NavigatorHub = () => {
  const aiTools = [
    {
      id: 'navigator',
      title: 'Talent AI Strategist',
      description: 'Your personalized professional intelligence partner for high-stakes career moves.',
      icon: <Brain className="h-8 w-8 text-blue-600" />,
      features: ['Real-time market insights', 'Strategic job mapping', 'Competitive skill analysis', 'Trajectory roadmaps'],
      link: '/navigator',
      badge: 'PREMIUM',
      color: 'blue'
    },
    {
      id: 'job-match',
      title: 'Talent Match Engine',
      description: 'High-velocity job matching with proprietary performance compatibility scoring.',
      icon: <Target className="h-8 w-8 text-purple-600" />,
      features: ['97.4% match precision', 'Deep skills verification', 'Salary insights', 'Company culture fit'],
      link: '/career-map/job-match-engine',
      badge: 'PRO',
      color: 'purple'
    },
    {
      id: 'pathfinder',
      title: 'Performance Pathfinder',
      description: 'Create multi-dimensional roadmaps to achieve peak professional output.',
      icon: <MapPin className="h-8 w-8 text-green-600" />,
      features: ['Goal-centric planning', 'Milestone synchronization', 'Market demand pulse', 'Timeline optimization'],
      link: '/career-map/pathfinder',
      color: 'green'
    },
    {
      id: 'roi-engine',
      title: 'Growth ROI Engine',
      description: 'Quantify the market value of every skill move and certification you acquire.',
      icon: <Calculator className="h-8 w-8 text-orange-600" />,
      features: ['Yield-per-skill analysis', 'Projected salary delta', 'Market volatility data', 'Investment hedging'],
      link: '/career-map/learning-roi',
      color: 'orange'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 backdrop-blur-xl edge-to-edge">
      {/* Header Section */}
      <div className="relative pt-24 pb-16 px-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center space-y-6"
          >
            <div className="flex justify-center">
              <Badge className="bg-slate-950 text-white rounded-full px-6 py-1 font-apple-bold text-[10px] tracking-widest uppercase">
                Platform Navigator
              </Badge>
            </div>
            <h1 className="text-5xl md:text-7xl font-apple-heavy text-slate-950 tracking-tighter max-w-4xl mx-auto">
              Master Your <span className="text-blue-600">Professional Identity</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto font-apple-medium leading-relaxed">
              Leverage the most advanced TalentXcel intelligence tools to architect your career growth, 
              quantify your market value, and secure high-stakes opportunities.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* AI Tools Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
            {aiTools.map((tool, idx) => (
              <motion.div
                key={tool.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full relative overflow-hidden rounded-[40px] border-white/20 bg-white/60 backdrop-blur-2xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 group border">
                  {tool.badge && (
                    <div className="absolute top-6 right-6">
                      <Badge className={cn(
                        "rounded-lg px-3 py-1 font-apple-bold text-[10px]",
                        tool.color === 'blue' ? "bg-blue-600" : "bg-purple-600"
                      )}>
                        {tool.badge}
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="p-10 pb-6">
                    <div className="flex items-start gap-6">
                      <div className={cn(
                        "p-5 rounded-[24px] shadow-lg group-hover:scale-110 transition-transform duration-500",
                        tool.color === 'blue' ? "bg-blue-50" : 
                        tool.color === 'purple' ? "bg-purple-50" : 
                        tool.color === 'green' ? "bg-green-50" : "bg-orange-50"
                      )}>
                        {tool.icon}
                      </div>
                      <div className="flex-1 pr-12">
                        <CardTitle className="text-2xl font-apple-heavy mb-2 text-slate-900">{tool.title}</CardTitle>
                        <CardDescription className="text-base font-apple-medium text-slate-500 leading-relaxed">
                          {tool.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-10 pt-0">
                    <div className="space-y-8">
                      <div className="grid grid-cols-2 gap-y-4">
                        {tool.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm font-apple-bold text-slate-600">
                            <Zap className="h-3.5 w-3.5 text-blue-500" />
                            {feature}
                          </div>
                        ))}
                      </div>
                      
                      <Link to={tool.link}>
                        <Button className="w-full h-14 rounded-2xl bg-slate-950 text-white font-apple-bold text-lg hover:scale-[1.02] transition-all flex items-center justify-between px-8">
                          Launch Module <ArrowRight className="h-5 w-5" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Identity Verification */}
          <motion.div 
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-slate-900 rounded-[48px] p-12 text-white overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
              <Shield className="w-64 h-64" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="max-w-md">
                <h2 className="text-3xl font-apple-heavy mb-4">Identity Verification</h2>
                <p className="text-slate-400 font-apple-medium leading-relaxed">
                  Our intelligence engines are validated against real-world performance data from FAANG hiring loops 
                  and market demand shifts. Your professional identity is verified.
                </p>
                <div className="mt-8 flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800" />
                    ))}
                  </div>
                  <span className="text-xs font-apple-bold text-slate-400">Verifying 12k+ daily data points</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 md:gap-12 w-full md:w-auto">
                <div className="space-y-1">
                  <div className="text-4xl font-apple-heavy text-blue-500 tracking-tighter">97.4%</div>
                  <div className="text-[10px] font-apple-heavy text-slate-500 uppercase tracking-widest">Match precision</div>
                </div>
                <div className="space-y-1">
                  <div className="text-4xl font-apple-heavy text-green-500 tracking-tighter">450%</div>
                  <div className="text-[10px] font-apple-heavy text-slate-500 uppercase tracking-widest">Growth ROI</div>
                </div>
                <div className="space-y-1">
                  <div className="text-4xl font-apple-heavy text-purple-500 tracking-tighter">89%</div>
                  <div className="text-[10px] font-apple-heavy text-slate-500 uppercase tracking-widest">Goal attainment</div>
                </div>
                <div className="space-y-1">
                  <div className="text-4xl font-apple-heavy text-orange-500 tracking-tighter">14d</div>
                  <div className="text-[10px] font-apple-heavy text-slate-500 uppercase tracking-widest">Avg transition</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default NavigatorHub;
