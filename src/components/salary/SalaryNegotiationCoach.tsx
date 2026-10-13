import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CompensationBenchmark } from '@/services/salary/salaryBenchmarkEngine';
import { 
  DollarSign, 
  Send, 
  Copy, 
  Check, 
  MessageSquare, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface SalaryNegotiationCoachProps {
  benchmark: CompensationBenchmark;
  initialSalary?: number;
}

export const SalaryNegotiationCoach: React.FC<SalaryNegotiationCoachProps> = ({
  benchmark,
  initialSalary
}) => {
  const [currentSalaryInput, setCurrentSalaryInput] = useState<string>(
    initialSalary ? (initialSalary / 100000).toString() : '12'
  );
  const [offeredSalaryInput, setOfferedSalaryInput] = useState<string>('15');
  const [keyAchievements, setKeyAchievements] = useState<string>(
    'Delivered high-throughput microservices reducing latency by 35%; led migration to Kubernetes for 4 core products.'
  );
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Practice mode state
  const [activePracticeScenario, setActivePracticeScenario] = useState<number>(0);
  const [userPracticeResponse, setUserPracticeResponse] = useState<string>('');
  const [feedbackResponse, setFeedbackResponse] = useState<string | null>(null);

  const currentVal = (parseFloat(currentSalaryInput) || 0) * 100000;
  const offerVal = (parseFloat(offeredSalaryInput) || 0) * 100000;

  // Suggested counter-offer calculation (bounded between offer and P75)
  const targetCounterLow = Math.max(offerVal * 1.10, benchmark.p50);
  const targetCounterHigh = Math.max(offerVal * 1.18, benchmark.p75);

  const formatLakhs = (amount: number): string => {
    return `₹${(amount / 100000).toFixed(1)} LPA`;
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    toast.success('Negotiation script copied to clipboard!');
    setTimeout(() => setCopiedType(null), 2500);
  };

  // Practice scenarios
  const practiceScenarios = [
    {
      recruiterPrompt: "This offer is at the absolute top of our band for this level. We cannot increase the base compensation.",
      tips: "Acknowledge their constraints warmly. Re-anchor to your unique skills and propose variable alternatives (e.g. joining bonus, early 6-month appraisal, or performance grant)."
    },
    {
      recruiterPrompt: "What is your current CTC? We generally offer a standard 25% to 30% hike on your latest payslip.",
      tips: "In modern Indian hiring, compensation should reflect role value rather than past history. Gently pivot: 'My target is aligned with market median for this scope, which sits at ₹X-Y Lakhs.'"
    },
    {
      recruiterPrompt: "We have other strong candidates in the pipeline who are willing to accept the current package. Can you confirm today?",
      tips: "Do not let manufactured urgency force a hasty concession. Reiterate enthusiastic mutual fit while requesting 24-48 hours to review the total rewards package."
    }
  ];

  const handleEvaluatePractice = () => {
    if (!userPracticeResponse.trim()) {
      toast.error('Please draft your response before requesting feedback.');
      return;
    }

    const lower = userPracticeResponse.toLowerCase();
    let advice = '';

    if (lower.includes('market') || lower.includes('benchmark') || lower.includes('range')) {
      advice += '✅ Strong data anchor: You appropriately cited market benchmarks rather than personal needs. ';
    } else {
      advice += '💡 Pro-tip: Cite objective market benchmarks (P50/P75 in your city) to substantiate your stance. ';
    }

    if (lower.includes('excited') || lower.includes('appreciate') || lower.includes('thank')) {
      advice += '✅ Collaborative tone: Excellent professional warmth. ';
    }

    if (lower.includes('flexibility') || lower.includes('joining bonus') || lower.includes('performance')) {
      advice += '✅ Value expansion: Great proposal of alternative levers beyond base salary.';
    }

    setFeedbackResponse(advice);
  };

  // Script templates
  const counterOfferScript = `Dear [Hiring Manager / Recruiter Name],

Thank you so much for extending the offer for the ${benchmark.normalizedRole} position with [Company Name]. I am genuinely energized by the team's roadmap and the opportunity to make an immediate impact.

Having reviewed the compensation structure alongside verified market benchmarks for ${benchmark.normalizedRole} in ${benchmark.normalizedLocation} (where median levels sit around ${formatLakhs(benchmark.p50)}), and considering the direct value I bring—including ${keyAchievements || 'my core technical contributions and domain expertise'}—I would be delighted to immediately accept if we can align closer to ${formatLakhs(targetCounterLow)} - ${formatLakhs(targetCounterHigh)}.

If base salary flexibility is constrained by band caps, I would be open to discussing a joining bonus or an accelerated 6-month compensation review milestone.

I am enthusiastic about partnering with the team and look forward to your thoughts.

Warm regards,
[Your Name]`;

  const appraisalScript = `Discussion Outline for Compensation Review:
1. Context: "I'd love to review my scope and compensation positioning over the past year."
2. Evidence: "${keyAchievements || 'Highlight 2-3 quantified project outcomes delivering measurable business upside'}."
3. Market Reality: "Independent market data for ${benchmark.normalizedRole} with my experience level in ${benchmark.normalizedLocation} indicates a median benchmark of ${formatLakhs(benchmark.p50)}, with upper deciles at ${formatLakhs(benchmark.p75)}."
4. Request: "Given my expanded ownership, I am seeking an adjustment to ${formatLakhs(targetCounterLow)} to ensure alignment with current market expectations."`;

  return (
    <div className="space-y-6">
      <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                Data-Grounded Salary Negotiation Coach
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Ground your discussions in verified market percentiles rather than arbitrary claims.
              </CardDescription>
            </div>
            <Badge variant="outline" className="self-start sm:self-auto font-mono text-xs">
              Cohort Median: {formatLakhs(benchmark.p50)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Current Annual CTC (₹ Lakhs)
              </label>
              <Input
                type="number"
                step="0.5"
                value={currentSalaryInput}
                onChange={(e) => setCurrentSalaryInput(e.target.value)}
                placeholder="e.g. 12"
                className="text-xs bg-white dark:bg-slate-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Offered / Target CTC (₹ Lakhs)
              </label>
              <Input
                type="number"
                step="0.5"
                value={offeredSalaryInput}
                onChange={(e) => setOfferedSalaryInput(e.target.value)}
                placeholder="e.g. 15"
                className="text-xs bg-white dark:bg-slate-900"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Key Quantified Wins & Value Drivers (Used to personalize script)
              </label>
              <Textarea
                rows={2}
                value={keyAchievements}
                onChange={(e) => setKeyAchievements(e.target.value)}
                placeholder="e.g. Architected microservice architecture reducing API response latency by 35%..."
                className="text-xs bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          {/* Strategic Range Target Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950 to-slate-950 text-white border border-emerald-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold">
                Suggested Counter-Offer Range
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">
                {formatLakhs(targetCounterLow)} - {formatLakhs(targetCounterHigh)}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Anchored to the 50th-75th percentile bracket for {benchmark.normalizedRole} in {benchmark.normalizedLocation}.
              </p>
            </div>

            <div className="shrink-0 space-y-1 text-right">
              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs">
                Empirically Defensible Range
              </Badge>
              <div className="text-[11px] text-slate-400">
                +{(Math.round(((targetCounterLow - offerVal) / offerVal) * 100))}% above initial offer
              </div>
            </div>
          </div>

          {/* Generated Scripts */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Ready-to-Use Professional Scripts
            </h4>

            {/* Script 1: Counter Offer Email */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Written Counter-Offer Email Response
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(counterOfferScript, 'email')}
                  className="text-xs h-8 border-slate-300 dark:border-slate-700"
                >
                  {copiedType === 'email' ? <Check className="h-3.5 w-3.5 text-emerald-600 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                  {copiedType === 'email' ? 'Copied' : 'Copy Email'}
                </Button>
              </div>

              <pre className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 leading-relaxed max-h-48 overflow-y-auto">
                {counterOfferScript}
              </pre>
            </div>

            {/* Script 2: Internal Appraisal Meeting */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  Internal Performance & Appraisal Talking Points
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(appraisalScript, 'appraisal')}
                  className="text-xs h-8 border-slate-300 dark:border-slate-700"
                >
                  {copiedType === 'appraisal' ? <Check className="h-3.5 w-3.5 text-emerald-600 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                  {copiedType === 'appraisal' ? 'Copied' : 'Copy Points'}
                </Button>
              </div>

              <pre className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 leading-relaxed max-h-40 overflow-y-auto">
                {appraisalScript}
              </pre>
            </div>
          </div>

          {/* Interactive Rehearsal & Practice Mode */}
          <div className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-indigo-950 dark:text-indigo-200 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                Interactive Negotiation Rehearsal Mode
              </h4>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                Scenario {activePracticeScenario + 1} of {practiceScenarios.length}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Recruiter Objection:
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 italic">
                "{practiceScenarios[activePracticeScenario].recruiterPrompt}"
              </p>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 pt-1">
                💡 Coaching Guidance: {practiceScenarios[activePracticeScenario].tips}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Your Spoken / Written Response:
              </label>
              <Textarea
                rows={3}
                value={userPracticeResponse}
                onChange={(e) => setUserPracticeResponse(e.target.value)}
                placeholder="Draft how you would respond to this recruiter objection..."
                className="text-xs bg-white dark:bg-slate-900"
              />
            </div>

            <div className="flex items-center justify-between">
              <Button
                size="sm"
                onClick={handleEvaluatePractice}
                className="text-xs font-semibold"
              >
                Evaluate My Response
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setActivePracticeScenario((prev) => (prev + 1) % practiceScenarios.length);
                  setUserPracticeResponse('');
                  setFeedbackResponse(null);
                }}
                className="text-xs text-slate-600 dark:text-slate-400"
              >
                Next Objection Scenario &rarr;
              </Button>
            </div>

            {feedbackResponse && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                {feedbackResponse}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
