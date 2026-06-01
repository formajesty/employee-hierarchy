import { Test, TestingModule } from '@nestjs/testing';
import { PositionsController } from './positions.controller';
import { PositionsService } from './positions.service';

describe('PositionsController', () => {
  let controller: PositionsController;

  const mockPositionsService = {
    createPosition: jest.fn(),
    getPositions: jest.fn(),
    getPositionById: jest.fn(),
    getChildren: jest.fn(),
    updatePosition: jest.fn(),
    deletePosition: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PositionsController],
      providers: [
        {
          provide: PositionsService,
          useValue: mockPositionsService,
        },
      ],
    }).compile();

    controller = module.get<PositionsController>(PositionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  //------------------ CREATE POSITION TESTS ------------------
  describe('create', () => {
    it('should create a root position (CEO) with no parent', async () => {
      const body = {
        name: 'CEO',
        description: 'Chief Executive Officer',
        parentId: null,
      };

      const result = {
        id: '1',
        ...body,
        parent: null,
      };

      mockPositionsService.createPosition.mockResolvedValue(result);

      expect(await controller.createPosition(body)).toEqual(result);

      expect(mockPositionsService.createPosition).toHaveBeenCalledWith(body);
    });

    it('should create a child position with a parent', async () => {
      const body = {
        name: 'Engineer',
        description: 'Software Engineer',
        parentId: '1',
      };

      const result = {
        id: '2',
        ...body,
        parent: {
          id: '1',
          name: 'CEO',
        },
      };

      mockPositionsService.createPosition.mockResolvedValue(result);

      expect(await controller.createPosition(body)).toEqual(result);

      expect(mockPositionsService.createPosition).toHaveBeenCalledWith(body);
    });

    it('should throw if a CEO already exists', async () => {
      mockPositionsService.createPosition.mockRejectedValue(
        new Error('CEO already exists'),
      );

      await expect(
        controller.createPosition({
          name: 'COO',
          description: 'jjkj;lj;j;j',
          parentId: '1' as string | null,
        }),
      ).rejects.toThrow('CEO already exists');
    });

    it('should throw when parent position does not exist', async () => {
      mockPositionsService.createPosition.mockRejectedValue(
        new Error('Parent position not found'),
      );

      await expect(
        controller.createPosition({
          name: 'Developer',
          description: 'Frontend Developer',
          parentId: '1',
        }),
      ).rejects.toThrow('Parent position not found');
    });
  });
  //------------------ GET POSITIONS TESTS ------------------
  describe('getPositions', () => {
    it('should return all positions', async () => {
      const positions = [
        { id: '1', name: 'CEO' },
        { id: '2', name: 'CTO' },
      ];

      mockPositionsService.getPositions.mockResolvedValue(positions);

      expect(await controller.getPositions()).toEqual(positions);

      expect(mockPositionsService.getPositions).toHaveBeenCalled();
    });
  });
  //------------------ GET POSITION BY ID TESTS ------------------
  describe('getPositionById', () => {
    it('should return a position by id', async () => {
      const position = {
        id: '1',
        name: 'CEO',
      };

      mockPositionsService.getPositionById.mockResolvedValue(position);

      expect(await controller.getPositionById('1')).toEqual(position);

      expect(mockPositionsService.getPositionById).toHaveBeenCalledWith('1');
    });

    it('should throw if position not found', async () => {
      mockPositionsService.getPositionById.mockRejectedValue(
        new Error('Position not found'),
      );

      await expect(controller.getPositionById('99')).rejects.toThrow(
        'Position not found',
      );
    });
  });
  //------------------ GET CHILDREN TESTS ------------------
  describe('getChildren', () => {
    it('should return children of a position', async () => {
      const children = [
        { id: '2', name: 'CTO' },
        { id: '3', name: 'CFO' },
      ];

      mockPositionsService.getChildren.mockResolvedValue(children);

      expect(await controller.getChildren('1')).toEqual(children);

      expect(mockPositionsService.getChildren).toHaveBeenCalledWith('1');
    });

    it('should throw when position does not exist', async () => {
      mockPositionsService.getChildren.mockRejectedValue(
        new Error('Position not found'),
      );

      await expect(controller.getChildren('999')).rejects.toThrow(
        'Position not found',
      );
    });
  });
  //------------------ UPDATE POSITION TESTS ------------------
  describe('updatePosition', () => {
    it('should update position name', async () => {
      const dto = {
        name: 'Chief Technology Officer',
      };

      const result = {
        id: '2',
        ...dto,
      };

      mockPositionsService.updatePosition.mockResolvedValue(result);

      expect(await controller.updatePosition('2', dto)).toEqual(result);

      expect(mockPositionsService.updatePosition).toHaveBeenCalledWith(
        '2',
        dto,
      );
    });

    it('should throw for circular hierarchy', async () => {
      mockPositionsService.updatePosition.mockRejectedValue(
        new Error('Circular hierarchy detected'),
      );

      await expect(
        controller.updatePosition('1', { parentId: '3' }),
      ).rejects.toThrow('Circular hierarchy detected');
    });

    it('should throw for self-parenting', async () => {
      mockPositionsService.updatePosition.mockRejectedValue(
        new Error('Position cannot report to itself'),
      );

      await expect(
        controller.updatePosition('1', { parentId: '1' }),
      ).rejects.toThrow('Position cannot report to itself');
    });
  });

  //------------------ DELETE POSITION TESTS ------------------
  describe('deletePosition', () => {
    it('should delete a position', async () => {
      const result = {
        affected: 1,
      };

      mockPositionsService.deletePosition.mockResolvedValue(result);

      expect(await controller.deletePosition('1')).toEqual(result);

      expect(mockPositionsService.deletePosition).toHaveBeenCalledWith('1');
    });

    it('should throw if position not found', async () => {
      mockPositionsService.deletePosition.mockRejectedValue(
        new Error('Position not found'),
      );

      await expect(controller.deletePosition('999')).rejects.toThrow(
        'Position not found',
      );
    });
  });
});
