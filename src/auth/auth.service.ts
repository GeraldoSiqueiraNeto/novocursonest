import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { User } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { AuthRegisterDTO } from './dto/auth-register.dto'
import * as bcrypt from 'bcrypt'
import { MailerService } from '@nestjs-modules/mailer'

@Injectable()
export class AuthService {
  authService: any
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly mailer: MailerService,
  ) {}

  createToken(user: User) {
    return {
      accessToken: this.jwtService.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        {
          expiresIn: '7 days',
          subject: String(user.id),
          issuer: 'login',
          audience: 'users',
        },
      ),
    }
  }

  checkToken(token: string) {
    try {
      const data = this.jwtService.verify(token, {
        audience: 'users',
        issuer: 'login',
      })
      return data
    } catch (error) {
      throw new UnauthorizedException(error)
    }
  }
  isValidToken(token: string) {
    try {
      this.checkToken(token)
      return true
    } catch (error) {
      return false
    }
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
      },
    })
    if (!user) {
      throw new UnauthorizedException(`Invalid email or password`)
    }
    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException(`Invalid email or password`)
    }

    return this.createToken(user)
  }

  async forget(email: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
      },
    })
    if (!user) {
      throw new UnauthorizedException(`Invalid email`)
    }
    const token = this.jwtService.sign(
      {
        id: user.id,
      },
      {
        expiresIn: '30 minutes',
        subject: String(user.id),
        issuer: 'forget',
        audience: 'users',
      },
    )
    await this.mailer.sendMail({
      subject: 'Reset Password',
      to: email,
      template: 'forget',
      context: {
        name: user.name,
        token,
      },
    })
    return true
  }

  async reset(password: string, token: string) {
    try {
      const data: any = this.jwtService.verify(token, {
        issuer: 'forget',
        audience: 'users',
      })
      if (isNaN(Number(data.id))) {
        throw new BadRequestException(`Invalid token`)
      }
      const salt = await bcrypt.genSalt()
      password = await bcrypt.hash(password, salt)

      const user = await this.prisma.user.update({
        where: {
          id: Number(data.id),
        },
        data: {
          password,
        },
      })
      return this.createToken(user)
    } catch (error) {
      throw new BadRequestException(error)
    }
  }

  async register(data: AuthRegisterDTO) {
    const user = await this.authService.create(data)
    return this.createToken(user)
  }
}
