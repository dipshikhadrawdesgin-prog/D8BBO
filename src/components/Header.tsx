import React, { useState } from 'react';
import { CURRENCIES, PRESETS } from '../utils/calculator';
import { CalculationInput } from '../types';
import { TrendingUp, Share2, Download, Sparkles, Check, ChevronDown } from 'lucide-react';

interface HeaderProps {
  input: CalculationInput;
  onChangeInput: (newInput: CalculationInput) => void;
  onExportCsv: () => void;
  onOpenShareModal: () => void;
  onTriggerConfetti: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  input,
  onChangeInput,
  onExportCsv,
  onOpenShareModal,
  onTriggerConfetti,
}) => {
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);

  const handleSelectPreset = (presetParams: Partial<CalculationInput>) => {
    onChangeInput({
      ...input,
      ...presetParams,
    });
    setShowPresetsMenu(false);
    onTriggerConfetti();
  };

  const handleSelectCurrency = (symbol: string) => {
    onChangeInput({
      ...input,
      currency: symbol,
    });
    setShowCurrencyMenu(false);
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-2xl bg-[#070709]/80 border-b border-white/[0.08] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-[0_0_20px_rgba(244,63,94,0.4)] text-white">
            <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            <div className="absolute -inset-0.5 rounded-2xl bg-pink-500/20 blur-sm -z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-100 to-pink-300 bg-clip-text text-transparent">
                TRADE CALCULATION
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-pink-500/10 text-pink-400 border border-pink-500/20 uppercase tracking-wider">
                PRO COMPOUND
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              Daily Trading Compound Interest & Growth Engine
            </p>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Presets Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowPresetsMenu(!showPresetsMenu);
                setShowCurrencyMenu(false);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-200 bg-zinc-900/90 hover:bg-zinc-800/90 border border-white/10 hover:border-pink-500/40 transition-all cursor-pointer shadow-sm"
              title="Quick Trading Presets"
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span className="hidden md:inline">Presets</span>
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${showPresetsMenu ? 'rotate-180' : ''}`} />
            </button>

            {showPresetsMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowPresetsMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-[#111116] border border-white/10 shadow-2xl p-2 z-50 backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-white/5">
                    <p className="text-xs font-semibold text-zinc-200">Trading Presets</p>
                    <p className="text-[11px] text-zinc-400">Load battle-tested compound models</p>
                  </div>
                  <div className="mt-1 space-y-1 max-h-72 overflow-y-auto">
                    {PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset.params)}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-pink-500/10 hover:border hover:border-pink-500/30 border border-transparent transition-all group cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-zinc-100 group-hover:text-pink-300">
                            {preset.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 group-hover:bg-pink-900/40 group-hover:text-pink-300">
                            {preset.tag}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                          {preset.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Currency Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setShowCurrencyMenu(!showCurrencyMenu);
                setShowPresetsMenu(false);
              }}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-medium text-zinc-200 bg-zinc-900/90 hover:bg-zinc-800/90 border border-white/10 hover:border-pink-500/40 transition-all cursor-pointer"
              title="Change Currency"
            >
              <span className="text-pink-400 font-mono font-bold">{input.currency}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${showCurrencyMenu ? 'rotate-180' : ''}`} />
            </button>

            {showCurrencyMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowCurrencyMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#111116] border border-white/10 shadow-2xl p-1.5 z-50 backdrop-blur-3xl">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => handleSelectCurrency(c.symbol)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-all cursor-pointer ${
                        input.currency === c.symbol
                          ? 'bg-pink-500/15 text-pink-300 font-semibold border border-pink-500/30'
                          : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-pink-400 w-4">{c.symbol}</span>
                        <span>{c.name}</span>
                      </div>
                      {input.currency === c.symbol && (
                        <Check className="w-3.5 h-3.5 text-pink-400" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Share Link Button */}
          <button
            onClick={onOpenShareModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-200 bg-zinc-900/90 hover:bg-zinc-800/90 border border-white/10 hover:border-pink-500/40 transition-all cursor-pointer"
            title="Share Calculation Link"
          >
            <Share2 className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* CSV Download */}
          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.35)] transition-all cursor-pointer font-semibold"
            title="Export CSV Table"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>
    </header>
  );
};
