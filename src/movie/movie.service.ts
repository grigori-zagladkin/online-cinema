import { Injectable, NotFoundException } from '@nestjs/common'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { Types } from 'mongoose'
import { InjectModel } from 'nestjs-typegoose'
import { TelegrammService } from 'src/telegramm/telegramm.service'
import { MoviesByGenresDto } from './dto/movies-by-genres.dto'
import { UpdateMovieDto } from './dto/update-movie.dto'
import { MovieModel } from './movie.model'

@Injectable()
export class MovieService {
	constructor(
		@InjectModel(MovieModel) private readonly MovieModel: ModelType<MovieModel>,
		private readonly telegramService: TelegrammService
	) {}

	async getAll(searchTerm?: string) {
		let options = {}
		if (searchTerm) {
			options = {
				$or: [
					{
						title: new RegExp(searchTerm, 'i'),
					},
				],
			}
		}
		return this.MovieModel.find(options)
			.select('-updatedAt -__v')
			.sort({ createdAt: 'desc' })
			.populate('actors genres')
			.exec()
	}

	async bySlug(slug: string) {
		const doc = await this.MovieModel.findOne({ slug })
			.populate('actors genres')
			.exec()
		if (!doc) {
			throw new NotFoundException('Movie not found')
		}
		return doc
	}

	async byActor(actorId: Types.ObjectId) {
		const doc = await this.MovieModel.find({ actors: actorId }).exec()
		if (!doc) {
			throw new NotFoundException('Movies not found')
		}
		return doc
	}

	async byGenres(genreIds: Types.ObjectId[]) {
		const doc = await this.MovieModel.find({
			genres: { $in: genreIds },
		}).exec()
		if (!doc) {
			throw new NotFoundException('Movie not found')
		}
		return doc
	}

	async getMostPopular() {
		return await this.MovieModel.find({ countOpened: { $gt: 0 } })
			.sort({ countOpened: -1 })
			.populate('genres')
			.exec()
	}

	async updateCountOpened(slug: string) {
		const updateDoc = await this.MovieModel.findOneAndUpdate(
			{ slug },
			{
				$inc: { countOpened: 1 },
			},
			{
				new: true,
			}
		).exec()
		if (!updateDoc) {
			throw new NotFoundException('Movie not found')
		}
		return updateDoc
	}

	async updateRating(id: Types.ObjectId, newRating: number) {
		return this.MovieModel.findByIdAndUpdate(
			id,
			{
				rating: newRating,
			},
			{
				new: true,
			}
		).exec()
	}

	async byId(_id: string) {
		const doc = await this.MovieModel.findById(_id)
		if (!doc) {
			throw new NotFoundException('movie not found')
		}
		return doc
	}

	async create() {
		const defaultValue: UpdateMovieDto = {
			bigPoster: '',
			actors: [],
			genres: [],
			poster: '',
			title: '',
			videoUrl: '',
			slug: '',
		}
		const movie = await this.MovieModel.create(defaultValue)
		return movie._id
	}

	async update(_id: string, dto: UpdateMovieDto) {
		if (!dto.isSendTelegram) {
			await this.sendNotification(dto)
			dto.isSendTelegram = true
		}
		const updateDoc = await this.MovieModel.findByIdAndUpdate(_id, dto, {
			new: true,
		}).exec()
		if (!updateDoc) throw new NotFoundException('Movie not found')
		return updateDoc
	}

	async delete(_id: string) {
		const deleteDoc = await this.MovieModel.findByIdAndDelete(_id).exec()
		if (!deleteDoc) {
			throw new NotFoundException('movie not found')
		}
		return deleteDoc
	}

	async sendNotification(dto: UpdateMovieDto) {
		// if (process.env.NODE_ENV !== 'development') {
		// 	await this.telegramService.sendPhoto(dto.poster)
		// }
		await this.telegramService.sendPhoto(
			'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7x42tmAKex3xSGmmajDgLr1KfDMwP3fNwRsuoQ-yn&s'
		)
		const msg = `<b>${dto.title}</b>\n\n` + `${dto.slug}\n\n`
		await this.telegramService.sendMessages(msg, {
			reply_markup: {
				inline_keyboard: [
					[
						{
							url: 'https://okko.tv/movie/free-guy',
							text: 'Go to watch',
						},
					],
				],
			},
		})
	}
}
