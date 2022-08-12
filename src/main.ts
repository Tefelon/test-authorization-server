import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {NestExpressApplication} from "@nestjs/platform-express";
import "reflect-metadata";
import {ConfigService} from "@nestjs/config";
import {AllExceptionFilter} from "./exception-filters/exception.filter";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalFilters(new AllExceptionFilter());
  const config = await app.get(ConfigService);
  const port = config.get<number>('API_PORT');
  await app.listen(port || 3030, () => {
    console.log(`App run at port: ${port}`)
  });
}
bootstrap();
