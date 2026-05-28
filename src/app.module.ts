import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { FoodModule } from './food/food.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [PrismaModule, AuthModule, FoodModule, OrderModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
