import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePositionDto, UpdatePositionDto } from './dto/position.dto';
import { Position } from './entities/position.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class PositionsService {
  constructor(
    @InjectRepository(Position)
    private positionRepository: Repository<Position>,
  ) {}
  private async wouldCreateCircularHierarchy(
    positionId: string,
    newParentId: string,
  ): Promise<boolean> {
    let current = await this.positionRepository.findOne({
      where: { id: newParentId },
      relations: ['parent'],
    });

    while (current) {
      // Found ourselves in the ancestry chain
      if (current.id === positionId) {
        return true;
      }

      if (!current.parent) {
        return false;
      }

      current = await this.positionRepository.findOne({
        where: {
          id: current.parent.id,
        },
        relations: ['parent'],
      });
    }

    return false;
  }

  async createPosition(createPositionDto: CreatePositionDto) {
    const { name, description, parentId } = createPositionDto;

    let parent = null;

    if (!parentId) {
      const existingRoot = await this.positionRepository.findOne({
        where: { parent: IsNull(), name: 'CEO' },
      });
      if (existingRoot) {
        throw new BadRequestException('A CEO/root position already exists');
      }
    }

    if (parentId) {
      parent = await this.positionRepository.findOne({
        where: { id: parentId },
      });

      if (!parent) {
        throw new NotFoundException('Parent position not found');
      }
    }

    return this.positionRepository.save({
      name,
      description,
      parent,
    });
  }
  async getPositions() {
    return await this.positionRepository.find({ relations: ['parent'] });
  }
  async getPositionById(id: string) {
    return await this.positionRepository.findOne({
      where: { id },
      relations: ['parent'],
    });
  }
  async getChildren(id: string) {
    const position = await this.positionRepository.findOne({
      where: { id },
      relations: ['children'],
    });

    if (!position) {
      throw new NotFoundException('Position not found');
    }

    return position.children;
  }
  async updatePosition(id: string, updatePositionDto: UpdatePositionDto) {
    const { name, description, parentId } = updatePositionDto;

    const existing = await this.positionRepository.findOne({
      where: { id },
      relations: ['parent'],
    });

    if (!existing) {
      throw new NotFoundException(`Position #${id} not found`);
    }

    if (name !== undefined) {
      existing.name = name;
    }

    if (description !== undefined) {
      existing.description = description;
    }

    if (parentId !== undefined) {
      // Prevent self-parenting
      if (parentId === id) {
        throw new BadRequestException('Position cannot report to itself');
      }

      // Prevent circular hierarchy
      const circular = await this.wouldCreateCircularHierarchy(id, parentId);

      if (circular) {
        throw new BadRequestException('Circular hierarchy detected');
      }

      const parent = await this.positionRepository.findOne({
        where: { id: parentId },
      });

      if (!parent) {
        throw new NotFoundException('Parent position not found');
      }

      existing.parent = parent;
    }

    return this.positionRepository.save(existing);
  }
  async deletePosition(id: string) {
    try {
      const result = await this.positionRepository.delete({ id });
      return result;
    } catch (error) {
      throw new InternalServerErrorException('Error deleting position');
    }
  }
}
