import { IsJWT } from 'class-validator'

export class RefreshTokenDto {
	@IsJWT({ message: 'this is not jwt-token' })
	refreshToken: string
}
