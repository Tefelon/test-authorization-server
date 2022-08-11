import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {NestExpressApplication} from "@nestjs/platform-express";
import "reflect-metadata";
import {ConfigService} from "@nestjs/config";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = await app.get(ConfigService)
  const port = config.get<number>('API_PORT')
  await app.listen(port || 3030, () => {
    console.log(`App run at port: ${port}`)
  });
}
bootstrap();
