import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // 1. Ambil URL Database dari file .env
    const connectionString = process.env.DATABASE_URL;

    // 2. Buat "Kolam Koneksi" menggunakan driver PostgreSQL standar
    const pool = new Pool({ connectionString });

    // 3. Bungkus kolam tersebut ke dalam Adapter khusus Prisma
    const adapter = new PrismaPg(pool);

    // 4. KUNCINYA: Lempar adapter tersebut ke constructor bawaan PrismaClient
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
