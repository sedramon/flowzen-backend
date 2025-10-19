import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { CreateClientDto } from "../dto/CreateClient.dto";
import { Client } from "../schemas/client.schema";
import { ClientsService } from "../service/clients.service";
import { JwtAuthGuard } from "src/common/guards/auth.guard";
import { ScopesGuard } from "src/common/guards/scopes.guard";
import { Scopes } from "src/common/decorators";
import { FilterClientsDto } from "../dto/filter-clients.dto";
import { ApiBearerAuth } from "@nestjs/swagger";

@Controller('clients')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) { }

    @Scopes('scope_clients:create')
    @Post()
    async createClient(@Body() createClientDto: CreateClientDto): Promise<Client> {
        return await this.clientsService.create(createClientDto);
    }

    @Scopes('scope_clients:read')
    @Get()
    async findAll(@Query() qs: FilterClientsDto) {
        return await this.clientsService.findAll(qs);
    }

    @Scopes('scope_clients:read')
    @Get('all')
    async findAllData(@Query('tenant') tenantId: string) {
        return await this.clientsService.findAllData(tenantId);
    }

    @Scopes('scope_clients:read')
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Client> {
        return await this.clientsService.findOne(id);
    }

    @Scopes('scope_clients:delete')
    @Delete(':id')
    async delete(@Param('id') id: string): Promise<void> {
        return await this.clientsService.delete(id);
    }

    @Scopes('scope_clients:update')
    @Put(':id')
    async update(@Param('id') id: string, @Body() createClientDto: CreateClientDto): Promise<Client> {
        return await this.clientsService.update(id, createClientDto);
    }


}