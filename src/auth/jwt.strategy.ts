import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

interface JwtPayload {
  sub: string;
  role: 'USER' | 'MERCHANT';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'rahasia_habis_app',
    });
  }

  /**
   * Memvalidasi payload JWT dan mengembalikan data user yang akan ditempel ke request.user.
   */
  async validate(payload: JwtPayload) {
    const { sub: id, role } = payload;

    switch (role) {
      case 'USER':
        return this.validateUser(id);
      case 'MERCHANT':
        return this.validateMerchant(id);
      default:
        throw new UnauthorizedException('Role tidak valid!');
    }
  }

  /**
   * Validasi entitas User (Pembeli).
   */
  private async validateUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan!');
    }
    return { id: user.id, role: 'USER', email: user.email };
  }

  /**
   * Validasi entitas Merchant (Toko).
   */
  private async validateMerchant(id: string) {
    const merchant = await this.prisma.merchant.findUnique({ where: { id } });
    if (!merchant) {
      throw new UnauthorizedException('Merchant tidak ditemukan!');
    }
    return { id: merchant.id, role: 'MERCHANT', email: merchant.email };
  }
}
