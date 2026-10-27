import React from 'react';
import { Milestone } from '../types';
import { formatCurrency } from '../utils/calculator';
import { Award, CheckCircle2, CircleDashed, Flame, Sparkles } from 'lucide-react';

interface MilestonesCardProps {
  milestones: Milestone[];
  currency: string;
  currentBalance: number;
  initialPrincipal: number;
  onMilestoneClick: () => void;
}

export const MilestonesCard: React.FC<MilestonesCardProps> = ({
  milestones,
  currency,
  currentBalance,
  initialPrincipal,
  onMilestoneClick,
}) => {
  return (
    <div className="apple-glass-card rounded-3xl p-5 sm:p-7 border border-white/10 space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-pink-400" />
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Account Milestones
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-pink-400 font-mono font-semibold">
          <Flame className="w-3.5 h-3.5" />
          <span>{milestones.filter((m) => m.reachedDay).length} of {milestones.length} Reached</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {milestones.map((m, idx) => {
          const isReached = !!m.reachedDay;
          const progressPercent = Math.min(100, Math.max(0, (currentBalance / m.targetBalance) * 100));

          return (
            <div
              key={idx}
              onClick={() => {
                if (isReached) onMilestoneClick();
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                isReached
                  ? 'bg-gradient-to-br from-pink-500/15 via-rose-500/10 to-transparent border-pink-500/40 hover:border-pink-500/60 shadow-[0_0_15px_rgba(236,72,153,0.15)] group'
                  : 'bg-[#0d0d12]/80 border-white/5 opacity-70'
              }`}
            >
              {isReached && (
                <div className="absolute top-2 right-2 text-pink-400 opacity-60 group-hover:opacity-100 transition-opacity">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              )}

              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white tracking-wide">
                  {m.label}
                </span>
                {isReached ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <CircleDashed className="w-4 h-4 text-zinc-600 shrink-0" />
                )}
              </div>

              <div className="text-lg font-mono font-bold text-pink-300">
                {formatCurrency(m.targetBalance, currency)}
              </div>

              {isReached ? (
                <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-bold">Day {m.reachedDay}</span>
                  <span className="text-zinc-400 text-[11px]">{m.reachedDate}</span>
                </div>
              ) : (
                <div className="mt-2 pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 mb-1">
                    <span>Target Progress</span>
                    <span>{progressPercent.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-1 overflow-hidden">
                    <div
                      className="bg-zinc-600 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
