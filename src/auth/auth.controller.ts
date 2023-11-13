import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { response, Response } from 'express';
import { omit } from 'src/utils';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/registrerUser.dto';
import JwtAuthGuard from './guard/jwt.auth.guard';
import { LocalAuthGuard } from './guard/local.auth.guard';
import { RequestWithUser } from './interface';

@Controller('auth')
export class AuthController {
  private EXCLUDED_FIELDS = ['password'];

  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() signUpData: RegisterUserDto) {
    return this.authService.registerUser(signUpData);
  }

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('signin')
  signIn(@Req() request: RequestWithUser) {
    const { user } = request;
    const { cookies } = this.authService.signInUser(user.id);
    request.res.setHeader('Set-Cookie', cookies);
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('signout')
  signOut(@Res() response: Response) {
    const { cookies } = this.authService.signOutUser();
    response.setHeader('Set-Cookie', cookies);
    return response.status(200).send('ok');
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  authenticate(@Req() request: RequestWithUser) {
    const { user } = request;
    return response.send(omit(this.EXCLUDED_FIELDS, user));
  }
}
