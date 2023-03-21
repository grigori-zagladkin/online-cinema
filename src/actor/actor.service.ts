import { Injectable } from '@nestjs/common'
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { InjectModel } from 'nestjs-typegoose'
import { ActorDto } from './actor.dto'
import { ActorModel } from './actor.model'

@Injectable()
export class ActorService {
	constructor(
		@InjectModel(ActorModel) private readonly ActorModel: ModelType<ActorModel>
	) {}

	async bySlug(slug: string) {
		const actor = await this.ActorModel.findOne({ slug }).exec()
		if (!actor) {
			throw new NotFoundException(`actor not found`)
		}
		return actor
	}

	async getAll(searchTerm?: string) {
		let options = {}
		if (searchTerm) {
			options = {
				$or: [
					{
						name: new RegExp(searchTerm, 'i'),
					},
					{
						slug: new RegExp(searchTerm, 'i'),
					},
				],
			}
		}
		return this.ActorModel.aggregate()
			.match(options)
			.lookup({
				from: 'Movie',
				localField: '_id',
				foreignField: 'actors',
				as: 'movies',
			})
			.addFields({
				countMovies: {
					$size: '$movies',
				},
			})
			.project({
				__v: 0,
				movies: 0,
				updatedAt: 0,
			})
			.sort({ createdAt: -1 })
			.exec()
	}

	async byId(_id: string) {
		const actor = await this.ActorModel.findById(_id)
		if (!actor) {
			throw new NotFoundException(`actor with id-${_id} not found`)
		}
		return actor
	}

	async create() {
		const defaultValue: ActorDto = {
			name: '',
			slug: '',
			photo: '',
		}
		const actor = await this.ActorModel.create(defaultValue)
		return actor._id
	}

	async update(_id: string, dto: ActorDto) {
		const updateDoc = await this.ActorModel.findByIdAndUpdate(
			_id,
			{ ...dto },
			{ new: true }
		)
		if (!updateDoc) {
			throw new NotFoundException(`actor with id-${_id} not found`)
		}
		return updateDoc
	}

	async delete(_id: string) {
		const deleteDoc = await this.ActorModel.findByIdAndDelete(_id).exec()
		if (!deleteDoc) {
			throw new NotFoundException(`actor with id-${_id} not found`)
		}
		return deleteDoc
	}
}
