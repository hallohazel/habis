import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/order.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  /**
   * Logika untuk membuat pesanan baru.
   * Mencakup validasi stok, kalkulasi harga, dan penggunaan database transaction.
   */
  async createOrder(userId: string, data: CreateOrderDto) {
    // 1. Verifikasi keberadaan dan status aktif makanan
    const food = await this.prisma.food.findUnique({
      where: { id: data.foodId },
    });

    if (!food) {
      throw new NotFoundException('Makanan tidak ditemukan!');
    }
    if (!food.isActive) {
      throw new BadRequestException('Makanan ini sudah tidak tersedia.');
    }

    // 2. Validasi ketersediaan stok
    if (food.stock < data.quantity) {
      throw new BadRequestException(
        `Stok tidak mencukupi! Sisa stok: ${food.stock}`,
      );
    }

    // 3. Kalkulasi total harga berdasarkan data database (Backend Authority)
    const finalPrice = Number(food.originalPrice) * data.quantity;

    // 4. Set waktu kadaluarsa pesanan (Default: 15 menit)
    const expiredAt = new Date();
    expiredAt.setMinutes(expiredAt.getMinutes() + 15);

    // 5. Generate PIN klaim acak 4-digit
    const claimPin = Math.floor(1000 + Math.random() * 9000).toString();

    // 6. Eksekusi transaksi database (Atomicity)
    const result = await this.prisma.$transaction(async (prisma) => {
      // Update stok menggunakan decrement untuk menghindari race condition
      await prisma.food.update({
        where: { id: data.foodId },
        data: {
          stock: { decrement: data.quantity },
        },
      });

      // Simpan data pesanan baru
      return prisma.order.create({
        data: {
          userId,
          foodId: data.foodId,
          quantity: data.quantity,
          totalPrice: new Prisma.Decimal(finalPrice),
          expiredAt,
          claimPin,
          status: 'PENDING',
        },
      });
    });

    return {
      message: 'Pesanan berhasil dibuat! Silakan bayar dalam 15 menit.',
      data: result,
    };
  }

  /**
   * Logika untuk Merchant mengklaim pesanan menggunakan PIN.
   * Memastikan keamanan kepemilikan toko dan validitas status pesanan.
   */
  async claimOrder(orderId: string, merchantId: string, providedPin: string) {
    // 1. Ambil data pesanan beserta relasi makanan (untuk cek merchantId)
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { food: true },
    });

    if (!order) {
      throw new NotFoundException('Pesanan tidak ditemukan!');
    }

    // 2. Validasi kepemilikan: Pastikan pesanan ditujukan untuk merchant yang login
    if (order.food.merchantId !== merchantId) {
      throw new UnauthorizedException(
        'Akses ditolak: Anda tidak bisa mengklaim pesanan dari toko lain!',
      );
    }

    // 3. Validasi status pesanan saat ini
    if (order.status === 'CLAIMED') {
      throw new BadRequestException(
        'Pesanan ini sudah berhasil diklaim sebelumnya.',
      );
    }
    if (order.status === 'CANCELLED') {
      throw new BadRequestException(
        'Pesanan ini sudah dibatalkan dan tidak bisa diklaim.',
      );
    }

    // 4. Verifikasi PIN klaim
    if (order.claimPin !== providedPin) {
      throw new BadRequestException('PIN Klaim yang dimasukkan salah!');
    }

    // 5. Finalisasi klaim: Update status pesanan
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CLAIMED' },
    });
  }
}
