import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, Post, Body, Get, Request } from '@nestjs/common'
import { CreateUserDto } from 'src/users/dto/create-user.dto'
import { UsersService } from 'src/users/users.service'
import { LoginDto } from './dto/auth.dto'
import { AuthService } from './auth.service'
import { Public } from './decorators/public.decorator'

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  @Public()
  @Post('register')
  async registerUser(@Body() dto: CreateUserDto) {
    return await this.usersService.create(dto)
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto)
  }

  @Get('status')
  async getStatus(@Request() req) {
    // Si llegamos aquí, el token es válido (JWT Guard lo validó)
    return {
      status: 'valid',
      user: req.user,
    };
  }
}

