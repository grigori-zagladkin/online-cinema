import { Module } from '@nestjs/common'
import { GenreService } from './genre.service'
import { GenreController } from './genre.controller'
import { TypegooseModule } from 'nestjs-typegoose'
import { GenreModel } from './genre.model'
import { ConfigModule } from '@nestjs/config'
import { MovieModule } from 'src/movie/movie.module'

@Module({
	controllers: [GenreController],
	providers: [GenreService],
	imports: [
		TypegooseModule.forFeature([
			{
				typegooseClass: GenreModel,
				schemaOptions: {
					collection: 'Genre',
				},
			},
		]),
		ConfigModule,
		MovieModule,
	],
})
export class GenreModule {}
