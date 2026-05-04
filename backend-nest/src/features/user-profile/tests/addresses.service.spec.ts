import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AddressesService } from '../addresses.service';
import { Address } from '../entities/address.entity';
import { AddressRepository } from '../repositories/address.repository';

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

describe('AddressesService', () => {
  let service: AddressesService;
  let repository: jest.Mocked<AddressRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressesService,
        {
          provide: AddressRepository,
          useValue: {
            findAllByUserId: jest.fn(),
            findOneByIdAndUserId: jest.fn(),
            save: jest.fn(),
            clearDefaultForUser: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AddressesService>(AddressesService);
    repository = module.get(AddressRepository);
  });

  describe('findAll', () => {
    it('should return all addresses for a user', async () => {
      const addresses = [mockAddress()];
      repository.findAllByUserId.mockResolvedValue(addresses);

      const result = await service.findAll(10);

      expect(repository.findAllByUserId).toHaveBeenCalledWith(10);
      expect(result).toEqual(addresses);
    });
  });

  describe('findOne', () => {
    it('should return an address when found', async () => {
      const address = mockAddress();
      repository.findOneByIdAndUserId.mockResolvedValue(address);

      const result = await service.findOne(1, 10);

      expect(repository.findOneByIdAndUserId).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(address);
    });

    it('should throw NotFoundException when address not found', async () => {
      repository.findOneByIdAndUserId.mockResolvedValue(null);

      await expect(service.findOne(99, 10)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create an address', async () => {
      const dto = {
        fullName: 'Nguyen Van A',
        phone: '0901234567',
        addressLine: '123 ABC',
        city: 'HCM',
      };
      const saved = { ...mockAddress(), ...dto };
      repository.save.mockResolvedValue(saved);

      const result = await service.create(10, dto);

      expect(repository.clearDefaultForUser).not.toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalledWith({ ...dto, userId: 10 });
      expect(result).toEqual(saved);
    });

    it('should clear other defaults when isDefault is true', async () => {
      const dto = {
        fullName: 'Nguyen Van A',
        phone: '0901234567',
        addressLine: '123 ABC',
        city: 'HCM',
        isDefault: true,
      };
      const saved = { ...mockAddress(), ...dto };
      repository.save.mockResolvedValue(saved);

      await service.create(10, dto);

      expect(repository.clearDefaultForUser).toHaveBeenCalledWith(10);
    });
  });

  describe('update', () => {
    it('should update an address', async () => {
      const address = mockAddress();
      const dto = { city: 'Ha Noi' };
      const updated = { ...address, ...dto };
      repository.findOneByIdAndUserId.mockResolvedValue(address);
      repository.save.mockResolvedValue(updated);

      const result = await service.update(1, 10, dto);

      expect(result.city).toBe('Ha Noi');
    });

    it('should throw NotFoundException when address not found', async () => {
      repository.findOneByIdAndUserId.mockResolvedValue(null);

      await expect(service.update(99, 10, { city: 'HCM' })).rejects.toThrow(NotFoundException);
    });

    it('should clear other defaults when setting isDefault to true', async () => {
      const address = mockAddress();
      repository.findOneByIdAndUserId.mockResolvedValue(address);
      repository.save.mockResolvedValue({ ...address, isDefault: true });

      await service.update(1, 10, { isDefault: true });

      expect(repository.clearDefaultForUser).toHaveBeenCalledWith(10);
    });
  });

  describe('remove', () => {
    it('should delete an address', async () => {
      repository.findOneByIdAndUserId.mockResolvedValue(mockAddress());

      await service.remove(1, 10);

      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when address not found', async () => {
      repository.findOneByIdAndUserId.mockResolvedValue(null);

      await expect(service.remove(99, 10)).rejects.toThrow(NotFoundException);
    });
  });

  describe('setDefault', () => {
    it('should set an address as default', async () => {
      const address = mockAddress();
      const defaulted = { ...address, isDefault: true };
      repository.findOneByIdAndUserId.mockResolvedValue(address);
      repository.save.mockResolvedValue(defaulted);

      const result = await service.setDefault(1, 10);

      expect(repository.clearDefaultForUser).toHaveBeenCalledWith(10);
      expect(result.isDefault).toBe(true);
    });

    it('should throw NotFoundException when address not found', async () => {
      repository.findOneByIdAndUserId.mockResolvedValue(null);

      await expect(service.setDefault(99, 10)).rejects.toThrow(NotFoundException);
    });
  });
});
