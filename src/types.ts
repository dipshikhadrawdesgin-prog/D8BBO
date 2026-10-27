export type RatePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type CashFlowPeriod = 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
export type TableViewMode = 'daily' | 'weekly' | 'monthly';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate?: number;
}

export interface CalculationInput {
  principal: number; // a
  interestRate: number; // p
  ratePeriod: RatePeriod; // pp
  years: number; // y
  months: number; // m
  days: number; // d
  reinvestRate: number; // dr (0 - 100%)
  includeWeekends: boolean; // iw ('y' or 'n')
  daysOff: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  startDate: string; // YYYY-MM-DD
  currency: string; // symbol e.g. '$'
  
  // Regular Deposits
  depositAmount: number; // md
  depositPeriod: CashFlowPeriod; // rp
  
  // Regular Withdrawals
  withdrawalAmount: number; // rw
  withdrawalPeriod: CashFlowPeriod; // rwp
  
  // One-off deposit
  oneOffDeposit: number; // od
  oneOffDepositDate: string; // odd
  
  // Optional tax/fee rate
  taxRate: number; // rt
}

export interface DailyResult {
  dayIndex: number; // 1, 2, 3...
  tradingDayIndex: number; // count of actual trading days
  date: Date;
  dateString: string;
  dayOfWeek: string;
  isWeekend: boolean;
  isTradingDay: boolean;
  startBalance: number;
  dailyProfit: number;
  reinvestedProfit: number;
  cashOutProfit: number;
  deposit: number;
  withdrawal: number;
  endBalance: number;
  cumulativeProfit: number;
  cumulativeDeposits: number;
  cumulativeCashOut: number;
  totalRoiPercentage: number;
}

export interface Milestone {
  label: string;
  targetBalance: number;
  reachedDay?: number;
  reachedDate?: string;
  multiplier: number;
}

export interface CalculationSummary {
  initialPrincipal: number;
  finalBalance: number;
  totalProfitEarned: number;
  totalReinvested: number;
  totalCashOut: number;
  totalDeposited: number;
  totalWithdrawn: number;
  netProfit: number;
  totalGainPercent: number;
  totalCalendarDays: number;
  totalTradingDays: number;
  averageDailyProfit: number;
  averageDailyPercent: number;
  multiplier: number;
  milestones: Milestone[];
  dailySchedule: DailyResult[];
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  tag: string;
  params: Partial<CalculationInput>;
}
