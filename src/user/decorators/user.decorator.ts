import { ExecutionContext } from '@nestjs/common'
import { createParamDecorator } from '@nestjs/common/decorators/http/create-route-param-metadata.decorator'
import { UserModel } from '../user.model'

type TypeData = keyof UserModel

export const User = createParamDecorator(
	(data: TypeData, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest()
		const user = request.user
		return data ? user[data] : user
	}
)
