import { Injectable, NotFoundException } from '@nestjs/common'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { genSalt, hash } from 'bcryptjs'
import { Types } from 'mongoose'
import { InjectModel } from 'nestjs-typegoose'
import { UpdateUserDto } from './update-user.dto'
import { UserModel } from './user.model'

@Injectable()
export class UserService {
	constructor(
		@InjectModel(UserModel) private readonly UserModel: ModelType<UserModel>
	) {}

	async byId(id: string) {
		const user = await this.UserModel.findById(id).exec()
		if (!user) throw new NotFoundException(`User with id-${id} not found`)
		return user
	}

	async updateProfile(_id: string, dto: UpdateUserDto) {
		const user = await this.byId(_id)
		const isSameUser = await this.UserModel.findOne({ email: dto.email })
		if (isSameUser && String(_id) !== String(isSameUser._id)) {
			throw new NotFoundException('email busy')
		}
		if (dto.password) {
			const salt = await genSalt(10)
			user.password = await hash(dto.password, salt)
		}
		user.email = dto.email
		if (dto.isAdmin || dto.isAdmin === false) {
			user.isAdmin = dto.isAdmin
		}
		await user.save()
		return
	}

	async getCount() {
		return await this.UserModel.find().count().exec()
	}

	async getAll(searchTerm?: string) {
		let options = {}
		if (searchTerm) {
			options = {
				$or: [
					{
						email: new RegExp(searchTerm, 'i'),
					},
				],
			}
		}
		return await this.UserModel.find(options)
			.select('-password -updatedAt -___v')
			.sort({ createdAt: 'desc' })
			.exec()
	}

	async deleteUser(_id: string) {
		return this.UserModel.findByIdAndDelete(_id).exec()
	}

	async toggleFavourites(movieId: Types.ObjectId, user: UserModel) {
		const { _id, favourites } = user

		await this.UserModel.findByIdAndUpdate(_id, {
			favourites: favourites.includes(movieId)
				? favourites.filter((_id) => String(_id) !== String(movieId))
				: [...favourites, movieId],
		})
	}

	async getFavouritesMovies(_id: Types.ObjectId) {
		return this.UserModel.findById(_id, 'favourites')
			.populate({
				path: 'favourites',
				populate: {
					path: 'genres',
				},
			})
			.exec()
			.then((data) => data.favourites)
	}
}
