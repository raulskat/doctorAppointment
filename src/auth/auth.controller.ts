// src/auth/auth.controller.ts

import { Body, Controller, Post, Req, Res, ForbiddenException, UseGuards, Get, Query, Redirect, BadRequestException } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { AuthService } from './auth.service';
import { Request,Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './guard/jwt-auth.guard';


@Controller('auth')
export class AuthController {
  constructor(
              private readonly authService: AuthService,
              private readonly jwtService: JwtService,
              private readonly config: ConfigService,
            ) {}


  @Get('google')
  @Redirect()
async googleLogin(@Query('role') role: string) {
  if (!role || !['doctor', 'patient'].includes(role.toLowerCase())) {
    throw new BadRequestException('Role must be doctor or patient');
  }

  const redirectUrl = await this.authService.getGoogleAuthURL(role.toLowerCase());
  return { url: redirectUrl };
}

@Get('google/callback')
async googleCallback(
  @Req() req: Request,
  @Res({ passthrough: true }) res: Response,
  @Query('code') code: string,
  @Query('state') state: string,
) {
  const result = await this.authService.handleGoogleCallback(code, state);

  if (result.status === 'existing') {
    const { access_token, refresh_token, user } = result;

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

    return {
      message: 'Login successful',
      user,
    };
  } else {
    // status === 'new'
    return {
      message: result.message,
      temp_token: result.temp_token,
      user: result.user,
    };
  }
}
@UseGuards(JwtAuthGuard)
@Post('google/complete-signup')
async completeGoogleSignup(
  @Body() dto: SignupDto,
  @Req() req,
) {
  return this.authService.completeGoogleSignup(dto, req.user);
}


  @Post('/signup')
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
  sameSite: 'strict',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});
    return { message: 'Login successful', user };
  }

  @Post('refresh')
async refreshToken(
  @Req() req: Request,
  @Res({ passthrough: true }) res: Response
) {
  const refreshToken = req.cookies['refresh_token'];
  if (!refreshToken) throw new ForbiddenException('No refresh token');

  const data = await this.authService.refreshTokens(refreshToken);

  res.cookie('refresh_token', data.refresh_token, {
    httpOnly: true,
    secure: false, // ✅ Set to true in production!
    sameSite: 'strict',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return { access_token: data.access_token, user: data.user };
}


  @Post('signout')
async signout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
  const token = req.cookies?.access_token;

  if (!token) throw new ForbiddenException('Access token not found');

  let payload;
  try {
    payload = this.jwtService.verify(token, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET'),
    });
  } catch (e) {
    throw new ForbiddenException('Invalid or expired token');
  }

  const userId = payload.sub;

  await this.authService.signout(userId);

  // Clear both cookies
  res.clearCookie('refresh_token', { path: '/' });
  res.clearCookie('access_token', { path: '/' });

  return { message: 'Successfully signed out' };
}



}




