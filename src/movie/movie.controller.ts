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
import { MoviesByGenresDto } from './dto/movies-by-genres.dto'
import { UpdateCountOpenedDto } from './dto/update-count-opened.dto'
import { UpdateMovieDto } from './dto/update-movie.dto'
import { MovieService } from './movie.service'

@Controller('movie')
export class MovieController {
	constructor(private readonly movieService: MovieService) {}

	@Get('by-slug/:slug')
	async getBySlug(@Param('slug') slug: string) {
		return this.movieService.bySlug(slug)
	}

	@Get('by-actor/:actorId')
	async getByActor(
		@Param('actorId', IdValidationPipe) actorId: Types.ObjectId
	) {
		return this.movieService.byActor(actorId)
	}

	@Post('by-genres')
	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	async byGenres(@Body() dto: MoviesByGenresDto) {
		return this.movieService.byGenres(dto.genreIds)
	}

	@Get()
	async getAll(@Query('searchTerm') searchTerm: string) {
		return this.movieService.getAll(searchTerm)
	}

	@Get('most-popular')
	async getMostPopular() {
		return this.movieService.getMostPopular()
	}

	@Put('update-count-opened')
	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	async updateCountOpened(@Body() dto: UpdateCountOpenedDto) {
		return this.movieService.updateCountOpened(dto.slug)
	}

	@Get(':_id')
	@Auth('admin')
	async get(@Param('_id', IdValidationPipe) _id: string) {
		return this.movieService.byId(_id)
	}

	@UsePipes(new ValidationPipe())
	@Post()
	@HttpCode(200)
	@Auth('admin')
	async create() {
		return this.movieService.create()
	}

	@UsePipes(new ValidationPipe())
	@Put('/:_id')
	@HttpCode(200)
	@Auth('admin')
	async update(
		@Param('_id', IdValidationPipe) _id: string,
		@Body() dto: UpdateMovieDto
	) {
		return this.movieService.update(_id, dto)
	}

	@Delete('/:_id')
	@HttpCode(200)
	@Auth('admin')
	async delete(@Param('_id', IdValidationPipe) _id: string) {
		return this.movieService.delete(_id)
	}
}
