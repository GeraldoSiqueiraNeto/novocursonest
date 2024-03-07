import {
  Body,
  Controller,
  Post,
  Get,
  Put,
  Patch,
  Delete,
  UseInterceptors,
} from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdatePutUserDto } from './dto/update-put-user.dto'
import { UpdatePatchUserDto } from './dto/update-patch-user.dto'
import { UserService } from './user.service'
import { LogInterceptor } from 'src/interceptors/log.interceptor'
import { ParamId } from 'src/decorator/param-id.decorator'

@UseInterceptors(LogInterceptor)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() data: CreateUserDto) {
    return this.userService.create(data)
  }

  @Get()
  async list() {
    return this.userService.list()
  }

  @Get(':id')
  async show(@ParamId() id: number) {
    return this.userService.show(id)
  }

  @Put(':id')
  async update(@Body() data: UpdatePutUserDto, @ParamId() id: number) {
    return this.userService.update(id, data)
  }

  @Patch(':id')
  async updatePartial(@Body() data: UpdatePatchUserDto, @ParamId() id: number) {
    return this.userService.updatePartial(id, data)
  }

  @Delete(':id')
  async delete(@ParamId() id: number) {
    return this.userService.delete(id)
  }
}
