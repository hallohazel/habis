import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  UnauthorizedException,
  Patch,
  Param,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto, ClaimOrderDto } from './dto/order.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Order (Transaksi)') // Mengelompokkan di Swagger
@ApiBearerAuth('JWT-auth') // Memunculkan tombol gembok di semua rute
@UseGuards(AuthGuard('jwt')) // Penjaga keamanan NestJS (Class-level)
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * Endpoint untuk membuat pesanan baru.
   * Hanya dapat diakses oleh akun dengan role 'USER'.
   */
  @ApiOperation({ summary: 'Membuat pesanan makanan (Khusus Pembeli/User)' })
  @Post()
  async createOrder(@Req() { user }: any, @Body() body: CreateOrderDto) {
    if (user.role !== 'USER') {
      throw new UnauthorizedException(
        'Akses ditolak: Hanya Pembeli (User) yang dapat membuat pesanan!',
      );
    }

    return this.orderService.createOrder(user.id, body);
  }

  /**
   * Endpoint untuk Merchant (Toko) mengklaim pesanan menggunakan PIN.
   * Hanya dapat diakses oleh akun dengan role 'MERCHANT'.
   */
  @ApiOperation({
    summary: 'Klaim pesanan COD via PIN (Khusus Kasir/Merchant)',
  })
  @Patch(':id/claim')
  async claimOrder(
    @Req() { user }: any,
    @Param('id') orderId: string,
    @Body() { claimPin }: ClaimOrderDto,
  ) {
    if (user.role !== 'MERCHANT') {
      throw new UnauthorizedException(
        'Akses ditolak: Hanya Kasir Toko yang bisa mengklaim pesanan!',
      );
    }

    return this.orderService.claimOrder(orderId, user.id, claimPin);
  }
}
