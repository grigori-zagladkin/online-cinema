import { Module } from '@nestjs/common'
import { TelegrammService } from './telegramm.service'

@Module({
	exports: [TelegrammService],
	providers: [TelegrammService],
})
export class TelegrammModule {}
