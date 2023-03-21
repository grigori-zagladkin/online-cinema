import { Module } from '@nestjs/common'
import { FileService } from './file.service'
import { FileController } from './file.controller'
import { ServeStaticModule } from '@nestjs/serve-static'
import { path } from 'app-root-path'

@Module({
	controllers: [FileController],
	providers: [FileService],
	imports: [
		ServeStaticModule.forRoot({
			serveRoot: '/uploads',
			rootPath: `${path}/uploads`,
		}),
	],
})
export class FileModule {}
