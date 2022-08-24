import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Connection} from "typeorm";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {UserModule} from "./user/user.module";
import TokenConfig from './configs/token.config';
import {TokenService} from "./services/token.service";
import {UserEntity} from "./user/user.entity";


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.sample',
      load: [TokenConfig]
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        type: config.get<'aurora-mysql'>('MYSQL_TYPE'),
        username: config.get<string>('MYSQL_USERNAME'),
        password: config.get<string>('MYSQL_PASSWORD'),
        database: config.get<string>('MYSQL_DATABASENAME'),
        port: config.get<number>('MYSQL_PORT'),
        entities: [__dirname + 'dist/**/*.entity{.ts,.js}'],
        synchronize: true,
        autoLoadEntities: true,
        logging: true
      })
    }),
    AuthModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {
  constructor(private connection: Connection) {
  }
}

