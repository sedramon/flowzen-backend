import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/common/guards/auth.guard";
import { ScopesGuard } from "src/common/guards/scopes.guard";
import { ArticleService } from "../service/article.service";
import { Scopes } from "src/common/decorators";
import { Article } from "../schema/article.schema";
import { UpdateArticleDto } from "../dto/UpdateArticle.dto";
import { CreateArticleDto } from "../dto/CreateArticle.dto";

@Controller('articles')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class ArticleController {
    constructor(
        private readonly articleService: ArticleService
    ) {}

    @Scopes('scope_articles:read')
    @Get()
    async findAll(@Query('tenant') tenantId?: string): Promise<Article[]> {
        return await this.articleService.findAll(tenantId);
    }

    @Scopes('scope_articles:read')
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Article> {
        return await this.articleService.findOne(id);
    }

    @Scopes('scope_articles:read')
    @Get('active/get')
    async getActive(@Query('tenant') tenantId?: string): Promise<Article[]> {
        return await this.articleService.findActiveAll(tenantId);
    }

    @Scopes('scope_articles:delete')
    @Delete(':id')
    async delete(@Param('id') id: string): Promise<{message: string}> {
        await this.articleService.delete(id);
        return { message: 'Article deleted successfully' };
    }

    @Scopes('scope_articles:update')
    @Put(':id')
    async update(@Param('id') id: string, @Body() updateArticleDto: UpdateArticleDto): Promise<Article> {
        return await this.articleService.update(id, updateArticleDto);
    }

    @Scopes('scope_articles:create')
    @Post()
    async create(@Body() createArticleDto: CreateArticleDto): Promise<Article> {
        return await this.articleService.create(createArticleDto);
    }

    @Scopes('scope_articles:update')
    @Post('bulk-stock')
    async updateBulkStock(@Body() bulkStockDto: { articles: Array<{ id: string; stock: number; minStock: number }> }): Promise<{ message: string; updated: number }> {
        return await this.articleService.updateBulkStock(bulkStockDto.articles);
    }

}