import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Article } from "../schema/article.schema";
import { isValidObjectId, Model } from "mongoose";
import { Supplier } from "src/modules/suppliers/schema/supplier.schema";
import { PinoLogger } from "nestjs-pino";
import { CreateArticleDto } from "../dto/CreateArticle.dto";
import { Tenant } from "src/modules/tenants/schemas/tenant.schema";
import { UpdateArticleDto } from "../dto/UpdateArticle.dto";

@Injectable()
export class ArticleService implements OnModuleInit {
    constructor(
        @InjectModel(Article.name) private readonly articleModel: Model<Article>,
        @InjectModel(Supplier.name) private readonly supplierModel: Model<Supplier>,
        @InjectModel(Tenant.name) private readonly tenantModel: Model<Tenant>,
        private readonly logger: PinoLogger
    ) { }

    async onModuleInit() {
        await this.articleModel.syncIndexes();
    }

    async findAll(tenantId: string): Promise<Article[]> {
        this.logger.debug({ tenantId }, 'Finding all articles for tenant')
        if (!isValidObjectId(tenantId)) {
            this.logger.warn({ tenantId }, 'Invalid tenant ID supplied to findAll')
            throw new BadRequestException(`Invalid tenant ID: ${tenantId}`);
        }

        const articles = await this.articleModel.find({ tenant: tenantId }).exec();
        this.logger.info({ count: articles.length }, 'Retrieved articles')
        return articles;
    }

    async delete(id: string): Promise<void> {
        this.logger.debug({ id }, 'Deleting article')
        await this.articleModel.findByIdAndDelete(id).exec();
    }

    async findOne(id: string): Promise<Article> {
        this.logger.debug({ id }, 'Finding article')
        return this.articleModel.findById(id).exec();
    }

    async create(createArticleDto: CreateArticleDto): Promise<Article> {
        this.logger.debug({ createArticleDto }, 'Creating article')
        try {
            const { tenant, supplier, ...articleDetails } = createArticleDto;

            if (!isValidObjectId(tenant)) {
                this.logger.warn({ tenant }, 'Invalid tenant ID supplied to create')
                throw new BadRequestException(`Invalid tenant ID: ${tenant}`);
            }
            const tenantDocument = await this.tenantModel.findById(tenant).exec();
            if (!tenantDocument) {
                this.logger.warn({ tenant }, 'Tenant not found')
                throw new NotFoundException(`Tenant with ID ${tenant} not found`);
            }

            if (supplier) {
                const supplierDocument = await this.supplierModel.findById(supplier).exec();
                if (!supplierDocument) {
                    this.logger.warn({ supplier }, 'Supplier not found')
                    throw new NotFoundException(`Supplier with ID ${supplier} not found`);
                }
            }

            const article = await this.articleModel.create(createArticleDto);
            this.logger.info({ article }, 'Created article')
            return article;

        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async update(id: string, updateArticleDto: UpdateArticleDto): Promise<Article> {
        this.logger.debug({ id }, 'Updating article')
        try {
            const { tenant, supplier, ...articleDetails } = updateArticleDto;

            if (!isValidObjectId(tenant)) {
                this.logger.warn({ tenant }, 'Invalid tenant ID supplied to update')
                throw new BadRequestException(`Invalid tenant ID: ${tenant}`);
            }

            const tenantDocument = await this.tenantModel.findById(tenant).exec();
            if (!tenantDocument) {
                this.logger.warn({ tenant }, 'Tenant not found')
                throw new NotFoundException(`Tenant with ID ${tenant} not found`);
            }

            if (supplier) {
                const supplierDocument = await this.supplierModel.findById(supplier).exec();
                if (!supplierDocument) {
                    this.logger.warn({ supplier }, 'Supplier not found')
                    throw new NotFoundException(`Supplier with ID ${supplier} not found`);
                }
            }


            const updatedArticle = await this.articleModel.findByIdAndUpdate(id, updateArticleDto, { new: true }).exec();
            this.logger.info({ updatedArticle }, 'Updated article')
            return updatedArticle;
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async findActiveAll(tenantId: string): Promise<Article[]> {
        this.logger.debug({ tenantId }, 'Finding all active articles for tenant')
        if (!isValidObjectId(tenantId)) {
            this.logger.warn({ tenantId }, 'Invalid tenant ID supplied to findActiveAll')
            throw new BadRequestException(`Invalid tenant ID: ${tenantId}`);
        }

        const articles = await this.articleModel.find({ tenant: tenantId, isActive: true }).exec();
        this.logger.info({ count: articles.length }, 'Retrieved active articles')
        return articles;
    }

    async updateBulkStock(articles: Array<{ id: string; stock: number; minStock: number }>): Promise<{ message: string; updated: number }> {
        this.logger.debug({ articles }, 'Updating bulk stock for articles')
        
        let updatedCount = 0;
        const bulkOps = [];

        for (const article of articles) {
            if (!isValidObjectId(article.id)) {
                this.logger.warn({ id: article.id }, 'Invalid article ID in bulk update')
                continue;
            }

            bulkOps.push({
                updateOne: {
                    filter: { _id: article.id },
                    update: { 
                        $set: { 
                            stock: article.stock,
                            minStock: article.minStock 
                        } 
                    }
                }
            });
        }

        if (bulkOps.length > 0) {
            const result = await this.articleModel.bulkWrite(bulkOps);
            updatedCount = result.modifiedCount;
            this.logger.info({ updatedCount }, 'Bulk stock update completed')
        }

        return {
            message: `Successfully updated stock for ${updatedCount} articles`,
            updated: updatedCount
        };
    }
}