import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ClientsService } from "./clients.service";
import { CreateClientDto } from "./dto/CreateClient.dto";
import { Client } from "./schemas/client.schema";

@Controller('clients')
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) {}

    @Post()
    async createClient(@Body() createClientDto: CreateClientDto) : Promise<Client> {
        return await this.clientsService.create(createClientDto);
    }

    @Get()
    async findAll(): Promise<Client[]> {
        return await this.clientsService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Client> {
        return await this.clientsService.findOne(id);
    }

}