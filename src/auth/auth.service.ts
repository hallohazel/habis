import {
  Injectable,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  RegisterUserDto,
  RegisterMerchantDto,
  LoginDto,
} from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService, // Injeksi JwtService
  ) {}

  // LOGIC REGISTER UNTUK PEMBELI (USER)
  async registerUser(data: RegisterUserDto) {
    const { name, email, password, phone } = data;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email sudah digunakan!');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
      },
    });

    const result = { ...newUser };
    delete (result as any).password;

    return {
      message: 'Registrasi User berhasil!',
      data: result,
    };
  }

  // LOGIC REGISTER UNTUK TOKO (MERCHANT)
  async registerMerchant(data: RegisterMerchantDto) {
    const { name, email, password, address, certificateCode } = data;

    const certificate = await this.prisma.certificate.findUnique({
      where: { code: certificateCode },
    });

    if (!certificate) {
      throw new BadRequestException(
        'Kode sertifikat tidak valid atau tidak ditemukan!',
      );
    }
    if (certificate.isUsed) {
      throw new BadRequestException(
        'Sertifikat ini sudah digunakan oleh toko lain!',
      );
    }

    const existingMerchant = await this.prisma.merchant.findUnique({
      where: { email },
    });
    if (existingMerchant) {
      throw new ConflictException('Email sudah digunakan!');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newMerchant = await this.prisma.$transaction(async (prisma) => {
      await prisma.certificate.update({
        where: { id: certificate.id },
        data: { isUsed: true },
      });

      return prisma.merchant.create({
        data: {
          name,
          email,
          password: hashedPassword,
          address,
          certificateId: certificate.id,
        },
      });
    });

    const result = { ...newMerchant };
    delete (result as any).password;

    return {
      message: 'Registrasi Merchant berhasil!',
      data: result,
    };
  }

  // LOGIC LOGIN UNTUK PEMBELI (USER)
  async loginUser(data: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (!user) {
      throw new UnauthorizedException('Email atau password salah!');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau password salah!');
    }

    const payload = { sub: user.id, role: 'USER' };

    return {
      message: 'Login berhasil!',
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  // LOGIC LOGIN UNTUK TOKO (MERCHANT)
  async loginMerchant(data: LoginDto) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { email: data.email },
    });
    if (!merchant) {
      throw new UnauthorizedException('Email atau password salah!');
    }

    const isPasswordValid = await bcrypt.compare(
      data.password,
      merchant.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau password salah!');
    }

    const payload = { sub: merchant.id, role: 'MERCHANT' };

    return {
      message: 'Login berhasil!',
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
