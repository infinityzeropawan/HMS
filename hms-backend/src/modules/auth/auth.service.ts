import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto, RefreshTokenDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    // Stub login validation
    const mockUser = {
      id: '11223344-5566-7788-9900-aabbccddeeff',
      email: loginDto.email,
      tenantId: '8f3b2a1c-9d0e-4f5a-8b2c-1d3e5f7a9b0c',
      hospitalId: '22334455-6677-8899-0011-bbccddeeff00',
      role: 'DOCTOR',
      fullName: 'Dr. Ramesh Kumar',
    };

    const payload = {
      sub: mockUser.id,
      email: mockUser.email,
      tenantId: mockUser.tenantId,
      hospitalId: mockUser.hospitalId,
      role: mockUser.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET') || 'hms_super_secret_refresh_key_2026',
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
      tenantId: mockUser.tenantId,
      hospitalId: mockUser.hospitalId,
      user: {
        id: mockUser.id,
        fullName: mockUser.fullName,
        email: mockUser.email,
        role: mockUser.role,
      },
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    // TODO: Implement token rotation logic against Redis/UserSession table
    return {
      accessToken: 'stub_new_access_token',
      refreshToken: refreshTokenDto.refreshToken,
    };
  }
}
