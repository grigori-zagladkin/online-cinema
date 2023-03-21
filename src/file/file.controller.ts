import { Controller, Post, Query, UploadedFile } from '@nestjs/common'
import { UseInterceptors } from '@nestjs/common/decorators/core/use-interceptors.decorator'
import { HttpCode } from '@nestjs/common/decorators/http/http-code.decorator'
import { FileInterceptor } from '@nestjs/platform-express'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { FileService } from './file.service'

@Controller('file')
export class FileController {
	constructor(private readonly fileService: FileService) {}

	@HttpCode(200)
	@Auth('admin')
	@UseInterceptors(FileInterceptor('file'))
	@Post()
	async uploadFile(
		@UploadedFile() file: Express.Multer.File,
		@Query('folder') folder: string
	) {
		return this.fileService.saveFiles([file], folder)
	}
}
