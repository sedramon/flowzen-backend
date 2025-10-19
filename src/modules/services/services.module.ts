import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Service, ServiceSchema } from './schemas/service.schema';
import { ServicesService } from './service/services.service';
import { ServicesController } from './controller/services.controller';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Service.name, schema: ServiceSchema }]),
        TenantsModule
    ],
    controllers: [ServicesController],
    providers: [ServicesService],
    exports: [MongooseModule],
})
export class ServicesModule {}
