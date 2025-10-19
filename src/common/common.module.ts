import { Module, Global } from '@nestjs/common';
import { CsrfService } from './services/csrf.service';

@Global()
@Module({
    providers: [CsrfService],
    exports: [CsrfService],
})
export class CommonModule {}

