// src/auth/auth.controller.ts
import { Body, Controller, Post,Res } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { AuthService } from './auth.service';
import { Response } from 'express';


@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('signin')
  async signin(@Body() dto: SigninDto, @Res({ passthrough: true }) res: Response) {
     const { access_token, refresh_token,user, } = await this.authService.signin(dto);

  res.cookie('access_token', access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  res.cookie('refresh_token', refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
    return { message: 'Login successful', user };
  }
}


