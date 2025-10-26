import { Body, Controller, Get, Post, Delete, Param, UseGuards } from "@nestjs/common";
import { Scope } from "../schemas/scope.schema";
import { ScopesService } from "../service/scopes.service";
import { CreateScopeDto } from "../dto/CreateScope.dto";
import { JwtAuthGuard } from "src/common/guards/auth.guard";
import { ApiBearerAuth } from "@nestjs/swagger";


@Controller('scopes')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class ScopesController {
    constructor(private readonly scopeService: ScopesService){}

    @Post()
    async create(@Body() createScopeDto: CreateScopeDto): Promise<Scope> {
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

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<Scope> {
        return this.scopeService.remove(id);
    }
}