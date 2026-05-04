import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderStatus, PaymentStatus } from '../types/order-status.type';

@Injectable()
export class OrderRepository {
  constructor(
    @InjectRepository(Order)
    private readonly repo: Repository<Order>,
  ) {}

  async findAllByUserId(
    userId: number,
    page: number,
    limit: number,
    status?: OrderStatus,
  ): Promise<[Order[], number]> {
    const qb = this.repo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'item')
      .where('order.userId = :userId', { userId })
      .orderBy('order.createdAt', 'DESC');

    if (status) qb.andWhere('order.status = :status', { status });

    return qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
  }

  findByIdAndUserId(id: number, userId: number): Promise<Order | null> {
    return this.repo.findOne({
      where: { id, userId },
      relations: ['items', 'items.productVariant'],
    });
  }

  findById(id: number): Promise<Order | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['items', 'items.productVariant'],
    });
  }

  async findAllPaginated(
    page: number,
    limit: number,
    status?: OrderStatus,
  ): Promise<[Order[], number]> {
    const qb = this.repo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'item')
      .orderBy('order.createdAt', 'DESC');

    if (status) qb.andWhere('order.status = :status', { status });

    return qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
  }

  save(order: Partial<Order>): Promise<Order> {
    return this.repo.save(order);
  }

  async updateStatus(id: number, status: OrderStatus): Promise<void> {
    await this.repo.update(id, { status });
  }

  async updatePaymentStatus(id: number, paymentStatus: PaymentStatus): Promise<void> {
    await this.repo.update(id, { paymentStatus });
  }
}
