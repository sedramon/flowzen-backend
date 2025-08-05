import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ArticleSchema } from "./schema/article.schema";
import { SuppliersModule } from "../suppliers/suppliers.module";

@Module({
    imports: [MongooseModule.forFeature([{name: 'Article', schema: ArticleSchema}]), SuppliersModule],
    controllers: [],
    providers: [],
    exports: [MongooseModule]
})
export class ArticlesModule {}