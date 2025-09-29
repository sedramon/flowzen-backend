import { FiscalProvider, FiscalizeResult } from './fiscal.provider';

export class DeviceFiscalProvider implements FiscalProvider {
  async fiscalize(sale: any): Promise<FiscalizeResult> {
    // TODO: Implement device SDK/driver logic
    return {
      status: 'pending',
      error: 'Device provider not implemented',
    };
  }
}
