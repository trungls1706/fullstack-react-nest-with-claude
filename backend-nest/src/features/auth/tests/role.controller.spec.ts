import { Test, TestingModule } from '@nestjs/testing';
import { RoleController } from '../controllers/role.controller';
import { RoleService } from '../services/role.service';
import { Role } from '../entities/role.entity';

describe('RoleController', () => {
  let controller: RoleController;
  let service: jest.Mocked<RoleService>;

  const mockRole: Role = { id: 1, name: 'admin' };

  beforeEach(async () => {
    const serviceMock: Partial<jest.Mocked<RoleService>> = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [{ provide: RoleService, useValue: serviceMock }],
    }).compile();

    controller = module.get(RoleController);
    service = module.get(RoleService);
  });

  it('GET /roles delegates to service.findAll', async () => {
    service.findAll.mockResolvedValue([mockRole]);
    await expect(controller.findAll()).resolves.toEqual([mockRole]);
  });

  it('GET /roles/:id delegates to service.findById', async () => {
    service.findById.mockResolvedValue(mockRole);
    await expect(controller.findOne(1)).resolves.toEqual(mockRole);
    expect(service.findById).toHaveBeenCalledWith(1);
  });

  it('POST /admin/roles delegates to service.create', async () => {
    const dto = { name: 'admin' };
    service.create.mockResolvedValue(mockRole);
    await expect(controller.create(dto)).resolves.toEqual(mockRole);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('PATCH /admin/roles/:id delegates to service.update', async () => {
    const dto = { name: 'manager' };
    const updated = { id: 1, name: 'manager' };
    service.update.mockResolvedValue(updated);
    await expect(controller.update(1, dto)).resolves.toEqual(updated);
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });

  it('DELETE /admin/roles/:id delegates to service.remove', async () => {
    service.remove.mockResolvedValue(undefined);
    await expect(controller.remove(1)).resolves.toBeUndefined();
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
