import { Module } from '@nestjs/common'
import { MovieService } from './movie.service'
import { MovieController } from './movie.controller'
import { TypegooseModule } from 'nestjs-typegoose'
import { MovieModel } from './movie.model'
import { TelegrammModule } from 'src/telegramm/telegramm.module'

@Module({
	controllers: [MovieController],
	providers: [MovieService],
	imports: [
		TypegooseModule.forFeature([
			{
				typegooseClass: MovieModel,
				schemaOptions: {
					collection: 'Movie',
				},
			},
		]),
		TelegrammModule,
	],
	exports: [MovieService],
})
export class MovieModule {}
