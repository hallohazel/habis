# Project Context: Habis! Backend API

## Deskripsi Proyek
"Habis!" adalah aplikasi backend berbasis REST API. Sistem ini memiliki dua jenis entitas pengguna utama: `User` (pembeli) dan `Merchant` (toko/penjual). Pendaftaran Merchant membutuhkan validasi `Certificate` yang valid.

## Tech Stack & Versi Spesifik (PENTING!)
- **Framework:** NestJS (TypeScript).
- **Database:** PostgreSQL.
- **ORM:** Prisma **(Versi 7.8.0)**.
  - *Catatan Kritis Prisma 7:* Konfigurasi koneksi database tidak lagi berada di dalam `schema.prisma`. Jangan menyarankan penggunaan `url = env("DATABASE_URL")` di dalam blok datasource. Aplikasi ini menggunakan konfigurasi eksternal melalui `prisma.config.ts` dan adapter injeksi dinamis `@prisma/adapter-pg` di dalam `PrismaService`.
- **Autentikasi:** `@nestjs/jwt`, `passport-jwt`, dan `bcrypt` (Enkripsi hash 10 salt rounds).
- **Linter/Formatter:** ESLint (menggunakan format baru Flat Config `eslint.config.mjs`). Aturan strict TypeScript seperti `no-explicit-any` dan `no-unsafe-assignment` telah dinonaktifkan untuk mempercepat proses prototyping.

## Arsitektur & Aturan Kode
1. **Modularity:** Tulis kode dengan pendekatan modular khas NestJS (Module, Controller, Service).
2. **DTOs (Data Transfer Objects):** Selalu gunakan DTO berkelas (`class`) untuk validasi input dari *body request*.
3. **Keamanan:** Endpoint yang membutuhkan autentikasi harus dilindungi menggunakan `@UseGuards(AuthGuard('jwt'))`.
4. **Database Transactions:** Gunakan `this.prisma.$transaction` ketika ada dua atau lebih operasi database yang saling bergantung (seperti update status sertifikat dan pembuatan merchant) untuk menjaga konsistensi data.

## Status Proyek Saat Ini (Sudah Selesai)
- Koneksi Prisma ke PostgreSQL sudah terhubung sempurna.
- `AuthModule` sudah selesai sepenuhnya.
- Terdapat 2 rute pendaftaran:
  - `POST /auth/register/user`
  - `POST /auth/register/merchant` (memvalidasi `certificateCode` dan menandainya sebagai `isUsed: true`).
- Terdapat 2 rute login:
  - `POST /auth/login/user`
  - `POST /auth/login/merchant`
- `JwtStrategy` sudah dibuat dan mengekstrak `Bearer Token` dengan *payload* `{ sub: id, role: 'USER' | 'MERCHANT' }`.

## Aturan Interaksi AI (Instruction for the Assistant)
1. **Jelaskan Logika, Jangan Hanya Kode:** Pengguna sedang memperdalam ilmu *software engineering*. Setiap kali memberikan solusi atau blok kode baru, jelaskan *logika fundamental* di baliknya. Mengapa menggunakan fungsi ini? Bagaimana alur kerjanya? 
2. **Berbahasa Indonesia:** Gunakan bahasa Indonesia yang asyik, profesional, namun mudah dipahami (tidak kaku).
3. **Ringkas namun Komprehensif:** Jika terjadi error, langsung tunjukkan baris yang perlu diperbaiki tanpa merusak file yang sudah berjalan baik.