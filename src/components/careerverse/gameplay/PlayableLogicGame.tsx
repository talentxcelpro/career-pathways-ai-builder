import React, { useState, useEffect } from 'react';
import { Zap, Clock, CheckCircle2, XCircle, Award, Star, Flame, ArrowRight } from 'lucide-react';
import { PlayableQuest, careerQuestEngine } from '@/services/careerverse/careerQuestEngine';
import { toast } from 'sonner';

interface PlayableLogicGameProps {
  quest: PlayableQuest;
  userId: string;
  onClose: () => void;
  onSuccess: (xpAwarded: number) => void;
}

export const PlayableLogicGame: React.FC<PlayableLogicGameProps> = ({
  quest,
  userId,
  onClose,
  onSuccess,
}) => {
  const questions = quest.playableData.questions || [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(quest.timeLimitSeconds || 60);
  const [isGameOver, setIsGameOver] = useState(false);

  // Timer
  useEffect(() => {
    if (isGameOver) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameOver]);

  const handleTimeExpired = () => {
    setIsGameOver(true);
    toast.error('Time expired!');
  };

  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted || isGameOver) return;
    setSelectedAnswer(index);
    setIsAnswerSubmitted(true);

    const q = questions[currentIdx];
    const isCorrect = index === q.correctAnswerIndex;

    if (isCorrect) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);
      setCorrectCount((prev) => prev + 1);
    } else {
      setCombo(0);
    }
  };

  const handleNextQuestion = async () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    } else {
      // Game Completed
      setIsGameOver(true);
      const scorePct = Math.round((correctCount / questions.length) * 100);
      const passed = scorePct >= 70;

      const res = await careerQuestEngine.submitQuestResult(
        userId,
        quest,
        scorePct,
        (quest.timeLimitSeconds || 60) - timeLeft,
        passed
      );

      if (passed) {
        toast.success(res.message);
        onSuccess(res.xpAwarded);
      } else {
        toast.error(`Score: ${scorePct}%. 70% required to pass. Retry to sharpen your logic!`);
      }
    }
  };

  const currentQ = questions[currentIdx] || {
    id: 'empty',
    prompt: 'No questions loaded.',
    options: [],
    correctAnswerIndex: 0,
    explanation: '',
  };

  const comboMultiplier = combo >= 3 ? '2.0x' : combo >= 2 ? '1.5x' : combo >= 1 ? '1.2x' : '1.0x';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0B1730] border border-[#36D9F5]/40 shadow-[0_0_50px_rgba(54,217,245,0.3)] flex flex-col overflow-hidden text-white">
        {/* Top HUD */}
        <div className="bg-[#101E3B] px-5 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#36D9F5] to-[#278DFF] p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(54,217,245,0.4)]">
              <div className="w-full h-full bg-[#0B1730] rounded-[10px] flex items-center justify-center text-[#36D9F5]">
                <Zap className="w-4 h-4" />
              </div>
            </div>

            <div>
              <h3 className="font-black text-sm sm:text-base text-white">{quest.title}</h3>
              <p className="text-xs text-slate-400">
                Question {currentIdx + 1} of {questions.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Combo Multiplier */}
            {combo > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-black animate-bounce">
                <Flame className="w-3.5 h-3.5 fill-orange-400" />
                <span>{combo}x Combo ({comboMultiplier})</span>
              </div>
            )}

            {/* Countdown Timer */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs font-bold border transition-colors ${
                timeLeft <= 15
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                  : 'bg-[#071329] text-cyan-400 border-white/10'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{timeLeft}s</span>
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

        {/* Content Area */}
        <div className="p-6 space-y-5">
          {!isGameOver ? (
            <>
              {/* Question Card */}
              <div className="bg-[#071329] border border-white/10 rounded-2xl p-5 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#36D9F5]">
                  Challenge Prompt
                </span>
                <h4 className="text-sm sm:text-base font-bold text-white leading-relaxed">
                  {currentQ.prompt}
                </h4>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 gap-2.5">
                {currentQ.options?.map((opt, idx) => {
                  const isSelected = selectedAnswer === idx;
                  const isCorrect = idx === currentQ.correctAnswerIndex;

                  let btnStyle = 'bg-[#101E3B]/70 border-white/10 text-slate-200 hover:border-[#36D9F5] hover:bg-[#101E3B]';
                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold';
                    } else if (isSelected) {
                      btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-300 font-bold';
                    } else {
                      btnStyle = 'bg-[#101E3B]/30 border-white/5 text-slate-500 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswerSubmitted}
                      className={`p-3.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {isAnswerSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {isAnswerSubmitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400" />}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Next Button */}
              {isAnswerSubmitted && (
                <div className="space-y-3 animate-in fade-in pt-2">
                  <div className="p-3.5 rounded-xl bg-[#071329] border border-white/10 text-xs text-slate-300 leading-relaxed">
                    <span className="font-bold text-[#36D9F5] block mb-1">Engineering Explanation:</span>
                    {currentQ.explanation}
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleNextQuestion}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7047F5] to-[#278DFF] hover:from-[#278DFF] hover:to-[#7047F5] text-white text-xs font-black shadow-[0_0_15px_rgba(112,71,245,0.4)] flex items-center gap-2 transition-all transform hover:scale-105"
                    >
                      <span>{currentIdx + 1 === questions.length ? 'Finalize Evaluation' : 'Next Mission'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            // Results Screen
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#7047F5] to-[#36D9F5] p-0.5 mx-auto flex items-center justify-center shadow-[0_0_25px_rgba(54,217,245,0.4)]">
                <div className="w-full h-full bg-[#0B1730] rounded-[14px] flex items-center justify-center text-[#36D9F5]">
                  <Award className="w-8 h-8" />
                </div>
              </div>

              <div>
                <h4 className="text-xl font-black text-white">Challenge Complete!</h4>
                <p className="text-xs text-slate-400 mt-1">
                  You answered {correctCount} of {questions.length} questions correctly.
                </p>
              </div>

              <div className="flex items-center justify-center gap-6 py-2">
                <div className="text-center">
                  <div className="text-2xl font-black text-[#20D994]">{Math.round((correctCount / questions.length) * 100)}%</div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Accuracy</span>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-[#FFCA55]">{maxCombo}x</div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Max Combo</span>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-[#36D9F5]">{60 - timeLeft}s</div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Time Taken</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#20D994] to-[#00E676] text-slate-950 font-black text-xs shadow-lg"
              >
                Return to CareerVerse
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
