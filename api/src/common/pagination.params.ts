import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class PaginationParams {
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page = 1;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  limit = 25;

  get offset(): number {
    return (this.page - 1) * this.limit;
  }
}
