export class RegisterUserDto {
  name!: string;
  email!: string;
  password!: string;
  phone?: string; // Tanda tanya berarti opsional
}

export class RegisterMerchantDto {
  name!: string;
  email!: string;
  password!: string;
  address!: string;
  certificateCode!: string;
}

export class LoginDto {
  email!: string;
  password!: string;
}
