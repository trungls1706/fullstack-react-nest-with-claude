import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PaginatedResult } from '../../../shared/types/pagination.type';
import { getPaginationParams, paginate } from '../../../shared/utils/pagination.util';
import { QueryOrderDto } from '../dto/query-order.dto';
import { UpdateOrderPaymentDto } from '../dto/update-order-payment.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { Order } from '../entities/order.entity';
import { OrderRepository } from '../repositories/order.repository';
import { OrderStatus } from '../types/order-status.type';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(private readonly orderRepository: OrderRepository) {}

  async getMyOrders(userId: number, query: QueryOrderDto): Promise<PaginatedResult<Order>> {
    const { page, limit } = getPaginationParams(query.page, query.limit);
    const [orders, total] = await this.orderRepository.findAllByUserId(
      userId,
      page,
      limit,
      query.status,
    );
    return paginate(orders, total, page, limit);
  }

  async getMyOrderById(id: number, userId: number): Promise<Order> {
    const order = await this.orderRepository.findByIdAndUserId(id, userId);
    if (!order) throw new NotFoundException(`Order #${id} not found`);
    return order;
  }

  async cancelOrder(id: number, userId: number): Promise<Order> {
    const order = await this.orderRepository.findByIdAndUserId(id, userId);
    if (!order) throw new NotFoundException(`Order #${id} not found`);

    const cancellable: OrderStatus[] = [OrderStatus.PENDING, OrderStatus.CONFIRMED];
    if (!cancellable.includes(order.status)) {
      throw new BadRequestException(
        'Cannot cancel order that is already shipping, delivered, or cancelled',
      );
    }

    this.logger.log(`Cancelling order #${id} for user #${userId}`);
    await this.orderRepository.updateStatus(id, OrderStatus.CANCELLED);
    return (await this.orderRepository.findByIdAndUserId(id, userId))!;
  }

  // Admin methods

  async getAllOrders(query: QueryOrderDto): Promise<PaginatedResult<Order>> {
    const { page, limit } = getPaginationParams(query.page, query.limit);
    const [orders, total] = await this.orderRepository.findAllPaginated(page, limit, query.status);
    return paginate(orders, total, page, limit);
  }

  async getOrderById(id: number): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) throw new NotFoundException(`Order #${id} not found`);
    return order;
  }

  async updateStatus(id: number, dto: UpdateOrderStatusDto): Promise<Order> {
    await this.getOrderById(id);
    this.logger.log(`Updating order #${id} status to ${dto.status}`);
    await this.orderRepository.updateStatus(id, dto.status);
    return (await this.orderRepository.findById(id))!;
  }

  async updatePayment(id: number, dto: UpdateOrderPaymentDto): Promise<Order> {
    await this.getOrderById(id);
    this.logger.log(`Updating order #${id} payment status to ${dto.paymentStatus}`);
    await this.orderRepository.updatePaymentStatus(id, dto.paymentStatus);
    return (await this.orderRepository.findById(id))!;
  }
}
