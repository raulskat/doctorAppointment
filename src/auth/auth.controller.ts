// src/auth/auth.controller.ts
import { Body, Controller, Post, Req, Res, ForbiddenException } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { AuthService } from './auth.service';
import { Request,Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';


@Controller('api/v1/auth')
export class AuthController {
  constructor(
              private readonly authService: AuthService,
              private readonly jwtService: JwtService,
              private readonly config: ConfigService,
            ) {}

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
  sameSite: 'strict',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});
    return { message: 'Login successful', user };
  }

  @Post('refresh')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
  const refreshToken = req.cookies['refresh_token'];
  if (!refreshToken) throw new ForbiddenException('No refresh token');

  return this.authService.refreshTokens(refreshToken).then((data) => {
    res.cookie('refresh_token', data.refresh_token, {
      httpOnly: true,
      secure: false, // Set to true in production
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.send({
      access_token: data.access_token,
      user: data.user,
    });
  });
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




