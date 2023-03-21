import { Module } from '@nestjs/common'
import { RatingService } from './rating.service'
import { RatingController } from './rating.controller'
import { TypegooseModule } from 'nestjs-typegoose'
import { RatingModel } from './rating.model'
import { ConfigModule } from '@nestjs/config'
import { MovieModule } from 'src/movie/movie.module'

@Module({
	controllers: [RatingController],
	providers: [RatingService],
	imports: [
		TypegooseModule.forFeature([
			{
				typegooseClass: RatingModel,
				schemaOptions: {
					collection: 'Rating',
				},
			},
		]),
		ConfigModule,
		MovieModule,
	],
})
export class RatingModule {}
