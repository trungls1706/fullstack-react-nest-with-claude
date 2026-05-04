import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Address } from './entities/address.entity';
import { AddressRepository } from './repositories/address.repository';

@Injectable()
export class AddressesService {
  private readonly logger = new Logger(AddressesService.name);

  constructor(private readonly addressRepository: AddressRepository) {}

  findAll(userId: number): Promise<Address[]> {
    return this.addressRepository.findAllByUserId(userId);
  }

  async findOne(id: number, userId: number): Promise<Address> {
    const address = await this.addressRepository.findOneByIdAndUserId(id, userId);
    if (!address) {
      throw new NotFoundException(`Address #${id} not found`);
    }
    return address;
  }

  async create(userId: number, dto: CreateAddressDto): Promise<Address> {
    this.logger.log(`Creating address for user #${userId}`);

    if (dto.isDefault) {
      await this.addressRepository.clearDefaultForUser(userId);
    }

    return this.addressRepository.save({ ...dto, userId });
  }

  async update(id: number, userId: number, dto: UpdateAddressDto): Promise<Address> {
    const address = await this.addressRepository.findOneByIdAndUserId(id, userId);
    if (!address) {
      throw new NotFoundException(`Address #${id} not found`);
    }

    if (dto.isDefault) {
      await this.addressRepository.clearDefaultForUser(userId);
    }

    return this.addressRepository.save({ ...address, ...dto });
  }

  async remove(id: number, userId: number): Promise<void> {
    const address = await this.addressRepository.findOneByIdAndUserId(id, userId);
    if (!address) {
      throw new NotFoundException(`Address #${id} not found`);
    }
    await this.addressRepository.delete(id);
    this.logger.log(`Deleted address #${id} for user #${userId}`);
  }

  async setDefault(id: number, userId: number): Promise<Address> {
    const address = await this.addressRepository.findOneByIdAndUserId(id, userId);
    if (!address) {
      throw new NotFoundException(`Address #${id} not found`);
    }

    await this.addressRepository.clearDefaultForUser(userId);
    return this.addressRepository.save({ ...address, isDefault: true });
  }
}
