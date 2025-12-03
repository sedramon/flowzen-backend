import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AgentSchema } from "./schemas/agent.schema";
import { AgentsController } from "./controller/agents.controller";
import { AgentsService } from "./service/agents.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'Agent', schema: AgentSchema }
        ])
    ],
    controllers: [AgentsController],
    providers: [AgentsService],
    exports: [MongooseModule]
})
export class AgentsModule {}

