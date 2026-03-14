import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Post('login')
  async login(@Body() body: any) {
    const { username, password } = body;

    // Simple mock authentication
    if (username === 'admin' && password === 'admin123') {
      return {
        user: {
          id: 1,
          username: 'admin',
          displayName: 'Admin User',
          role: 'Admin',
        },
      };
    }

    throw new UnauthorizedException('Invalid credentials');
  }
}
