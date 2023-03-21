import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { InjectModel } from 'nestjs-typegoose'
import { UserModel } from 'src/user/user.model'
import { AuthDto } from './dto/auth.dto'
import { hash, genSalt, compare } from 'bcryptjs'
import { JwtService } from '@nestjs/jwt'
import { RefreshTokenDto } from './dto/refershToken.dto'

@Injectable()
export class AuthService {
	constructor(
		@InjectModel(UserModel) private readonly UserModel: ModelType<UserModel>,
		private readonly jwtService: JwtService
	) {}

	async login(dto: AuthDto) {
		const user = await this.validateUser(dto)
		const tokens = await this.issueTokenPair(String(user._id))
		return {
			user: this.returnUserFields(user),
			tokens,
		}
	}

	getNewTokens = async ({ refreshToken }: RefreshTokenDto) => {
		if (!refreshToken) throw new UnauthorizedException('Please sign in')
		const result = await this.jwtService.verifyAsync(refreshToken)
		if (!result) throw new UnauthorizedException('Invalid token or expired')
		const user = await this.UserModel.findById(result._id)
		const tokens = await this.issueTokenPair(String(user._id))
		return {
			user: this.returnUserFields(user),
			tokens,
		}
	}

	async register(dto: AuthDto) {
		const candidate = await this.UserModel.findOne({ email: dto.email })
		if (candidate) {
			throw new BadRequestException('User with email is already in the system')
		}
		const salt = await genSalt(10)
		const newUser = new this.UserModel({
			email: dto.email,
			password: await hash(dto.password, salt),
		})
		newUser.save()
		const tokens = await this.issueTokenPair(String(newUser._id))
		return {
			user: this.returnUserFields(newUser),
			tokens,
		}
	}

	async validateUser(dto: AuthDto) {
		const candidate = await this.UserModel.findOne({ email: dto.email })
		const isValidPassword = await compare(dto.password, candidate.password)
		if (isValidPassword && candidate) {
			return candidate
		}
		throw new UnauthorizedException('User or password is not valid')
	}

	issueTokenPair = async (userId: string) => ({
		refreshToken: await this.jwtService.signAsync(
			{ _id: userId },
			{
				expiresIn: '15d',
			}
		),
		accessToken: await this.jwtService.signAsync(
			{ _id: userId },
			{
				expiresIn: '1h',
			}
		),
	})

	returnUserFields = (user: UserModel) => ({
		_id: user._id,
		email: user.email,
		isAdmin: user.isAdmin,
	})
}
