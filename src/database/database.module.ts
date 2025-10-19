import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Module({
    imports: [
        MongooseModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                uri: config.get<string>('MONGODB_URI'),
            }),
        }),
    // TypeOrmModule.forRootAsync({
    //   useFactory: () => ({
    //     type: 'postgres',
    //     host: process.env.POSTGRES_URI,
    //     port: Number(process.env.DB_PORT),
    //     username: process.env.DB_USER,
    //     password: process.env.DB_PASS,
    //     database: process.env.DB_NAME, // <-- now points to appdb
    //     autoLoadEntities: true,
    //     synchronize: true, // for dev only
    //     ssl: { rejectUnauthorized: false }, // RDS quick setup
    //   }),
    // }),
    ],
    exports: [MongooseModule],
})
// export class DatabaseModule implements OnModuleInit {
//   constructor(private dataSource: DataSource) { }

//   async onModuleInit() {
//     const logger = new Logger('DatabaseModule');

//     if (this.dataSource.isInitialized) {
//       logger.log('✅ PostgreSQL connected');
//     }

//     logger.log('✅ MongoDB connection initialized (assumed)');
//   }
// }
export class DatabaseModule {}
