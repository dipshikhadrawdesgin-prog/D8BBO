import React from 'react';
import { CalculationSummary } from '../types';
import { formatCurrency } from '../utils/calculator';
import { ArrowUpRight, DollarSign, PieChart, Calendar, Target, Award } from 'lucide-react';

interface MetricsOverviewProps {
  summary: CalculationSummary;
  currency: string;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ summary, currency }) => {
  const isPositive = summary.totalGainPercent >= 0;
  const reinvestRatio = summary.totalProfitEarned > 0 
    ? (summary.totalReinvested / summary.totalProfitEarned) * 100 
    : 100;
  const cashOutRatio = 100 - reinvestRatio;

  return (
    <div className="space-y-4">
      {/* Hero Stat Apple Glass Card */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 apple-glass-card pink-glow border border-pink-500/30">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-16 w-48 h-48 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-pink-400 mb-2">
              <Target className="w-4 h-4" />
              <span>Projected Future Portfolio</span>
              <span className="text-zinc-500" aria-hidden="true">·</span>
              <span className="text-zinc-400 font-mono">
                {summary.totalCalendarDays} Days Duration
              </span>
            </div>

            <div className="flex flex-wrap items-baseline gap-3 sm:gap-4">
              <span className="text-4xl sm:text-5xl md:text-6xl font-black font-mono tracking-tight text-white pink-text-glow">
                {formatCurrency(summary.finalBalance, currency)}
              </span>

              <div className="flex items-center gap-1.5 text-sm sm:text-base font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl">
                <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>+{summary.totalGainPercent.toLocaleString(undefined, { maximumFractionDigits: 1 })}%</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-xs sm:text-sm text-zinc-400">
              <span>Principal: <strong className="text-zinc-200 font-mono">{formatCurrency(summary.initialPrincipal, currency)}</strong></span>
              <span className="text-zinc-600" aria-hidden="true">·</span>
              <span>Account Growth: <strong className="text-pink-400 font-mono">{summary.multiplier.toFixed(2)}x</strong> initial</span>
              {summary.totalDeposited > 0 && (
                <>
                  <span className="text-zinc-600" aria-hidden="true">·</span>
                  <span>Deposits: <strong className="text-zinc-300 font-mono">{formatCurrency(summary.totalDeposited, currency)}</strong></span>
                </>
              )}
            </div>
          </div>

          {/* Quick Snapshot Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 shrink-0">
            <div className="bg-zinc-900/80 rounded-2xl p-3 border border-white/5">
              <div className="text-[11px] text-zinc-400 font-medium">Net Profit</div>
              <div className="text-base sm:text-lg font-bold font-mono text-emerald-400 mt-0.5">
                +{formatCurrency(summary.totalProfitEarned, currency)}
              </div>
            </div>

            <div className="bg-zinc-900/80 rounded-2xl p-3 border border-white/5">
              <div className="text-[11px] text-zinc-400 font-medium">Daily Avg Profit</div>
              <div className="text-base sm:text-lg font-bold font-mono text-pink-300 mt-0.5">
                {formatCurrency(summary.averageDailyProfit, currency)}
                <span className="text-[10px] text-zinc-500 ml-1 font-sans">/day</span>
              </div>
            </div>

            <div className="bg-zinc-900/80 rounded-2xl p-3 border border-white/5 col-span-2 sm:col-span-1 lg:col-span-2">
              <div className="text-[11px] text-zinc-400 font-medium flex items-center justify-between">
                <span>Trading Days</span>
                <span className="text-pink-400 font-mono font-semibold">
                  {summary.totalTradingDays} of {summary.totalCalendarDays}
                </span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-pink-500 to-rose-400 h-1.5 rounded-full"
                  style={{
                    width: `${Math.min(100, (summary.totalTradingDays / summary.totalCalendarDays) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Profit Earned */}
        <div className="rounded-2xl p-4 sm:p-5 apple-glass-card border border-white/10">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Profit</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {formatCurrency(summary.totalProfitEarned, currency)}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            Total compound yield generated
          </p>
        </div>

        {/* Reinvested vs Banked */}
        <div className="rounded-2xl p-4 sm:p-5 apple-glass-card border border-white/10">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Reinvest Split</span>
            <PieChart className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-pink-400">
            {reinvestRatio.toFixed(0)}% <span className="text-xs font-normal text-zinc-400">/ {cashOutRatio.toFixed(0)}%</span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-[11px] text-zinc-400">
            <span className="text-zinc-200">Reinvested: {formatCurrency(summary.totalReinvested, currency)}</span>
          </div>
        </div>

        {/* Total Banked Cash Out */}
        <div className="rounded-2xl p-4 sm:p-5 apple-glass-card border border-white/10">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Banked Cash</span>
            <ArrowUpRight className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-100">
            {formatCurrency(summary.totalCashOut, currency)}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            {summary.totalCashOut > 0 ? 'Profits pocketed to cold wallet' : '100% full compounding active'}
          </p>
        </div>

        {/* Milestones Met */}
        <div className="rounded-2xl p-4 sm:p-5 apple-glass-card border border-white/10">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Fastest 2x Target</span>
            <Award className="w-4 h-4 text-pink-400" />
          </div>
          {summary.milestones[0]?.reachedDay ? (
            <div>
              <div className="text-2xl font-bold font-mono text-pink-400">
                Day {summary.milestones[0].reachedDay}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                2x Double Capital ({summary.milestones[0].reachedDate})
              </p>
            </div>
          ) : (
            <div>
              <div className="text-lg font-semibold text-zinc-400">
                In Progress
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                Extend duration to reach 2x double
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
