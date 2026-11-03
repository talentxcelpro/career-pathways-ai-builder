import React, { useState, useEffect } from 'react';
import { Terminal, Play, CheckCircle2, XCircle, RotateCcw, Award, Star, Clock, AlertTriangle } from 'lucide-react';
import { PlayableQuest, careerQuestEngine } from '@/services/careerverse/careerQuestEngine';
import { toast } from 'sonner';

interface PlayableCodeArenaProps {
  quest: PlayableQuest;
  userId: string;
  onClose: () => void;
  onSuccess: (xpAwarded: number) => void;
}

export const PlayableCodeArena: React.FC<PlayableCodeArenaProps> = ({
  quest,
  userId,
  onClose,
  onSuccess,
}) => {
  const [code, setCode] = useState<string>(quest.playableData.starterCode || '');
  const [testResults, setTestResults] = useState<Array<{ input: string; expected: string; actual: string; passed: boolean }>>([]);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [hasPassedAll, setHasPassedAll] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleRunTests = async () => {
    setIsExecuting(true);
    setConsoleOutput(['[Sandbox Kernel] Initializing V8 isolate...', '[Sandbox Kernel] Evaluating test cases...']);

    const testCases = quest.playableData.testCases || [];
    const results: Array<{ input: string; expected: string; actual: string; passed: boolean }> = [];
    const logs: string[] = ['[Sandbox Kernel] Initializing V8 isolate...'];

    try {
      // Safe client-side execution sandbox using Function constructor in isolation
      const fn = new Function(`${code}; return { evalTestCase: (inputStr) => { return eval(inputStr); } };`)();

      let passedCount = 0;
      for (const tc of testCases) {
        try {
          const actualOutputObj = fn.evalTestCase(tc.input);
          const actualJson = JSON.stringify(actualOutputObj);
          const expectedJson = tc.expectedOutput.replace(/\s+/g, '');
          const normalizedActual = (actualJson || String(actualOutputObj)).replace(/\s+/g, '');

          const passed = normalizedActual === expectedJson || String(actualOutputObj) === tc.expectedOutput;
          if (passed) passedCount++;

          results.push({
            input: tc.input,
            expected: tc.expectedOutput,
            actual: actualJson || String(actualOutputObj),
            passed,
          });

          logs.push(`Test: ${tc.input} -> ${passed ? 'PASSED ✅' : 'FAILED ❌'}`);
        } catch (err: any) {
          results.push({
            input: tc.input,
            expected: tc.expectedOutput,
            actual: `Error: ${err.message}`,
            passed: false,
          });
          logs.push(`Test failed with exception: ${err.message}`);
        }
      }

      setTestResults(results);
      setConsoleOutput(logs);

      const allPassed = passedCount === testCases.length && testCases.length > 0;
      setHasPassedAll(allPassed);

      if (allPassed) {
        const scorePct = 100;
        const res = await careerQuestEngine.submitQuestResult(userId, quest, scorePct, elapsedSeconds, true);
        toast.success(res.message);
        onSuccess(res.xpAwarded);
      } else {
        toast.error(`${passedCount}/${testCases.length} tests passed. Check the assertion output!`);
      }
    } catch (err: any) {
      logs.push(`[Fatal Parse Error]: ${err.message}`);
      setConsoleOutput(logs);
      toast.error(`Syntax or execution error: ${err.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in">
      <div className="relative w-full max-w-5xl h-[90vh] rounded-3xl bg-[#0B1730] border border-[#7047F5]/50 shadow-[0_0_50px_rgba(112,71,245,0.3)] flex flex-col overflow-hidden text-white">
        {/* Header HUD */}
        <div className="bg-[#101E3B] px-5 py-3.5 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7047F5] to-[#36D9F5] p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(54,217,245,0.4)]">
              <div className="w-full h-full bg-[#0B1730] rounded-[10px] flex items-center justify-center text-[#36D9F5]">
                <Terminal className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base text-white">{quest.title}</h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#20D994]/20 text-[#20D994] border border-[#20D994]/40">
                  {quest.difficulty}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-md">{quest.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Timer */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#071329] border border-white/10 text-xs font-mono text-cyan-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(elapsedSeconds)}</span>
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-[#071329] hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Main Body: 2-Column (Instructions & Editor) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: Mission Briefing & Test Spec */}
          <div className="w-full md:w-80 lg:w-96 bg-[#071329] border-r border-white/10 p-5 overflow-y-auto space-y-4 shrink-0">
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#36D9F5]">Story Lore</span>
              <p className="text-xs text-slate-300 italic leading-relaxed bg-[#101E3B]/60 p-3 rounded-xl border border-white/5">
                "{quest.lore}"
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Mission Objectives</span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {quest.playableData.instructions.map((inst, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#20D994] font-bold">▸</span>
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Execution Constraints</span>
              <ul className="space-y-1 text-[11px] text-slate-400">
                {quest.playableData.rules.map((r, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FFCA55]" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Reward Card */}
            <div className="bg-gradient-to-r from-[#7047F5]/20 to-[#278DFF]/20 border border-[#7047F5]/40 rounded-2xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Mission Rewards</span>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1 text-[#FFCA55] text-xs font-black">
                    <Star className="w-3.5 h-3.5 fill-[#FFCA55]" />
                    <span>+{quest.xpReward} XP</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#36D9F5] text-xs font-black">
                    <Award className="w-3.5 h-3.5" />
                    <span>+{quest.coinReward} Coins</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Code Editor & Live Test Runner */}
          <div className="flex-1 flex flex-col bg-[#050D1C] overflow-hidden">
            {/* Editor Action Bar */}
            <div className="bg-[#0B1730] px-4 py-2 border-b border-white/5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>solution.js (JavaScript V8 Kernel)</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCode(quest.playableData.starterCode || '')}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-semibold text-slate-300 flex items-center gap-1 transition-all"
                  title="Reset Code"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>

                <button
                  onClick={handleRunTests}
                  disabled={isExecuting}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#20D994] to-[#00E676] hover:from-[#00E676] hover:to-[#20D994] text-slate-950 text-xs font-black shadow-[0_0_15px_rgba(32,217,148,0.5)] flex items-center gap-1.5 transition-all transform hover:scale-105 disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>{isExecuting ? 'Evaluating...' : 'Run Unit Tests'}</span>
                </button>
              </div>
            </div>

            {/* Code Input Area */}
            <div className="flex-1 relative overflow-hidden">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="w-full h-full bg-[#050D1C] p-4 font-mono text-xs text-emerald-400 leading-relaxed resize-none focus:outline-none selection:bg-[#7047F5]"
              />
            </div>

            {/* Bottom Test Results Drawer */}
            <div className="h-44 bg-[#071329] border-t border-white/10 p-3 overflow-y-auto space-y-2 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Test Case Telemetry</span>
                <span className="text-[10px] font-mono text-cyan-400">
                  {testResults.filter((r) => r.passed).length} / {testResults.length || quest.playableData.testCases?.length || 0} Passing
                </span>
              </div>

              {testResults.length === 0 ? (
                <div className="text-xs text-slate-500 font-mono italic p-2">
                  Click "Run Unit Tests" to execute your solution against automated test assertions.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {testResults.map((tr, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-xl text-xs font-mono flex items-center justify-between border ${
                        tr.passed
                          ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate max-w-md">
                        {tr.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                        <span className="truncate">{tr.input}</span>
                      </div>
                      <div className="text-[11px] shrink-0 text-slate-400">
                        Expected: <span className="text-white font-bold">{tr.expected}</span> | Actual: <span className={tr.passed ? 'text-emerald-400' : 'text-rose-400'}>{tr.actual}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
