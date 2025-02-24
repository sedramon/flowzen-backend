import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
    imports: [
      MongooseModule.forRoot('mongodb+srv://aljosagadjanskibozic:Kikiriki1231@flowzen.f4fxw.mongodb.net/flowzen?retryWrites=true&w=majority&appName=Flowzen'),
    ],
    exports: [MongooseModule],
  })
  export class DatabaseModule {}