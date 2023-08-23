import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import AuthDto from './dto/auth.dto';
import {hashData, compareHash } from '../utils/hash.util';
import { match } from 'assert';
import { JwtPayload } from './interfaces/jwt-payload.interface';


@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  async signin(authDto: AuthDto) {
    const { password, username } = authDto;

    const user = await this.usersService.findOneByTerm(username);


    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatchs = await compareHash(password, user.password);


    if (!passwordMatchs) {
      throw new UnauthorizedException('Invalid credentials');
    }

    delete user.password;

    const { id } = user;

    const tokens = await this.getTokens({
      id,
      username,
    });

    await this.updateRefreshToken(user.id, tokens.refreshToken);
    delete user.refreshToken;

    return {
      user,
      tokens,
    };
  }

  async signup(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    const {id, username} = user;
    const tokens = await this.getTokens({
      id,
      username,
    });
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    delete user.refreshToken;
    return {
      user,
      tokens,
    };
  }



  async refresh(userId: string, refreshToken: string) {
    const user = await this.usersService.findOne(userId);
    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access Denied');
    const refreshTokenMatches = await compareHash(
      refreshToken,
      user.refreshToken,
    );
    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');
    const {id, username} = user;
    
    const tokens = await this.getTokens({
      id,
      username,
    });
    await this.updateRefreshToken(id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string) {
    await this.usersService.update(userId, {
      refreshToken: null,
    });
  }

  //TODO: Implement forgotPassword and resetPassword
  forgot() {}



  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await hashData(refreshToken);
    await this.usersService.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async getTokens(payload: JwtPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        payload,
        {
          secret: this.configService.get<string>('AUTH_ACCESS_SECRET'),
          expiresIn: this.configService.get<string>(
            'AUTH_ACCESS_TOKEN_EXPIRES_IN',
          ),
        },
      ),
      this.jwtService.signAsync(
        payload,
        {
          secret: this.configService.get<string>('AUTH_REFRESH_SECRET'),
          expiresIn: this.configService.get<string>(
            'AUTH_REFRESH_TOKEN_EXPIRES_IN',
          ),
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
