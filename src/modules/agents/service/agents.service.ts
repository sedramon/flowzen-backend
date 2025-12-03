import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreateAgentDto } from '../dto/CreateAgent.dto';
import { UpdateAgentDto } from '../dto/UpdateAgent.dto';
import { FilterAgentsDto } from '../dto/FilterAgents.dto';
import { Agent } from '../schemas/agent.schema';

@Injectable()
export class AgentsService {
    constructor(
        @InjectModel(Agent.name) private agentModel: Model<Agent>,
    ) { }

    async create(createAgentDto: CreateAgentDto): Promise<Agent> {
        try {
            // Check if slug already exists
            const existingAgent = await this.agentModel.findOne({ slug: createAgentDto.slug }).exec();
            if (existingAgent) {
                throw new ConflictException(`Agent with slug "${createAgentDto.slug}" already exists`);
            }

            const agent = await this.agentModel.create(createAgentDto);
            return agent;
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }
            throw new BadRequestException(`Failed to create agent: ${error.message}`);
        }
    }

    async findAll(filterDto?: FilterAgentsDto): Promise<Agent[]> {
        try {
            const filter: any = {};

            if (filterDto?.agentType) {
                filter.agentType = filterDto.agentType;
            }

            if (filterDto?.clientId) {
                filter.clientId = filterDto.clientId;
            }

            if (filterDto?.isActive !== undefined) {
                filter.isActive = filterDto.isActive;
            }

            return await this.agentModel.find(filter).sort({ createdAt: -1 }).exec();
        } catch (error) {
            throw new BadRequestException(`Failed to fetch agents: ${error.message}`);
        }
    }

    async findOne(id: string): Promise<Agent> {
        if (!isValidObjectId(id)) {
            throw new BadRequestException(`Invalid agent ID: ${id}`);
        }

        const agent = await this.agentModel.findById(id).exec();
        if (!agent) {
            throw new NotFoundException(`Agent with ID ${id} not found`);
        }

        return agent;
    }

    async update(id: string, updateAgentDto: UpdateAgentDto): Promise<Agent> {
        try {
            if (!isValidObjectId(id)) {
                throw new BadRequestException(`Invalid agent ID: ${id}`);
            }

            // Check if slug is being updated and if it's unique
            if (updateAgentDto.slug) {
                const existingAgent = await this.agentModel.findOne({ 
                    slug: updateAgentDto.slug,
                    _id: { $ne: id }
                }).exec();
                if (existingAgent) {
                    throw new ConflictException(`Agent with slug "${updateAgentDto.slug}" already exists`);
                }
            }

            const agent = await this.agentModel
                .findByIdAndUpdate(id, updateAgentDto, { new: true })
                .exec();

            if (!agent) {
                throw new NotFoundException(`Agent with ID ${id} not found`);
            }

            return agent;
        } catch (error) {
            if (error instanceof ConflictException || error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException(`Failed to update agent: ${error.message}`);
        }
    }

    async delete(id: string): Promise<void> {
        if (!isValidObjectId(id)) {
            throw new BadRequestException(`Invalid agent ID: ${id}`);
        }

        const agent = await this.agentModel.findByIdAndDelete(id).exec();
        if (!agent) {
            throw new NotFoundException(`Agent with ID ${id} not found`);
        }
    }

    async toggleStatus(id: string): Promise<Agent> {
        try {
            if (!isValidObjectId(id)) {
                throw new BadRequestException(`Invalid agent ID: ${id}`);
            }

            const agent = await this.agentModel.findById(id).exec();
            if (!agent) {
                throw new NotFoundException(`Agent with ID ${id} not found`);
            }

            agent.isActive = !agent.isActive;
            return await agent.save();
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException(`Failed to toggle agent status: ${error.message}`);
        }
    }
}

