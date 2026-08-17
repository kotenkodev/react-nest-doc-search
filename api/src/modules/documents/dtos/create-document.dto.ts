import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  Matches,
} from 'class-validator';
import {
  ALLOWED_DOCUMENT_MIME_TYPES,
  MAX_DOCUMENT_SIZE,
  type AllowedDocumentMimeType,
} from '../../../common/constant';

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @Matches(/\.(pdf|docx)$/i, {
    message: 'File name must end with .pdf or .docx',
  })
  userFilename: string;

  @IsNotEmpty()
  @IsIn(ALLOWED_DOCUMENT_MIME_TYPES, {
    message: 'Invalid mimeType. Only PDF and DOCX files are allowed',
  })
  mimeType: AllowedDocumentMimeType;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(MAX_DOCUMENT_SIZE, {
    message: `File size must not exceed ${MAX_DOCUMENT_SIZE / (1024 * 1024)}MB`,
  })
  size: number;
}
