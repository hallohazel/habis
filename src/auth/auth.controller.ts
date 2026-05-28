import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  RegisterUserDto,
  RegisterMerchantDto,
  LoginDto,
} from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/user')
  async registerUser(@Body() body: RegisterUserDto) {
    return this.authService.registerUser(body);
  }

  @Post('register/merchant')
  async registerMerchant(@Body() body: RegisterMerchantDto) {
    return this.authService.registerMerchant(body);
  }

  @Post('login/user')
  async loginUser(@Body() body: LoginDto) {
    return this.authService.loginUser(body);
  }

  @Post('login/merchant')
  async loginMerchant(@Body() body: LoginDto) {
    return this.authService.loginMerchant(body);
  }
}
