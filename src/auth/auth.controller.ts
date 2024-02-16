import { Body, Controller, Post } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { Public } from '../common/decorators';
import { AuthUserDto } from './dto';

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  
  @Public()
  @Post('login')
  login(@Body() dto: AuthUserDto) {
    return this.authService.login(dto);
  }
}
