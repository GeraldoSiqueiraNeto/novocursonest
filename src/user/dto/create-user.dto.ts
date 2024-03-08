import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator'
import { Role } from 'src/enums/role.enum'

export class CreateUserDto {
  @IsString()
  name: string

  @IsEmail()
  email: string

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 0,
    minUppercase: 0,
    minNumbers: 0,
    minSymbols: 0,
  })
  password: string

  @IsOptional()
  @IsDateString()
  birthDate: string

  @IsOptional()
  @IsEnum(Role)
  role: number
}
