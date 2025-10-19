import { FiscalProvider } from './fiscal.provider';
import { FiscalizeResult } from '../../types';

/**
 * Device Fiscal Provider
 * 
 * Simulates communication with a physical fiscal device.
 * In a real implementation, this would use the device SDK
 * to communicate with the actual fiscal printer/device.
 */
export class DeviceFiscalProvider implements FiscalProvider {
    /**
   * Fiscalize sale through physical device
   * @param sale - Sale transaction data
   * @returns Promise resolving to fiscalization result
   */
    async fiscalize(sale: any): Promise<FiscalizeResult> {
        try {
            // Simulate device communication delay (0.5-1 second)
            const delay = Math.random() * 500 + 500;
            await new Promise(resolve => setTimeout(resolve, delay));
      
            // Simulate successful fiscalization (90% success rate)
            if (Math.random() > 0.1) {
                const fiscalNumber = `DEV-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        
                return {
                    status: 'success',
                    fiscalNumber,
                    correlationId: `device-${sale._id || 'unknown'}`,
                    error: undefined,
                };
            } else {
                // Simulate device errors
                const errors = [
                    'Device not available',
                    'Communication error with device',
                    'Device is busy',
                    'Insufficient paper',
                    'Device offline'
                ];
                const randomError = errors[Math.floor(Math.random() * errors.length)];
        
                return {
                    status: 'error',
                    error: randomError,
                    correlationId: `device-${sale._id || 'unknown'}`,
                };
            }
        } catch (error: any) {
            return {
                status: 'error',
                error: error.message || 'Unknown fiscal device error',
                correlationId: `device-${sale._id || 'unknown'}`,
            };
        }
    }
}
