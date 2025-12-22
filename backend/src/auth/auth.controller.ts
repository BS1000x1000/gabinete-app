// import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
// import { AuthService } from './auth.service';
// import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
// import { TrabajadorService } from 'src/trabajador/trabajador.service';
// import { CreateTrabajadorDto } from 'src/trabajador/dto/trabajador.dto';
// import { JwtAuthGuard } from './guards/jwt-auth.guard';

// @Controller('auth')
// export class AuthController {
//   constructor(
//     private readonly authService: AuthService,
//     private trabajadorService: TrabajadorService,
//   ) {}

//   @Post('auth/register')
//   async register(@Body() body: CreateTrabajadorDto) {
//     return this.trabajadorService.create(body);
//   }

//   @UseGuards(LocalAuthGuard)
//   @Post('auth/login')
//   login(@Request() req) {
//     return this.authService.login(req.user);
//   }

//   @UseGuards(JwtAuthGuard)
//   @Get('auth/profile')
//   async getProfile(@Request() req) {
//     return await this.trabajadorService.findOne(req.user.id);
//   }
// }
