import React, { useState, useMemo } from 'react';
import { DailyResult, TableViewMode } from '../types';
import { formatCurrency } from '../utils/calculator';
import { 
  Table, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Check, 
  Smartphone, 
  SlidersHorizontal,
  Calendar,
  Layers
} from 'lucide-react';

interface CompoundingTableProps {
  schedule: DailyResult[];
  currency: string;
}

export const CompoundingTable: React.FC<CompoundingTableProps> = ({ schedule, currency }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'trading' | 'weekends'>('all');
  const [viewMode, setViewMode] = useState<TableViewMode>('daily');
  const [pageSize, setPageSize] = useState<number>(30);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [mobileLayout, setMobileLayout] = useState<'table' | 'cards'>('table');
  const [copied, setCopied] = useState(false);

  // Grouping logic for Weekly & Monthly summaries
  const processedData = useMemo(() => {
    let list = schedule;

    // Filter
    if (filterMode === 'trading') {
      list = list.filter((d) => d.isTradingDay);
    } else if (filterMode === 'weekends') {
      list = list.filter((d) => !d.isTradingDay || d.isWeekend);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (d) =>
          d.dayIndex.toString() === q ||
          d.dateString.toLowerCase().includes(q) ||
          d.dayOfWeek.toLowerCase().includes(q)
      );
    }

    if (viewMode === 'daily') {
      return list;
    }

    if (viewMode === 'weekly') {
      // Group every 7 calendar days
      const weeklyGroups: DailyResult[] = [];
      const chunkSize = 7;
      for (let i = 0; i < list.length; i += chunkSize) {
        const chunk = list.slice(i, i + chunkSize);
        if (chunk.length === 0) continue;
        const first = chunk[0];
        const last = chunk[chunk.length - 1];

        const totalProfit = chunk.reduce((acc, c) => acc + c.dailyProfit, 0);
        const totalReinvest = chunk.reduce((acc, c) => acc + c.reinvestedProfit, 0);
        const totalCashOut = chunk.reduce((acc, c) => acc + c.cashOutProfit, 0);
        const totalDep = chunk.reduce((acc, c) => acc + c.deposit, 0);
        const totalWith = chunk.reduce((acc, c) => acc + c.withdrawal, 0);

        weeklyGroups.push({
          dayIndex: Math.floor(i / chunkSize) + 1,
          tradingDayIndex: chunk.filter((c) => c.isTradingDay).length,
          date: first.date,
          dateString: `Week ${Math.floor(i / chunkSize) + 1} (${first.dateString.slice(5)} to ${last.dateString.slice(5)})`,
          dayOfWeek: `${chunk.filter((c) => c.isTradingDay).length} trade days`,
          isWeekend: false,
          isTradingDay: true,
          startBalance: first.startBalance,
          dailyProfit: totalProfit,
          reinvestedProfit: totalReinvest,
          cashOutProfit: totalCashOut,
          deposit: totalDep,
          withdrawal: totalWith,
          endBalance: last.endBalance,
          cumulativeProfit: last.cumulativeProfit,
          cumulativeDeposits: last.cumulativeDeposits,
          cumulativeCashOut: last.cumulativeCashOut,
          totalRoiPercentage: last.totalRoiPercentage,
        });
      }
      return weeklyGroups;
    }

    if (viewMode === 'monthly') {
      // Group by calendar month
      const monthMap = new Map<string, DailyResult[]>();
      list.forEach((d) => {
        const monthKey = d.dateString.slice(0, 7); // YYYY-MM
        if (!monthMap.has(monthKey)) monthMap.set(monthKey, []);
        monthMap.get(monthKey)!.push(d);
      });

      const monthlyGroups: DailyResult[] = [];
      let mIdx = 1;
      monthMap.forEach((chunk, key) => {
        const first = chunk[0];
        const last = chunk[chunk.length - 1];
        const totalProfit = chunk.reduce((acc, c) => acc + c.dailyProfit, 0);
        const totalReinvest = chunk.reduce((acc, c) => acc + c.reinvestedProfit, 0);
        const totalCashOut = chunk.reduce((acc, c) => acc + c.cashOutProfit, 0);
        const totalDep = chunk.reduce((acc, c) => acc + c.deposit, 0);
        const totalWith = chunk.reduce((acc, c) => acc + c.withdrawal, 0);

        monthlyGroups.push({
          dayIndex: mIdx++,
          tradingDayIndex: chunk.filter((c) => c.isTradingDay).length,
          date: first.date,
          dateString: `Month ${key}`,
          dayOfWeek: `${chunk.length} days (${chunk.filter((c) => c.isTradingDay).length} trade)`,
          isWeekend: false,
          isTradingDay: true,
          startBalance: first.startBalance,
          dailyProfit: totalProfit,
          reinvestedProfit: totalReinvest,
          cashOutProfit: totalCashOut,
          deposit: totalDep,
          withdrawal: totalWith,
          endBalance: last.endBalance,
          cumulativeProfit: last.cumulativeProfit,
          cumulativeDeposits: last.cumulativeDeposits,
          cumulativeCashOut: last.cumulativeCashOut,
          totalRoiPercentage: last.totalRoiPercentage,
        });
      });
      return monthlyGroups;
    }

    return list;
  }, [schedule, filterMode, searchQuery, viewMode]);

  // Pagination
  const totalPages = pageSize === 0 ? 1 : Math.ceil(processedData.length / pageSize);
  const pagedData = useMemo(() => {
    if (pageSize === 0) return processedData;
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  const handleCopySummary = () => {
    const text = processedData
      .slice(0, 50)
      .map(
        (d) =>
          `Day ${d.dayIndex} (${d.dateString}): Start ${formatCurrency(d.startBalance, currency)} | Profit +${formatCurrency(d.dailyProfit, currency)} | End ${formatCurrency(d.endBalance, currency)}`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="apple-glass-card rounded-3xl p-5 sm:p-7 border border-white/10 space-y-5">
      {/* Top Header & View Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Table className="w-5 h-5 text-pink-400" />
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Compounding Schedule
            </h3>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Detailed breakdown of balance, daily profit, reinvestments & withdrawals
          </p>
        </div>

        {/* View Mode Segmented Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Day / Week / Month Mode */}
          <div className="flex items-center gap-1 p-1 bg-[#0c0c10] rounded-xl border border-white/5">
            <button
              onClick={() => {
                setViewMode('daily');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                viewMode === 'daily'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => {
                setViewMode('weekly');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                viewMode === 'weekly'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => {
                setViewMode('monthly');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                viewMode === 'monthly'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
          </div>

          {/* Mobile Layout Switch (Table vs Cards) */}
          <button
            onClick={() => setMobileLayout(mobileLayout === 'table' ? 'cards' : 'table')}
            className="sm:hidden flex items-center gap-1 px-2.5 py-1.5 bg-zinc-900 border border-white/10 rounded-xl text-xs text-zinc-300 cursor-pointer"
            title="Toggle Card View on Mobile"
          >
            <Smartphone className="w-3.5 h-3.5 text-pink-400" />
            <span>{mobileLayout === 'table' ? 'Card View' : 'Table View'}</span>
          </button>

          {/* Copy Table Snippet */}
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-pink-500/40 rounded-xl text-xs text-zinc-300 transition-all cursor-pointer"
            title="Copy schedule snippet to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-pink-400" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter Bar (Search + Trading Days Filter + Page Size) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search day or date..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 bg-[#0c0c10] border border-white/10 hover:border-pink-500/40 rounded-xl text-xs font-mono text-white outline-none transition-all placeholder:text-zinc-600"
          />
        </div>

        {/* Filter Chips & Page Size */}
        <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-end">
          <div className="flex items-center gap-1 p-0.5 bg-[#0c0c10] rounded-xl border border-white/5">
            <button
              onClick={() => {
                setFilterMode('all');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              All Days
            </button>
            <button
              onClick={() => {
                setFilterMode('trading');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all cursor-pointer ${
                filterMode === 'trading'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Trading Days Only
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-mono">
            <span>Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value) || 0);
                setCurrentPage(1);
              }}
              className="bg-[#0c0c10] border border-white/10 rounded-lg px-2 py-1 text-xs text-zinc-200 outline-none"
            >
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="60">60</option>
              <option value="0">All</option>
            </select>
          </div>
        </div>
      </div>

      {/* Render Data: Either Desktop/Mobile Responsive Table or Mobile Cards */}
      {mobileLayout === 'cards' ? (
        <div className="sm:hidden space-y-3">
          {pagedData.map((d) => (
            <div
              key={d.dayIndex}
              className={`p-4 rounded-2xl border ${
                d.isTradingDay
                  ? 'bg-[#0d0d12] border-white/10'
                  : 'bg-zinc-950/60 border-zinc-900 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-pink-400">
                    Day {d.dayIndex}
                  </span>
                  <span className="text-zinc-300 text-xs">{d.dateString}</span>
                </div>
                <span className="text-[11px] text-zinc-400">
                  {d.dayOfWeek}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase">Start Balance</span>
                  <span className="font-medium text-zinc-300">{formatCurrency(d.startBalance, currency)}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase">Daily Profit</span>
                  <span className={`font-bold ${d.dailyProfit > 0 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {d.dailyProfit > 0 ? `+${formatCurrency(d.dailyProfit, currency)}` : `${currency}0.00`}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase">Reinvested</span>
                  <span className="font-medium text-pink-300">{formatCurrency(d.reinvestedProfit, currency)}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase">End Balance</span>
                  <span className="font-bold text-white">{formatCurrency(d.endBalance, currency)}</span>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                <span className="text-zinc-400">Total Return:</span>
                <span className="font-bold text-pink-400">+{d.totalRoiPercentage.toFixed(2)}%</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10 -mx-1 sm:mx-0">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-[#101016] text-zinc-400 uppercase tracking-wider text-[10px] border-b border-white/10">
                <th className="py-3 px-3 sm:px-4 font-bold text-white">
                  {viewMode === 'daily' ? 'Day' : viewMode === 'weekly' ? 'Week' : 'Month'}
                </th>
                <th className="py-3 px-3 sm:px-4">Date</th>
                <th className="py-3 px-3 sm:px-4 text-right">Start Balance</th>
                <th className="py-3 px-3 sm:px-4 text-right">Daily Profit</th>
                <th className="py-3 px-3 sm:px-4 text-right">Reinvested</th>
                <th className="py-3 px-3 sm:px-4 text-right">Cash Out</th>
                <th className="py-3 px-3 sm:px-4 text-right font-bold text-white">End Balance</th>
                <th className="py-3 px-3 sm:px-4 text-right text-pink-400">Total Gain %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {pagedData.map((d) => {
                const isNonTrading = !d.isTradingDay;

                return (
                  <tr
                    key={d.dayIndex}
                    className={`transition-colors hover:bg-pink-500/[0.06] ${
                      isNonTrading ? 'opacity-50 bg-[#070709]' : 'bg-[#0d0d12]/50'
                    }`}
                  >
                    {/* Day Number */}
                    <td className="py-3 px-3 sm:px-4 font-semibold text-white">
                      <div className="flex items-center gap-1.5">
                        <span className="text-pink-400 font-bold">#{d.dayIndex}</span>
                        {isNonTrading && (
                          <span className="text-[9px] text-zinc-500 font-sans uppercase">
                            Off
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 sm:px-4 text-zinc-300">
                      <div>
                        <span>{d.dateString}</span>
                        <span className="text-[10px] text-zinc-500 ml-1.5 font-sans">
                          {d.dayOfWeek}
                        </span>
                      </div>
                    </td>

                    {/* Start Balance */}
                    <td className="py-3 px-3 sm:px-4 text-right text-zinc-300">
                      {formatCurrency(d.startBalance, currency)}
                    </td>

                    {/* Daily Profit */}
                    <td className="py-3 px-3 sm:px-4 text-right font-semibold">
                      {d.dailyProfit > 0 ? (
                        <span className="text-emerald-400">
                          +{formatCurrency(d.dailyProfit, currency)}
                        </span>
                      ) : (
                        <span className="text-zinc-600">{currency}0.00</span>
                      )}
                    </td>

                    {/* Reinvested */}
                    <td className="py-3 px-3 sm:px-4 text-right text-pink-300">
                      {d.reinvestedProfit > 0 ? formatCurrency(d.reinvestedProfit, currency) : '-'}
                    </td>

                    {/* Cash Out */}
                    <td className="py-3 px-3 sm:px-4 text-right text-zinc-400">
                      {d.cashOutProfit > 0 ? formatCurrency(d.cashOutProfit, currency) : '-'}
                    </td>

                    {/* End Balance */}
                    <td className="py-3 px-3 sm:px-4 text-right font-bold text-white">
                      {formatCurrency(d.endBalance, currency)}
                    </td>

                    {/* Total ROI % */}
                    <td className="py-3 px-3 sm:px-4 text-right font-bold text-pink-400">
                      +{d.totalRoiPercentage.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}

              {pagedData.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-zinc-500">
                    No compounding records found matching filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/5 text-xs">
          <div className="text-zinc-400 font-mono">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, processedData.length)} of{' '}
            {processedData.length} records
          </div>

          <div className="flex items-center gap-1.5 self-center sm:self-auto">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-mono text-zinc-300">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
