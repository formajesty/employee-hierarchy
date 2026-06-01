import { Transform } from 'class-transformer';
import { IsUUID, MinLength, IsOptional, IsString } from 'class-validator';

export class CreatePositionDto {
  @IsString()
  @MinLength(3, { message: 'Name must be at least 3 characters' })
  name: string;

  @IsString()
  @MinLength(3, { message: 'Description must be at least 3 characters' })
  description: string;

  @IsOptional()
  @IsUUID()
  parentId?: string | null;
}

export class UpdatePositionDto {
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Name must be at least 3 characters' })
  name?: string;

  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Description must be at least 3 characters' })
  description?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string | null;
}
