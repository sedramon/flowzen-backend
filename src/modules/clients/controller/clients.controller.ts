import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { CreateClientDto } from "../dto/CreateClient.dto";
import { Client } from "../schemas/client.schema";
import { ClientsService } from "../service/clients.service";

@Controller('clients')
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) {}

    @Post()
    async createClient(@Body() createClientDto: CreateClientDto) : Promise<Client> {
        return await this.clientsService.create(createClientDto);
    }

    @Get()
    async findAll(@Query('tenant') tenantId?: string): Promise<Client[]> {
        return await this.clientsService.findAll(tenantId);
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Client> {
        return await this.clientsService.findOne(id);
    }

    @Delete(':id')
    async delete(@Param('id') id: string): Promise<void> {
        return await this.clientsService.delete(id);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() createClientDto: CreateClientDto): Promise<Client> {
        return await this.clientsService.update(id, createClientDto);
    }

}