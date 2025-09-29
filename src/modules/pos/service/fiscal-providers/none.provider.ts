import { FiscalProvider, FiscalizeResult } from './fiscal.provider';

export class NoneFiscalProvider implements FiscalProvider {
  async fiscalize(sale: any): Promise<FiscalizeResult> {
    return {
      status: 'success',
      number: undefined,
      time: new Date(),
      error: undefined,
    };
  }
}
