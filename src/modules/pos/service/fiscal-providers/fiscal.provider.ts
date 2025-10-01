import { FiscalizeResult, FiscalStatus } from '../../types';

/**
 * Abstract Fiscal Provider Interface
 * 
 * Defines the contract for all fiscal providers in the POS system.
 * Each provider must implement the fiscalize method to handle
 * fiscal receipt generation for sales transactions.
 */
export interface FiscalProvider {
  /**
   * Fiscalize a sale transaction
   * @param sale - Sale transaction data
   * @returns Promise resolving to fiscalization result
   */
  fiscalize(sale: any): Promise<FiscalizeResult>;
}
