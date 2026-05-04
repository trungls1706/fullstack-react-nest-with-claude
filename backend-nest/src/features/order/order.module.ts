import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartModule } from '../cart/cart.module';
import { UserProfileModule } from '../user-profile/user-profile.module';
import { AdminOrderController } from './controllers/admin-order.controller';
import { OrderController } from './controllers/order.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderItemRepository } from './repositories/order-item.repository';
import { OrderRepository } from './repositories/order.repository';
import { CheckoutService } from './services/checkout.service';
import { OrderService } from './services/order.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    CartModule,
    UserProfileModule,
  ],
  controllers: [OrderController, AdminOrderController],
  providers: [OrderService, CheckoutService, OrderRepository, OrderItemRepository],
  exports: [OrderService, OrderRepository],
})
export class OrderModule {}
