import { applyDecorators } from '@nestjs/common/decorators/core/apply-decorators'
import { UseGuards } from '@nestjs/common/decorators/core/use-guards.decorator'
import { TypeRole } from '../auth.interface'
import { OnlyAdminGuard } from '../guards/admin.guard'
import { JwtAuthGuard } from '../guards/jwt.guard'

export const Auth = (role: TypeRole = 'user') =>
	applyDecorators(
		role === 'admin'
			? UseGuards(JwtAuthGuard, OnlyAdminGuard)
			: UseGuards(JwtAuthGuard)
	)
