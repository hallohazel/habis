import { Controller, Post, Get, Body, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { FoodService } from './food.service';
import { CreateFoodDto } from './dto/food.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('food')
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  @UseGuards(AuthGuard('jwt')) 
  @Post()
  async createFood(@Req() req: any, @Body() body: CreateFoodDto) {
    // Validasi ketat: Hanya Merchant yang boleh posting makanan
    if (req.user.role !== 'MERCHANT') {
      throw new UnauthorizedException('Akses ditolak: Hanya Merchant yang dapat menambah makanan!');
    }

    return this.foodService.createFood(req.user.id, body);
  }

  @Get()
  async getAllFoods() {
    return this.foodService.getAllFoods();
  }
}
