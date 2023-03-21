import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypegooseModule } from 'nestjs-typegoose'
import { getMongoDBConfig } from './config/MongoDB.config'
import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'
import { GenreModule } from './genre/genre.module';
import { FileModule } from './file/file.module';
import { ActorModule } from './actor/actor.module';
import { MovieModule } from './movie/movie.module';
import { TelegrammModule } from './telegramm/telegramm.module';
import { RatingModule } from './rating/rating.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypegooseModule.forRootAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: getMongoDBConfig,
    }),
    AuthModule,
    UserModule,
    GenreModule,
    FileModule,
    ActorModule,
    MovieModule,
    TelegrammModule,
    RatingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
