import React, { useState } from 'react';
import { formatCurrency } from '../utils/calculator';
import { X, Calculator, ShieldAlert, CheckCircle, Percent } from 'lucide-react';

interface RiskSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountBalance: number;
  dailyTargetPercent: number;
  currency: string;
}

export const RiskSimulatorModal: React.FC<RiskSimulatorModalProps> = ({
  isOpen,
  onClose,
  accountBalance,
  dailyTargetPercent,
  currency,
}) => {
  const [riskPerTradePercent, setRiskPerTradePercent] = useState<number>(1.5);
  const [stopLossPips, setStopLossPips] = useState<number>(20);
  const [riskRewardRatio, setRiskRewardRatio] = useState<number>(2); // 1:2 RR
  const [pipValuePerLot, setPipValuePerLot] = useState<number>(10); // Standard lot $10/pip

  if (!isOpen) return null;

  const targetDailyCash = accountBalance * (dailyTargetPercent / 100);
  const maxRiskCash = accountBalance * (riskPerTradePercent / 100);
  
  // Lot size = Risk Amount / (StopLoss * PipValue)
  const calculatedLotSize = stopLossPips > 0 && pipValuePerLot > 0
    ? maxRiskCash / (stopLossPips * pipValuePerLot)
    : 0;

  // Potential profit per winning trade = maxRiskCash * riskRewardRatio
  const profitPerWin = maxRiskCash * riskRewardRatio;
  const winsNeededForDailyTarget = profitPerWin > 0
    ? Math.ceil(targetDailyCash / profitPerWin)
    : 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg rounded-3xl bg-[#101016] border border-white/10 p-6 sm:p-7 shadow-2xl z-10 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-pink-400" />
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Trade Risk & Lot Size Simulator
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-zinc-400">
          Determine the exact position size and risk required to hit your{' '}
          <strong className="text-pink-400">{dailyTargetPercent}%</strong> ({formatCurrency(targetDailyCash, currency)}) daily goal without blowing your account.
        </p>

        {/* Inputs */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0a0a0e] p-3 rounded-2xl border border-white/5">
              <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                Risk Per Trade %
              </label>
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="number"
                  step="0.5"
                  min="0.1"
                  max="10"
                  value={riskPerTradePercent}
                  onChange={(e) => setRiskPerTradePercent(parseFloat(e.target.value) || 1)}
                  className="w-full bg-transparent text-lg font-mono font-bold text-white outline-none"
                />
                <span className="text-xs text-pink-400 font-mono">%</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">
                Risk: {formatCurrency(maxRiskCash, currency)}
              </span>
            </div>

            <div className="bg-[#0a0a0e] p-3 rounded-2xl border border-white/5">
              <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                Stop Loss (Pips/Pts)
              </label>
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={stopLossPips}
                  onChange={(e) => setStopLossPips(parseInt(e.target.value) || 10)}
                  className="w-full bg-transparent text-lg font-mono font-bold text-white outline-none"
                />
                <span className="text-xs text-zinc-400">pips</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">
                Distance to SL
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0a0a0e] p-3 rounded-2xl border border-white/5">
              <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                Risk-to-Reward Ratio
              </label>
              <select
                value={riskRewardRatio}
                onChange={(e) => setRiskRewardRatio(parseFloat(e.target.value))}
                className="w-full mt-1 bg-transparent text-xs font-mono font-bold text-pink-300 outline-none"
              >
                <option value="1">1 : 1 (Equal)</option>
                <option value="1.5">1 : 1.5</option>
                <option value="2">1 : 2 (Recommended)</option>
                <option value="3">1 : 3 (Pro)</option>
                <option value="4">1 : 4</option>
              </select>
            </div>

            <div className="bg-[#0a0a0e] p-3 rounded-2xl border border-white/5">
              <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                Pip Value / Lot
              </label>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-zinc-400 font-mono">{currency}</span>
                <input
                  type="number"
                  min="1"
                  value={pipValuePerLot}
                  onChange={(e) => setPipValuePerLot(parseFloat(e.target.value) || 10)}
                  className="w-full bg-transparent text-xs font-mono font-bold text-white outline-none"
                />
                <span className="text-[10px] text-zinc-500">/std lot</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-500/10 via-rose-500/5 to-transparent border border-pink-500/30 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-300 font-semibold">Recommended Lot Size:</span>
            <span className="text-xl font-mono font-black text-pink-400">
              {calculatedLotSize.toFixed(calculatedLotSize < 0.1 ? 3 : 2)} Lots
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-2 border-t border-white/10 text-zinc-300">
            <div>
              <span className="text-zinc-500 block">Max Trade Loss:</span>
              <span className="text-rose-400 font-bold">-{formatCurrency(maxRiskCash, currency)}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">Profit per Target Hit:</span>
              <span className="text-emerald-400 font-bold">+{formatCurrency(profitPerWin, currency)}</span>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-zinc-400 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-pink-400 shrink-0" />
            <span>
              Hit daily goal in <strong>{winsNeededForDailyTarget} winning trade{winsNeededForDailyTarget > 1 ? 's' : ''}</strong> at 1:{riskRewardRatio} RR.
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
        >
          Close Simulator
        </button>
      </div>
    </div>
  );
};
