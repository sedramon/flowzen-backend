import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { CreateClientDto } from "../dto/CreateClient.dto";
import { UpdateClientDto } from "../dto/UpdateClient.dto";
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

    /**
     * GET /clients/by-user/:userId
     * Pronalazi Client entitet povezan sa User nalogom.
     * Koristi se za self-service login gde User nalog treba da dobije klijent podatke.
     */
    @Scopes('scope_clients:read')
    @Get('by-user/:userId')
    async findClientByUserId(@Param('userId') userId: string): Promise<Client | null> {
        return await this.clientsService.findClientByUserId(userId);
    }

    /**
     * PUT /clients/connect-user/:clientId/:userId
     * Povezuje User nalog sa Client entitetom.
     * Koristi se u admin panelu da se dodeli User nalog klijentu za self-service pristup.
     */
    @Scopes('scope_clients:update')
    @Put('connect-user/:clientId/:userId')
    async connectUserToClient(
        @Param('clientId') clientId: string, 
        @Param('userId') userId: string
    ): Promise<Client> {
        return await this.clientsService.updateUserReference(clientId, userId);
    }

    /**
     * PUT /clients/disconnect-user/:clientId
     * Diskonektuje User nalog od klijenta.
     * Uklanja vezu između User i Client entiteta.
     */
    @Scopes('scope_clients:update')
    @Put('disconnect-user/:clientId')
    async disconnectUserFromClient(
        @Param('clientId') clientId: string
    ): Promise<Client> {
        return await this.clientsService.disconnectUserFromClient(clientId);
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
    async update(
        @Param('id') id: string, 
        @Body() updateClientDto: any
    ): Promise<Client> {
        return await this.clientsService.update(id, updateClientDto);
    }
}