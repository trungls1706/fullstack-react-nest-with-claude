import { Test, TestingModule } from '@nestjs/testing';
import { AddressesController } from '../addresses.controller';
import { AddressesService } from '../addresses.service';
import { Address } from '../entities/address.entity';
import { User } from '../../auth/entities/user.entity';

const mockUser = (): Partial<User> => ({ id: 10, email: 'user@example.com' });

const mockAddress = (): Address => ({
  id: 1,
  userId: 10,
  fullName: 'Nguyen Van A',
  phone: '0901234567',
  addressLine: '123 ABC Street',
  city: 'Ho Chi Minh',
  isDefault: false,
  user: null as any,
});

describe('AddressesController', () => {
  let controller: AddressesController;
  let service: jest.Mocked<AddressesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AddressesController],
      providers: [
        {
          provide: AddressesService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            setDefault: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AddressesController>(AddressesController);
    service = module.get(AddressesService);
  });

  describe('findAll', () => {
    it('should return all addresses for the current user', async () => {
      const user = mockUser() as User;
      const addresses = [mockAddress()];
      service.findAll.mockResolvedValue(addresses);

      const result = await controller.findAll(user);

      expect(service.findAll).toHaveBeenCalledWith(10);
      expect(result).toEqual(addresses);
    });
  });

  describe('findOne', () => {
    it('should return a single address', async () => {
      const user = mockUser() as User;
      const address = mockAddress();
      service.findOne.mockResolvedValue(address);

      const result = await controller.findOne(1, user);

      expect(service.findOne).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(address);
    });
  });

  describe('create', () => {
    it('should create and return a new address', async () => {
      const user = mockUser() as User;
      const dto = {
        fullName: 'Nguyen Van A',
        phone: '0901234567',
        addressLine: '123 ABC',
        city: 'HCM',
      };
      const created = mockAddress();
      service.create.mockResolvedValue(created);

      const result = await controller.create(user, dto);

      expect(service.create).toHaveBeenCalledWith(10, dto);
      expect(result).toEqual(created);
    });
  });

  describe('update', () => {
    it('should update and return the address', async () => {
      const user = mockUser() as User;
      const dto = { city: 'Ha Noi' };
      const updated = { ...mockAddress(), city: 'Ha Noi' };
      service.update.mockResolvedValue(updated);

      const result = await controller.update(1, user, dto);

      expect(service.update).toHaveBeenCalledWith(1, 10, dto);
      expect(result.city).toBe('Ha Noi');
    });
  });

  describe('remove', () => {
    it('should call service remove', async () => {
      const user = mockUser() as User;
      service.remove.mockResolvedValue();

      await controller.remove(1, user);

      expect(service.remove).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('setDefault', () => {
    it('should set address as default', async () => {
      const user = mockUser() as User;
      const address = { ...mockAddress(), isDefault: true };
      service.setDefault.mockResolvedValue(address);

      const result = await controller.setDefault(1, user);

      expect(service.setDefault).toHaveBeenCalledWith(1, 10);
      expect(result.isDefault).toBe(true);
    });
  });
});
