import { Controller, Get, Post, Body, HttpStatus, HttpCode, UseGuards, Req, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { Auth } from './decorators/auth.decorator';
import { GetUser } from './decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';
import AuthDto from './dto/auth.dto';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  signin(@Body() authDto: AuthDto){
    return this.authService.signin(authDto);
  }

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  signup(@Body() createUserDto: CreateUserDto){
    return this.authService.signup(createUserDto);
  }


  @Get('refresh')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  refresh(
    @GetUser() user: any,
  ){
    return this.authService.refresh(user.sub, user.refreshToken);
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @Auth()
  me(
    @GetUser() user: User,
  ){
    const { password, refreshToken, ...rest } = user;
    return {
      ...rest
    }
  }

  @Auth()
  @Patch('logout')
  logOut(
    @GetUser() user: User,
  ){
    return this.authService.logout(
      user.id,
    );
  }

  // @Post('forgot')
  // forgot(){
  //   this.authService.forgot();
  // }
}
