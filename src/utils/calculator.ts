import { CalculationInput, CalculationSummary, DailyResult, Milestone, Preset } from '../types';

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (A$)' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar (C$)' },
  { code: 'USDT', symbol: '₮', name: 'Tether (USDT)' },
  { code: 'BTC', symbol: '₿', name: 'Bitcoin (BTC)' },
];

export const PRESETS: Preset[] = [
  {
    id: 'user-default',
    name: '30-Day Growth ($170 @ 5%)',
    description: 'The exact initial configuration: $170 capital with 5% daily compounding over 1 month.',
    tag: 'Popular',
    params: {
      principal: 170,
      interestRate: 5,
      ratePeriod: 'daily',
      years: 0,
      months: 1,
      days: 0,
      reinvestRate: 100,
      includeWeekends: true,
      startDate: '2025-10-09',
    },
  },
  {
    id: 'forex-1percent',
    name: 'Forex 1% Daily (5-Day Market)',
    description: 'Classic professional Forex compounding. Weekends excluded (Mon–Fri).',
    tag: 'Forex',
    params: {
      principal: 1000,
      interestRate: 1,
      ratePeriod: 'daily',
      years: 0,
      months: 3,
      days: 0,
      reinvestRate: 90,
      includeWeekends: false,
    },
  },
  {
    id: 'crypto-2percent',
    name: 'Crypto 2.5% Daily (24/7)',
    description: 'High-frequency spot/futures trading across all 7 calendar days.',
    tag: 'Crypto',
    params: {
      principal: 500,
      interestRate: 2.5,
      ratePeriod: 'daily',
      years: 0,
      months: 2,
      days: 0,
      reinvestRate: 80,
      includeWeekends: true,
    },
  },
  {
    id: 'prop-firm',
    name: 'Prop Firm 0.5% Consistency',
    description: 'Conservative capital preservation for funded accounts with regular withdrawals.',
    tag: 'Funded',
    params: {
      principal: 10000,
      interestRate: 0.5,
      ratePeriod: 'daily',
      years: 0,
      months: 6,
      days: 0,
      reinvestRate: 70,
      includeWeekends: false,
      withdrawalAmount: 500,
      withdrawalPeriod: 'monthly',
    },
  },
  {
    id: 'hundred-days',
    name: 'The 100-Day Challenge',
    description: '$200 starting balance @ 3% daily target for 100 continuous trading days.',
    tag: 'Challenge',
    params: {
      principal: 200,
      interestRate: 3,
      ratePeriod: 'daily',
      years: 0,
      months: 0,
      days: 100,
      reinvestRate: 100,
      includeWeekends: true,
    },
  },
];

export const DEFAULT_INPUT: CalculationInput = {
  principal: 170,
  interestRate: 5,
  ratePeriod: 'daily',
  years: 0,
  months: 1,
  days: 0,
  reinvestRate: 100,
  includeWeekends: true,
  daysOff: [],
  startDate: '2025-10-09',
  currency: '$',
  depositAmount: 0,
  depositPeriod: 'monthly',
  withdrawalAmount: 0,
  withdrawalPeriod: 'monthly',
  oneOffDeposit: 0,
  oneOffDepositDate: '',
  taxRate: 0,
};

/**
 * Parses query params matching www.thecalculatorsite.com/dailycompound?a=170&p=5...
 */
export function parseUrlParams(search: string): Partial<CalculationInput> {
  const params = new URLSearchParams(search);
  const result: Partial<CalculationInput> = {};

  if (params.has('a')) {
    const val = parseFloat(params.get('a') || '');
    if (!isNaN(val) && val >= 0) result.principal = val;
  }
  if (params.has('p')) {
    const val = parseFloat(params.get('p') || '');
    if (!isNaN(val) && val >= 0) result.interestRate = val;
  }
  if (params.has('pp')) {
    const pp = params.get('pp')?.toLowerCase();
    if (pp === 'daily' || pp === 'weekly' || pp === 'monthly' || pp === 'yearly') {
      result.ratePeriod = pp;
    }
  }
  if (params.has('y')) {
    const y = parseInt(params.get('y') || '', 10);
    if (!isNaN(y) && y >= 0) result.years = y;
  }
  if (params.has('m')) {
    const m = parseInt(params.get('m') || '', 10);
    if (!isNaN(m) && m >= 0) result.months = m;
  }
  if (params.has('d')) {
    const d = parseInt(params.get('d') || '', 10);
    if (!isNaN(d) && d >= 0) result.days = d;
  }
  if (params.has('dr')) {
    const dr = parseFloat(params.get('dr') || '');
    if (!isNaN(dr) && dr >= 0 && dr <= 100) result.reinvestRate = dr;
  }
  if (params.has('iw')) {
    const iw = params.get('iw')?.toLowerCase();
    result.includeWeekends = iw === 'y' || iw === 'true' || iw === '1';
  }
  if (params.has('sd')) {
    const sd = params.get('sd');
    if (sd && /^\d{4}-\d{2}-\d{2}$/.test(sd)) result.startDate = sd;
  }
  if (params.has('md')) {
    const md = parseFloat(params.get('md') || '');
    if (!isNaN(md) && md >= 0) result.depositAmount = md;
  }
  if (params.has('rp')) {
    const rp = params.get('rp')?.toLowerCase();
    if (rp === 'daily' || rp === 'weekly' || rp === 'monthly' || rp === 'yearly') {
      result.depositPeriod = rp;
    }
  }
  if (params.has('rw')) {
    const rw = parseFloat(params.get('rw') || '');
    if (!isNaN(rw) && rw >= 0) result.withdrawalAmount = rw;
  }
  if (params.has('rwp')) {
    const rwp = params.get('rwp')?.toLowerCase();
    if (rwp === 'daily' || rwp === 'weekly' || rwp === 'monthly' || rwp === 'yearly') {
      result.withdrawalPeriod = rwp;
    }
  }
  if (params.has('c')) {
    const c = params.get('c');
    if (c === '1') result.currency = '$';
    else if (c === '2') result.currency = '€';
    else if (c === '3') result.currency = '£';
    else if (c) result.currency = c;
  }

  return result;
}

/**
 * Builds shareable URL query string mirroring the original calculator
 */
export function buildUrlParams(input: CalculationInput): string {
  const p = new URLSearchParams();
  p.set('a', input.principal.toString());
  p.set('p', input.interestRate.toString());
  p.set('pp', input.ratePeriod);
  p.set('y', input.years.toString());
  p.set('m', input.months.toString());
  p.set('d', input.days.toString());
  p.set('dr', input.reinvestRate.toString());
  p.set('iw', input.includeWeekends ? 'y' : 'n');
  if (input.daysOff && input.daysOff.length > 0) {
    p.set('do', input.daysOff.join(','));
  }
  p.set('sd', input.startDate);
  p.set('c', input.currency === '$' ? '1' : input.currency === '€' ? '2' : input.currency === '£' ? '3' : input.currency);
  if (input.depositAmount > 0) {
    p.set('md', input.depositAmount.toString());
    p.set('rp', input.depositPeriod);
  }
  if (input.withdrawalAmount > 0) {
    p.set('rw', input.withdrawalAmount.toString());
    p.set('rwp', input.withdrawalPeriod);
  }
  if (input.oneOffDeposit > 0 && input.oneOffDepositDate) {
    p.set('od', input.oneOffDeposit.toString());
    p.set('odd', input.oneOffDepositDate);
  }
  return p.toString();
}

/**
 * Main Calculation Engine
 */
export function calculateCompounding(input: CalculationInput): CalculationSummary {
  const {
    principal,
    interestRate,
    ratePeriod,
    years,
    months,
    days,
    reinvestRate,
    includeWeekends,
    daysOff,
    startDate,
    depositAmount,
    depositPeriod,
    withdrawalAmount,
    withdrawalPeriod,
    oneOffDeposit,
    oneOffDepositDate,
    taxRate,
  } = input;

  // Compute total duration in calendar days based on start date
  const start = new Date(startDate ? `${startDate}T00:00:00` : new Date());
  if (isNaN(start.getTime())) {
    start.setTime(Date.now());
  }

  // Calculate target end date
  const targetEnd = new Date(start);
  targetEnd.setFullYear(targetEnd.getFullYear() + (years || 0));
  targetEnd.setMonth(targetEnd.getMonth() + (months || 0));
  targetEnd.setDate(targetEnd.getDate() + (days || 0));

  // Determine number of calendar days
  let totalCalendarDays = Math.round((targetEnd.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (totalCalendarDays <= 0) {
    // default to 30 days if everything is 0
    totalCalendarDays = 30;
  }
  // Cap at 3650 days (10 years) for UI performance
  totalCalendarDays = Math.min(totalCalendarDays, 3650);

  // Determine rate per trading day
  let effectiveDailyRate = 0;
  if (ratePeriod === 'daily') {
    effectiveDailyRate = interestRate / 100;
  } else if (ratePeriod === 'weekly') {
    effectiveDailyRate = (interestRate / 100) / (includeWeekends ? 7 : 5);
  } else if (ratePeriod === 'monthly') {
    effectiveDailyRate = (interestRate / 100) / (includeWeekends ? 30.416 : 21.6);
  } else if (ratePeriod === 'yearly') {
    effectiveDailyRate = (interestRate / 100) / (includeWeekends ? 365 : 260);
  }

  const reinvestMultiplier = Math.max(0, Math.min(100, reinvestRate)) / 100;
  const cashOutMultiplier = 1 - reinvestMultiplier;
  const taxMultiplier = taxRate > 0 ? (1 - Math.min(100, taxRate) / 100) : 1;

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dailySchedule: DailyResult[] = [];

  let currentBalance = Math.max(0, principal);
  let cumulativeProfit = 0;
  let cumulativeReinvested = 0;
  let cumulativeCashOut = 0;
  let cumulativeDeposits = 0;
  let cumulativeWithdrawals = 0;
  let tradingDaysCount = 0;

  // Milestones tracking
  const target2x = principal * 2;
  const target3x = principal * 3;
  const target5x = principal * 5;
  const target10x = principal * 10;
  const target50x = principal * 50;
  const target100x = principal * 100;

  const milestones: Milestone[] = [
    { label: '2x Double Capital', targetBalance: target2x, multiplier: 2 },
    { label: '3x Triple Account', targetBalance: target3x, multiplier: 3 },
    { label: '5x Scale Target', targetBalance: target5x, multiplier: 5 },
    { label: '10x Deca Growth', targetBalance: target10x, multiplier: 10 },
    { label: '50x High Growth', targetBalance: target50x, multiplier: 50 },
    { label: '100x Century Mark', targetBalance: target100x, multiplier: 100 },
  ];

  for (let i = 1; i <= totalCalendarDays; i++) {
    const dayDate = new Date(start);
    dayDate.setDate(dayDate.getDate() + i);

    const dayOfWeekIndex = dayDate.getDay();
    const dayOfWeekName = dayNames[dayOfWeekIndex];
    const isWeekend = dayOfWeekIndex === 0 || dayOfWeekIndex === 6;

    // Check if trading day
    let isTradingDay = true;
    if (!includeWeekends && isWeekend) {
      isTradingDay = false;
    }
    if (daysOff && daysOff.includes(dayOfWeekIndex)) {
      isTradingDay = false;
    }

    const startBalanceToday = currentBalance;
    let profitToday = 0;
    let reinvestToday = 0;
    let cashOutToday = 0;

    if (isTradingDay && currentBalance > 0) {
      tradingDaysCount++;
      const rawProfit = startBalanceToday * effectiveDailyRate;
      profitToday = rawProfit * taxMultiplier;
      reinvestToday = profitToday * reinvestMultiplier;
      cashOutToday = profitToday * cashOutMultiplier;
    }

    // Check cash flows on this day
    let depToday = 0;
    let withToday = 0;

    // Regular deposit logic
    if (depositAmount > 0 && depositPeriod !== 'none') {
      if (depositPeriod === 'daily' && (isTradingDay || includeWeekends)) {
        depToday += depositAmount;
      } else if (depositPeriod === 'weekly' && (i % 7 === 0 || i === totalCalendarDays)) {
        depToday += depositAmount;
      } else if (depositPeriod === 'biweekly' && (i % 14 === 0)) {
        depToday += depositAmount;
      } else if (depositPeriod === 'monthly' && (dayDate.getDate() === start.getDate() || i % 30 === 0)) {
        depToday += depositAmount;
      } else if (depositPeriod === 'yearly' && (i % 365 === 0)) {
        depToday += depositAmount;
      }
    }

    // Regular withdrawal logic
    if (withdrawalAmount > 0 && withdrawalPeriod !== 'none') {
      if (withdrawalPeriod === 'daily' && (isTradingDay || includeWeekends)) {
        withToday += withdrawalAmount;
      } else if (withdrawalPeriod === 'weekly' && (i % 7 === 0)) {
        withToday += withdrawalAmount;
      } else if (withdrawalPeriod === 'biweekly' && (i % 14 === 0)) {
        withToday += withdrawalAmount;
      } else if (withdrawalPeriod === 'monthly' && (dayDate.getDate() === start.getDate() || i % 30 === 0)) {
        withToday += withdrawalAmount;
      } else if (withdrawalPeriod === 'yearly' && (i % 365 === 0)) {
        withToday += withdrawalAmount;
      }
    }

    // One off deposit
    const dateStr = dayDate.toISOString().split('T')[0];
    if (oneOffDeposit > 0 && oneOffDepositDate && oneOffDepositDate === dateStr) {
      depToday += oneOffDeposit;
    }

    // Cap withdrawal if it exceeds available balance
    withToday = Math.min(withToday, startBalanceToday + reinvestToday + depToday);

    const endBalanceToday = Math.max(0, startBalanceToday + reinvestToday + depToday - withToday);

    cumulativeProfit += profitToday;
    cumulativeReinvested += reinvestToday;
    cumulativeCashOut += cashOutToday;
    cumulativeDeposits += depToday;
    cumulativeWithdrawals += withToday;

    const totalInvestedSoFar = principal + cumulativeDeposits;
    const totalRoi = totalInvestedSoFar > 0
      ? ((endBalanceToday + cumulativeCashOut - totalInvestedSoFar) / totalInvestedSoFar) * 100
      : 0;

    dailySchedule.push({
      dayIndex: i,
      tradingDayIndex: tradingDaysCount,
      date: dayDate,
      dateString: dateStr,
      dayOfWeek: dayOfWeekName,
      isWeekend,
      isTradingDay,
      startBalance: startBalanceToday,
      dailyProfit: profitToday,
      reinvestedProfit: reinvestToday,
      cashOutProfit: cashOutToday,
      deposit: depToday,
      withdrawal: withToday,
      endBalance: endBalanceToday,
      cumulativeProfit,
      cumulativeDeposits,
      cumulativeCashOut,
      totalRoiPercentage: totalRoi,
    });

    // Check milestones
    for (const m of milestones) {
      if (!m.reachedDay && endBalanceToday >= m.targetBalance) {
        m.reachedDay = i;
        m.reachedDate = dateStr;
      }
    }

    currentBalance = endBalanceToday;
  }

  const finalBalance = currentBalance;
  const netProfit = cumulativeProfit;
  const totalGainPercent = principal > 0 ? ((finalBalance + cumulativeCashOut - principal - cumulativeDeposits) / (principal + cumulativeDeposits)) * 100 : 0;
  const avgDailyProfit = tradingDaysCount > 0 ? cumulativeProfit / tradingDaysCount : 0;
  const avgDailyPercent = tradingDaysCount > 0 && principal > 0 ? (cumulativeProfit / (principal * tradingDaysCount)) * 100 : 0;
  const multiplier = principal > 0 ? finalBalance / principal : 0;

  return {
    initialPrincipal: principal,
    finalBalance,
    totalProfitEarned: cumulativeProfit,
    totalReinvested: cumulativeReinvested,
    totalCashOut: cumulativeCashOut,
    totalDeposited: cumulativeDeposits,
    totalWithdrawn: cumulativeWithdrawals,
    netProfit,
    totalGainPercent,
    totalCalendarDays,
    totalTradingDays: tradingDaysCount,
    averageDailyProfit: avgDailyProfit,
    averageDailyPercent: avgDailyPercent,
    multiplier,
    milestones,
    dailySchedule,
  };
}

/**
 * Currency Formatter
 */
export function formatCurrency(amount: number, symbol: string = '$', decimals: number = 2): string {
  if (isNaN(amount) || !isFinite(amount)) return `${symbol}0.00`;
  
  // Format with commas
  const parts = Math.abs(amount).toFixed(decimals).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const sign = amount < 0 ? '-' : '';
  return `${sign}${symbol}${parts.join('.')}`;
}

export function formatCompactCurrency(amount: number, symbol: string = '$'): string {
  if (isNaN(amount) || !isFinite(amount)) return `${symbol}0`;
  if (Math.abs(amount) >= 1_000_000_000) {
    return `${symbol}${(amount / 1_000_000_000).toFixed(2)}B`;
  }
  if (Math.abs(amount) >= 1_000_000) {
    return `${symbol}${(amount / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(amount) >= 10_000) {
    return `${symbol}${(amount / 1_000).toFixed(1)}k`;
  }
  return formatCurrency(amount, symbol, 2);
}

/**
 * Generate CSV for download
 */
export function generateCsvData(summary: CalculationSummary, currency: string): string {
  const headers = [
    'Day',
    'Trading Day',
    'Date',
    'Day of Week',
    'Is Trading Day',
    `Start Balance (${currency})`,
    `Daily Profit (${currency})`,
    `Reinvested (${currency})`,
    `Cash Out (${currency})`,
    `Deposits (${currency})`,
    `Withdrawals (${currency})`,
    `Ending Balance (${currency})`,
    `Cumulative Profit (${currency})`,
    'Total ROI %',
  ];

  const rows = summary.dailySchedule.map((d) => [
    d.dayIndex,
    d.isTradingDay ? d.tradingDayIndex : '-',
    d.dateString,
    d.dayOfWeek,
    d.isTradingDay ? 'Yes' : 'No',
    d.startBalance.toFixed(2),
    d.dailyProfit.toFixed(2),
    d.reinvestedProfit.toFixed(2),
    d.cashOutProfit.toFixed(2),
    d.deposit.toFixed(2),
    d.withdrawal.toFixed(2),
    d.endBalance.toFixed(2),
    d.cumulativeProfit.toFixed(2),
    `${d.totalRoiPercentage.toFixed(2)}%`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
