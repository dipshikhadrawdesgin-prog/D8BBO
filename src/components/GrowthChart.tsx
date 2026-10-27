import React, { useState, useRef, useMemo } from 'react';
import { DailyResult } from '../types';
import { formatCurrency, formatCompactCurrency } from '../utils/calculator';
import { TrendingUp, Layers, Eye } from 'lucide-react';

interface GrowthChartProps {
  data: DailyResult[];
  initialPrincipal: number;
  currency: string;
}

export const GrowthChart: React.FC<GrowthChartProps> = ({
  data,
  initialPrincipal,
  currency,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [showLinearBaseline, setShowLinearBaseline] = useState<boolean>(true);
  const [chartMetric, setChartMetric] = useState<'balance' | 'profit' | 'cashout'>('balance');

  // Downsample if more than 365 days for smooth SVG rendering
  const displayData = useMemo(() => {
    if (data.length <= 365) return data;
    const step = Math.ceil(data.length / 300);
    const sampled: DailyResult[] = [];
    for (let i = 0; i < data.length; i += step) {
      sampled.push(data[i]);
    }
    // Always include the last day
    if (sampled[sampled.length - 1].dayIndex !== data[data.length - 1].dayIndex) {
      sampled.push(data[data.length - 1]);
    }
    return sampled;
  }, [data]);

  // Determine min and max
  const { minVal, maxVal, linearValues } = useMemo(() => {
    let min = 0;
    let max = 1;

    // Linear baseline: profit without compounding (simple interest)
    // Daily average simple rate = total gain if rate applied to principal only
    const linearVals: number[] = [];
    let linearAccum = initialPrincipal;

    displayData.forEach((d, idx) => {
      let val = d.endBalance;
      if (chartMetric === 'profit') val = d.cumulativeProfit;
      if (chartMetric === 'cashout') val = d.cumulativeCashOut;

      if (val > max) max = val;
      if (val < min) min = val;

      // Simple interest baseline calculation
      if (d.isTradingDay) {
        // daily profit based purely on initial principal
        linearAccum += (initialPrincipal * (d.dailyProfit / (d.startBalance || 1)));
      }
      linearVals.push(linearAccum);
    });

    max = Math.max(max * 1.05, initialPrincipal * 1.1);
    return { minVal: min, maxVal: max, linearValues: linearVals };
  }, [displayData, chartMetric, initialPrincipal]);

  // SVG dimensions
  const svgWidth = 800;
  const svgHeight = 320;
  const padding = { top: 30, right: 25, bottom: 40, left: 65 };
  const innerWidth = svgWidth - padding.left - padding.right;
  const innerHeight = svgHeight - padding.top - padding.bottom;

  // Scale functions
  const getX = (index: number) => {
    if (displayData.length <= 1) return padding.left;
    return padding.left + (index / (displayData.length - 1)) * innerWidth;
  };

  const getY = (val: number) => {
    if (maxVal === minVal) return padding.top + innerHeight / 2;
    const norm = (val - minVal) / (maxVal - minVal);
    return padding.top + (1 - norm) * innerHeight;
  };

  // Build path
  const pathD = useMemo(() => {
    if (displayData.length === 0) return '';
    const points = displayData.map((d, i) => {
      let val = d.endBalance;
      if (chartMetric === 'profit') val = d.cumulativeProfit;
      if (chartMetric === 'cashout') val = d.cumulativeCashOut;
      return `${getX(i)},${getY(val)}`;
    });

    return `M ${points.join(' L ')}`;
  }, [displayData, chartMetric, maxVal, minVal]);

  // Area path
  const areaD = useMemo(() => {
    if (displayData.length === 0) return '';
    const bottomY = padding.top + innerHeight;
    const startX = getX(0);
    const endX = getX(displayData.length - 1);
    return `${pathD} L ${endX},${bottomY} L ${startX},${bottomY} Z`;
  }, [pathD, displayData, innerHeight]);

  // Linear baseline path
  const linearPathD = useMemo(() => {
    if (!showLinearBaseline || linearValues.length === 0 || chartMetric !== 'balance') return '';
    const points = linearValues.map((val, i) => `${getX(i)},${getY(val)}`);
    return `M ${points.join(' L ')}`;
  }, [showLinearBaseline, linearValues, chartMetric, maxVal, minVal]);

  // Handle pointer tracking
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const relativeX = (clientX / rect.width) * svgWidth - padding.left;
    const ratio = Math.max(0, Math.min(1, relativeX / innerWidth));
    const targetIdx = Math.round(ratio * (displayData.length - 1));
    setHoverIndex(targetIdx);
  };

  const handlePointerLeave = () => {
    setHoverIndex(null);
  };

  const activePoint = hoverIndex !== null && displayData[hoverIndex] ? displayData[hoverIndex] : displayData[displayData.length - 1];
  const activePointIndex = hoverIndex !== null ? hoverIndex : displayData.length - 1;

  // Y-axis grid ticks
  const yTicks = [
    maxVal,
    minVal + (maxVal - minVal) * 0.75,
    minVal + (maxVal - minVal) * 0.5,
    minVal + (maxVal - minVal) * 0.25,
    minVal,
  ];

  return (
    <div className="apple-glass-card rounded-3xl p-5 sm:p-7 border border-white/10 space-y-4">
      {/* Chart Top Header & Metric Switches */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-pink-400" />
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Growth Trajectory
            </h3>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Interactive daily exponential compound curve
          </p>
        </div>

        {/* Metric Selector Tabs (Apple Segmented Style) */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 p-1 bg-[#0c0c10] rounded-xl border border-white/5">
            <button
              onClick={() => setChartMetric('balance')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                chartMetric === 'balance'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Account Balance
            </button>
            <button
              onClick={() => setChartMetric('profit')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                chartMetric === 'profit'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Profit
            </button>
            <button
              onClick={() => setChartMetric('cashout')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                chartMetric === 'cashout'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Banked Cash
            </button>
          </div>

          {/* Dotted Baseline Toggle */}
          {chartMetric === 'balance' && (
            <button
              onClick={() => setShowLinearBaseline(!showLinearBaseline)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                showLinearBaseline
                  ? 'bg-zinc-800/80 text-zinc-200 border-white/20'
                  : 'bg-zinc-900/60 text-zinc-500 border-white/5 hover:text-zinc-300'
              }`}
              title="Show simple interest baseline comparison"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Compounding vs Simple</span>
            </button>
          )}
        </div>
      </div>

      {/* Floating Active Inspector Bar */}
      {activePoint && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#0d0d12]/90 rounded-2xl border border-white/5 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-pink-400 bg-pink-500/15 px-2 py-0.5 rounded-md border border-pink-500/30">
              Day {activePoint.dayIndex}
            </span>
            <span className="text-zinc-300 font-medium">{activePoint.dateString}</span>
            <span className="text-zinc-500" aria-hidden="true">·</span>
            <span className="text-zinc-400">{activePoint.dayOfWeek}</span>
            {!activePoint.isTradingDay && (
              <span className="text-[10px] text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">
                Weekend / Day Off
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-zinc-500 mr-1.5">Balance:</span>
              <span className="font-bold text-white">
                {formatCurrency(activePoint.endBalance, currency)}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 mr-1.5">Today Profit:</span>
              <span className="font-semibold text-emerald-400">
                +{formatCurrency(activePoint.dailyProfit, currency)}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 mr-1.5">Total Return:</span>
              <span className="font-semibold text-pink-400">
                +{activePoint.totalRoiPercentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SVG Chart Area */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden select-none touch-none"
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible cursor-crosshair"
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          <defs>
            {/* Neon Pink Gradient for Fill */}
            <linearGradient id="pinkChartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.38" />
              <stop offset="60%" stopColor="#f43f5e" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#070709" stopOpacity="0.0" />
            </linearGradient>

            {/* Glowing Pink Filter */}
            <filter id="pinkGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#ec4899" floodOpacity="0.7" />
            </filter>
          </defs>

          {/* Horizontal Gridlines & Y-Axis Labels */}
          {yTicks.map((tick, i) => {
            const y = getY(tick);
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={svgWidth - padding.right}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.06)"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] font-mono fill-zinc-500 font-medium"
                >
                  {formatCompactCurrency(tick, currency)}
                </text>
              </g>
            );
          })}

          {/* Linear Non-Compounding Baseline (Comparison) */}
          {linearPathD && (
            <path
              d={linearPathD}
              fill="none"
              stroke="#71717a"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.6"
            />
          )}

          {/* Area Fill */}
          {areaD && (
            <path d={areaD} fill="url(#pinkChartGrad)" />
          )}

          {/* Main Exponential Curve */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="#ec4899"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#pinkGlowFilter)"
            />
          )}

          {/* Crosshair & Active Hover Indicator */}
          {activePointIndex !== null && (
            <g>
              {/* Vertical scrub line */}
              <line
                x1={getX(activePointIndex)}
                y1={padding.top}
                x2={getX(activePointIndex)}
                y2={padding.top + innerHeight}
                stroke="#ec4899"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.8"
              />

              {/* Active data point glowing circle */}
              <circle
                cx={getX(activePointIndex)}
                cy={getY(
                  chartMetric === 'profit'
                    ? activePoint.cumulativeProfit
                    : chartMetric === 'cashout'
                    ? activePoint.cumulativeCashOut
                    : activePoint.endBalance
                )}
                r="6"
                fill="#ffffff"
                stroke="#ec4899"
                strokeWidth="3"
                filter="url(#pinkGlowFilter)"
              />
            </g>
          )}

          {/* X-Axis Dates Labels */}
          {displayData.length > 0 && (
            <g>
              <text
                x={getX(0)}
                y={svgHeight - 10}
                textAnchor="start"
                className="text-[10px] font-mono fill-zinc-500"
              >
                {displayData[0].dateString}
              </text>
              <text
                x={getX(Math.floor(displayData.length / 2))}
                y={svgHeight - 10}
                textAnchor="middle"
                className="text-[10px] font-mono fill-zinc-500"
              >
                Day {displayData[Math.floor(displayData.length / 2)].dayIndex}
              </text>
              <text
                x={getX(displayData.length - 1)}
                y={svgHeight - 10}
                textAnchor="end"
                className="text-[10px] font-mono fill-zinc-500"
              >
                {displayData[displayData.length - 1].dateString}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Legend & Annotation */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400 pt-2 border-t border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-pink-500 rounded-full shadow-[0_0_8px_#ec4899]" />
            <span className="text-zinc-300 font-medium">Compound Trajectory</span>
          </div>
          {showLinearBaseline && chartMetric === 'balance' && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-b border-dashed border-zinc-400" />
              <span>Simple (Non-Compounded) Baseline</span>
            </div>
          )}
        </div>
        <div className="text-[11px] text-zinc-500 font-mono">
          Hover or drag across chart to inspect day-by-day stats
        </div>
      </div>
    </div>
  );
};
