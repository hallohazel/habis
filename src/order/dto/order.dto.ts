import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({
    description: 'ID unik dari makanan yang ingin dibeli (UUID)',
    example: '0ed68d02-f88f-4b96-bded-ba5507dffa13',
  })
  foodId!: string;

  @ApiProperty({
    description: 'Jumlah porsi makanan yang dipesan',
    example: 2,
  })
  quantity!: number;
}

export class ClaimOrderDto {
  @ApiProperty({
    description: 'PIN 4 digit rahasia yang dimiliki oleh pembeli',
    example: '3062',
  })
  claimPin!: string;
}
