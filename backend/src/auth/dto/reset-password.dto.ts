import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { PASSWORD_REGEX, PASSWORD_MSG } from '../../trabajador/dto/password-validators';

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MSG })
  newPassword: string;
}
