/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { CalculationInput, CalculationSummary } from './types';
import { 
  DEFAULT_INPUT, 
  calculateCompounding, 
  parseUrlParams, 
  buildUrlParams, 
  generateCsvData,
  formatCurrency 
} from './utils/calculator';
import { Header } from './components/Header';
import { MetricsOverview } from './components/MetricsOverview';
import { InputPanel } from './components/InputPanel';
import { GrowthChart } from './components/GrowthChart';
import { MilestonesCard } from './components/MilestonesCard';
import { CompoundingTable } from './components/CompoundingTable';
import { ShareModal } from './components/ShareModal';
import { RiskSimulatorModal } from './components/RiskSimulatorModal';
import { 
  Calculator, 
  TrendingUp, 
  HelpCircle, 
  Zap, 
  ArrowUpRight, 
  ShieldCheck, 
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

export default function App() {
  // Initialize state with URL query parameters or default
  const [input, setInput] = useState<CalculationInput>(() => {
    if (typeof window !== 'undefined' && window.location.search) {
      const parsed = parseUrlParams(window.location.search);
      return {
        ...DEFAULT_INPUT,
        ...parsed,
      };
    }
    return DEFAULT_INPUT;
  });

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);

  // Sync URL query params with state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const queryString = buildUrlParams(input);
      const newUrl = `${window.location.pathname}?${queryString}`;
      window.history.replaceState(null, '', newUrl);
    }
  }, [input]);

  // Main calculation
  const summary: CalculationSummary = useMemo(() => {
    return calculateCompounding(input);
  }, [input]);

  // Confetti trigger
  const triggerConfetti = useCallback(() => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#ff2a85', '#ec4899', '#f43f5e', '#ffffff', '#fb7185'],
    });
  }, []);

  // CSV download handler
  const handleExportCsv = useCallback(() => {
    const csv = generateCsvData(summary, input.currency);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `trade-calculation-${input.principal}-${input.interestRate}pct.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [summary, input]);

  const handleReset = useCallback(() => {
    setInput(DEFAULT_INPUT);
  }, []);

  return (
    <div className="min-h-screen bg-[#060608] text-zinc-100 flex flex-col font-sans selection:bg-pink-500/30 selection:text-pink-200">
      {/* Background ambient light */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-pink-600/15 via-rose-600/5 to-transparent rounded-full blur-3xl opacity-70" />
        <div className="absolute top-1/3 -right-40 w-[450px] h-[450px] bg-pink-500/10 rounded-full blur-[120px] opacity-40" />
      </div>

      {/* Top Navigation */}
      <Header
        input={input}
        onChangeInput={setInput}
        onExportCsv={handleExportCsv}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onTriggerConfetti={triggerConfetti}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-24 md:pb-12">
        {/* Banner with Trade Setup Quick Insights */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-pink-500/10 via-zinc-900/60 to-zinc-900/40 border border-pink-500/20 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Active Model:</span>
                <span className="text-pink-300 font-mono">
                  {formatCurrency(input.principal, input.currency)} @ {input.interestRate}% {input.ratePeriod}
                </span>
                <span className="hidden sm:inline text-zinc-400 font-normal">
                  ({input.reinvestRate}% Reinvested)
                </span>
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                {input.includeWeekends ? '24/7 Continuous (Crypto)' : 'Weekdays Only (Forex / Stocks)'}
                {' · '}
                {summary.totalCalendarDays} days total ({summary.totalTradingDays} trading sessions)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsRiskModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900/90 hover:bg-zinc-800 text-pink-300 border border-pink-500/30 hover:border-pink-500/50 shadow-sm transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-pink-400" />
              <span>Lot Size & Risk Calc</span>
            </button>
          </div>
        </div>

        {/* Executive Metrics Overview */}
        <MetricsOverview summary={summary} currency={input.currency} />

        {/* Interactive Main Grid: Parameters + Visual Trajectory */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Parameters Input Card */}
          <div className="lg:col-span-5 space-y-6">
            <InputPanel
              input={input}
              onChange={setInput}
              onReset={handleReset}
            />
          </div>

          {/* Right Column: Chart & Milestones */}
          <div className="lg:col-span-7 space-y-6">
            <GrowthChart
              data={summary.dailySchedule}
              initialPrincipal={input.principal}
              currency={input.currency}
            />

            <MilestonesCard
              milestones={summary.milestones}
              currency={input.currency}
              currentBalance={summary.finalBalance}
              initialPrincipal={input.principal}
              onMilestoneClick={triggerConfetti}
            />
          </div>
        </div>

        {/* Full Detailed Day-by-Day Compounding Schedule Table */}
        <section className="pt-2">
          <CompoundingTable
            schedule={summary.dailySchedule}
            currency={input.currency}
          />
        </section>

        {/* Financial Disclaimer & Educational Notes */}
        <footer className="pt-6 border-t border-white/5 text-zinc-500 text-xs space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-400">TRADE CALCULATION</span>
              <span className="text-zinc-600" aria-hidden="true">·</span>
              <span>Based on Daily Compound Interest Mathematics</span>
            </div>
            <div className="text-[11px] text-zinc-400 font-mono">
              Designed with Apple-Inspired Black & Pink Aesthetics
            </div>
          </div>
          <p className="text-[11px] leading-relaxed text-zinc-400">
            Disclaimer: Compound interest calculations reflect theoretical compounding models based on constant returns. Real market trading carries inherent capital risk, slippage, and spread variance. Trade responsibly and preserve your risk capital.
          </p>
        </footer>
      </main>

      {/* Mobile Floating Sticky Bottom Summary Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 p-3 bg-[#0a0a0e]/90 backdrop-blur-2xl border-t border-white/10 shadow-[0_-10px_25px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          <div>
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
              Future Balance
            </div>
            <div className="text-lg font-bold font-mono text-white flex items-center gap-1.5">
              <span>{formatCurrency(summary.finalBalance, input.currency)}</span>
              <span className="text-xs font-semibold text-pink-400">
                +{summary.totalGainPercent.toFixed(0)}%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const el = document.querySelector('table');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-900 border border-white/10 text-zinc-200"
            >
              Table
            </button>
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.4)]"
            >
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Share Modal Dialog */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        input={input}
        summary={summary}
      />

      {/* Risk & Lot Size Simulator Modal Dialog */}
      <RiskSimulatorModal
        isOpen={isRiskModalOpen}
        onClose={() => setIsRiskModalOpen(false)}
        accountBalance={input.principal}
        dailyTargetPercent={input.interestRate}
        currency={input.currency}
      />
    </div>
  );
}
