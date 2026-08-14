import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/auth.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto);
    const payload = {
      username: user.email,
      sub: {
        name: user.first_name,
        role: user.role.name,
      },
    };

    // Get token expiration from environment variables with fallbacks
    const accessTokenExpiration =
      process.env.JWT_ACCESS_TOKEN_EXPIRATION || '1h';
    const refreshTokenExpiration =
      process.env.JWT_REFRESH_TOKEN_EXPIRATION || '7d';

    // Convert string expiration to seconds for JWT v11 compatibility
    const expirationToSeconds = {
      '20s': 20,
      '1h': 3600,
      '7d': 604800,
      '24h': 86400,
    };
    const accessTokenExpiresIn =
      expirationToSeconds[accessTokenExpiration] || 3600;
    const refreshTokenExpiresIn =
      expirationToSeconds[refreshTokenExpiration] || 604800;

    const jwtSecret = this.configService.get<string>('jwtSecretKey');
    const jwtRefreshSecret = this.configService.get<string>('jwtRefreshToken');

    return {
      user,
      backendTokens: {
        // Access token with configurable duration from env
        accessToken: await this.jwtService.signAsync(payload, {
          expiresIn: accessTokenExpiresIn,
          secret: jwtSecret,
        }),
        refreshToken: await this.jwtService.signAsync(payload, {
          expiresIn: refreshTokenExpiresIn,
          secret: jwtRefreshSecret,
        }),
        expiresIn: new Date().setTime(
          new Date().getTime() + accessTokenExpiresIn * 1000,
        ),
      },
    };
  }

  // Validate user credentials
  async validateUser(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (user && (await bcrypt.compare(dto.password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    throw new UnauthorizedException('Invalid credentials.');
  }
}
