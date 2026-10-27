import React, { useState } from 'react';
import { CalculationInput, RatePeriod, CashFlowPeriod } from '../types';
import { 
  Sliders, 
  Calendar, 
  Percent, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  PlusCircle, 
  MinusCircle, 
  Clock, 
  ShieldCheck,
  Coins
} from 'lucide-react';
import { DEFAULT_INPUT } from '../utils/calculator';

interface InputPanelProps {
  input: CalculationInput;
  onChange: (updated: CalculationInput) => void;
  onReset: () => void;
}

export const InputPanel: React.FC<InputPanelProps> = ({ input, onChange, onReset }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateField = <K extends keyof CalculationInput>(field: K, value: CalculationInput[K]) => {
    onChange({
      ...input,
      [field]: value,
    });
  };

  const dayNames = [
    { idx: 1, label: 'Mon' },
    { idx: 2, label: 'Tue' },
    { idx: 3, label: 'Wed' },
    { idx: 4, label: 'Thu' },
    { idx: 5, label: 'Fri' },
    { idx: 6, label: 'Sat' },
    { idx: 0, label: 'Sun' },
  ];

  const toggleDayOff = (dayIdx: number) => {
    const current = input.daysOff || [];
    if (current.includes(dayIdx)) {
      updateField('daysOff', current.filter((d) => d !== dayIdx));
    } else {
      updateField('daysOff', [...current, dayIdx]);
    }
  };

  return (
    <div className="apple-glass-card rounded-3xl p-5 sm:p-7 border border-white/10 space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-pink-400" />
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Trading Parameters
          </h2>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-pink-300 hover:bg-pink-500/10 border border-white/5 hover:border-pink-500/30 transition-all cursor-pointer"
          title="Reset to $170 @ 5% Daily"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Default</span>
        </button>
      </div>

      {/* Primary 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {/* Principal Starting Balance */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Starting Capital (Principal)
            </label>
            <span className="text-[11px] text-zinc-500">Initial Deposit</span>
          </div>

          <div className="relative flex items-center">
            <span className="absolute left-4 font-mono font-bold text-lg text-pink-400 pointer-events-none">
              {input.currency}
            </span>
            <input
              type="number"
              min="0"
              step="any"
              value={input.principal === 0 ? '' : input.principal}
              onChange={(e) => updateField('principal', Math.max(0, parseFloat(e.target.value) || 0))}
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-3 bg-[#0d0d12] border border-white/10 hover:border-pink-500/40 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-2xl text-lg font-mono font-bold text-white transition-all outline-none"
            />
          </div>

          {/* Quick Step Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {[170, 500, 1000, 5000].map((amt) => (
              <button
                key={amt}
                onClick={() => updateField('principal', amt)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition-all cursor-pointer ${
                  input.principal === amt
                    ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-white/5'
                }`}
              >
                {input.currency}{amt.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Profit / Interest Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Profit / Interest Rate
            </label>
            <span className="text-[11px] text-zinc-500 font-mono">
              Target Yield
            </span>
          </div>

          <div className="relative flex items-center">
            <input
              type="number"
              min="0"
              step="0.01"
              value={input.interestRate === 0 ? '' : input.interestRate}
              onChange={(e) => updateField('interestRate', Math.max(0, parseFloat(e.target.value) || 0))}
              placeholder="5.0"
              className="w-full pl-4 pr-10 py-3 bg-[#0d0d12] border border-white/10 hover:border-pink-500/40 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-2xl text-lg font-mono font-bold text-white transition-all outline-none"
            />
            <span className="absolute right-4 font-mono font-bold text-lg text-pink-400 pointer-events-none">
              %
            </span>
          </div>

          {/* Rate Period Segmented Control (Apple Style) */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-[#0d0d12] rounded-xl border border-white/5">
            {(['daily', 'weekly', 'monthly', 'yearly'] as RatePeriod[]).map((period) => (
              <button
                key={period}
                onClick={() => updateField('ratePeriod', period)}
                className={`py-1.5 text-xs font-semibold capitalize rounded-lg transition-all cursor-pointer ${
                  input.ratePeriod === period
                    ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Duration Controls */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-pink-400" />
            <span>Investment Duration</span>
          </label>
          <span className="text-[11px] text-pink-400 font-mono">
            {input.years > 0 ? `${input.years}y ` : ''}
            {input.months > 0 ? `${input.months}m ` : ''}
            {input.days > 0 ? `${input.days}d` : ''}
            {input.years === 0 && input.months === 0 && input.days === 0 ? 'Default 1m (30d)' : ''}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* Years */}
          <div className="bg-[#0d0d12] border border-white/10 rounded-2xl p-3 focus-within:border-pink-500/50 transition-all">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Years</span>
            <input
              type="number"
              min="0"
              max="20"
              value={input.years}
              onChange={(e) => updateField('years', Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full bg-transparent text-xl font-mono font-bold text-white outline-none mt-1"
            />
          </div>

          {/* Months */}
          <div className="bg-[#0d0d12] border border-white/10 rounded-2xl p-3 focus-within:border-pink-500/50 transition-all">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Months</span>
            <input
              type="number"
              min="0"
              max="120"
              value={input.months}
              onChange={(e) => updateField('months', Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full bg-transparent text-xl font-mono font-bold text-white outline-none mt-1"
            />
          </div>

          {/* Days */}
          <div className="bg-[#0d0d12] border border-white/10 rounded-2xl p-3 focus-within:border-pink-500/50 transition-all">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Days</span>
            <input
              type="number"
              min="0"
              max="3650"
              value={input.days}
              onChange={(e) => updateField('days', Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full bg-transparent text-xl font-mono font-bold text-white outline-none mt-1"
            />
          </div>
        </div>

        {/* Quick Duration Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          {[
            { label: '30 Days', y: 0, m: 1, d: 0 },
            { label: '60 Days', y: 0, m: 2, d: 0 },
            { label: '90 Days', y: 0, m: 3, d: 0 },
            { label: '100 Days', y: 0, m: 0, d: 100 },
            { label: '6 Months', y: 0, m: 6, d: 0 },
            { label: '1 Year', y: 1, m: 0, d: 0 },
          ].map((dur) => (
            <button
              key={dur.label}
              onClick={() => {
                updateField('years', dur.y);
                updateField('months', dur.m);
                updateField('days', dur.d);
              }}
              className="px-2.5 py-1 rounded-lg text-[11px] font-mono text-zinc-400 hover:text-pink-300 bg-zinc-900/60 hover:bg-pink-500/10 border border-white/5 transition-all cursor-pointer"
            >
              {dur.label}
            </button>
          ))}
        </div>
      </div>

      {/* Daily Reinvestment Slider */}
      <div className="space-y-3 pt-2 p-4 rounded-2xl bg-[#0c0c10] border border-white/5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Daily Reinvestment Rate
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-pink-400 bg-pink-500/15 px-2 py-0.5 rounded-md border border-pink-500/30">
              {input.reinvestRate}% Reinvested
            </span>
            {input.reinvestRate < 100 && (
              <span className="text-xs font-mono font-medium text-zinc-400">
                ({100 - input.reinvestRate}% Banked Cash)
              </span>
            )}
          </div>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={input.reinvestRate}
          onChange={(e) => updateField('reinvestRate', parseInt(e.target.value) || 0)}
          className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
        />

        <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span>0% (Cash Out All Profit)</span>
          <span>50% Balanced</span>
          <span>100% (Full Compound Growth)</span>
        </div>
      </div>

      {/* Schedule / Market Rules (Weekends & Start Date) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#0c0c10] border border-white/5">
        {/* Weekend Switch (Apple iOS style) */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-zinc-200">
              Include Weekends
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {input.includeWeekends ? '7-Day Crypto / 24-7 Market' : '5-Day Forex / Stock Weekdays'}
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={input.includeWeekends}
            onClick={() => updateField('includeWeekends', !input.includeWeekends)}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              input.includeWeekends ? 'bg-pink-500 shadow-[0_0_12px_rgba(236,72,153,0.5)]' : 'bg-zinc-800'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                input.includeWeekends ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Start Date */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-pink-400" />
              <span>Start Date</span>
            </span>
            <button
              onClick={() => updateField('startDate', new Date().toISOString().split('T')[0])}
              className="text-[10px] text-pink-400 hover:underline cursor-pointer"
            >
              Today
            </button>
          </div>
          <input
            type="date"
            value={input.startDate}
            onChange={(e) => updateField('startDate', e.target.value)}
            className="w-full px-3 py-2 bg-[#121218] border border-white/10 hover:border-pink-500/40 rounded-xl text-xs font-mono text-zinc-100 outline-none transition-all"
          />
        </div>

        {/* Custom Days Off Filter (if weekends off or specific off-days) */}
        <div className="col-span-1 md:col-span-2 pt-2 border-t border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-zinc-400">Custom Days Off (No Trading):</span>
            <span className="text-[10px] text-zinc-500">Click to toggle non-trading day</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {dayNames.map(({ idx, label }) => {
              const isOff = input.daysOff?.includes(idx);
              return (
                <button
                  key={idx}
                  onClick={() => toggleDayOff(idx)}
                  className={`px-3 py-1 text-xs font-mono font-medium rounded-xl transition-all cursor-pointer ${
                    isOff
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 line-through'
                      : 'bg-zinc-900 text-zinc-300 hover:text-white border border-white/5'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Advanced Drawer Toggle (Deposits, Withdrawals, Taxes) */}
      <div className="border-t border-white/10 pt-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-pink-300 transition-colors cursor-pointer py-1"
        >
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-pink-400" />
            <span>Regular Deposits & Withdrawals (Cash Flow)</span>
          </div>
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4 text-zinc-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          )}
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Regular Deposit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#0c0c10] border border-white/5">
              <div>
                <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wide">
                  Regular Contribution / Deposit
                </label>
                <div className="relative flex items-center mt-1">
                  <span className="absolute left-3 font-mono text-zinc-400 text-xs">
                    {input.currency}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={input.depositAmount === 0 ? '' : input.depositAmount}
                    onChange={(e) => updateField('depositAmount', Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0"
                    className="w-full pl-8 pr-3 py-2 bg-[#121218] border border-white/10 rounded-xl text-sm font-mono text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wide">
                  Deposit Frequency
                </label>
                <select
                  value={input.depositPeriod}
                  onChange={(e) => updateField('depositPeriod', e.target.value as CashFlowPeriod)}
                  className="w-full mt-1 px-3 py-2 bg-[#121218] border border-white/10 rounded-xl text-xs font-mono text-white outline-none"
                >
                  <option value="none">None</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Every 2 Weeks</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            {/* Regular Withdrawal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#0c0c10] border border-white/5">
              <div>
                <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wide">
                  Regular Withdrawal / Payout
                </label>
                <div className="relative flex items-center mt-1">
                  <span className="absolute left-3 font-mono text-zinc-400 text-xs">
                    {input.currency}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={input.withdrawalAmount === 0 ? '' : input.withdrawalAmount}
                    onChange={(e) => updateField('withdrawalAmount', Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0"
                    className="w-full pl-8 pr-3 py-2 bg-[#121218] border border-white/10 rounded-xl text-sm font-mono text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wide">
                  Withdrawal Frequency
                </label>
                <select
                  value={input.withdrawalPeriod}
                  onChange={(e) => updateField('withdrawalPeriod', e.target.value as CashFlowPeriod)}
                  className="w-full mt-1 px-3 py-2 bg-[#121218] border border-white/10 rounded-xl text-xs font-mono text-white outline-none"
                >
                  <option value="none">None</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Every 2 Weeks</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            {/* One-off Deposit & Tax */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#0c0c10] border border-white/5">
              <div>
                <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wide">
                  One-Off Cash Injection
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <input
                    type="number"
                    min="0"
                    value={input.oneOffDeposit === 0 ? '' : input.oneOffDeposit}
                    onChange={(e) => updateField('oneOffDeposit', Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="Amount"
                    className="w-full px-2.5 py-2 bg-[#121218] border border-white/10 rounded-xl text-xs font-mono text-white outline-none"
                  />
                  <input
                    type="date"
                    value={input.oneOffDepositDate}
                    onChange={(e) => updateField('oneOffDepositDate', e.target.value)}
                    className="w-full px-2 py-2 bg-[#121218] border border-white/10 rounded-xl text-[11px] font-mono text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wide">
                  Broker Fee / Profit Tax %
                </label>
                <div className="relative flex items-center mt-1">
                  <input
                    type="number"
                    min="0"
                    max="90"
                    value={input.taxRate === 0 ? '' : input.taxRate}
                    onChange={(e) => updateField('taxRate', Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0"
                    className="w-full pl-3 pr-8 py-2 bg-[#121218] border border-white/10 rounded-xl text-sm font-mono text-white outline-none"
                  />
                  <span className="absolute right-3 font-mono text-zinc-400 text-xs">%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
