export interface FiscalizeResult {
  status: 'pending' | 'success' | 'error' | 'retry';
  number?: string;
  time?: Date;
  error?: string;
}

export interface FiscalProvider {
  fiscalize(sale: any): Promise<FiscalizeResult>;
}
