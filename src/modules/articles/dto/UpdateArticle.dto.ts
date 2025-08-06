import { PartialType } from "@nestjs/swagger";
import { CreateArticleDto } from "./CreateArticle.dto";

export class UpdateArticleDto extends PartialType(CreateArticleDto) {

}