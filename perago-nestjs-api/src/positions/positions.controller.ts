import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  ValidationPipe,
  Body,
} from '@nestjs/common';
import { CreatePositionDto, UpdatePositionDto } from './dto/position.dto';
import { PositionsService } from './positions.service';

@Controller('positions')
export class PositionsController {
  constructor(private readonly appService: PositionsService) {}
  @Post('create')
  createPosition(
    @Body(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    )
    createPositionDto: CreatePositionDto,
  ) {
    return this.appService.createPosition(createPositionDto);
  }
  @Get()
  getPositions() {
    return this.appService.getPositions();
  }
  @Get(':id')
  getPositionById(@Param('id') id: string) {
    return this.appService.getPositionById(id);
  }
  @Get(':id/children')
  getChildren(@Param('id') id: string) {
    return this.appService.getChildren(id);
  }
  @Patch(':id')
  updatePosition(
    @Param('id') id: string,
    @Body(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    )
    dto: UpdatePositionDto,
  ) {
    return this.appService.updatePosition(id, dto);
  }
  @Delete(':id')
  deletePosition(@Param('id') id: string) {
    return this.appService.deletePosition(id);
  }
}
