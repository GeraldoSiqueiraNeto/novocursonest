import { Injectable, NotFoundException } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { UpdatePutUserDto } from './dto/update-put-user.dto'
import { UpdatePatchUserDto } from './dto/update-patch-user.dto'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto) {
    data.password = await bcrypt.hash(data.password, 10)

    return this.prisma.user.create({
      data,
    })
  }

  async list() {
    return this.prisma.user.findMany()
  }

  async show(id: number) {
    await this.exists(id)
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    })
  }

  async update(
    id: number,
    { email, password, name, birthDate, role }: UpdatePutUserDto,
  ) {
    await this.exists(id)
    password = await bcrypt.hash(password, 10)
    return this.prisma.user.update({
      data: {
        email,
        password,
        name,
        birthDate: birthDate ? new Date(birthDate) : null,
        role,
      },
      where: {
        id,
      },
    })
  }

  async updatePartial(
    id: number,

    { email, password, name, birthDate, role }: UpdatePatchUserDto,
  ) {
    await this.exists(id)
    const data: any = {}
    if (birthDate) {
      data.birthDate = new Date(birthDate)
    }
    if (email) {
      data.email = email
    }
    if (password) {
      data.password = await bcrypt.hash(password, 10)
    }
    if (name) {
      data.name = name
    }
    if (role) {
      data.name = role
    }
    return this.prisma.user.update({
      data,
      where: {
        id,
      },
    })
  }

  async delete(id: number) {
    await this.exists(id)
    return this.prisma.user.delete({
      where: {
        id,
      },
    })
  }
  async exists(id: number) {
    if (!(await this.prisma.user.count({ where: { id } }))) {
      throw new NotFoundException(`User with id ${id} not found`)
    }
  }
}
