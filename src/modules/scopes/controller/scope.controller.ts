import { Body, Controller, Get, Post } from "@nestjs/common";
import { Scope } from "../schemas/scope.schema";
import { ScopesService } from "../service/scopes.service";


@Controller('scopes')
export class ScopesController {
    constructor(private readonly scopeService: ScopesService){}

    @Post()
    async create(@Body() createScopeDto: any): Promise<Scope> {
        try {
            return await this.scopeService.create(createScopeDto);
        } catch (error) {
            throw error;
        }
    }

    @Get()
    async findAll(): Promise<Scope[]> {
        return this.scopeService.findAll();
    }
}