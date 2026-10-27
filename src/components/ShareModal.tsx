import React, { useState } from 'react';
import { CalculationInput, CalculationSummary } from '../types';
import { buildUrlParams, formatCurrency } from '../utils/calculator';
import { X, Copy, Check, Share2, Link as LinkIcon, Send } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  input: CalculationInput;
  summary: CalculationSummary;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  input,
  summary,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  if (!isOpen) return null;

  const currentUrl = window.location.origin + window.location.pathname + '?' + buildUrlParams(input);

  const summaryText = `🔥 TRADE CALCULATION - Daily Compound Report
💰 Initial Capital: ${formatCurrency(summary.initialPrincipal, input.currency)}
📈 Daily Target: ${input.interestRate}% (${input.ratePeriod})
⏱ Duration: ${summary.totalCalendarDays} days (${summary.totalTradingDays} trading days)
🔄 Reinvest Rate: ${input.reinvestRate}%
🚀 Projected Final Balance: ${formatCurrency(summary.finalBalance, input.currency)} (+${summary.totalGainPercent.toFixed(1)}%)
💵 Net Profit: +${formatCurrency(summary.totalProfitEarned, input.currency)}
Calculate yours: ${currentUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(summaryText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-3xl bg-[#101016] border border-white/10 p-6 sm:p-7 shadow-2xl z-10 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-pink-400" />
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Share Trade Calculation
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Link field */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">
            Direct Shareable URL
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="w-full px-3 py-2.5 bg-[#0a0a0e] border border-white/10 rounded-xl text-xs font-mono text-zinc-300 outline-none select-all"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-zinc-400">
            Anyone opening this link will load these exact compounding settings.
          </p>
        </div>

        {/* Summary text preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">
              Trading Summary Card
            </label>
            <button
              onClick={handleCopyText}
              className="text-xs text-pink-400 hover:text-pink-300 font-semibold cursor-pointer flex items-center gap-1"
            >
              {copiedText ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedText ? 'Copied Text' : 'Copy Text'}</span>
            </button>
          </div>
          <pre className="p-3 bg-[#0a0a0e] border border-white/10 rounded-xl text-xs font-mono text-zinc-300 whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed">
            {summaryText}
          </pre>
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
