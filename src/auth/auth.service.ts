import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { RegisterUserDto } from './dto/registrerUser.dto';
import { omit } from '../utils';
import { PostgresErrorCode } from 'src/database/pgErrorCode';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  private EXCLUDED_FIELDS = ['password'];

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async registerUser(registerData: RegisterUserDto) {
    const hashedPassword = await bcrypt.hash(registerData.password, 10);
    try {
      const createdUser = await this.userService.create({
        ...registerData,
        password: hashedPassword,
      });

      return omit(this.EXCLUDED_FIELDS, createdUser);
    } catch (err) {
      console.log(err);
      if (err?.code === PostgresErrorCode.UniqueViolation) {
        throw new HttpException(
          'User with that email already exists',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public signInUser(userId: number) {
    return { cookies: this.getCookiesWithJwtToken(userId) };
  }

  public signOutUser() {
    return { cookies: this.getCookiesForLogOut() };
  }

  public async getAuthenticatedUser(email: string, password: string) {
    try {
      const user = await this.userService.getByEmail(email);

      await this.verifyPassword(password, user.password);
      return omit(this.EXCLUDED_FIELDS, user);
    } catch (error) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  private async verifyPassword(password: string, hashedPassword) {
    const isPasswordMatching = await bcrypt.compare(password, hashedPassword);
    if (!isPasswordMatching) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  private getCookiesWithJwtToken(userId: number) {
    const payload: { userId: number } = { userId };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: `${this.configService.get('JWT_ACCESS_EXPIRATION_TIME')}m`,
    });
    return `access_token=${token}; HttpOnly; Path=/; Max-Age=${
      this.configService.get('JWT_ACCESS_EXPIRATION_TIME') * 60
    }`;
  }
  private getCookiesForLogOut() {
    return `access_token=; HttpOnly; Path=/; Max-Age=0`;
  }
}
