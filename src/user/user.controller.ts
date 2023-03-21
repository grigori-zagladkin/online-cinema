import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Post,
	Put,
	Query,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common'
import { Types } from 'mongoose'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { IdValidationPipe } from 'src/pipes/id.validation.pipe'
import { User } from './decorators/user.decorator'
import { UpdateUserDto } from './update-user.dto'
import { UserModel } from './user.model'
import { UserService } from './user.service'

@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get('profile')
	@Auth()
	async getProfile(@User('_id') _id: string) {
		return this.userService.byId(_id)
	}

	@Get('profile/favourites')
	@Auth()
	async getFavourites(@User('_id') _id: Types.ObjectId) {
		return this.userService.getFavouritesMovies(_id)
	}

	@Post('profile/favourites')
	@HttpCode(200)
	@Auth()
	async toggleFavourites(
		@Body('movieId', IdValidationPipe) movieId: Types.ObjectId,
		@User() user: UserModel
	) {
		return this.userService.toggleFavourites(movieId, user)
	}

	@Get('/_:id')
	@Auth('admin')
	async getUser(@Param('_id', IdValidationPipe) _id: string) {
		return this.userService.byId(_id)
	}

	@Get('/count')
	@Auth('admin')
	async getCountUsers() {
		return await this.userService.getCount()
	}

	@Get()
	@Auth('admin')
	async getUsers(@Query('searchTerm') searchTerm?: string) {
		return this.userService.getAll(searchTerm)
	}

	@Put('profile')
	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Auth()
	async updateProfile(@User('_id') _id: string, @Body() dto: UpdateUserDto) {
		return this.userService.updateProfile(_id, dto)
	}

	@Put(':_id')
	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Auth('admin')
	async updateUser(
		@Param('_id', IdValidationPipe) _id: string,
		@Body() dto: UpdateUserDto
	) {
		return this.userService.updateProfile(_id, dto)
	}

	@Delete(':_id')
	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Auth('admin')
	async deleteUser(@Param('_id', IdValidationPipe) _id: string) {
		return this.userService.deleteUser(_id)
	}
}
