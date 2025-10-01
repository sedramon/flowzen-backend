import { FiscalProvider, FiscalizeResult } from './fiscal.provider';

export class DeviceFiscalProvider implements FiscalProvider {
  async fiscalize(sale: any): Promise<FiscalizeResult> {
    // Simulacija fiskalnog uređaja
    // U realnoj implementaciji bi ovde bio SDK za komunikaciju sa fiskalnim uređajem
    
    try {
      // Simuliraj komunikaciju sa uređajem (0.5-1 sekunda)
      const delay = Math.random() * 500 + 500;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Simuliraj uspešnu fiskalizaciju (90% šanse)
      if (Math.random() > 0.1) {
        const fiscalNumber = `FISC-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        
        return {
          status: 'success',
          number: fiscalNumber,
          time: new Date(),
          error: undefined,
        };
      } else {
        // Simuliraj grešku
        const errors = [
          'Uređaj nije dostupan',
          'Greška komunikacije sa uređajem',
          'Uređaj je zauzet',
          'Nedovoljno papira'
        ];
        const randomError = errors[Math.floor(Math.random() * errors.length)];
        
        return {
          status: 'error',
          error: randomError,
          time: new Date(),
        };
      }
    } catch (error: any) {
      return {
        status: 'error',
        error: error.message || 'Nepoznata greška fiskalnog uređaja',
        time: new Date(),
      };
    }
  }
}
