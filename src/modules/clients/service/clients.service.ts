import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { Tenant } from 'src/modules/tenants/schemas/tenant.schema';
import { CreateClientDto } from '../dto/CreateClient.dto';
import { UpdateClientDto } from '../dto/UpdateClient.dto';
import { Client } from '../schemas/client.schema';
import { FilterClientsDto } from '../dto/filter-clients.dto';
import { User } from 'src/modules/users/schemas/user.schema';

@Injectable()
export class ClientsService {
    constructor(
        @InjectModel(Client.name) private clientModel: Model<Client>,
        @InjectModel(Tenant.name) private tenantModel: Model<Tenant>,
        @InjectModel('User') private userModel: Model<User>,
    ) { }

    async create(createClientDto: CreateClientDto): Promise<Client> {
        try {
            const { tenant, ...clientDetails } = createClientDto;

            if (!isValidObjectId(tenant)) {
                throw new BadRequestException(`Invalid tenant ID: ${tenant}`);
            }

            // Check if tenant exists
            const tenantDocument = await this.tenantModel.findById(tenant).exec();
            if (!tenantDocument) {
                throw new NotFoundException(`Tenant with ID ${tenant} not found`);
            }

            const client = await this.clientModel.create(createClientDto);

            return client;
        } catch (error) {
            throw new Error(error);
        }
    }

    async findAll(qs: FilterClientsDto): Promise<{
        data: Client[];
        total: number;
        page: number;
        limit: number;
    }> {
        const {
            tenant,
            search,
            createdFrom,
            createdTo,
            sortBy,
            sortDir,
            page,
            limit,
        } = qs;
        const filter: any = {};

        if (!isValidObjectId(tenant)) {
            throw new BadRequestException(`Invalid tenant ID: ${tenant}`);
        }

        if (search?.trim()) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { contactEmail: { $regex: search, $options: 'i' } },
            ];
        }

        if (createdFrom || createdTo) {
            filter.createdAt = {};

            if (createdFrom) {
                filter.createdAt.$gte = new Date(createdFrom);
            }

            if (createdTo) {
                filter.createdAt.$lte = new Date(createdTo);
            }
        }

        // CRITICAL: Always filter by tenant for security and data isolation
        filter.tenant = tenant;

        const skip = (page - 1) * limit;
        const sortObj: any = {};
        if (sortBy) {
            sortObj[sortBy] = sortDir === 'desc' ? -1 : 1;
        }
        const [data, total] = await Promise.all([
            this.clientModel
                .find(filter)
                .sort(sortObj)
                .skip(skip)
                .limit(limit)
                .exec(),

            this.clientModel.countDocuments(filter).exec(),
        ]);

        return { data, total, page, limit };
    }

    async findAllData(tenantId: string): Promise<Client[]> {
        try {
            if (!isValidObjectId(tenantId)) {
                throw new BadRequestException(`Invalid tenant ID: ${tenantId}`);
            }

            const tenantDocument = await this.tenantModel.findById(tenantId).exec();
            if (!tenantDocument) {
                throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
            }

            return this.clientModel
                .find({ tenant: tenantId })
                .exec();
        } catch (error) {
            throw error;
        }
    }

    async findOne(id: string): Promise<Client> {
        return this.clientModel.findById(id).exec();
    }

    async delete(id: string): Promise<void> {
        await this.clientModel.findByIdAndDelete(id).exec();
    }

    async update(id: string, updateClientDto: any): Promise<Client> {
        try {
            // Only allow specific fields for update and handle nested objects
            const updateData: any = {};
            
            // Helper function to extract ID from nested objects
            const extractId = (value: any): string | null => {
                if (!value) return null;
                if (typeof value === 'string') return value;
                if (typeof value === 'object' && value._id) return value._id.toString();
                return null;
            };
            
            // Process each allowed field
            if (updateClientDto.firstName !== undefined) {
                updateData.firstName = updateClientDto.firstName;
            }
            if (updateClientDto.lastName !== undefined) {
                updateData.lastName = updateClientDto.lastName;
            }
            if (updateClientDto.contactPhone !== undefined) {
                updateData.contactPhone = updateClientDto.contactPhone;
            }
            if (updateClientDto.contactEmail !== undefined) {
                updateData.contactEmail = updateClientDto.contactEmail;
            }
            if (updateClientDto.address !== undefined) {
                updateData.address = updateClientDto.address;
            }
            
            // Handle tenant
            if (updateClientDto.tenant !== undefined) {
                const tenantId = extractId(updateClientDto.tenant);
                if (tenantId) {
                    if (!isValidObjectId(tenantId)) {
                        throw new BadRequestException(`Invalid tenant ID: ${tenantId}`);
                    }
                    const tenantDocument = await this.tenantModel.findById(tenantId).exec();
                    if (!tenantDocument) {
                        throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
                    }
                    updateData.tenant = tenantId;
                }
            }
            
            // Handle user
            if (updateClientDto.user !== undefined) {
                const userId = extractId(updateClientDto.user);
                if (userId) {
                    if (!isValidObjectId(userId)) {
                        throw new BadRequestException(`Invalid user ID: ${userId}`);
                    }
                    updateData.user = userId;
                }
            }
            
            return await this.clientModel
                .findByIdAndUpdate(id, updateData, { new: true })
                .exec();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Povezuje klijenta sa User nalogom.
     * Ovo omogućava User entitetu da bude povezan sa Client entitetom.
     * Koristi se za self-service funkcionalnost gde User može da pristupi klijent podacima.
     */
    async updateUserReference(clientId: string, userId: string): Promise<Client> {
        try {
            if (!isValidObjectId(userId)) {
                throw new BadRequestException(`Invalid user ID: ${userId}`);
            }
            
            return await this.clientModel
                .findByIdAndUpdate(clientId, { user: userId }, { new: true })
                .exec();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Pronalazi Client entitet povezan sa User nalogom.
     * Pretražuje po 'user' referenci ili po email adresi.
     * Koristi se prilikom logina da se pronađe klijent profil za User nalog.
     */
    async findClientByUserId(userId: string): Promise<Client | null> {
        try {
            // First find the user by userId
            const user = await this.userModel.findById(userId).exec();
            if (!user) {
                return null;
            }

            // Find client that has this user reference or matches email
            const client = await this.clientModel
                .findOne({ $or: [{ user: userId }, { contactEmail: user.email }] })
                .exec();

            return client;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Diskonektuje User nalog od klijenta.
     * Uklanja 'user' referencu iz Client entiteta.
     */
    async disconnectUserFromClient(clientId: string): Promise<Client> {
        try {
            return await this.clientModel
                .findByIdAndUpdate(clientId, { $unset: { user: "" } }, { new: true })
                .exec();
        } catch (error) {
            throw error;
        }
    }
}
