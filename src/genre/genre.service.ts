import { Injectable } from '@nestjs/common'
import { NotFoundException } from '@nestjs/common/exceptions'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { InjectModel } from 'nestjs-typegoose'
import { MovieService } from 'src/movie/movie.service'
import { CreateGenreDto } from './dto/create-genre.dto'
import { ICollection } from './genre.interface'
import { GenreModel } from './genre.model'

@Injectable()
export class GenreService {
	constructor(
		@InjectModel(GenreModel) private readonly GenreModel: ModelType<GenreModel>,
		private readonly movieService: MovieService
	) {}
	async byId(_id: string) {
		const genre = await this.GenreModel.findById(_id)
		if (!genre) throw new NotFoundException('Genre not found')
		return genre
	}
	async bySlug(slug: string) {
		return this.GenreModel.findOne({ slug }).exec()
	}
	async create() {
		const defaultValue: CreateGenreDto = {
			name: '',
			description: '',
			icon: '',
			slug: '',
		}
		const genre = await this.GenreModel.create(defaultValue)
		return genre._id
	}
	async getAll(searchTerms?: string) {
		let options = {}
		if (searchTerms) {
			options = {
				$or: [
					{
						name: new RegExp(searchTerms, 'i'),
					},
					{
						slug: new RegExp(searchTerms, 'i'),
					},
					{
						description: new RegExp(searchTerms, 'i'),
					},
				],
			}
		}
		return this.GenreModel.find(options)
			.select('-updatedAt -__v')
			.sort({ createdAt: 'desc' })
			.exec()
	}
	async getCollections() {
		const genres = await this.getAll()
		const collections = await Promise.all(
			genres.map(async (genre) => {
				const moviesByGenre = await this.movieService.byGenres([genre._id])
				const result: ICollection = {
					_id: String(genre._id),
					image: moviesByGenre[0].bigPoster,
					slug: genre.slug,
					title: genre.name,
				}
				return result
			})
		)
		return collections
	}
	async update(_id: string, dto: CreateGenreDto) {
		const genre = await this.GenreModel.findByIdAndUpdate(
			_id,
			{
				...dto,
			},
			{ new: true }
		).exec()
		if (!genre) throw new NotFoundException('Genre not found')
		return genre
	}
	async delete(_id: string) {
		const deleteDoc = this.GenreModel.findByIdAndDelete(_id).exec()
		if (!deleteDoc) throw new NotFoundException('Genre not found')
		return deleteDoc
	}
}
