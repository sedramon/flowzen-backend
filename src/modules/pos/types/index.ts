/**
 * POS Module Types
 * 
 * Centralized type definitions for the POS module
 */

// ============================================================================
// USER & AUTHENTICATION TYPES
// ============================================================================

/**
 * JWT User Payload Interface
 * Represents the authenticated user data from JWT token
 */
export interface JwtUserPayload {
  userId: string;
  username: string;
  tenant: string;
  role: string;
  scopes: string[];
}

// ============================================================================
// CASH SESSION TYPES
// ============================================================================

/**
 * Cash Session Status Enum
 */
export type CashSessionStatus = 'open' | 'closed';

/**
 * Payment Totals Interface
 */
export interface PaymentTotals {
  cash: number;
  card: number;
  voucher: number;
  gift: number;
  bank: number;
  other: number;
}

/**
 * Cash Session Summary Interface
 */
export interface CashSessionSummary {
  id: string;
  variance: number;
  expectedCash: number;
  closingCount: number;
  closedAt: Date | string;
  totalsByMethod: PaymentTotals;
  summary: {
    openingFloat: number;
    totalSales: number;
    closingCount: number;
    variance: number;
    variancePercentage: number;
  };
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

/**
 * Analytics Period Types
 */
export type AnalyticsPeriod = '1d' | '7d' | '30d' | '90d' | '1y' | 'custom';

/**
 * Analytics Query Parameters
 */
export interface AnalyticsQuery {
  facility?: string;
  period?: AnalyticsPeriod;
  type?: 'sales' | 'cash-flow' | 'performance' | 'general';
  dateFrom?: string;
  dateTo?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Date Range Interface
 */
export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Sales Analytics Interface
 */
export interface SalesAnalytics {
  totalSales: number;
  totalTransactions?: number;
  averageTransaction?: number;
  salesByMethod?: PaymentTotals;
  salesByService?: Array<{
    serviceId: string;
    serviceName: string;
    count: number;
    revenue: number;
  }>;
  salesTrend?: Array<{
    date: string;
    sales: number;
    transactions: number;
  }>;
  topServices?: Array<{
    serviceId: string;
    serviceName: string;
    revenue: number;
    count: number;
  }>;
  totalRevenue?: number;
  averageSaleValue?: number;
  paymentMethods?: Array<{
    method: string;
    amount: number;
    percentage: number;
  }>;
  dailySales?: Array<{
    date: string;
    totalSales: number;
    revenue: number;
  }>;
  period: AnalyticsPeriod;
  dateRange: DateRange;
}

/**
 * Cash Flow Analytics Interface
 */
export interface CashFlowAnalytics {
  totalCash: number;
  totalVariance: number;
  averageVariance: number;
  variancePercentage?: number;
  cashFlowTrend?: Array<{
    date: string;
    openingFloat: number;
    closingCount: number;
    variance: number;
  }>;
  sessionCount?: number;
  averageSessionDuration?: number;
  dailyFlow?: Array<{
    date: string;
    totalCash: number;
    variance: number;
    sessions: number;
  }>;
  period: AnalyticsPeriod;
  dateRange: DateRange;
}

/**
 * Performance Analytics Interface
 */
export interface PerformanceAnalytics {
  totalRevenue?: number;
  totalTransactions?: number;
  averageTransactionValue?: number;
  peakHours?: Array<{
    hour: number;
    transactions: number;
    revenue: number;
  }>;
  paymentMethodDistribution?: PaymentTotals;
  dailyPerformance?: Array<{
    date: string;
    revenue: number;
    transactions: number;
    averageValue: number;
  }>;
  averageSessionDuration?: number;
  varianceEfficiency?: number;
  sessionProductivity?: number;
  period: AnalyticsPeriod;
  dateRange: DateRange;
}

/**
 * General Analytics Interface
 */
export interface GeneralAnalytics {
  overview?: {
    totalRevenue: number;
    totalTransactions: number;
    totalSessions: number;
    averageTransactionValue: number;
  };
  sales?: SalesAnalytics;
  cashFlow?: CashFlowAnalytics;
  performance?: PerformanceAnalytics;
  period?: AnalyticsPeriod;
  dateRange?: DateRange;
  // Legacy properties for backward compatibility
  totalSessions?: number;
  totalCash?: number;
  averageVariance?: number;
  varianceTrend?: 'improving' | 'stable' | 'declining';
  topPerformingFacility?: any;
  cashFlowEfficiency?: number;
  recommendations?: string[];
}

// ============================================================================
// REPORTS TYPES
// ============================================================================

/**
 * Daily Report Interface
 */
export interface DailyReport {
  date: string;
  facility: string;
  summary: {
    totalSales: number;
    totalRefunds: number;
    netTotal: number;
    transactionCount: number;
    refundCount: number;
  };
  paymentTotals: PaymentTotals;
  topServices: Array<{
    serviceId: string;
    serviceName: string;
    count: number;
    revenue: number;
  }>;
  hourlyBreakdown: Array<{
    hour: number;
    sales: number;
    transactions: number;
  }>;
}

/**
 * Sales Report Interface
 */
export interface SalesReport {
  period: {
    start: Date;
    end: Date;
  };
  facility: string;
  summary: {
    totalRevenue: number;
    totalTransactions: number;
    averageTransactionValue: number;
    refundCount: number;
    refundAmount: number;
  };
  dailyBreakdown: Array<{
    date: string;
    revenue: number;
    transactions: number;
    refunds: number;
  }>;
  paymentMethodBreakdown: PaymentTotals;
  serviceBreakdown: Array<{
    serviceId: string;
    serviceName: string;
    count: number;
    revenue: number;
    percentage: number;
  }>;
}

/**
 * Cash Flow Report Interface
 */
export interface CashFlowReport {
  period: {
    start: Date;
    end: Date;
  };
  facility: string;
  summary: {
    totalCash: number;
    totalVariance: number;
    averageVariance: number;
    sessionCount: number;
  };
  dailyCashFlow: Array<{
    date: string;
    openingFloat: number;
    closingCount: number;
    variance: number;
    sessionCount: number;
  }>;
  varianceAnalysis: {
    acceptable: number;
    warning: number;
    critical: number;
    severe: number;
  };
}

/**
 * Z-Report Interface
 */
export interface ZReport {
  sessionId: string;
  openedAt: Date;
  closedAt: Date;
  cashier: string;
  salesCount: number;
  refundCount: number;
  totalSales: number;
  totalRefunds: number;
  paymentTotals: PaymentTotals;
  openingFloat: number;
  closingCount: number;
  expectedCash: number;
  variance: number;
}

// ============================================================================
// SALE TYPES
// ============================================================================

/**
 * Sale Item Type Enum
 */
export type SaleItemType = 'service' | 'product';

/**
 * Sale Status Enum
 */
export type SaleStatus = 'final' | 'refunded' | 'partial_refund';

/**
 * Payment Method Enum
 */
export type PaymentMethod = 'cash' | 'card' | 'voucher' | 'gift' | 'bank' | 'other';

/**
 * Sale Item Details Interface
 */
export interface SaleItemDetails {
  refId: string;
  type: SaleItemType;
  name: string;
  qty: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  total: number;
}

/**
 * Sale Summary Interface
 */
export interface SaleSummary {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  tip: number;
  grandTotal: number;
}

/**
 * Payment Details Interface
 */
export interface PaymentDetails {
  method: PaymentMethod;
  amount: number;
  change?: number;
  externalRef?: string;
}

/**
 * Fiscal Status Enum
 */
export type FiscalStatus = 'pending' | 'success' | 'error' | 'retry';

/**
 * Fiscalize Result Interface
 */
export interface FiscalizeResult {
  status: FiscalStatus;
  fiscalNumber?: string;
  correlationId?: string;
  error?: string;
  responsePayload?: any;
}

/**
 * Fiscal Information Interface
 */
export interface FiscalInfo {
  status: FiscalStatus;
  correlationId: string;
  fiscalNumber?: string;
  error?: string;
  processedAt?: Date;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Standard POS API Response Interface
 */
export interface PosApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

// ============================================================================
// QUERY PARAMETER TYPES
// ============================================================================

/**
 * POS Query Parameters Interface
 */
export interface PosQueryParams {
  facility?: string;
  tenant?: string;
  dateFrom?: string;
  dateTo?: string;
  period?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Sale number prefixes
 */
export const SALE_PREFIXES = {
    SALE: 'POS-',
    REFUND: 'REF-',
    FISCAL_REFUND: 'REF-FISC-'
} as const;

/**
 * Default fiscal configuration
 */
export const DEFAULT_FISCAL_CONFIG = {
    status: 'pending' as FiscalStatus,
    correlationId: ''
} as const;
