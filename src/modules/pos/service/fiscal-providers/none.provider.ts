import { FiscalProvider } from './fiscal.provider';
import { FiscalizeResult } from '../../types';

/**
 * None Fiscal Provider
 * 
 * A no-op fiscal provider that simulates successful fiscalization
 * without actually sending data to any fiscal system.
 * Used for testing or when fiscalization is disabled.
 */
export class NoneFiscalProvider implements FiscalProvider {
    /**
   * Simulate fiscalization without actual fiscal processing
   * @param sale - Sale transaction data
   * @returns Promise resolving to successful fiscalization result
   */
    async fiscalize(sale: any): Promise<FiscalizeResult> {
    // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 100));
    
        return {
            status: 'success',
            fiscalNumber: `NONE-${Date.now()}`,
            correlationId: `none-${sale._id || 'unknown'}`,
            error: undefined,
        };
    }
}
