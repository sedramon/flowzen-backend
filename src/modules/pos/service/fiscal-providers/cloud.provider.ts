import { FiscalProvider, FiscalizeResult } from './fiscal.provider';

export class CloudFiscalProvider implements FiscalProvider {
  async fiscalize(sale: any): Promise<FiscalizeResult> {
    // TODO: Implement cloud HTTP API logic
    return {
      status: 'pending',
      error: 'Cloud provider not implemented',
    };
  }
}
