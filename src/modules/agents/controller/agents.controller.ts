import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from "@nestjs/common";
import { CreateAgentDto } from "../dto/CreateAgent.dto";
import { UpdateAgentDto } from "../dto/UpdateAgent.dto";
import { FilterAgentsDto } from "../dto/FilterAgents.dto";
import { Agent } from "../schemas/agent.schema";
import { AgentsService } from "../service/agents.service";
import { JwtAuthGuard } from "src/common/guards/auth.guard";
import { SuperAdminGuard } from "src/common/guards/superadmin.guard";
import { GlobalScopesGuard } from "src/common/guards/global-scopes.guard";
import { Scopes } from "src/common/decorators";
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@Controller('agents')
@ApiTags('Agents')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, SuperAdminGuard, GlobalScopesGuard)
export class AgentsController {
    constructor(private readonly agentsService: AgentsService) { }

    @Scopes('global.beta:*')
    @Post()
    @ApiOperation({ summary: 'Create a new agent' })
    @ApiResponse({ status: 201, description: 'Agent created successfully' })
    @ApiResponse({ status: 409, description: 'Agent with this slug already exists' })
    async createAgent(@Body() createAgentDto: CreateAgentDto): Promise<Agent> {
        return await this.agentsService.create(createAgentDto);
    }

    @Scopes('global.beta:*')
    @Get()
    @ApiOperation({ summary: 'Get all agents' })
    @ApiResponse({ status: 200, description: 'List of agents' })
    async findAll(@Query() filterDto: FilterAgentsDto): Promise<Agent[]> {
        return await this.agentsService.findAll(filterDto);
    }

    @Scopes('global.beta:*')
    @Get(':id')
    @ApiOperation({ summary: 'Get agent by ID' })
    @ApiResponse({ status: 200, description: 'Agent found' })
    @ApiResponse({ status: 404, description: 'Agent not found' })
    async findOne(@Param('id') id: string): Promise<Agent> {
        return await this.agentsService.findOne(id);
    }

    @Scopes('global.beta:*')
    @Put(':id')
    @ApiOperation({ summary: 'Update agent' })
    @ApiResponse({ status: 200, description: 'Agent updated successfully' })
    @ApiResponse({ status: 404, description: 'Agent not found' })
    @ApiResponse({ status: 409, description: 'Agent with this slug already exists' })
    async update(
        @Param('id') id: string,
        @Body() updateAgentDto: UpdateAgentDto
    ): Promise<Agent> {
        return await this.agentsService.update(id, updateAgentDto);
    }

    @Scopes('global.beta:*')
    @Delete(':id')
    @ApiOperation({ summary: 'Delete agent' })
    @ApiResponse({ status: 200, description: 'Agent deleted successfully' })
    @ApiResponse({ status: 404, description: 'Agent not found' })
    async delete(@Param('id') id: string): Promise<void> {
        return await this.agentsService.delete(id);
    }

    @Scopes('global.beta:*')
    @Patch(':id/toggle-status')
    @ApiOperation({ summary: 'Toggle agent active status' })
    @ApiResponse({ status: 200, description: 'Agent status toggled successfully' })
    @ApiResponse({ status: 404, description: 'Agent not found' })
    async toggleStatus(@Param('id') id: string): Promise<Agent> {
        return await this.agentsService.toggleStatus(id);
    }
}

