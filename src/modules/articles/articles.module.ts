import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ArticleSchema } from "./schema/article.schema";
import { SuppliersModule } from "../suppliers/suppliers.module";
import { ArticleController } from "./controller/article.controller";
import { ArticleService } from "./service/article.service";
import { TenantsModule } from "../tenants/tenants.module";

@Module({
    imports: [MongooseModule.forFeature([{name: 'Article', schema: ArticleSchema}]), SuppliersModule, TenantsModule],
    controllers: [ArticleController],
    providers: [ArticleService],
    exports: [MongooseModule]
})
export class ArticlesModule {}