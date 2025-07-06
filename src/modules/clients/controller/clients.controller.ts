import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { CreateClientDto } from "../dto/CreateClient.dto";
import { Client } from "../schemas/client.schema";
import { ClientsService } from "../service/clients.service";
import { JwtAuthGuard } from "src/modules/auth/auth.guard";
import { ScopesGuard } from "src/modules/auth/scopes.guard";
import { Scopes } from "src/modules/auth/scopes.decorator";

@Controller('clients')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) {}

    @Scopes('scope_clients:create')
    @Post()
    async createClient(@Body() createClientDto: CreateClientDto) : Promise<Client> {
        return await this.clientsService.create(createClientDto);
    }

    @Scopes('scope_clients:read')
    @Get()
    async findAll(@Query('tenant') tenantId?: string): Promise<Client[]> {
        return await this.clientsService.findAll(tenantId);
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