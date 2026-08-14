import {
  Controller,
  Get,
  Param,
  Body,
  Delete,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dtos/create-document.dto';
import { GetDocumentQueryDto } from './dtos/get-document.query';
import { EmailGuard } from '../../shared/guards/email.guard';
import { CurrentUserEmail } from '../../shared/decorators/current-user-email.decorator';

@UseGuards(EmailGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  async getDocuments(
    @CurrentUserEmail() userEmail: string,
    @Query() query: GetDocumentQueryDto,
  ) {
    return this.documentsService.getDocuments(userEmail, query.searchText);
  }

  @Get(':id')
  async getDocumentById(
    @CurrentUserEmail() userEmail: string,
    @Param('id') id: string,
  ) {
    return this.documentsService.getDocumentById(userEmail, id);
  }

  @Post()
  async createDocument(
    @CurrentUserEmail() userEmail: string,
    @Body() dto: CreateDocumentDto,
  ) {
    return this.documentsService.createDocument(userEmail, dto);
  }

  @Delete(':id')
  async deleteDocument(
    @CurrentUserEmail() userEmail: string,
    @Param('id') id: string,
  ) {
    return this.documentsService.deleteDocument(userEmail, id);
  }
}
