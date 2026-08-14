import { IsOptional, IsString } from 'class-validator';

export class GetDocumentQueryDto {
  @IsOptional()
  @IsString()
  searchText: string | undefined;
}
