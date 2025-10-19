/**
 * POS Module Constants
 * 
 * Centralized constants for the POS module
 */

// ============================================================================
// SALE CONSTANTS
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
 * Sale status values
 */
export const SALE_STATUS = {
    FINAL: 'final',
    REFUNDED: 'refunded',
    PARTIAL_REFUND: 'partial_refund'
} as const;

/**
 * Sale item types
 */
export const SALE_ITEM_TYPES = {
    SERVICE: 'service',
    PRODUCT: 'product'
} as const;

// ============================================================================
// PAYMENT CONSTANTS
// ============================================================================

/**
 * Payment method values
 */
export const PAYMENT_METHODS = {
    CASH: 'cash',
    CARD: 'card',
    VOUCHER: 'voucher',
    GIFT: 'gift',
    BANK: 'bank',
    OTHER: 'other'
} as const;

// ============================================================================
// FISCAL CONSTANTS
// ============================================================================

/**
 * Fiscal status values
 */
export const FISCAL_STATUS = {
    PENDING: 'pending',
    SUCCESS: 'success',
    ERROR: 'error',
    RETRY: 'retry'
} as const;

/**
 * Default fiscal configuration
 */
export const DEFAULT_FISCAL_CONFIG = {
    status: FISCAL_STATUS.PENDING,
    correlationId: ''
} as const;

/**
 * Fiscal retry timeout (in minutes)
 */
export const FISCAL_RETRY_TIMEOUT = 10;

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

/**
 * Minimum and maximum values for validation
 */
export const VALIDATION_LIMITS = {
    MIN_QUANTITY: 0.01,
    MAX_QUANTITY: 999999,
    MIN_PRICE: 0,
    MAX_PRICE: 999999999,
    MIN_DISCOUNT: 0,
    MAX_DISCOUNT: 100,
    MIN_TAX_RATE: 0,
    MAX_TAX_RATE: 100,
    MAX_NOTE_LENGTH: 500,
    MAX_ITEM_NAME_LENGTH: 200
} as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

/**
 * Common error messages
 */
export const ERROR_MESSAGES = {
    SALE_NOT_FOUND: 'Prodaja nije pronađena',
    INVALID_SALE_ID: 'Neispravan ID prodaje',
    NO_OPEN_SESSION: 'Nema otvorene blagajničke sesije',
    APPOINTMENT_ALREADY_PAID: 'Termin je već naplaćen',
    INSUFFICIENT_STOCK: 'Nema dovoljno zaliha',
    CANNOT_REFUND_FINAL: 'Može se refundirati samo završena transakcija',
    CANNOT_REFUND_UNFISCALIZED: 'Može se refundirati samo fiskalizovana transakcija',
    REFUND_ALREADY_EXISTS: 'Već postoji refund za ovu transakciju',
    INVALID_REFUND_QUANTITY: 'Ne možeš refundirati više nego što je prodato',
    ALREADY_FISCALIZED: 'Račun je već fiskalizovan',
    FISCALIZATION_NOT_FOUND: 'Prodaja nema fiskalizaciju za resetovanje'
} as const;

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

/**
 * Common success messages
 */
export const SUCCESS_MESSAGES = {
    SALE_CREATED: 'Prodaja je uspešno kreirana',
    SALE_REFUNDED: 'Prodaja je uspešno refundirana',
    SALE_FISCALIZED: 'Prodaja je uspešno fiskalizovana',
    FISCALIZATION_RESET: 'Fiskalizacija je resetovana',
    PENDING_FISCALIZATIONS_RESET: 'Pending fiskalizacije su resetovane'
} as const;

