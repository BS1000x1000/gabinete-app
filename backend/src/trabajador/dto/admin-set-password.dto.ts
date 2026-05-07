import { IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { PASSWORD_REGEX, PASSWORD_MSG } from './password-validators';

export class AdminSetPasswordDto {
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MSG })
  passwordNueva: string;
}
