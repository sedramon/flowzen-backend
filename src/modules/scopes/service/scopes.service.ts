import { ConflictException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Scope } from "../schemas/scope.schema";

@Injectable()
export class ScopesService {
    constructor(@InjectModel(Scope.name) private scopeModel: Model<Scope>) {}

    async create(createScopeDto: any): Promise<Scope> {
        try {
            const existingScope = await this.scopeModel.findOne({ name: createScopeDto.name }).exec();
    
            if (existingScope) {
                throw new ConflictException(`Scope with name ${createScopeDto.name} already exists`);
            }
            const newScope = new this.scopeModel(createScopeDto);
            return await newScope.save();
        } catch (error) {
            throw error;
        }
    }

    async findAll(): Promise<Scope[]> {
        return this.scopeModel.find().exec();
    }

}