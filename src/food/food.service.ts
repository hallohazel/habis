import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFoodDto } from './dto/food.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class FoodService {
  constructor(private prisma: PrismaService) {}

  async createFood(merchantId: string, data: CreateFoodDto) {
    return this.prisma.food.create({
      data: {
        name: data.name,
        imageUrl: data.imageUrl,
        stock: data.stock,
        // Konversi tipe data agar sesuai dengan skema Prisma Anda
        originalPrice: new Prisma.Decimal(data.originalPrice),
        expiryTime: new Date(data.expiryTime),
        pickupDeadline: new Date(data.pickupDeadline),
        merchantId: merchantId,
      },
    });
  }

  async getAllFoods() {
    return this.prisma.food.findMany({
      where: { isActive: true }, // Tambahan: Hanya tampilkan makanan yang masih aktif!
      include: {
        merchant: {
          select: { name: true, address: true },
        },
      },
    });
  }
}
